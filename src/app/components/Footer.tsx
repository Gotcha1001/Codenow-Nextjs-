// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { playClickSound } from "@/lib/playSound";

// const links = [
//   { href: "/data-protection", label: "Data Protection" },
//   { href: "/testimony", label: "Testimony" },
//   { href: "/pdf-form", label: "PDF Form" },
//   { href: "/coding-blogs", label: "Coding Blogs" },
//   { href: "/coding-community", label: "Coding Community" },
// ];

// export default function Footer() {
//   const pathname = usePathname();

//   return (
//     <footer className="footer bg-gray-200 py-4">
//       <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
//         <ul className="footer-links flex flex-wrap sm:flex-row sm:justify-center">
//           {links.map(({ href, label }) => {
//             const isActive = pathname === href;
//             return (
//               <li key={href} className="mb-4 sm:mb-0">
//                 <Link
//                   href={href}
//                   onClick={() => playClickSound()}
//                   className={
//                     isActive
//                       ? "active-footer-link text-gray-900 block"
//                       : "text-gray-700 hover:text-gray-900 block"
//                   }
//                 >
//                   {label}
//                 </Link>
//               </li>
//             );
//           })}
//         </ul>

//         {/* Company Logo */}
//         <Link
//           href="/"
//           className="text-2xl font-bold mb-4 md:mb-0 zoom horizontal-spin"
//           onClick={() => playClickSound()}
//         >
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img
//             src="/CodeNowNavbarLogo.png"
//             alt="Logo"
//             className="navbar-logo"
//           />
//         </Link>
//       </div>
//     </footer>
//   );
// }

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { playClickSound } from "@/lib/playSound";
import { StarField } from "@/app/components/Starfield";

const FOOTER_LINKS = [
  { href: "/data-protection", label: "Data Protection" },
  { href: "/testimony", label: "Testimony" },
  { href: "/pdf-form", label: "PDF Form" },
  { href: "/coding-blogs", label: "Coding Blogs" },
  { href: "/coding-community", label: "Coding Community" },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-gradient-to-r from-black via-neutral-900 to-black py-6 text-white shadow-lg">
      <StarField count={30} />
      <div className="container relative z-10 mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <ul className="flex flex-wrap items-center justify-center gap-4">
          {FOOTER_LINKS.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => playClickSound()}
                  className={`text-sm transition-colors ${
                    isActive ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href="/" onClick={() => playClickSound()}>
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
            className="relative h-36 w-36"
          >
            <Image
              src="/CodeNowNavbarLogo.png"
              alt="CodeNow Logo"
              fill
              className="object-contain"
            />
          </motion.div>
        </Link>
      </div>
    </footer>
  );
}
