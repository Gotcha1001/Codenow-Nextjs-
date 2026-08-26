"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import Spinner from "@/lib/spinner";

// Next.js port of Navbar/Testimony.jsx.
// Same six story cards + admin-editable background on settings/"testimony".

const ADMIN_EMAIL = "admin@example.com";

type BackgroundSettings = {
  backgroundMediaUrl?: string;
  isBackgroundVideo?: boolean;
};

type TestimonyCard = {
  title: string;
  body: string;
};

const testimonies: TestimonyCard[] = [
  {
    title: "Where I Started",
    body: "I started my career, after 5 years of Stuyding Jazz and Popular music at Howard Campus KZN, I got my Honors Degree and started my carreer as a music teacher in a primary school, where I worked for 15 years. I loved teaching music to children and watching them grow, but I always felt a pull towards technology.",
  },
  {
    title: "Changing Careers Due to COVID-19",
    body: "Due to the COVID-19 pandemic, I decided to explore programming as a hobby. I began with C++ and quickly found a new passion. The ability to create something from nothing with code fascinated me.",
  },
  {
    title: "Taking the Jump to Full-Time Study",
    body: "I took the leap and enrolled in a bootcamp to study programming full-time. I started with C# and Angular, then moved to a Full Stack Development course. The journey was tough but incredibly rewarding.",
  },
  {
    title: "Transitioning to JavaScript and React",
    body: "After completing the bootcamp, I transitioned to JavaScript and React. Each day, I faced new challenges and learned something new, but my passion for coding kept me motivated.",
  },
  {
    title: "Freelancing and Helping Small Businesses",
    body: "Now, I am freelancing and creating websites for small businesses. I love helping them promote their products and services online. The journey has been rough but fruitful, and I am still learning every day.",
  },
  {
    title: "The Road Ahead is Great",
    body: "I have so much more to learn, and learning shall always be a part of my future. Each new day is a gift to learn something new, and there are countless possibilities. The life of a programmer is a never-ending, evolving journey of embracing all the new technologies, methods, and ways of coding. I am dedicated to this beautiful new career.",
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

export default function TestimonyPage() {
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState("");
  const [showBackgroundDialog, setShowBackgroundDialog] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });

    const fetchBackgroundVideoUrl = async () => {
      try {
        const docRef = doc(collection(db, "settings"), "testimony");
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
      const docRef = doc(collection(db, "settings"), "testimony");
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
          className="zoom mb-8 rounded-md p-4 text-center font-serif text-4xl font-bold text-white shadow-teal hover:bg-black"
        >
          Testimony
        </motion.h1>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={gridVariants}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonies.map((item) => (
            <motion.div key={item.title} variants={cardVariants}>
              <Card className="mx-auto max-w-md flex-1 border-0 bg-black text-white shadow-neon">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-2xl font-bold text-purple-400">
                    {item.title}
                  </h2>
                  <p>{item.body}</p>
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
