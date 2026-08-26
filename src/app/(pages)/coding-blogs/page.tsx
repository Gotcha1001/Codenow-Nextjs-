"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import Spinner from "@/lib/spinner";

// Next.js port of Footer/CodingBlogs.jsx.
// Same admin-editable background video + Firestore "coding-blogs" settings
// doc, same blogLinks data/copy -- just Next routing/typing, shadcn Card
// in place of the plain bordered <div>, and a staggered fade/scale-in on
// the grid (the old version had no entrance animation at all).

const ADMIN_EMAIL = "admin@example.com";

type BackgroundSettings = {
  backgroundMediaUrl?: string;
  isBackgroundVideo?: boolean;
};

const blogLinks = [
  { url: "https://blog.codingblocks.com/", name: "Coding Blocks Blog" },
  {
    url: "https://dev.to/stealc/top-programming-blogs-to-read-in-2024-3hf2",
    name: "Top Programming Blogs 2024",
  },
  {
    url: "https://blog.bit.ai/programming-blogs-and-websites/",
    name: "Bit.ai Programming Blogs",
  },
  {
    url: "https://feedly.com/i/top/programming-blogs",
    name: "Feedly Top Programming Blogs",
  },
  {
    url: "https://medium.com/the-pandadoc-tech-blog/blogs-every-developer-should-read-in-2022-19d5eda9e566",
    name: "Pandadoc Tech Blog",
  },
  { url: "https://coding.blog/", name: "Coding.blog" },
  { url: "https://codeblog.jonskeet.uk/", name: "Jon Skeet's Coding Blog" },
  { url: "https://coder.com/blog", name: "Coder Blog" },
  {
    url: "https://bloggingidol.com/best-programming-blogs/",
    name: "Best Programming Blogs",
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

export default function CodingBlogsPage() {
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string>("");
  const [showBackgroundDialog, setShowBackgroundDialog] =
    useState<boolean>(false);
  const [newVideoUrl, setNewVideoUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });

    const fetchBackgroundVideoUrl = async () => {
      try {
        const docRef = doc(collection(db, "settings"), "coding-blogs");
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
      const docRef = doc(collection(db, "settings"), "coding-blogs");
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
          className="zoom mx-auto mb-8 w-fit rounded-md px-6 py-2 text-center text-4xl font-bold text-white shadow-neon hover:bg-black"
        >
          Coding Blogs
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

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={gridVariants}
          className="mt-8 grid grid-cols-1 gap-11 sm:grid-cols-2 lg:grid-cols-3"
        >
          {blogLinks.map((blog) => (
            <motion.div key={blog.url} variants={cardVariants}>
              <div className="neon-emerald h-full max-w-sm rounded-xl border border-black bg-transparent p-6 transition-colors duration-300 hover:bg-black">
                <a
                  href={blog.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-white hover:underline"
                >
                  {blog.name}
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
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
