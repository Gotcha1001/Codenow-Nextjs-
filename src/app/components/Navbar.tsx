// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { auth, db } from "@/lib/firebaseConfig";
// import { signOut, onAuthStateChanged, type User } from "firebase/auth";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
// import { playClickSound } from "@/lib/playSound";

// type UserDetails = {
//   firstName?: string;
//   lastName?: string;
//   [key: string]: unknown;
// };

// const ADMIN_EMAIL = "admin@example.com";

// // A small drop-in replacement for react-router's <NavLink activeClassName>:
// // compares the current pathname to the link's href and applies
// // "active-link" the same way the old app did.
// function useActiveLinkClass(href: string) {
//   const pathname = usePathname();
//   const isActive = pathname === href;
//   return isActive ? "active-link" : "";
// }

// function NavItem({
//   href,
//   children,
//   onClick,
//   className,
// }: {
//   href: string;
//   children: React.ReactNode;
//   onClick: () => void;
//   className?: string;
// }) {
//   const activeClass = useActiveLinkClass(href);
//   return (
//     <Link
//       href={href}
//       onClick={onClick}
//       className={`${className ?? ""} ${activeClass}`}
//     >
//       {children}
//     </Link>
//   );
// }

// export default function Navbar() {
//   const [user, setUser] = useState<User | null>(null);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
//   const [isCodeShareDropdownOpen, setIsCodeShareDropdownOpen] = useState(false);
//   const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

//   const adminDropdownRef = useRef<HTMLDivElement>(null);
//   const codeShareDropdownRef = useRef<HTMLDivElement>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
//       if (currentUser) {
//         setUser(currentUser);
//         if (currentUser.providerData[0]?.providerId === "google.com") {
//           setUserDetails({
//             firstName: currentUser.displayName ?? "",
//             lastName: "",
//           });
//         } else {
//           try {
//             const usersRef = collection(db, "users");
//             const q = query(usersRef, where("uid", "==", currentUser.uid));
//             const querySnapshot = await getDocs(q);
//             if (!querySnapshot.empty) {
//               setUserDetails(querySnapshot.docs[0].data() as UserDetails);
//             } else {
//               setUserDetails(null);
//             }
//           } catch (error) {
//             console.error("Error fetching user details:", error);
//             setUserDetails(null);
//           }
//         }
//       } else {
//         setUser(null);
//         setUserDetails(null);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         adminDropdownRef.current &&
//         !adminDropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsAdminDropdownOpen(false);
//       }
//       if (
//         codeShareDropdownRef.current &&
//         !codeShareDropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsCodeShareDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const logout = async () => {
//     try {
//       await signOut(auth);
//       router.push("/");
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const toggleMenu = () => setIsMenuOpen((v) => !v);
//   const toggleAdminDropdown = () => setIsAdminDropdownOpen((v) => !v);
//   const toggleCodeShareDropdown = () => setIsCodeShareDropdownOpen((v) => !v);

//   const handleLinkClick = () => {
//     playClickSound();
//     setIsMenuOpen(false);
//   };

//   return (
//     <nav className="navbar bg-gray-800 text-white py-4">
//       <div className="container mx-auto flex flex-col md:flex-row md:justify-between items-center">
//         {/* Logo */}
//         <div className="flex items-center justify-center w-full md:w-auto">
//           <Link
//             href="/"
//             className="text-2xl font-bold zoom horizontal-spin mx-auto"
//             onClick={() => playClickSound()}
//           >
//             {/* eslint-disable-next-line @next/next/no-img-element */}
//             <img
//               src="/CodeNowNavbarLogo.png"
//               alt="Logo"
//               className="navbar-logo"
//             />
//           </Link>
//         </div>

//         {/* Burger Menu Button */}
//         <button
//           className="block md:hidden"
//           onClick={toggleMenu}
//           aria-label="Toggle menu"
//         >
//           <svg
//             className="w-8 h-8 text-white"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M4 6h16M4 12h16M4 18h16"
//             />
//           </svg>
//         </button>

