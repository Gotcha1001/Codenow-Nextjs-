"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { addDoc, collection, Timestamp } from "firebase/firestore";

// Next.js port of Navbar/SubmitCodeShare.jsx.
// Creates a doc in Firestore "sharing-code" with isApproved: false.
// react-router navigate → next/navigation useRouter.
// Timestamp imported from firebase/firestore (not the config module).

export default function SubmitCodeSharePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [picUrl, setPicUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUserName(user.displayName || user.email || "");
      } else {
        setUserName("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, "sharing-code"), {
        userName: userName || "Anonymous",
        title,
        content,
        picUrl,
        date: Timestamp.now(),
        approved: false,
        isApproved: false,
        likes: 0,
      });

      setTitle("");
      setContent("");
      setPicUrl("");

      alert("Code shared successfully. It will be displayed once approved!");
      router.push("/sharing-code");
    } catch (err) {
      console.error("Error adding code share:", err);
      setError("Failed to add code share.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="form-container gradient-background1 mx-auto mb-4 mt-10 w-full max-w-2xl rounded-lg bg-white p-6 shadow-md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-center text-3xl font-bold text-gray-800">
            Submit Code Share
          </h2>

          {!userName && (
            <p className="text-center text-sm text-amber-700">
              You are not signed in. The share will be posted as Anonymous.
              Consider{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="underline"
              >
                logging in
              </button>{" "}
              first.
            </p>
          )}

          {error && <p className="text-red-500">{error}</p>}

          <div>
            <label className="mb-2 block text-gray-700">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-gray-700">Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Enter your code here..."
              className="h-40 w-full resize-none rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-gray-700">
              Picture URL (optional):
            </label>
            <input
              type="text"
              value={picUrl}
              onChange={(e) => setPicUrl(e.target.value)}
              className="w-full rounded border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push("/sharing-code")}
              className="mr-4 rounded bg-red-500 px-5 py-2 text-white hover:bg-red-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-500 px-5 py-2 text-white hover:bg-blue-600 disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
