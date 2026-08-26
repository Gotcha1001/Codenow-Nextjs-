"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import Spinner from "@/lib/spinner";

// Next.js port of Navbar/AboutUs.jsx.
// Same admin-editable background/main image + Firestore "about-us"
// settings doc, same copy -- just Next routing/typing, shadcn Carousel
// in place of react-bootstrap, and motion entrance/stagger animations.

const ADMIN_EMAIL = "admin@example.com";

type AboutUsSettings = {
  backgroundMediaUrl?: string;
  isBackgroundVideo?: boolean;
  mainImageUrl?: string;
};

const CAROUSEL_IMAGES = [
  {
    src: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Slide 1",
  },
  {
    src: "https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Slide 2",
  },
  {
    src: "https://images.pexels.com/photos/5935794/pexels-photo-5935794.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Slide 3",
  },
];

const ARTWORK_IMAGES = [
  {
    src: "https://images.pexels.com/photos/8134609/pexels-photo-8134609.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Artwork 1",
  },
  {
    src: "https://images.pexels.com/photos/4816921/pexels-photo-4816921.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Artwork 2",
  },
  {
    src: "https://images.pexels.com/photos/5380659/pexels-photo-5380659.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Artwork 3",
  },
];

const SERVICES = [
  "Responsive designs that look great on any device",
  "Authentication and dynamic content",
  "Video moving backgrounds",
  "Functionality for users to change their homepage background or main image at will",
  "Logo creation",
  "Social media integration",
  "Email functionality",
  "Effective marketing strategies to boost online presence",
  "Excellent communication and accessibility to the business owner",
];

