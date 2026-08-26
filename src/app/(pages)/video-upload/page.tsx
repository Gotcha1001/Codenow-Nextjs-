"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebaseConfig";
import { addDoc, collection, Timestamp } from "firebase/firestore";

// Next.js port of Navbar/VideoUpload.jsx.
// Adds a doc to Firestore "videos". navigate → useRouter.
// postedBy uses auth.currentUser.email (same as original).

export default function VideoUploadPage() {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = auth.currentUser?.email;
      if (!email) {
        setError("You must be logged in to upload a video.");
        setLoading(false);
        return;
      }

      await addDoc(collection(db, "videos"), {
        title,
        videoUrl,
        content,
        date: Timestamp.now(),
        postedBy: email,
        embeddable: true,
        likes: 0,
      });

      setTitle("");
      setVideoUrl("");
      setContent("");

      alert("Video uploaded successfully!");
      router.push("/coding-videos");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload video.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/coding-videos");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        onSubmit={handleSubmit}
        className="gradient-background1 mx-auto mb-3 mt-4 w-full max-w-lg rounded-lg bg-white p-8 shadow-md"
      >
        <h2 className="mb-4 text-2xl font-bold text-white">Upload Video</h2>

        {error && <p className="mb-4 text-red-500">{error}</p>}

        <div className="mb-4">
          <label className="mb-2 block font-semibold text-white">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-semibold text-white">
            Video URL:
          </label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-semibold text-white">
            Content:
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="h-40 w-full resize-none whitespace-pre-wrap rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-md bg-gray-500 px-4 py-2 text-white transition duration-300 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-500 px-4 py-2 text-white transition duration-300 hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
