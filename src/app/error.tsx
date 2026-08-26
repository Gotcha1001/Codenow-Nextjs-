"use client";

import Link from "next/link";

// Replaces the "something threw" half of the old errorElement
// (SpecialSetups/Error.jsx). Error boundaries in the App Router must be
// client components and receive (error, reset) props from Next.js.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 gradient-background2">
      <div className="rounded-lg bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 text-5xl font-bold text-red-500">Oops!</h1>
        <p className="mb-6 text-lg">Sorry, an unexpected error has occurred.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://github.com/Gotcha1001/My-Images-for-sites-Wes/blob/main/Gamingpic.jpg?raw=true"
          alt="Error"
          className="mx-auto mb-4 h-auto max-w-full rounded-lg shadow-lg"
          style={{ maxWidth: "400px" }}
        />
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-block rounded bg-gray-200 px-4 py-2 text-lg font-semibold text-gray-800 hover:bg-gray-300"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-block rounded bg-blue-500 px-4 py-2 text-lg font-semibold text-white hover:bg-blue-600"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