//         {/* Menu Items */}
//         <div
//           className={`flex-col md:flex md:flex-row md:items-center md:space-x-4 ${
//             isMenuOpen ? "block" : "hidden"
//           } md:block`}
//         >
//           <ul className="navbar-links flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
//             <li className="md:mr-4 my-2 md:my-0 p-2 rounded-lg">
//               <NavItem href="/original-projects" onClick={handleLinkClick}>
//                 Original Projects
//               </NavItem>
//             </li>
//             <li className="md:mr-4 my-2 md:my-0 p-2 rounded-lg">
//               <NavItem href="/tutorials" onClick={handleLinkClick}>
//                 Tutorials
//               </NavItem>
//             </li>
//             <li className="md:mr-4 my-2 md:my-0 p-2 rounded-lg">
//               <NavItem href="/about-us" onClick={handleLinkClick}>
//                 About us
//               </NavItem>
//             </li>
//             <li className="md:mr-4 my-2 md:my-0 p-2 rounded-lg">
//               <NavItem href="/cv" onClick={handleLinkClick}>
//                 CV
//               </NavItem>
//             </li>
//             <li className="md:mr-4 my-2 md:my-0">
//               <NavItem href="/contact-us" onClick={handleLinkClick}>
//                 Contact Us
//               </NavItem>
//             </li>
//             <li className="md:mr-4 my-2 md:my-0 shadow-blue p-2 rounded-lg">
//               <NavItem href="/pricing" onClick={handleLinkClick}>
//                 Pricing
//               </NavItem>
//             </li>
//             <li className="md:mr-4 my-2 md:my-0 shadow-blue p-2 rounded-lg">
//               <NavItem href="/modern-coding" onClick={handleLinkClick}>
//                 Modern Coding
//               </NavItem>
//             </li>
//             <li className="md:mr-4 my-2 md:my-0 shadow-blue p-2 rounded-lg">
//               <NavItem href="/code-tips" onClick={handleLinkClick}>
//                 Coding Tips
//               </NavItem>
//             </li>
//             <li className="md:mr-4 my-2 md:my-0">
//               <NavItem href="/coding-videos" onClick={handleLinkClick}>
//                 Coding Videos
//               </NavItem>
//             </li>

//             {/* Code Sharing dropdown */}
//             <div className="relative navbar-element" ref={codeShareDropdownRef}>
//               <button
//                 onClick={toggleCodeShareDropdown}
//                 className="bg-black rounded-md p-1 hover:text-blue-500"
//               >
//                 Code Sharing
//               </button>
//               {isCodeShareDropdownOpen && (
//                 <ul className="absolute bg-gray-800 text-white rounded mt-2 shadow-lg">
//                   <li>
//                     <Link
//                       href="/sharing-code"
//                       className="text-white block px-4 py-2"
//                       onClick={handleLinkClick}
//                     >
//                       Sharing Code
//                     </Link>
//                   </li>
//                   <li>
//                     <Link
//                       href="/submit-code-share"
//                       className="text-white block px-4 py-2"
//                       onClick={handleLinkClick}
//                     >
//                       Submit Code Sharing
//                     </Link>
//                   </li>
//                 </ul>
//               )}
//             </div>

