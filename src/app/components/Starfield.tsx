"use client";

import { useState } from "react";
import { motion } from "framer-motion";

// Fixed set of stars generated once per mount so positions don't jump on re-render.
function useStarField(count: number) {
  const [stars] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 1.6 + 0.6,
      duration: Math.random() * 3 + 2.5,
      delay: Math.random() * 4,
    })),
  );
  return stars;
}

export function StarField({ count = 35 }: { count?: number }) {
  const stars = useStarField(count);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{ opacity: [0.15, 1, 0.15], x: [0, 6, 0] }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
