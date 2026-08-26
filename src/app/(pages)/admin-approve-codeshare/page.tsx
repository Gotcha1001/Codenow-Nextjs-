"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, CheckCircle2, ImageOff } from "lucide-react";
import { db, Timestamp } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import Pagination from "@/app/components/Pagination";
import Spinner from "@/lib/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Next.js port of Navbar/AdminApproveCodeShare.jsx.
// Same "sharing-code" collection, same edit/delete/approve actions and
// the same 5-per-page pagination -- just Next/TypeScript, shadcn
// Card/Input/Textarea/Button/Badge in place of raw markup, and motion
// list/dialog animations. The one behavior change: updating a share no
// longer does `window.location.reload()` -- it patches local state
// instead, matching how the rest of the app avoids full reloads.

type CodeShare = {
  id: string;
  title: string;
  content: string;
  date: Date;
  picUrl?: string;
  isApproved?: boolean;
};

const SHARES_PER_PAGE = 5;

export default function AdminApproveCodeSharePage() {
  const [codeShares, setCodeShares] = useState<CodeShare[]>([]);
  const [selectedShare, setSelectedShare] = useState<CodeShare | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCodeShares = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "sharing-code"));
        const sharesData = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            date: data.date.toDate(),
          } as CodeShare;
        });
        sharesData.sort((a, b) => b.date.getTime() - a.date.getTime());
        setCodeShares(sharesData);
      } catch (err) {
        console.error("Error fetching code shares:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCodeShares();
  }, []);

  const handleDeleteClick = async (shareId: string) => {
    try {
      await deleteDoc(doc(db, "sharing-code", shareId));
      setCodeShares((prev) => prev.filter((share) => share.id !== shareId));
    } catch (err) {
      console.error("Error deleting code share:", err);
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedShare) return;
    const { id, date, title, content, picUrl } = selectedShare;
    try {
      const shareRef = doc(db, "sharing-code", id);
      await updateDoc(shareRef, {
        date: Timestamp.fromDate(new Date(date)),
        title,
        content,
        picUrl: picUrl || "",
      });
      setCodeShares((prev) =>
        prev.map((share) =>
          share.id === id ? { ...share, ...selectedShare } : share,
        ),
      );
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Error updating code share:", err);
    }
  };

  const handleApprove = async (shareId: string) => {
    try {
      const shareRef = doc(db, "sharing-code", shareId);
      await updateDoc(shareRef, { isApproved: true });
      setCodeShares((prev) =>
        prev.map((share) =>
          share.id === shareId ? { ...share, isApproved: true } : share,
        ),
      );
    } catch (err) {
      console.error("Error approving code share:", err);
    }
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setSelectedShare((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleUpdateClick = (share: CodeShare) => {
    setSelectedShare(share);
    setIsDialogOpen(true);
  };

  const indexOfLastShare = currentPage * SHARES_PER_PAGE;
  const indexOfFirstShare = indexOfLastShare - SHARES_PER_PAGE;
  const currentShares = codeShares.slice(indexOfFirstShare, indexOfLastShare);

  const nextPage = () =>
    setCurrentPage((prev) =>
      Math.min(prev + 1, Math.ceil(codeShares.length / SHARES_PER_PAGE)),
    );
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-stone-50 px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 text-4xl font-bold"
      >
        Manage Code Shares
      </motion.h1>

      <div className="flex w-full max-w-2xl flex-col items-center">
        {currentShares.length === 0 ? (
          <p className="text-muted-foreground">No code shares yet.</p>
        ) : (
          <AnimatePresence initial={false}>
            {currentShares.map((share) => (
              <motion.div
                key={share.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mb-4 w-full"
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h2 className="text-xl font-bold">{share.title}</h2>
                      {share.isApproved ? (
                        <Badge className="bg-green-600 hover:bg-green-600">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </div>
                    <p className="mb-2">
                      <strong>Content:</strong> {share.content}
                    </p>
                    <p className="mb-2">
                      <strong>Date:</strong>{" "}
                      {share.date.toLocaleDateString("en-GB")}
                    </p>
                    {share.picUrl ? (
                      <img
                        src={share.picUrl}
                        alt="Code related"
                        className="mb-2 h-auto max-w-full rounded-lg"
                      />
                    ) : (
                      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <ImageOff className="h-4 w-4" />
                        No image attached
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleUpdateClick(share)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1.5"
                        onClick={() => handleDeleteClick(share.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                      {!share.isApproved && (
                        <Button
                          size="sm"
                          className="gap-1.5 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(share.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {codeShares.length > SHARES_PER_PAGE && (
          <Pagination
            itemsPerPage={SHARES_PER_PAGE}
            totalItems={codeShares.length}
            currentPage={currentPage}
            nextPage={nextPage}
            prevPage={prevPage}
          />
        )}
      </div>

      <AnimatePresence>
        {isDialogOpen && selectedShare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg"
            >
              <h2 className="mb-4 text-2xl font-bold">Edit Code Share</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="date" className="mb-2 block font-bold">
                    Date
                  </Label>
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    value={selectedShare.date.toISOString().split("T")[0]}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="title" className="mb-2 block font-bold">
                    Title
                  </Label>
                  <Input
                    type="text"
                    id="title"
                    name="title"
                    value={selectedShare.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content" className="mb-2 block font-bold">
                    Content
                  </Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={selectedShare.content}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="picUrl" className="mb-2 block font-bold">
                    Picture URL
                  </Label>
                  <Input
                    type="text"
                    id="picUrl"
                    name="picUrl"
                    value={selectedShare.picUrl || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Update
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