export default function AboutUsPage() {
  const [backgroundMediaUrl, setBackgroundMediaUrl] = useState<string>("");
  const [mainImageUrl, setMainImageUrl] = useState<string>("");
  const [showBackgroundDialog, setShowBackgroundDialog] =
    useState<boolean>(false);
  const [showMainImageDialog, setShowMainImageDialog] =
    useState<boolean>(false);
  const [newMediaUrl, setNewMediaUrl] = useState<string>("");
  const [isBackgroundVideo, setIsBackgroundVideo] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });

    const fetchBackgroundMedia = async () => {
      try {
        const docRef = doc(collection(db, "settings"), "about-us");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as AboutUsSettings;
          setBackgroundMediaUrl(data.backgroundMediaUrl || "");
          setIsBackgroundVideo(data.isBackgroundVideo || false);
          setMainImageUrl(data.mainImageUrl || "");
        }
      } catch (error) {
        console.error("Error fetching background media:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBackgroundMedia();

    return () => unsubscribe();
  }, []);

  const handleBackgroundMediaSubmit = async () => {
    const isVideo = newMediaUrl.endsWith(".mp4");
    setBackgroundMediaUrl(newMediaUrl);
    setIsBackgroundVideo(isVideo);
    setShowBackgroundDialog(false);
    setNewMediaUrl("");
    const docRef = doc(collection(db, "settings"), "about-us");
    await setDoc(docRef, {
      backgroundMediaUrl: newMediaUrl,
      isBackgroundVideo: isVideo,
      mainImageUrl,
    });
  };

  const handleMainImageUrlSubmit = async () => {
    setMainImageUrl(newMediaUrl);
    setShowMainImageDialog(false);
    setNewMediaUrl("");
    const docRef = doc(collection(db, "settings"), "about-us");
    await setDoc(docRef, {
      backgroundMediaUrl,
      isBackgroundVideo,
      mainImageUrl: newMediaUrl,
    });
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black p-4 text-white">
      {isBackgroundVideo ? (
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover brightness-75"
          src={backgroundMediaUrl}
          autoPlay
          loop
          muted
        />
      ) : (
        <div
          className="absolute inset-0 z-0 h-full w-full bg-cover bg-center bg-no-repeat brightness-75"
          style={{ backgroundImage: `url(${backgroundMediaUrl})` }}
        />
      )}
      {/* subtle scrim so content stays legible over background media */}
      <div className="absolute inset-0 z-0 bg-black/40" />

      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 mb-10 flex items-center justify-center"
        >
          <div className="flex flex-col items-center space-y-2 rounded-lg bg-white p-4 shadow-lg">
            <button
              className="rounded bg-purple-600 px-4 py-2 text-white shadow-lg transition-colors hover:bg-purple-700"
              onClick={() => setShowBackgroundDialog(true)}
            >
              Change Background
            </button>
            <button
              className="rounded bg-purple-600 px-4 py-2 text-white shadow-lg transition-colors hover:bg-purple-700"
              onClick={() => setShowMainImageDialog(true)}
            >
              Change Main Image
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <h1 className="mb-10 bg-gradient-to-r from-teal-400 via-purple-400 to-teal-400 bg-clip-text text-center text-4xl font-bold text-transparent">
          About Us
        </h1>
        <div className="mb-8 flex w-full max-w-lg justify-center">
          <motion.img
            whileHover={{ scale: 1.2 }}
            transition={{ type: "spring", stiffness: 500 }}
            src={mainImageUrl}
            alt="Main"
            className="rounded-lg shadow-neon"
            style={{
              width: "400px",
              height: "300px",
              objectFit: "cover",
              transformOrigin: "center",
            }}
          />
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="neon-purple relative z-10 mb-10 rounded-xl bg-black py-6 md:py-8"
      >
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center">
            <h2 className="mb-4 text-4xl font-bold text-white">About Us</h2>
            <p className="text-lg text-white">
              Discover our journey from C# to JavaScript and Next.js, and learn
              how we can help elevate your small business online.
            </p>
          </div>
          <div className="flex flex-col gap-8 rounded-lg p-1 shadow-neon md:flex-row md:p-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="md:w-1/2"
            >
              <Card className="mt-3 mr-3 ml-3 border-0 bg-black shadow-sky">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-3xl font-semibold text-white">
                    Our Services
                  </h2>
                  <p className="mb-4 text-base text-white">
                    We specialize in crafting custom-made websites for small
                    businesses with responsive designs for all screen sizes. Our
                    services include:
                  </p>
                  <ul className="mb-4 list-disc pl-5 text-white">
                    {SERVICES.map((service) => (
                      <li key={service}>{service}</li>
                    ))}
                  </ul>
                  <p className="text-base text-white">
                    Let us help you make a lasting impression on the web and
                    connect with your audience effectively.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="md:w-1/2"
            >
              <Card className="mt-3 mr-3 ml-3 border-0 bg-black shadow-sky">
                <CardContent className="p-12">
                  <h2 className="mb-4 text-3xl font-semibold text-white">
                    Our Journey
                  </h2>
                  <p className="mb-4 text-base text-white">
                    My programming journey began with C#, where I developed a
                    strong foundation in object-oriented programming and desktop
                    applications. As technology evolved, so did my skills,
                    leading me to a comprehensive Full Stack Development course.
                    This course expanded my expertise to modern web
                    technologies, including Angular and React, enabling me to
                    build dynamic and interactive web applications.
                  </p>
                  <p className="text-base text-white">
                    Today, I work primarily with JavaScript and Next.js,
                    creating efficient and scalable web solutions. My focus is
                    on delivering high-quality websites for small businesses,
                    helping them establish a strong online presence and achieve
                    their marketing goals.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mb-8 w-full md:w-3/4"
      >
        <Carousel className="overflow-hidden rounded-lg shadow-neon">
          <CarouselContent>
            {CAROUSEL_IMAGES.map(({ src, alt }) => (
              <CarouselItem key={alt}>
                <img className="block w-full rounded-lg" src={src} alt={alt} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 border-white/20 bg-black/50 text-white hover:bg-black/70 hover:text-white" />
          <CarouselNext className="right-2 border-white/20 bg-black/50 text-white hover:bg-black/70 hover:text-white" />
        </Carousel>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {ARTWORK_IMAGES.map(({ src, alt }) => (
          <div key={alt} className="h-64 overflow-hidden rounded-lg shadow-lg">
            <motion.img
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 500 }}
              style={{ transformOrigin: "center" }}
              className="h-full w-full object-cover"
              src={src}
              alt={alt}
            />
          </div>
        ))}
      </motion.div>

      {showBackgroundDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-neutral-900 p-6 text-white shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">
              Update Background Media
            </h2>
            <input
              type="text"
              value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              placeholder="Enter image or video URL"
              className="mb-4 w-full rounded border border-white/20 bg-neutral-800 p-2 text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowBackgroundDialog(false)}
                className="mr-2 rounded bg-white/10 px-4 py-2 text-white/80 hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleBackgroundMediaSubmit}
                className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showMainImageDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-neutral-900 p-6 text-white shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Update Main Image</h2>
            <input
              type="text"
              value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              placeholder="Enter image URL"
              className="mb-4 w-full rounded border border-white/20 bg-neutral-800 p-2 text-white placeholder:text-white/40 focus:border-purple-500 focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowMainImageDialog(false)}
                className="mr-2 rounded bg-white/10 px-4 py-2 text-white/80 hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleMainImageUrlSubmit}
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
