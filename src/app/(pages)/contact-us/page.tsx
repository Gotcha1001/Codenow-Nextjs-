"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import Spinner from "@/lib/spinner";

// Next.js port of Navbar/ContactUs.jsx.
// Same contact / banking / socials content, same settings/"contact-us"
// background video, same PDF requirements download. Admin uses
// onAuthStateChanged; DownloadPDFButton is inlined (old import from
// PDFForm.jsx) so this page does not depend on the pdf-form route yet.

const ADMIN_EMAIL = "admin@example.com";

const PDF_URL =
  "https://raw.githubusercontent.com/Gotcha1001/My-Images-for-sites-Wes/main/Website%20Client%20Form1.pdf";

type BackgroundSettings = {
  backgroundMediaUrl?: string;
  isBackgroundVideo?: boolean;
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

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

function DownloadPDFButton() {
  return (
    <div className="gradient-background2 rounded-lg p-8 text-center shadow-lg">
      <h2 className="mb-6 animate-bounce rounded-lg p-3 text-3xl font-bold text-purple-700 hover:bg-black">
        Download the Website Requirements Form
      </h2>
      <a
        href={PDF_URL}
        target="_blank"
        rel="noopener noreferrer"
        download
        className="inline-block rounded-md bg-purple-600 px-6 py-3 text-lg font-semibold text-white shadow-neon transition duration-300 hover:bg-purple-700"
      >
        Download PDF
      </a>
    </div>
  );
}

export default function ContactUsPage() {
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
        const docRef = doc(collection(db, "settings"), "contact-us");
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
      const docRef = doc(collection(db, "settings"), "contact-us");
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
          className="zoom mb-8 rounded-md p-4 text-center font-serif text-4xl font-bold text-white hover:bg-black"
        >
          Contact Us
        </motion.h1>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={gridVariants}
          className="mb-8 grid grid-cols-1 items-center justify-center gap-6 lg:grid-cols-2"
        >
          {/* Contact Information */}
          <motion.div variants={cardVariants}>
            <Card className="gradient-background2 mx-auto max-w-md border-0 bg-purple-800 text-white shadow-sunset">
              <CardContent className="p-6">
                <h2 className="zoom mb-2 rounded-lg bg-black p-3 text-center text-2xl font-semibold">
                  Contact Information
                </h2>
                <p className="mb-4 text-xl">
                  Email:{" "}
                  <a
                    href="mailto:WesleyOlivier443@gmail.com"
                    className="text-blue-400 hover:underline"
                  >
                    CodeNow101@gmail.com
                  </a>
                </p>
                <p className="mb-4 text-xl">
                  Phone:{" "}
                  <a
                    href="tel:+2780077368"
                    className="text-blue-400 hover:underline"
                  >
                    +27 80077368
                  </a>
                </p>
                <p className="mb-4 text-xl">
                  Address: 110 Manfred Drive, Park Hill, Durban North
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Banking Details */}
          <motion.div variants={cardVariants}>
            <Card className="gradient-background2 mx-auto max-w-md border-0 bg-purple-800 text-white shadow-sunset">
              <CardContent className="p-6">
                <h2 className="zoom mb-2 rounded-lg bg-black p-3 text-center text-2xl font-semibold">
                  Banking Details
                </h2>
                <p className="mb-4 text-xl">Bank: Standard Bank</p>
                <p className="mb-4 text-xl">Account Number: 251884783</p>
                <p className="mb-4 text-xl">Account Holder: MR WW OLIVIER</p>
                <p className="mb-4 text-xl">Branch Code: 051001</p>
                <p className="mb-4 text-xl">SWIFT Code: SBZAZAJJ</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Follow Us */}
          <motion.div
            variants={cardVariants}
            className="col-span-1 lg:col-span-2"
          >
            <Card className="mx-auto max-w-lg border-0 bg-purple-800 text-white shadow-sunset transition duration-300 hover:bg-purple-600">
              <CardContent className="p-6">
                <h2 className="zoom mb-3 text-center text-2xl font-semibold">
                  Follow Us
                </h2>
                <div className="flex justify-center space-x-4">
                  <a
                    href="https://www.facebook.com/profile.php?id=61563719426651"
                    className="animate-bounce text-blue-600 hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <FaFacebook size={40} />
                  </a>
                  <a
                    href="https://www.instagram.com/codenow101?igsh=MWsyMWs1ZGRwYzc2cg=="
                    className="animate-bounce text-pink-600 hover:text-pink-800"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <FaInstagram size={40} />
                  </a>
                  <a
                    href="https://wa.me/27780077368"
                    className="animate-bounce text-green-500 hover:text-green-700"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp size={40} />
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* PDF download (was DownloadPDFButton from PDFForm.jsx) */}
          <motion.div
            variants={cardVariants}
            className="col-span-1 mx-auto max-w-lg text-center lg:col-span-2"
          >
            <DownloadPDFButton />
          </motion.div>
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
                Cancel
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
