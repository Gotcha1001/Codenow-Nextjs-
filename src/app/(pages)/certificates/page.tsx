"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import Spinner from "@/lib/spinner";

// Next.js port of Components/Certificates.jsx.
// Same admin-editable background video + Firestore "certificates"
// settings doc, same certificate images/copy -- just Next routing/typing,
// shadcn Card in place of the old plain div grid, and motion entrance/
// hover animations in place of the old bare <motion.img> hovers.

const ADMIN_EMAIL = "admin@example.com";

type CertificatesSettings = {
  backgroundVideoUrl?: string;
};

type CertificateImage = {
  src: string;
  alt: string;
};

const CERTIFICATE_IMAGES: CertificateImage[] = [
  {
    src: "https://github.com/Gotcha1001/Images-2-Slimming/blob/main/React%20Cert.jpg?raw=true",
    alt: "Certificate 1",
  },
  {
    src: "https://github.com/Gotcha1001/My-Images-for-sites-Wes/blob/main/CertificatesFullStack.jpg?raw=true",
    alt: "Certificate 2",
  },
  {
    src: "https://github.com/Gotcha1001/My-Images-for-sites-Wes/blob/main/CertificatesC%23Fundamentals.jpg?raw=true",
    alt: "Certificate 3",
  },
  {
    src: "https://github.com/Gotcha1001/My-Images-for-sites-Wes/blob/main/CertificatesC%23Intermediate.jpg?raw=true",
    alt: "Certificate 4",
  },
  {
    src: "https://github.com/Gotcha1001/My-Images-for-sites-Wes/blob/main/CertificatesC%23Advanced.jpg?raw=true",
    alt: "Certificate 5",
  },
  {
    src: "https://github.com/Gotcha1001/My-Images-for-sites-Wes/blob/main/CertificatesC%23DatingApp.jpg?raw=true",
    alt: "Certificate 6",
  },
  {
    src: "https://github.com/Gotcha1001/My-Images-for-sites-Wes/blob/main/CertificatesC%23ECommerce.jpg?raw=true",
    alt: "Certificate 7",
  },
];

export default function CertificatesPage() {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showBackgroundDialog, setShowBackgroundDialog] =
    useState<boolean>(false);
  const [newVideoUrl, setNewVideoUrl] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });

    const fetchVideoUrl = async () => {
      try {
        const docRef = doc(collection(db, "settings"), "certificates");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as CertificatesSettings;
          setVideoUrl(data.backgroundVideoUrl || "");
        }
      } catch (error) {
        console.error("Error fetching background video:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoUrl();
    return () => unsubscribe();
  }, []);

  const openBackgroundDialog = () => {
    setNewVideoUrl(videoUrl);
    setShowBackgroundDialog(true);
  };

  const closeBackgroundDialog = () => setShowBackgroundDialog(false);

  const changeBackgroundVideo = async () => {
    const docRef = doc(collection(db, "settings"), "certificates");
    await setDoc(docRef, { backgroundVideoUrl: newVideoUrl });
    setVideoUrl(newVideoUrl);
    closeBackgroundDialog();
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-black p-6 text-white">
      {videoUrl && (
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-50"
          src={videoUrl}
          autoPlay
          loop
          muted
        />
      )}
      <div className="absolute inset-0 z-0 bg-black/40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <h1 className="zoom mb-6 text-center text-4xl font-bold text-purple-400">
          My Programming Certificates
        </h1>
        <p className="mb-6 animate-bounce text-center font-serif text-lg">
          Udemy certificates:
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 grid w-full max-w-6xl grid-cols-1 gap-14 md:grid-cols-2 lg:grid-cols-3"
      >
        {CERTIFICATE_IMAGES.map(({ src, alt }, index) => (
          <motion.div
            key={alt}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.05 }}
          >
            <Card className="overflow-hidden border-0 bg-black shadow-neon">
              <CardContent className="p-0">
                <motion.img
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 500 }}
                  style={{ transformOrigin: "center" }}
                  src={src}
                  alt={alt}
                  className="rounded-lg border-4 border-purple-600 shadow-neon"
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 mt-6 flex justify-center"
        >
          <button
            onClick={openBackgroundDialog}
            className="rounded-lg bg-gray-500 px-4 py-2 text-white shadow-lg transition-colors hover:bg-gray-600"
          >
            Change Background Video
          </button>
        </motion.div>
      )}

      {showBackgroundDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-neutral-900 p-6 text-white shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">
              Change Background Video
            </h2>
            <input
              type="text"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              placeholder="Enter new video URL"
              className="mb-4 w-full rounded border border-white/20 bg-neutral-800 p-2 text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeBackgroundDialog}
                className="rounded bg-white/10 px-4 py-2 text-white/80 hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={changeBackgroundVideo}
                className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
