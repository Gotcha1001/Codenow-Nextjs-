"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import Spinner from "@/lib/spinner";
import FeatureWrapperDelay from "@/app/components/FeatureWrapperDelay";
import FeatureMotionWrapper from "@/app/components/FeatureMotionWrapper";
import tutorials from "@/lib/tutorials";

const ADMIN_EMAIL = "admin@example.com";

type PortfolioSettings = {
  backgroundMediaUrl?: string;
  isBackgroundVideo?: boolean;
};

export default function TutorialsPage() {
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string>("");
  const [showBackgroundDialog, setShowBackgroundDialog] =
    useState<boolean>(false);
  const [newVideoUrl, setNewVideoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });

    const fetchBackgroundVideoUrl = async () => {
      try {
        const docRef = doc(collection(db, "settings"), "portfolio");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as PortfolioSettings;
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

    fetchBackgroundVideoUrl();
    return () => unsubscribe();
  }, []);

  const filteredTutorials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tutorials;
    return tutorials.filter((project) =>
      project.title.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const openBackgroundDialog = () => {
    setNewVideoUrl(backgroundVideoUrl);
    setShowBackgroundDialog(true);
  };

  const closeBackgroundDialog = () => setShowBackgroundDialog(false);

  const changeBackgroundVideo = async () => {
    try {
      const docRef = doc(collection(db, "settings"), "portfolio");
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

  if (loading) {
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
      <div className="relative z-10 w-full">
        <FeatureWrapperDelay
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h1 className="zoom mb-8 rounded-md p-4 text-center text-4xl font-bold text-white shadow-neon hover:bg-black">
            My Portfolio
          </h1>
        </FeatureWrapperDelay>

        <p className="mb-6 text-center text-white">
          These are my projects and apps I have built. Click on the projects to
          view their beauty and functionality:
        </p>

        {/* SEARCH BAR — sits under the intro text */}
        <div className="relative z-20 mx-auto mb-8 w-full max-w-md px-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tutorials by name..."
              aria-label="Search tutorials by name"
              className="w-full rounded-lg border border-white/30 bg-black/70 py-3 pl-10 pr-4 text-white shadow-lg placeholder:text-white/50 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          {searchQuery.trim() && (
            <p className="mt-2 text-center text-sm text-white/80">
              {filteredTutorials.length === 0
                ? "No tutorials match that name."
                : `${filteredTutorials.length} tutorial${filteredTutorials.length === 1 ? "" : "s"} found`}
            </p>
          )}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTutorials.map((project, index) => (
            <FeatureMotionWrapper key={project.href} index={index}>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="gradient-background2 h-full border-0 text-white opacity-90 shadow-neon transition duration-300 hover:bg-purple-600 hover:opacity-100">
                  <CardContent className="p-6">
                    <h2 className="text-center text-xl font-semibold">
                      {project.title}
                    </h2>
                    <p className="mt-2 rounded-lg p-1 text-center shadow-teal">
                      {project.shortDescription}
                    </p>
                    <div className="mt-5 mb-8 flex items-center justify-center">
                      <motion.img
                        whileHover={{ scale: 1.2 }}
                        transition={{ type: "spring", stiffness: 500 }}
                        style={{
                          transformOrigin: "center",
                          height: "200px",
                          width: "200px",
                        }}
                        src={project.imageUrl}
                        alt={project.alt}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              </a>
            </FeatureMotionWrapper>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          {isAdmin && (
            <button
              className="rounded-md bg-indigo-800 px-4 py-2 text-white transition duration-300 hover:bg-green-600"
              onClick={openBackgroundDialog}
            >
              Change Background Video
            </button>
          )}
        </div>
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
