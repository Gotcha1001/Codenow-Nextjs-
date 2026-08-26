import Link from "next/link";

// Replaces the "unmatched route" half of the old errorElement
// (SpecialSetups/Error.jsx) from react-router's RootLayout config.
// Next.js renders this automatically for any URL that doesn't match a
// route, and also whenever you call notFound() from a page/route.
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 gradient-background2">
      <div className="rounded-lg bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 text-5xl font-bold text-red-500">Oops!</h1>
        <p className="mb-6 text-lg">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://github.com/Gotcha1001/My-Images-for-sites-Wes/blob/main/Gamingpic.jpg?raw=true"
          alt="Error"
          className="mx-auto mb-4 h-auto max-w-full rounded-lg shadow-lg"
          style={{ maxWidth: "400px" }}
        />
        <Link
          href="/"
          className="inline-block rounded bg-blue-500 px-4 py-2 text-lg font-semibold text-white hover:bg-blue-600"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
