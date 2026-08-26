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
import VideoEmbed from "@/app/components/VideoEmbed";
import Pagination from "@/app/components/Pagination";

// Next.js port of Navbar/CodingVideos.jsx (exported as VideoDisplay).
// Same Firestore "videos" list + likes increment, same settings/
// "coding-videos" background video, same pagination (5 per page) and
// VideoEmbed — typed, with onAuthStateChanged for admin, setDoc for
// background so missing docs still work, and Framer Motion on the list.

const ADMIN_EMAIL = "admin@example.com";
const VIDEOS_PER_PAGE = 5;

type BackgroundSettings = {
  backgroundMediaUrl?: string;
  isBackgroundVideo?: boolean;
};

type VideoItem = {
  id: string;
  title?: string;
  postedBy?: string;
  videoUrl?: string;
  content?: string;
  likes?: number;
  date: Date | null;
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toDate(value: unknown): Date | null {
  if (!value) return null;
  // Firestore Timestamp
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  ) {
    return (value as Timestamp).toDate();
  }
  // Seconds number
  if (typeof value === "number") {
    return new Date(value * 1000);
  }
  // Already a Date / ISO string
  const d = new Date(value as string | number | Date);
  return Number.isNaN(d.getTime()) ? null : d;
}

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function CodingVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState("");
  const [showBackgroundDialog, setShowBackgroundDialog] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "videos"));
        const videoList: VideoItem[] = querySnapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title as string | undefined,
            postedBy: data.postedBy as string | undefined,
            videoUrl: data.videoUrl as string | undefined,
            content: data.content as string | undefined,
            likes: (data.likes as number | undefined) ?? 0,
            date: toDate(data.date),
          };
        });

        videoList.sort((a, b) => {
          const ta = a.date?.getTime() ?? 0;
          const tb = b.date?.getTime() ?? 0;
          return tb - ta;
        });

        setVideos(videoList);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos.");
      } finally {
        setLoading(false);
      }
    };

    const fetchBackgroundVideoUrl = async () => {
      try {
        const docRef = doc(collection(db, "settings"), "coding-videos");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as BackgroundSettings;
          if (data.backgroundMediaUrl) {
            setBackgroundVideoUrl(data.backgroundMediaUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching background video URL:", err);
      }
    };

    fetchVideos();
    fetchBackgroundVideoUrl();
  }, []);

  const incrementLikes = async (videoId: string, currentLikes?: number) => {
    try {
      const videoRef = doc(db, "videos", videoId);
      const updatedLikes = Number(currentLikes ?? 0) + 1;
      await updateDoc(videoRef, { likes: updatedLikes });
      setVideos((prev) =>
        prev.map((video) =>
          video.id === videoId ? { ...video, likes: updatedLikes } : video,
        ),
      );
    } catch (err) {
      console.error("Error incrementing likes:", err);
    }
  };

  const indexOfLastVideo = currentPage * VIDEOS_PER_PAGE;
  const indexOfFirstVideo = indexOfLastVideo - VIDEOS_PER_PAGE;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const nextPage = () => {
    setCurrentPage((prev) => {
      const next = Math.min(
        prev + 1,
        Math.ceil(videos.length / VIDEOS_PER_PAGE),
      );
      scrollToTop();
      return next;
    });
  };

  const prevPage = () => {
    setCurrentPage((prev) => {
      const p = Math.max(prev - 1, 1);
      scrollToTop();
      return p;
    });
  };

  const openBackgroundDialog = () => {
    setNewVideoUrl(backgroundVideoUrl);
    setShowBackgroundDialog(true);
  };

  const closeBackgroundDialog = () => setShowBackgroundDialog(false);

  const changeBackgroundVideo = async () => {
    try {
      const docRef = doc(collection(db, "settings"), "coding-videos");
      // setDoc so a missing settings doc still works (old code only updateDoc)
      await setDoc(
        docRef,
        {
          backgroundMediaUrl: newVideoUrl,
          isBackgroundVideo: true,
        },
        { merge: true },
      );
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

  if (error) {
    return <p className="p-8 text-center text-red-400">{error}</p>;
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
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="zoom mb-8 rounded-md p-4 text-center font-serif text-4xl font-bold text-white hover:bg-black"
        >
          Coding Tips and Videos
        </motion.h1>

        {isAdmin ? (
          <div className="mb-4 flex justify-center">
            <button
              className="rounded-md bg-indigo-800 px-4 py-2 text-white transition duration-300 hover:bg-green-600"
              onClick={openBackgroundDialog}
            >
              Change Background
            </button>
          </div>
        ) : (
          <p className="mb-4 text-center text-white">
            Learn to code step by step
          </p>
        )}

        <motion.div
          key={currentPage}
          initial="hidden"
          animate="visible"
          variants={listVariants}
        >
          {currentVideos.map((video) => (
            <motion.div
              key={video.id}
              variants={itemVariants}
              className="card-content mx-auto mb-8 mt-4 w-full rounded-lg bg-black p-4 shadow-teal lg:w-2/3"
            >
              <h2 className="text-2xl font-bold text-white">{video.title}</h2>
              <p className="mb-1 text-lg text-gray-300">
                Posted By: {video.postedBy}
              </p>
              <p className="mb-1 text-lg text-gray-300">
                Date: {formatDate(video.date)}
              </p>
              {video.videoUrl && (
                <div className="mx-auto w-full max-w-full overflow-hidden rounded-lg">
                  <VideoEmbed videoUrl={video.videoUrl} />
                </div>
              )}
              <p className="mb-3 mt-4 text-gray-300">
                Content: {video.content}
              </p>
              <div className="flex items-center">
                <button
                  className="rounded-md bg-blue-500 px-4 py-2 text-white transition duration-300 hover:bg-blue-600"
                  onClick={() => incrementLikes(video.id, video.likes)}
                >
                  Likes {video.likes ?? 0}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <Pagination
          itemsPerPage={VIDEOS_PER_PAGE}
          totalItems={videos.length}
          currentPage={currentPage}
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
