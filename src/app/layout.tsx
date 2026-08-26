import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/lib/scrollToTop";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.codenow101.com"),
  title: "CodeNow101",
  description:
    "CodeNow helps small businesses create professional websites while promoting coding knowledge with real-world projects and secrets to effective learning.",
  robots: "index, follow",
  authors: [{ name: "CodeNow Team" }],
  icons: {
    icon: "/CodeNowNavbarLogo.png",
  },
  openGraph: {
    title: "CodeNow - Build Websites & Learn Coding",
    description:
      "Build professional websites for your small business while mastering coding with CodeNow's real-world projects and tips.",
    images: ["/CodeNowNavbarLogo.png"],
    url: "https://codenow101.com",
    type: "website",
    siteName: "CodeNow",
  },
  alternates: {
    canonical: "https://codenow101.com",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* bg-stone-50 carried over from the old index.html <body> class. */}
      <body className="min-h-full flex flex-col bg-stone-50">
        {/*
          Ported 1:1 from the old Navbar/RootLayout.jsx, which wrapped
          react-router's <Outlet /> the same way: ScrollToTop first (it
          renders null, just watches route changes), then Navbar, then
          <main>{children}</main> in place of <Outlet />, then Footer.
        */}
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
