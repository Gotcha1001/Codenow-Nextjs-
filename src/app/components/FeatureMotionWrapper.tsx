"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

type FeatureMotionWrapperProps = {
  children: ReactNode;
  index: number;
};

// Ported 1:1 from Components/FeatureMotionWrapper.jsx. Fires each item
// in from a pseudo-random direction (seeded off its index, so it's
// stable across re-renders) the first time it scrolls into view.
export default function FeatureMotionWrapper({
  children,
  index,
}: FeatureMotionWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const getRandomDirection = (i: number, min: number, max: number) => {
    const seed = Math.sin(i + 42) * 10000;
    return Math.floor((seed - Math.floor(seed)) * (max - min + 1)) + min;
  };

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "50px", // Preload animations slightly before they're visible
      },
    );

    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{
        x: getRandomDirection(index, -100, 100),
        y: getRandomDirection(index, -100, 100),
        opacity: 0,
      }}
      animate={
        isVisible
          ? { x: 0, y: 0, opacity: 1 }
          : {
              x: getRandomDirection(index, -100, 100),
              y: getRandomDirection(index, -100, 100),
              opacity: 0,
            }
      }
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.3,
        delay: index * 0.05,
      }}
    >
      {children}
    </motion.div>
  );
}
