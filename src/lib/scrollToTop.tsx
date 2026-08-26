"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Ported 1:1 from SpecialSetups/ScrollToTop.jsx. react-router's
// useLocation().pathname becomes next/navigation's usePathname(); the
// scroll-on-route-change behavior is identical since App Router does
// client-side navigation the same way react-router did.
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
