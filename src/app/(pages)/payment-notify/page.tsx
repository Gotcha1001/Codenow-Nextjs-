"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { Card, CardContent } from "@/components/ui/card";

// Next.js port of Payments/PaymentNotify.jsx.
// Same client-side EmailJS send from sessionStorage paymentDetails +
// success UI. Env vars use NEXT_PUBLIC_* (old VITE_*). Note: real PayFast
// ITN hits the server /api/payment/notify route; this page is the browser
// fallback the old app used after redirect.

type PaymentDetails = {
  packageName?: string;
  amount?: string | number;
  email?: string;
};

export default function PaymentNotifyPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  useEffect(() => {
    const sendEmail = async () => {
      const raw = sessionStorage.getItem("paymentDetails");
      if (!raw) {
        setStatus("idle");
        return;
      }

      let paymentDetails: PaymentDetails;
      try {
        paymentDetails = JSON.parse(raw) as PaymentDetails;
      } catch {
        console.error("Invalid paymentDetails in sessionStorage");
        setStatus("error");
        return;
      }

      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const userId = process.env.NEXT_PUBLIC_EMAILJS_USER_ID;

      if (!serviceId || !templateId || !userId) {
        console.error("Missing NEXT_PUBLIC_EMAILJS_* env vars");
        setStatus("error");
        return;
      }

      const templateParams = {
        firstname: "Customer",
        package_name: paymentDetails.packageName ?? "Payment for service",
        amount: paymentDetails.amount ?? "",
        purchase_date: new Date().toLocaleDateString(),
        order_id: `ORDER-${Date.now()}`,
        email: paymentDetails.email ?? "",
      };

      setStatus("sending");
      try {
        const response = await emailjs.send(
          serviceId,
          templateId,
          templateParams,
          userId,
        );
        console.log("Email sent successfully!", response.status, response.text);
        setStatus("sent");
        // Clear so a refresh does not re-send
        sessionStorage.removeItem("paymentDetails");
      } catch (error) {
        console.error("Failed to send email. Error:", error);
        setStatus("error");
      }
    };

    void sendEmail();
  }, []);

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
              Payment Notification Received
            </h2>
            <p className="mb-4 text-lg text-gray-700">
              Thank you for your payment. Your transaction was successful.
            </p>
            {status === "sending" && (
              <p className="mb-4 text-sm text-gray-500">
                Sending confirmation email…
              </p>
            )}
            {status === "sent" && (
              <p className="mb-4 text-sm text-green-600">
                Confirmation email sent.
              </p>
            )}
            {status === "error" && (
              <p className="mb-4 text-sm text-amber-600">
                We could not send the confirmation email automatically. You
                should still receive a receipt from our payment processor.
              </p>
            )}
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
