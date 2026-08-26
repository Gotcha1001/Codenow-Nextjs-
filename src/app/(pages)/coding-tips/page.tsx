"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import Spinner from "@/lib/spinner";

// Next.js port of Navbar/CodingTips.jsx.
// Same admin-editable background video + Firestore "coding-tips" settings
// doc, same six tip cards/copy — Next routing/typing, shadcn Card +
// Framer Motion stagger on the grid, and the shared dark admin dialog.
// Route path is /code-tips to match Navbar NAV_LINKS.

const ADMIN_EMAIL = "admin@example.com";

type BackgroundSettings = {
  backgroundMediaUrl?: string;
  isBackgroundVideo?: boolean;
};

type Tip = {
  title: string;
  body: string;
};

const tips: Tip[] = [
  {
    title: "Master the Basics",
    body: "Focus on mastering fundamental concepts such as data structures, algorithms, and basic programming principles. Understanding these core concepts is crucial for writing efficient and effective code.",
  },
  {
    title: "Expand Your Knowledge",
    body: "Explore different programming languages and technologies. Read about best practices and study coding standards.",
  },
  {
    title: "Work on Projects",
    body: "Apply your skills to real-world projects and contribute to open-source. This helps you understand how to tackle real-world problems.",
  },
  {
    title: "Refine Your Problem-Solving Skills",
    body: "Engage in problem-solving activities and review your solutions to improve your analytical thinking and problem-solving abilities.",
  },
  {
    title: "Learn from Others",
    body: "Study code written by experienced developers, seek feedback, and learn from their practices and techniques.",
  },
  {
    title: "Stay Updated with Technology",
    body: "Follow industry trends, experiment with new tools, and stay current with the latest technologies and frameworks.",
  },
];

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function CodingTipsPage() {
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string>("");
  const [showBackgroundDialog, setShowBackgroundDialog] =
    useState<boolean>(false);
  const [newVideoUrl, setNewVideoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Prefer onAuthStateChanged over a one-shot auth.currentUser so the
    // admin button appears reliably after login (old code only checked once).
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });

    const fetchBackgroundVideoUrl = async () => {
      try {
        const docRef = doc(collection(db, "settings"), "coding-tips");
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

    fetchBackgroundVideoUrl();
    return () => unsubscribe();
  }, []);

  const openBackgroundDialog = () => {
    setNewVideoUrl(backgroundVideoUrl);
    setShowBackgroundDialog(true);
  };

  const closeBackgroundDialog = () => setShowBackgroundDialog(false);

  const changeBackgroundVideo = async () => {
    try {
      const docRef = doc(collection(db, "settings"), "coding-tips");
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

      <div className="relative z-10 w-full p-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="zoom mx-auto mb-8 w-fit rounded-md p-4 text-center font-serif text-4xl font-bold text-white hover:bg-black"
        >
          Coding Tips
        </motion.h1>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={gridVariants}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {tips.map((tip) => (
            <motion.div key={tip.title} variants={cardVariants}>
              <Card className="sunset-gradient-background h-full border-0 shadow-sunset">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    {tip.title}
                  </h2>
                  <p className="text-gray-700">{tip.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

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
