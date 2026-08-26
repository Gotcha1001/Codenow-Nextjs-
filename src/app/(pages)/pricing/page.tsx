"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/firebaseConfig";
import { collection, doc, getDoc } from "firebase/firestore";
import Spinner from "@/lib/spinner";
import PaymentForm from "@/app/components/PayNowButton";

// Next.js port of Navbar/Pricing.jsx.
// Same three packages + PayNow modal. Background from settings/"pricing".
// isAdmin was set in the old code but never used in the UI — omitted.

type BackgroundSettings = {
  backgroundMediaUrl?: string;
};

type Package = {
  name: string;
  pages: string;
  price: number;
  description: string;
};

const packages: Package[] = [
  {
    name: "Package 1",
    pages: "2 Pages",
    price: 1000,
    description: "Perfect for small businesses needing a simple web presence.",
  },
  {
    name: "Package 2",
    pages: "5 Pages",
    price: 3000,
    description: "Ideal for growing businesses requiring more content.",
  },
  {
    name: "Package 3",
    pages: "10 Pages",
    price: 5000,
    description: "Comprehensive package for large-scale projects.",
  },
];

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function PricingPage() {
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPayForm, setShowPayForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState({
    price: 0,
    packageName: "",
  });

  useEffect(() => {
    const fetchBackgroundVideoUrl = async () => {
      try {
        const docRef = doc(collection(db, "settings"), "pricing");
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
  }, []);

  const handlePayNowClick = (packageName: string, price: number) => {
    // Toggle off if the same package button is clicked again (matches old label logic)
    if (showPayForm && selectedPackage.packageName === packageName) {
      handleClosePaymentForm();
      return;
    }
    setSelectedPackage({ packageName, price });
    setShowPayForm(true);
  };

  const handleClosePaymentForm = () => {
    setShowPayForm(false);
    setSelectedPackage({ price: 0, packageName: "" });
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

      <div className="relative z-10 w-full max-w-xl p-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="zoom mb-8 rounded-md p-3 text-center font-serif text-4xl font-bold text-white shadow-neon hover:bg-black"
        >
          Pricing
        </motion.h1>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
          className="mb-8 grid grid-cols-1 gap-6"
        >
          {packages.map((pkg) => (
            <motion.div key={pkg.name} variants={cardVariants}>
              <Card className="gradient-background2 border-0 bg-purple-800 text-center text-white shadow-neon transition duration-300">
                <CardContent className="p-6">
                  <h2 className="mb-2 rounded-md bg-black p-3 text-2xl font-semibold">
                    {pkg.name}
                  </h2>
                  <p className="text-xl font-bold">{pkg.pages}</p>
                  <p className="mb-4 text-xl">{pkg.price} Rand</p>
                  <p className="text-white">{pkg.description}</p>
                  <button
                    className="mt-4 rounded-md bg-green-600 px-4 py-2 text-white transition duration-300 hover:bg-green-700"
                    onClick={() => handlePayNowClick(pkg.name, pkg.price)}
                  >
                    {showPayForm && selectedPackage.packageName === pkg.name
                      ? "Cancel"
                      : "Pay Now"}
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {showPayForm && (
          <PaymentForm
            price={selectedPackage.price}
            packageName={selectedPackage.packageName}
            onCancel={handleClosePaymentForm}
          />
        )}
      </div>
    </div>
  );
}
