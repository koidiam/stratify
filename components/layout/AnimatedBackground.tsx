"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0A0A0A]">
      {/* Very subtle, minimal grid pattern like Linear/Vercel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_60%,transparent_100%)] opacity-70" />

      {/* Single ultra-minimal glowing header spotlight */}
      <motion.div
        animate={{
          opacity: [0.3, 0.4, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] rounded-[100%] bg-primary/10 blur-[140px] mix-blend-screen pointer-events-none"
      />
    </div>
  );
}
