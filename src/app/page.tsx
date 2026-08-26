// "use client";

// import { useEffect, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { onAuthStateChanged, type User } from "firebase/auth";
// import { collection, doc, getDoc, setDoc } from "firebase/firestore";

// import { auth, db } from "@/lib/firebaseConfig";
// import Spinner from "@/lib/spinner";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// const ADMIN_EMAIL = "admin@example.com";

// // Same five stock photos the old react-bootstrap <Carousel> cycled
// // through on Home.jsx. react-bootstrap isn't part of the new stack, so
// // this is a small self-contained replacement built on framer-motion
// // instead of pulling in an extra carousel dependency.
// const CAROUSEL_SLIDES = [
//   {
//     src: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600",
//     alt: "First slide",
//   },
//   {
//     src: "https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=600",
//     alt: "Second slide",
//   },
//   {
//     src: "https://images.pexels.com/photos/5935794/pexels-photo-5935794.jpeg?auto=compress&cs=tinysrgb&w=600",
//     alt: "Third slide",
//   },
//   {
//     src: "https://images.pexels.com/photos/6853498/pexels-photo-6853498.jpeg?auto=compress&cs=tinysrgb&w=600",
//     alt: "Fourth slide",
//   },
//   {
//     src: "https://images.pexels.com/photos/14011035/pexels-photo-14011035.jpeg?auto=compress&cs=tinysrgb&w=600",
//     alt: "Fifth slide",
//   },
// ];

// // The old markup hard-coded interval={1000} (1s per slide) on the
// // bootstrap Carousel. Kept as-is for parity, even though it's quick.
// const CAROUSEL_INTERVAL_MS = 1000;

// function HeroCarousel() {
//   const [index, setIndex] = useState(0);

//   useEffect(() => {
//     const id = setInterval(() => {
//       setIndex((current) => (current + 1) % CAROUSEL_SLIDES.length);
//     }, CAROUSEL_INTERVAL_MS);
//     return () => clearInterval(id);
//   }, []);

//   return (
//     <div
//       className="relative mb-8 w-full overflow-hidden rounded-lg shadow-lg md:w-3/4"
//       style={{ maxWidth: "600px", aspectRatio: "16 / 9" }}
//     >
//       <AnimatePresence mode="wait">
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <motion.img
//           key={CAROUSEL_SLIDES[index].src}
//           src={CAROUSEL_SLIDES[index].src}
//           alt={CAROUSEL_SLIDES[index].alt}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           transition={{ duration: 0.4 }}
//           className="absolute inset-0 h-full w-full transform object-cover transition-transform duration-300 hover:scale-105"
//         />
//       </AnimatePresence>
//     </div>
//   );
// }

// // The six hover-zoom artwork tiles below the carousel. Same images and
// // spring-hover behavior as the original grid of <motion.img>s.
// const ARTWORK_IMAGES = [
//   "https://images.pexels.com/photos/8134609/pexels-photo-8134609.jpeg?auto=compress&cs=tinysrgb&w=600",
//   "https://images.pexels.com/photos/4816921/pexels-photo-4816921.jpeg?auto=compress&cs=tinysrgb&w=600",
//   "https://images.pexels.com/photos/5380659/pexels-photo-5380659.jpeg?auto=compress&cs=tinysrgb&w=600",
//   "https://images.pexels.com/photos/5380649/pexels-photo-5380649.jpeg?auto=compress&cs=tinysrgb&w=600",
//   "https://images.pexels.com/photos/6963944/pexels-photo-6963944.jpeg?auto=compress&cs=tinysrgb&w=600",
//   "https://images.pexels.com/photos/97077/pexels-photo-97077.jpeg?auto=compress&cs=tinysrgb&w=600",
// ];

