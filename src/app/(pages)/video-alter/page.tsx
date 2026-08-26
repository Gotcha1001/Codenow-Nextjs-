"use client";

import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import Spinner from "@/lib/spinner";
import Pagination from "@/app/components/Pagination";
import VideoEmbed from "@/app/components/VideoEmbed";

// Next.js port of Navbar/VideoAlter.jsx (AlterUploads).
// Admin list of Firestore "videos": edit modal, delete, pagination.
// react-router navigate → useRouter; shared Pagination/VideoEmbed/Spinner.

const VIDEOS_PER_PAGE = 5;

type VideoItem = {
  id: string;
  title?: string;
  postedBy?: string;
  videoUrl?: string;
  content?: string;
  likes?: number;
  /** Display string like "d-m-yyyy" for the list */
  dateDisplay: string | null;
  /** Raw seconds if present (for editing) */
  dateSeconds: number | null;
};

type FormValues = {
  title: string;
  postedBy: string;
  videoUrl: string;
  content: string;
  date: string; // yyyy-mm-dd for <input type="date">
  likes: number;
};

function formatListDate(date: Date | null): string | null {
  if (!date || Number.isNaN(date.getTime())) return null;
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
}

function toDateFromFirestore(value: unknown): Date | null {
  if (!value) return null;
  if (
    typeof value === "object" &&
    value !== null &&
    "seconds" in value &&
    typeof (value as { seconds: number }).seconds === "number"
  ) {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  ) {
    return (value as Timestamp).toDate();
  }
  return null;
}

export default function VideoAlterPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    title: "",
    postedBy: "",
    videoUrl: "",
    content: "",
    date: "",
    likes: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const q = query(collection(db, "videos"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const videoList: VideoItem[] = querySnapshot.docs.map((d) => {
          const data = d.data();
          const dateObj = toDateFromFirestore(data.date);
          const seconds =
            data.date && typeof data.date === "object" && "seconds" in data.date
              ? (data.date as { seconds: number }).seconds
              : dateObj
                ? Math.floor(dateObj.getTime() / 1000)
                : null;

          return {
            id: d.id,
            title: data.title as string | undefined,
            postedBy: data.postedBy as string | undefined,
            videoUrl: data.videoUrl as string | undefined,
            content: data.content as string | undefined,
            likes: (data.likes as number | undefined) ?? 0,
            dateDisplay: formatListDate(dateObj),
            dateSeconds: seconds,
          };
        });
        setVideos(videoList);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const scrollToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleEdit = (video: VideoItem) => {
    try {
      setEditingVideo(video.id);
      let dateISO = "";
      if (video.dateSeconds != null) {
        const date = new Date(video.dateSeconds * 1000);
        if (!Number.isNaN(date.getTime())) {
          dateISO = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        }
      }
      setFormValues({
        title: video.title || "",
        postedBy: video.postedBy || "",
        videoUrl: video.videoUrl || "",
        content: video.content || "",
        date: dateISO,
        likes: video.likes || 0,
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error in handleEdit:", err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    try {
      const [year, month, day] = formValues.date.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      await updateDoc(doc(db, "videos", editingVideo), {
        title: formValues.title,
        postedBy: formValues.postedBy,
        videoUrl: formValues.videoUrl,
        content: formValues.content,
        likes: Number(formValues.likes) || 0,
        date: Timestamp.fromDate(date),
      });

      setVideos((prev) =>
        prev.map((video) =>
          video.id === editingVideo
            ? {
                ...video,
                title: formValues.title,
                postedBy: formValues.postedBy,
                videoUrl: formValues.videoUrl,
                content: formValues.content,
                likes: Number(formValues.likes) || 0,
                dateDisplay: formatListDate(date),
                dateSeconds: Math.floor(date.getTime() / 1000),
              }
            : video,
        ),
      );

      setEditingVideo(null);
      setIsModalOpen(false);
      router.push("/coding-videos");
      scrollToTop();
    } catch (err) {
      console.error("Error updating video:", err);
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      await deleteDoc(doc(db, "videos", videoId));
      setVideos((prev) => prev.filter((video) => video.id !== videoId));
    } catch (err) {
      console.error("Error deleting video:", err);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === "likes" ? Number(value) : value,
    }));
  };

  const nextPage = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, Math.ceil(videos.length / VIDEOS_PER_PAGE) || 1),
    );
    scrollToTop();
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    scrollToTop();
  };

  const indexOfLastVideo = currentPage * VIDEOS_PER_PAGE;
  const indexOfFirstVideo = indexOfLastVideo - VIDEOS_PER_PAGE;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <p className="p-8 text-center text-red-400">{error}</p>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-r from-black to-white p-4">
      <motion.h1
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-8 text-4xl font-bold text-white"
      >
        Alter Uploads
      </motion.h1>

      <div className="mt-8 w-full max-w-2xl rounded-lg bg-white p-6 shadow-md">
        {currentVideos.map((video) => (
          <div
            key={video.id}
            className="gradient-background1 mb-4 rounded-lg border-b border-gray-300 p-4 last:border-b-0"
          >
            <h2 className="text-xl font-bold text-white">{video.title}</h2>
            <p className="text-white">Posted By: {video.postedBy}</p>
            <p className="text-white">Content: {video.content}</p>
            <p className="text-white">Date: {video.dateDisplay}</p>
            <p className="text-white">Likes: {video.likes ?? 0}</p>
            {video.videoUrl && (
              <div className="mx-auto my-8 w-full max-w-full overflow-hidden rounded-lg">
                <VideoEmbed videoUrl={video.videoUrl} />
              </div>
            )}
            <button
              className="mr-2 rounded-md bg-yellow-500 px-4 py-2 text-white transition duration-300 hover:bg-yellow-600"
              onClick={() => handleEdit(video)}
            >
              Edit
            </button>
            <button
              className="rounded-md bg-red-500 px-4 py-2 text-white transition duration-300 hover:bg-red-600"
              onClick={() => handleDelete(video.id)}
            >
              Delete
            </button>
          </div>
        ))}

        <Pagination
          itemsPerPage={VIDEOS_PER_PAGE}
          totalItems={videos.length}
          currentPage={currentPage}
          nextPage={nextPage}
          prevPage={prevPage}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/75">
          <div className="mx-auto w-full max-w-lg rounded-lg bg-white p-8 shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Edit Video</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2 block font-semibold text-gray-700">
                  Title:
                </label>
                <input
                  type="text"
                  name="title"
                  value={formValues.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block font-semibold text-gray-700">
                  Posted By:
                </label>
                <input
                  type="text"
                  name="postedBy"
                  value={formValues.postedBy}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block font-semibold text-gray-700">
                  Video URL:
                </label>
                <input
                  type="text"
                  name="videoUrl"
                  value={formValues.videoUrl}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block font-semibold text-gray-700">
                  Content:
                </label>
                <textarea
                  name="content"
                  value={formValues.content}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block font-semibold text-gray-700">
                  Date:
                </label>
                <input
                  type="date"
                  name="date"
                  value={formValues.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block font-semibold text-gray-700">
                  Likes:
                </label>
                <input
                  type="number"
                  name="likes"
                  value={formValues.likes}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 rounded-md bg-gray-500 px-4 py-2 text-white transition duration-300 hover:bg-gray-600"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-500 px-4 py-2 text-white transition duration-300 hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
