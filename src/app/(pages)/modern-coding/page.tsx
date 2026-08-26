"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import Spinner from "@/lib/spinner";

// Next.js port of Footer/ModernCoding.jsx.
// Same communityLinks (title + tips), settings/"modern-coding" background
// video, admin dialog — typed, Framer Motion stagger, shared Spinner.

const ADMIN_EMAIL = "admin@example.com";

type BackgroundSettings = {
  backgroundMediaUrl?: string;
  isBackgroundVideo?: boolean;
};

type CommunityLink = {
  title: string;
  url: string;
  tips: string;
};

const communityLinks: CommunityLink[] = [
  {
    title: "Daily Dev Blog: General Programming Communities to Join",
    url: "https://daily.dev/blog/general-programming-communities-to-join",
    tips: "Find curated lists of communities to join, from general programming to niche interests.",
  },
  {
    title: "Code Institute: What's the Coding Community Like?",
    url: "https://codeinstitute.net/global/blog/whats-the-coding-community-like/",
    tips: "Learn about different coding communities and their benefits for learning and networking.",
  },
  {
    title: "DEV Community",
    url: "https://dev.to/",
    tips: "Engage with a large, active community of developers discussing a wide range of topics.",
  },
  {
    title: "Boot Dev Blog: Best Coding Communities",
    url: "https://blog.boot.dev/misc/best-coding-communities/",
    tips: "Explore top coding communities and platforms for developers at all levels.",
  },
  {
    title: "Arc Dev: Online Developer Communities",
    url: "https://arc.dev/talent-blog/online-developer-communities/",
    tips: "Discover communities that offer job opportunities and networking for developers.",
  },
  {
    title: "Stack Overflow",
    url: "https://stackoverflow.com/",
    tips: "Get answers to programming questions and join a vibrant community of developers.",
  },
  {
    title: "FreeCodeCamp: Best Developer Communities to Be Part of in 2020",
    url: "https://www.freecodecamp.org/news/best-developer-communities-to-be-part-of-in-2020/",
    tips: "Find recommendations for developer communities that support growth and learning.",
  },
  {
    title: "Coding for Community",
    url: "https://codingforcommunity.org/",
    tips: "Join a community dedicated to using coding skills for social good and impact.",
  },
  {
    title: "Codedamn: Best Online Coding Communities to Join",
    url: "https://codedamn.com/news/programming/best-online-coding-communities-to-join",
    tips: "Explore online communities with a focus on coding education and peer support.",
  },
  {
    title: "Reddit: r/programming",
    url: "https://www.reddit.com/r/programming/",
    tips: "Participate in discussions about programming topics and trends on Reddit.",
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

export default function ModernCodingPage() {
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
        const docRef = doc(collection(db, "settings"), "modern-coding");
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
      const docRef = doc(collection(db, "settings"), "modern-coding");
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
          className="zoom mb-12 rounded-md p-2 text-center font-serif text-4xl font-bold text-white hover:bg-black"
        >
          Modern Coding
        </motion.h1>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={gridVariants}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:items-center sm:justify-center sm:text-center lg:grid-cols-3"
        >
          {communityLinks.map((link) => (
            <motion.div key={link.url} variants={cardVariants}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="neon-emerald zoom mx-auto block max-w-sm rounded-lg border border-black p-6 transition duration-300 hover:bg-black sm:mx-0"
              >
                <h2 className="mb-2 text-2xl font-bold text-white">
                  {link.title}
                </h2>
                <p className="text-gray-600">{link.tips}</p>
              </a>
            </motion.div>
          ))}
        </motion.div>

        {isAdmin && (
          <div className="mt-8 text-center">
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
