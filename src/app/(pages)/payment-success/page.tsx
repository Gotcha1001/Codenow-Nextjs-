"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const SUCCESS_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdr1DMONakU9MUecTXVHg290MknEaXlFRhrA&s";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const { packageName, amount } = useMemo(() => {
    return {
      packageName: searchParams.get("item_name") || "Unknown",
      amount: searchParams.get("amount") || "0.00",
    };
  }, [searchParams]);

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
            <h1 className="mb-4 text-4xl font-bold text-gray-800">
              Successful Payment
            </h1>
            <p className="mb-2 text-lg text-gray-700">
              Thank you for your payment
            </p>
            {(packageName !== "Unknown" || amount !== "0.00") && (
              <p className="mb-6 text-sm text-gray-600">
                {packageName !== "Unknown" && (
                  <>
                    <span className="font-semibold">{packageName}</span>
                    {amount !== "0.00" && " — "}
                  </>
                )}
                {amount !== "0.00" && (
                  <span className="font-semibold">R {amount}</span>
                )}
              </p>
            )}
            <div className="mx-auto mb-8 h-64 w-64">
              <img
                src={SUCCESS_IMAGE}
                alt="Success"
                className="h-full w-full rounded-lg object-cover"
              />
            </div>
            <Link
              href="/"
              className="inline-block rounded-lg bg-purple-600 px-5 py-2 font-semibold text-white transition duration-300 hover:bg-purple-700"
            >
              Back Home
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-black to-white">
          <p className="text-white">Loading…</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