// export default function Home() {
//   const [backgroundMediaUrl, setBackgroundMediaUrl] = useState("");
//   const [mainImageUrl, setMainImageUrl] = useState("");
//   const [isBackgroundVideo, setIsBackgroundVideo] = useState(false);
//   const [showBackgroundDialog, setShowBackgroundDialog] = useState(false);
//   const [showMainImageDialog, setShowMainImageDialog] = useState(false);
//   const [newMediaUrl, setNewMediaUrl] = useState("");
//   const [currentUser, setCurrentUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // NOTE: Home.jsx also carried a "Create/Change Profile" button and a
//   // ProfileForm dialog, but both were already commented out in the old
//   // code (dead, unreachable UI), so they aren't ported here.

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setCurrentUser(user);
//     });

//     const fetchBackgroundMedia = async () => {
//       try {
//         const docRef = doc(collection(db, "settings"), "background");
//         const docSnap = await getDoc(docRef);
//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           setBackgroundMediaUrl(data.backgroundMediaUrl || "");
//           setIsBackgroundVideo(data.isBackgroundVideo || false);
//           setMainImageUrl(data.mainImageUrl || "");
//         } else {
//           setBackgroundMediaUrl("");
//           setIsBackgroundVideo(false);
//           setMainImageUrl("");
//         }
//       } catch (error) {
//         console.error("Error fetching background media:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchBackgroundMedia();
//     return unsubscribe;
//   }, []);

//   const handleBackgroundMediaSubmit = async () => {
//     const isVideo = newMediaUrl.endsWith(".mp4");
//     setBackgroundMediaUrl(newMediaUrl);
//     setIsBackgroundVideo(isVideo);
//     setShowBackgroundDialog(false);
//     setNewMediaUrl("");

//     const docRef = doc(collection(db, "settings"), "background");
//     await setDoc(docRef, {
//       backgroundMediaUrl: newMediaUrl,
//       isBackgroundVideo: isVideo,
//       mainImageUrl,
//     });
//   };

//   const handleMainImageUrlSubmit = async () => {
//     setMainImageUrl(newMediaUrl);
//     setShowMainImageDialog(false);
//     setNewMediaUrl("");

//     const docRef = doc(collection(db, "settings"), "background");
//     await setDoc(docRef, {
//       backgroundMediaUrl,
//       isBackgroundVideo,
//       mainImageUrl: newMediaUrl,
//     });
//   };

//   if (isLoading) {
//     return <Spinner />;
//   }

//   const isAdmin = currentUser?.email === ADMIN_EMAIL;

//   return (
//     <div
//       className="relative flex min-h-screen flex-col items-center justify-start p-4"
//       style={{
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//         backgroundAttachment: "fixed",
//         filter: "brightness(90%)",
//       }}
//     >
//       {isBackgroundVideo ? (
//         <video
//           className="absolute inset-0 z-0 h-full w-full object-cover"
//           src={backgroundMediaUrl}
//           autoPlay
//           loop
//           muted
//         />
//       ) : (
//         <div
//           className="absolute inset-0 h-full w-full"
//           style={{ backgroundImage: `url(${backgroundMediaUrl})` }}
//         />
//       )}

//       {isAdmin && (
//         <div className="z-10 flex gap-2">
//           <Button
//             className="relative left-4 top-3 mb-4 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 md:left-3"
//             onClick={() => setShowBackgroundDialog(true)}
//           >
//             Change Background
//           </Button>
//           <Button
//             className="relative left-4 top-3 mb-4 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 md:left-3"
//             onClick={() => setShowMainImageDialog(true)}
//           >
//             Change Main Image
//           </Button>
//         </div>
//       )}

//       <h1 className="gradient-background1 z-50 mb-8 rounded-full p-3 text-center text-3xl font-bold text-white hover:bg-teal-600 md:text-4xl">
//         CODE NOW
//       </h1>

//       {/* Main Image (admin-changeable) */}
//       <div className="mb-8 w-full max-w-xl md:w-3/4">
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img
//           src={mainImageUrl}
//           alt="Main Image"
//           className="zoom mx-auto rounded-lg shadow-lg"
//           style={{ maxWidth: "100%" }}
//         />
//       </div>

