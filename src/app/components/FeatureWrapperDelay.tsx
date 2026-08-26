"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  type Target,
  type TargetAndTransition,
  type Transition,
  type Variants,
} from "framer-motion";

type MotionWrapperDelayProps = {
  children: ReactNode;
  initial?: Target;
  whileInView?: TargetAndTransition;
  viewport?: { amount?: number };
  transition?: Transition;
  variants?: Variants;
};

// Ported 1:1 from Components/MotionWrapperDelay.jsx. Unlike framer's
// built-in whileInView, this resets isVisible to false when the
// element leaves the viewport, so the animation replays every time it
// scrolls back into view rather than only firing once.
export default function FeatureWrapperDelay({
  children,
  initial,
  whileInView,
  viewport,
  transition,
  variants,
}: MotionWrapperDelayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: viewport?.amount ?? 0.1,
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
  }, [viewport]);

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isVisible ? whileInView : initial}
      viewport={viewport}
      transition={transition}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
