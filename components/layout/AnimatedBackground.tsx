"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#000000]">
      {/* Subtle, precise background grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" 
        style={{
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%, #000 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%, #000 30%, transparent 100%)'
        }}
      />
      {/* Thin line top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {/* Very light radial fade at the top center to add depth, no motion bounds */}
      <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[60vw] h-[60vh] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
