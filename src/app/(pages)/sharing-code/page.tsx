"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import Spinner from "@/lib/spinner";

// Next.js port of Navbar/SharingCodes.jsx (SharingCode).
// Lists approved docs from Firestore "sharing-code", likes, local
// pagination (5/page), admin background on settings/"sharing-code".

const ADMIN_EMAIL = "admin@example.com";
const SHARES_PER_PAGE = 5;

type BackgroundSettings = {
  backgroundMediaUrl?: string;
  isBackgroundVideo?: boolean;
};

type CodeShare = {
  id: string;
  title?: string;
  content?: string;
  userName?: string;
  picUrl?: string;
  likes?: number;
  isApproved?: boolean;
  date: Date | null;
};

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  ) {
    return (value as Timestamp).toDate();
  }
  const d = new Date(value as string | number | Date);
  return Number.isNaN(d.getTime()) ? null : d;
}

function SharesPagination({
  sharesPerPage,
  totalShares,
  currentPage,
  paginate,
  nextPage,
  prevPage,
}: {
  sharesPerPage: number;
  totalShares: number;
  currentPage: number;
  paginate: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}) {
  const totalPages = Math.ceil(totalShares / sharesPerPage) || 1;

  return (
    <div className="mt-8 flex justify-center">
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className="ml-2 rounded-md bg-teal-600 px-4 py-2 text-white transition duration-300 hover:bg-teal-700 disabled:opacity-50"
      >
        Previous
      </button>
      <button
        className="ml-2 rounded-md bg-white px-4 py-2 text-black transition duration-300 hover:bg-teal-600"
        onClick={() => paginate(currentPage)}
      >
        {currentPage}
      </button>
      <button
        onClick={nextPage}
        disabled={currentPage === totalPages}
        className="ml-2 rounded-md bg-teal-600 px-4 py-2 text-white transition duration-300 hover:bg-teal-700 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

export default function SharingCodePage() {
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState("");
  const [showBackgroundDialog, setShowBackgroundDialog] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [codeShares, setCodeShares] = useState<CodeShare[]>([]);
  const [sharesLoading, setSharesLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });

    const fetchBackgroundVideoUrl = async () => {
      try {
        const docRef = doc(collection(db, "settings"), "sharing-code");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as BackgroundSettings;
          if (data.backgroundMediaUrl) {
            setBackgroundVideoUrl(data.backgroundMediaUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching background video URL:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCodeShares = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "sharing-code"));
        const sharesData: CodeShare[] = querySnapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title as string | undefined,
            content: data.content as string | undefined,
            userName: data.userName as string | undefined,
            picUrl: data.picUrl as string | undefined,
            likes: (data.likes as number | undefined) ?? 0,
            isApproved: Boolean(data.isApproved),
            date: toDate(data.date),
          };
        });
        setCodeShares(sharesData.filter((share) => share.isApproved));
      } catch (err) {
        console.error("Error fetching code shares:", err);
      } finally {
        setSharesLoading(false);
      }
    };

    fetchBackgroundVideoUrl();
    fetchCodeShares();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const openBackgroundDialog = () => {
    setNewVideoUrl(backgroundVideoUrl);
    setShowBackgroundDialog(true);
  };

  const closeBackgroundDialog = () => setShowBackgroundDialog(false);

  const changeBackgroundVideo = async () => {
    try {
      const docRef = doc(collection(db, "settings"), "sharing-code");
      await setDoc(docRef, {
        backgroundMediaUrl: newVideoUrl,
        isBackgroundVideo: true,
      });
      setBackgroundVideoUrl(newVideoUrl);
      setNewVideoUrl("");
      closeBackgroundDialog();
    } catch (err) {
      console.error("Error updating background video URL:", err);
    }
  };

  const incrementLikes = async (id: string, currentLikes?: number) => {
    try {
      const updatedLikes = (currentLikes || 0) + 1;
      const docRef = doc(db, "sharing-code", id);
      await updateDoc(docRef, { likes: updatedLikes });
      setCodeShares((prev) =>
        prev.map((share) =>
          share.id === id ? { ...share, likes: updatedLikes } : share,
        ),
      );
    } catch (err) {
      console.error("Error updating likes:", err);
    }
  };

  const indexOfLastShare = currentPage * SHARES_PER_PAGE;
  const indexOfFirstShare = indexOfLastShare - SHARES_PER_PAGE;
  const currentShares = codeShares.slice(indexOfFirstShare, indexOfLastShare);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) =>
      Math.min(prev + 1, Math.ceil(codeShares.length / SHARES_PER_PAGE) || 1),
    );
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (loading || sharesLoading) {
    return <Spinner />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      {backgroundVideoUrl && (
        <video
          src={backgroundVideoUrl}
          autoPlay
          loop
          muted
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      )}

      <div className="relative z-10 w-full p-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="zoom mb-8 rounded-md text-center font-serif text-4xl font-bold text-white"
        >
          Sharing Code
        </motion.h1>

        {isAdmin && (
          <div className="mt-8 flex justify-center">
            <button
              className="rounded-md bg-indigo-800 px-4 py-2 text-white transition duration-300 hover:bg-green-600"
              onClick={openBackgroundDialog}
            >
              Change Background Video
            </button>
          </div>
        )}
      </div>

      <div className="relative z-10 mx-auto mt-8 w-full max-w-3xl p-4">
        <motion.ul
          key={currentPage}
          initial="hidden"
          animate="visible"
          variants={listVariants}
        >
          {currentShares.length ? (
            currentShares.map((share) => (
              <motion.li
                key={share.id}
                variants={itemVariants}
                className="gradient-background2 mb-4 rounded p-4 text-white shadow"
              >
                <h3 className="mb-4 text-xl font-bold">
                  Title: {share.title || "No Title"}
                </h3>
                <p className="pre-wrap m-3 rounded-md p-2 shadow-neon whitespace-pre-wrap">
                  {share.content || "No Content"}
                </p>
                <p className="mt-5 text-sm text-white">
                  Posted by: {share.userName || "Unknown"}
                </p>
                {share.picUrl ? (
                  <img
                    src={share.picUrl}
                    alt="Code Related"
                    className="my-2 h-auto max-w-full rounded"
                  />
                ) : (
                  <p>No Image</p>
                )}
                <div className="mt-2 flex items-center">
                  <button
                    className="zoom mr-2 rounded-md bg-blue-500 px-3 py-1 text-white shadow-sky"
                    onClick={() => incrementLikes(share.id, share.likes)}
                  >
                    Like
                  </button>
                  <p>{share.likes ?? 0} Likes</p>
                </div>
              </motion.li>
            ))
          ) : (
            <p className="text-white">No code shares available.</p>
          )}
        </motion.ul>

        <SharesPagination
          sharesPerPage={SHARES_PER_PAGE}
          totalShares={codeShares.length}
          currentPage={currentPage}
          paginate={paginate}
          nextPage={nextPage}
          prevPage={prevPage}
        />
      </div>

      {showBackgroundDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-neutral-900 p-6 text-white shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">
              Change Background Video
            </h2>
            <input
              type="text"
              placeholder="Enter video URL"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              className="mb-4 w-full rounded border border-white/20 bg-neutral-800 p-2 text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeBackgroundDialog}
                className="rounded bg-white/10 px-4 py-2 text-white/80 hover:bg-white/20"
              >
                Close
              </button>
              <button
                onClick={changeBackgroundVideo}
                className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Change Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