//             {user ? (
//               <>
//                 {user.email === ADMIN_EMAIL && (
//                   <div
//                     className="relative navbar-element"
//                     ref={adminDropdownRef}
//                   >
//                     <button
//                       onClick={toggleAdminDropdown}
//                       className="bg-black rounded-md p-1 hover:text-blue-500"
//                     >
//                       Admin Actions
//                     </button>
//                     {isAdminDropdownOpen && (
//                       <ul className="absolute bg-gray-800 text-white rounded mt-2 shadow-lg">
//                         <li>
//                           <Link
//                             href="/video-upload"
//                             className="text-white block px-4 py-2"
//                             onClick={handleLinkClick}
//                           >
//                             Video Upload
//                           </Link>
//                         </li>
//                         <li>
//                           <Link
//                             href="/video-alter"
//                             className="text-white block px-4 py-2"
//                             onClick={handleLinkClick}
//                           >
//                             Video Alter
//                           </Link>
//                         </li>
//                         <li>
//                           <Link
//                             href="/admin-approve-codeshare"
//                             className="text-white block px-4 py-2"
//                             onClick={handleLinkClick}
//                           >
//                             Approve Code Share
//                           </Link>
//                         </li>
//                       </ul>
//                     )}
//                   </div>
//                 )}
//                 {userDetails && (
//                   <li className="mb-0">
//                     {userDetails.firstName ? (
//                       <span className="welcome-message text-teal-500 font-bold animate-pulse rounded-full p-1">
//                         Welcome {userDetails.firstName} {userDetails.lastName}
//                       </span>
//                     ) : (
//                       <span className="welcome-message text-teal-500 rounded-full p-2">
//                         Welcome {user.email}
//                       </span>
//                     )}
//                   </li>
//                 )}
//                 <li className="md:mr-4 my-2 md:my-0 shadow-sky p-2 rounded-md">
//                   <button
//                     onClick={logout}
//                     className="text-white hover:text-blue-500"
//                   >
//                     Logout
//                   </button>
//                 </li>
//               </>
//             ) : (
//               <>
//                 <li className="md:mr-4 my-2 md:my-0">
//                   <Link
//                     href="/register"
//                     onClick={handleLinkClick}
//                     className="text-now font-bold hover:text-blue-500"
//                   >
//                     Register
//                   </Link>
//                 </li>
//                 <li className="md:mr-4 my-2 md:my-0">
//                   <Link
//                     href="/login"
//                     onClick={handleLinkClick}
//                     className="text-now font-bold hover:text-blue-500"
//                   >
//                     Login
//                   </Link>
//                 </li>
//               </>
//             )}
//           </ul>
//         </div>

//         {/* Social Icons */}
//         <div className="flex flex-col md:flex-row md:justify-between items-center">
//           <div className="flex flex-wrap justify-center md:justify-end space-x-2 mt-4 md:mt-0">
//             <a
//               href="https://www.facebook.com/profile.php?id=61563719426651"
//               className="text-blue-600 hover:text-blue-800 animate-bounce"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <FaFacebook size={40} />
//             </a>
//             <a
//               href="https://www.instagram.com/codenow101?igsh=MWsyMWs1ZGRwYzc2cg=="
//               className="text-pink-600 hover:text-pink-800 animate-bounce"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <FaInstagram size={40} />
//             </a>
//             <a
//               href="https://wa.me/27780077368"
//               className="text-green-500 hover:text-green-700 animate-bounce"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <FaWhatsapp size={40} />
//             </a>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebaseConfig";
import { signOut, onAuthStateChanged, type User } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { playClickSound } from "@/lib/playSound";
import { StarField } from "@/app/components/Starfield";

type UserDetails = {
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
};

const ADMIN_EMAIL = "admin@example.com";

