"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

// Next.js port of Payments/PayNowButton.jsx (PaymentForm).
// Posts name/email/amount to the PayFast server API and redirects to
// paymentUrl. Uses NEXT_PUBLIC_SERVER_URL (fallback to the live API).

type PaymentFormProps = {
  price: number;
  packageName: string;
  onCancel: () => void;
};

type FormData = {
  name: string;
  email: string;
  amount: number;
};

export default function PaymentForm({
  price,
  packageName,
  onCancel,
}: PaymentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    amount: price,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      "https://server-api-seven.vercel.app";

    try {
      // Stash details for payment-notify / success pages
      sessionStorage.setItem(
        "paymentDetails",
        JSON.stringify({
          packageName,
          amount: formData.amount,
          email: formData.email,
        }),
      );

      const response = await fetch(`${serverUrl}/api/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          amount: formData.amount,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = (await response.json()) as { paymentUrl?: string };
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        setError("Payment initiation failed");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white transition duration-300 hover:bg-red-600"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          Make a Payment for {packageName}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block font-semibold text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block font-semibold text-gray-700">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              readOnly
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            />
          </div>
          {error && <p className="mb-4 text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white transition duration-300 hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
