"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

// Next.js port of Payments/PaymentCancel.jsx.
// Same cancelled-payment message; added motion + a home link for a
// clearer recovery path (original was static text only).

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-black to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-0 bg-white shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-800">
              Payment Cancelled
            </h2>
            <p className="mb-6 text-lg text-gray-700">
              Your payment was cancelled.
            </p>
            <Link
              href="/pricing"
              className="inline-block rounded-lg bg-purple-600 px-5 py-2 font-semibold text-white transition duration-300 hover:bg-purple-700"
            >
              Back to Pricing
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