const NAV_LINKS = [
  { href: "/original-projects", label: "Original Projects" },
  { href: "/tutorials", label: "Tutorials" },
  { href: "/about-us", label: "About us" },
  { href: "/cv", label: "CV" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/pricing", label: "Pricing" },
  { href: "/modern-coding", label: "Modern Coding" },
  { href: "/coding-tips", label: "Coding Tips" },
  { href: "/coding-videos", label: "Coding Videos" },
];

const CODE_SHARE_LINKS = [
  { href: "/sharing-code", label: "Sharing Code" },
  { href: "/submit-code-share", label: "Submit Code Sharing" },
];

const SOCIALS = [
  {
    href: "https://www.facebook.com/profile.php?id=61563719426651",
    Icon: FaFacebook,
    className: "text-blue-400",
  },
  {
    href: "https://www.instagram.com/codenow101?igsh=MWsyMWs1ZGRwYzc2cg==",
    Icon: FaInstagram,
    className: "text-pink-400",
  },
  {
    href: "https://wa.me/27780077368",
    Icon: FaWhatsapp,
    className: "text-green-400",
  },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={() => playClickSound()}
      className={`relative text-sm font-medium transition-colors hover:text-white ${
        isActive ? "text-white" : "text-white/60"
      }`}
    >
      {label}
      {isActive && (
        <motion.span
          layoutId="nav-underline"
          className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-white via-white/70 to-transparent"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isCodeShareDropdownOpen, setIsCodeShareDropdownOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const codeShareDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.providerData[0]?.providerId === "google.com") {
          setUserDetails({
            firstName: currentUser.displayName ?? "",
            lastName: "",
          });
        } else {
          try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("uid", "==", currentUser.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              setUserDetails(querySnapshot.docs[0].data() as UserDetails);
            } else {
              setUserDetails(null);
            }
          } catch (error) {
            console.error("Error fetching user details:", error);
            setUserDetails(null);
          }
        }
      } else {
        setUser(null);
        setUserDetails(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        adminDropdownRef.current &&
        !adminDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAdminDropdownOpen(false);
      }
      if (
        codeShareDropdownRef.current &&
        !codeShareDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCodeShareDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  const handleLinkClick = () => {
    playClickSound();
    setIsMenuOpen(false);
    setIsAdminDropdownOpen(false);
    setIsCodeShareDropdownOpen(false);
  };

  return (
    // No overflow-hidden here — it was clipping the dropdown menus
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-black via-neutral-900 to-black text-white shadow-lg">
      {/* Clip stars only, not the dropdowns */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <StarField count={45} />
      </div>

      <div className="container relative z-10 mx-auto flex items-center justify-between gap-4 px-4 py-5">
        <Link href="/" onClick={() => playClickSound()} className="shrink-0">
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

        {/* Desktop nav */}
        <nav className="hidden flex-wrap items-center gap-5 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}

          {/* Code Sharing dropdown */}
          <div className="relative" ref={codeShareDropdownRef}>
            <button
              onClick={() => {
                setIsCodeShareDropdownOpen((v) => !v);
                setIsAdminDropdownOpen(false);
              }}
              className="flex items-center gap-1 text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              Code Sharing <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {isCodeShareDropdownOpen && (
              <ul className="absolute right-0 z-[100] mt-2 w-48 rounded-md border border-white/10 bg-neutral-900 py-1 shadow-lg">
                {CODE_SHARE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={handleLinkClick}
                      className="block px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Admin dropdown */}
          {user?.email === ADMIN_EMAIL && (
            <div className="relative" ref={adminDropdownRef}>
              <button
                onClick={() => {
                  setIsAdminDropdownOpen((v) => !v);
                  setIsCodeShareDropdownOpen(false);
                }}
                className="flex items-center gap-1 text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                Admin Actions <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {isAdminDropdownOpen && (
                <ul className="absolute right-0 z-[100] mt-2 w-56 rounded-md border border-white/10 bg-neutral-900 py-1 shadow-lg">
                  {[
                    { href: "/video-upload", label: "Video Upload" },
                    { href: "/video-alter", label: "Video Alter" },
                    {
                      href: "/admin-approve-codeshare",
                      label: "Approve Code Share",
                    },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={handleLinkClick}
                        className="block px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            {SOCIALS.map(({ href, Icon, className }) => (
              <motion.a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ rotate: [0, -10, 10, -6, 6, 0], scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className={className}
              >
                <Icon size={22} />
              </motion.a>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              {userDetails?.firstName ? (
                <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-teal-400">
                  Welcome {userDetails.firstName} {userDetails.lastName}
                </span>
              ) : (
                <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-teal-400">
                  Welcome {user.email}
                </span>
              )}
              <button
                onClick={logout}
                className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <NavLink href="/register" label="Register" />
              <NavLink href="/login" label="Login" />
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="text-white lg:hidden"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="relative z-10 flex flex-col gap-3 border-t border-white/10 bg-neutral-900/95 px-4 py-4 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="text-white/80 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {CODE_SHARE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="text-white/80 hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          {user?.email === ADMIN_EMAIL && (
            <>
              <Link
                href="/video-upload"
                onClick={handleLinkClick}
                className="text-white/80 hover:text-white"
              >
                Video Upload
              </Link>
              <Link
                href="/video-alter"
                onClick={handleLinkClick}
                className="text-white/80 hover:text-white"
              >
                Video Alter
              </Link>
              <Link
                href="/admin-approve-codeshare"
                onClick={handleLinkClick}
                className="text-white/80 hover:text-white"
              >
                Approve Code Share
              </Link>
            </>
          )}

          {user ? (
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-1 text-left text-white/80 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          ) : (
            <>
              <Link
                href="/register"
                onClick={handleLinkClick}
                className="text-white/80 hover:text-white"
              >
                Register
              </Link>
              <Link
                href="/login"
                onClick={handleLinkClick}
                className="text-white/80 hover:text-white"
              >
                Login
              </Link>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {SOCIALS.map(({ href, Icon, className }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                <Icon size={22} />
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