//       <HeroCarousel />

//       {/* Artwork Grid */}
//       <div className="mt-4 grid w-full grid-cols-1 gap-4 md:w-3/4 md:grid-cols-2 lg:grid-cols-3">
//         {ARTWORK_IMAGES.map((src) => (
//           <div
//             key={src}
//             className="h-64 w-full transform overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
//           >
//             <motion.img
//               whileHover={{ scale: 1.2 }}
//               transition={{ type: "spring", stiffness: 500 }}
//               style={{ transformOrigin: "center" }}
//               className="h-full w-full object-cover"
//               src={src}
//               alt="Artwork"
//             />
//           </div>
//         ))}
//       </div>

//       {/* Background Media Dialog */}
//       <Dialog
//         open={showBackgroundDialog}
//         onOpenChange={setShowBackgroundDialog}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Enter Background Media URL</DialogTitle>
//           </DialogHeader>
//           <Input
//             type="text"
//             value={newMediaUrl}
//             onChange={(e) => setNewMediaUrl(e.target.value)}
//             placeholder="Enter image or video URL"
//           />
//           <DialogFooter>
//             <Button
//               variant="secondary"
//               onClick={() => setShowBackgroundDialog(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               className="bg-teal-600 hover:bg-teal-700"
//               onClick={handleBackgroundMediaSubmit}
//             >
//               Save
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Main Image URL Dialog */}
//       <Dialog open={showMainImageDialog} onOpenChange={setShowMainImageDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Enter Main Image URL</DialogTitle>
//           </DialogHeader>
//           <Input
//             type="text"
//             value={newMediaUrl}
//             onChange={(e) => setNewMediaUrl(e.target.value)}
//             placeholder="Enter image URL"
//           />
//           <DialogFooter>
//             <Button
//               variant="secondary"
//               onClick={() => setShowMainImageDialog(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               className="bg-teal-600 hover:bg-teal-700"
//               onClick={handleMainImageUrlSubmit}
//             >
//               Save
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { auth, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";

import Spinner from "@/lib/spinner";
import { StarField } from "@/app/components/Starfield";

const ADMIN_EMAIL = "admin@example.com";

type BackgroundSettings = {
  backgroundMediaUrl?: string;
  isBackgroundVideo?: boolean;
  mainImageUrl?: string;
};

const ARTWORK_IMAGES = [
  "https://images.pexels.com/photos/8134609/pexels-photo-8134609.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/4816921/pexels-photo-4816921.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/5380659/pexels-photo-5380659.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/5380649/pexels-photo-5380649.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/6963944/pexels-photo-6963944.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/97077/pexels-photo-97077.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const CAROUSEL_IMAGES = [
  {
    src: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "First slide",
  },
  {
    src: "https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Second slide",
  },
  {
    src: "https://images.pexels.com/photos/5935794/pexels-photo-5935794.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Third slide",
  },
  {
    src: "https://images.pexels.com/photos/6853498/pexels-photo-6853498.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Fourth slide",
  },
  {
    src: "https://images.pexels.com/photos/14011035/pexels-photo-14011035.jpeg?auto=compress&cs=tinysrgb&w=600",
    alt: "Fifth slide",
  },
];

export default function Home() {
  const [backgroundMediaUrl, setBackgroundMediaUrl] = useState<string>("");
  const [mainImageUrl, setMainImageUrl] = useState<string>("");
  const [showBackgroundDialog, setShowBackgroundDialog] =
    useState<boolean>(false);
  const [showMainImageDialog, setShowMainImageDialog] =
    useState<boolean>(false);
  const [newMediaUrl, setNewMediaUrl] = useState<string>("");
  const [isBackgroundVideo, setIsBackgroundVideo] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState<boolean>(false); // State to manage showing the profile dialog
  const [hasProfile, setHasProfile] = useState<boolean>(false); // State to track if the user has a profile
  const [isLoading, setIsLoading] = useState<boolean>(true); // State for loading state

  // Lazy-initialized once, stable across renders — avoids reading a ref's
  // .current during render, which React (compiler/strict mode) now warns on.
  const [autoplayPlugin] = useState(() =>
    Autoplay({ delay: 1000, stopOnInteraction: false }),
  );

  // Declared before the effect that calls it, so there's no
  // "accessed before declaration" complaint from the linter/compiler.
  const checkUserProfile = async (uid: string) => {
    try {
      const profileRef = doc(db, "profiles", uid);
      const profileSnap = await getDoc(profileRef);
      setHasProfile(profileSnap.exists());
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setCurrentUser(user.email);
        setIsAdmin(user.email === ADMIN_EMAIL);
        if (user.uid) checkUserProfile(user.uid); // Check if user has a profile
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        setHasProfile(false); // Reset profile status when user logs out
      }
    });

    const fetchBackgroundMedia = async () => {
      try {
        const docRef = doc(collection(db, "settings"), "background");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as BackgroundSettings;
          setBackgroundMediaUrl(data.backgroundMediaUrl || "");
          setIsBackgroundVideo(data.isBackgroundVideo || false);
          setMainImageUrl(data.mainImageUrl || "");
        } else {
          setBackgroundMediaUrl("");
          setIsBackgroundVideo(false);
          setMainImageUrl("");
        }
      } catch (error) {
        console.error("Error fetching background media:", error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };

    fetchBackgroundMedia();

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackgroundMediaSubmit = async () => {
    const isVideo = newMediaUrl.endsWith(".mp4");
    setBackgroundMediaUrl(newMediaUrl);
    setIsBackgroundVideo(isVideo);
    setShowBackgroundDialog(false);
    setNewMediaUrl("");

    const docRef = doc(collection(db, "settings"), "background");
    await setDoc(docRef, {
      backgroundMediaUrl: newMediaUrl,
      isBackgroundVideo: isVideo,
      mainImageUrl,
    }); // Update background media
  };

  const handleMainImageUrlSubmit = async () => {
    setMainImageUrl(newMediaUrl);
    setShowMainImageDialog(false);
    setNewMediaUrl("");

    const docRef = doc(collection(db, "settings"), "background");
    await setDoc(docRef, {
      backgroundMediaUrl,
      isBackgroundVideo,
      mainImageUrl: newMediaUrl,
    }); // Update main image URL
  };

  const openProfileDialog = () => {
    setShowProfileDialog(true);
  };

  if (isLoading) {
    return <Spinner />; // Show spinner while loading
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-gradient-to-b from-black via-neutral-900 to-black p-4 text-white">
      <StarField count={60} />

      {isBackgroundVideo ? (
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover brightness-90"
          src={backgroundMediaUrl}
          autoPlay
          loop
          muted
        />
      ) : (
        <div
          className="absolute inset-0 z-0 h-full w-full bg-cover bg-center bg-no-repeat brightness-90"
          style={{ backgroundImage: `url(${backgroundMediaUrl})` }}
        />
      )}

      {/* subtle scrim so content stays legible over background media */}
      <div className="absolute inset-0 z-0 bg-black/40" />

      {currentUser === ADMIN_EMAIL && (
        <div className="relative z-10 mb-4 flex flex-wrap justify-center gap-3">
          <button
            className="rounded-full bg-teal-600 px-4 py-2 text-white shadow-lg transition-colors duration-300 hover:bg-teal-500"
            onClick={() => setShowBackgroundDialog(true)}
          >
            Change Background
          </button>
          <button
            className="rounded-full bg-teal-600 px-4 py-2 text-white shadow-lg transition-colors duration-300 hover:bg-teal-500"
            onClick={() => setShowMainImageDialog(true)}
          >
            Change Main Image
          </button>
        </div>
      )}

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-8 rounded-full bg-gradient-to-r from-teal-500 via-purple-500 to-teal-500 bg-[length:200%_auto] p-3 text-center text-3xl font-bold text-white shadow-lg hover:bg-right md:text-4xl"
        style={{ transition: "background-position 0.8s ease" }}
      >
        CODE NOW
      </motion.h1>

      {/* Main Image Changeable */}
      <div className="relative z-10 mb-8 w-full max-w-xl md:w-3/4">
        <img
          src={mainImageUrl}
          alt="Main Image"
          className="zoom mx-auto rounded-lg shadow-lg ring-1 ring-white/10"
          style={{ maxWidth: "100%" }}
        />
      </div>

      {/* Profile Button
            {currentUser && (
                <>
                    {hasProfile ? (
                        <button
                            className=" animate-bounce mb-4 rounded-full bg-teal-600 px-4 py-2 text-white shadow-lg transition-colors duration-300 hover:bg-teal-700"
                            onClick={openProfileDialog}
                        >
                            Change Profile
                        </button>
                    ) : (
                        <button
                            className="zoom mb-4 rounded-full bg-teal-600 px-4 py-2 text-white shadow-2xl transition-colors duration-300 hover:bg-black"
                            onClick={openProfileDialog}
                        >
                            Create Profile
                        </button>
                    )}
                </>
            )} */}

      {/* Profile Creation Form Dialog */}
      {/* {showProfileDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <ProfileForm onClose={() => setShowProfileDialog(false)} />
                    </div>
                </div>
            )} */}

      {/* Background Carousel */}
      <div
        className="relative z-10 mb-8 w-full md:w-3/4"
        style={{ maxWidth: "600px" }}
      >
        <Carousel
          plugins={[autoplayPlugin]}
          onMouseEnter={autoplayPlugin.stop}
          onMouseLeave={autoplayPlugin.reset}
          className="overflow-hidden rounded-lg shadow-lg ring-1 ring-white/10"
        >
          <CarouselContent>
            {CAROUSEL_IMAGES.map(({ src, alt }) => (
              <CarouselItem key={alt}>
                <img
                  className="block w-full transform transition-transform duration-300 hover:scale-105"
                  src={src}
                  alt={alt}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 border-white/20 bg-black/50 text-white hover:bg-black/70 hover:text-white" />
          <CarouselNext className="right-2 border-white/20 bg-black/50 text-white hover:bg-black/70 hover:text-white" />
        </Carousel>
      </div>

      {/* Artwork Grid */}
      <div className="relative z-10 mt-4 grid w-full grid-cols-1 gap-4 md:w-3/4 md:grid-cols-2 lg:grid-cols-3">
        {ARTWORK_IMAGES.map((src) => (
          <div
            key={src}
            className="h-64 w-full transform overflow-hidden rounded-lg shadow-lg ring-1 ring-white/10 transition-transform duration-300 hover:scale-105"
          >
            <motion.img
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 500 }}
              style={{ transformOrigin: "center" }}
              className="h-full w-full object-cover"
              src={src}
              alt="Artwork"
            />
          </div>
        ))}
      </div>

      {/* Background Media Dialog */}
      {showBackgroundDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-neutral-900 p-6 text-white shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">
              Enter Background Media URL
            </h2>
            <input
              type="text"
              value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              placeholder="Enter image or video URL"
              className="mb-4 w-full rounded border border-white/20 bg-neutral-800 p-2 text-white placeholder:text-white/40 focus:border-teal-500 focus:outline-none"
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
                className="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Image URL Dialog */}
      {showMainImageDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-white/10 bg-neutral-900 p-6 text-white shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Enter Main Image URL</h2>
            <input
              type="text"
              value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              placeholder="Enter image URL"
              className="mb-4 w-full rounded border border-white/20 bg-neutral-800 p-2 text-white placeholder:text-white/40 focus:border-teal-500 focus:outline-none"
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
                className="rounded bg-teal-600 px-4 py-2 text-white hover:bg-teal-500"
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
