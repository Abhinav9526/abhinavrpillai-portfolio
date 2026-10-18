"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type AnimeWriterState = "idle" | "writing" | "submitted";

interface AnimeWriterProps {
  state?: AnimeWriterState;
  className?: string;
}

export default function AnimeWriter({
  state = "idle",
  className,
}: AnimeWriterProps) {
  const shouldReduceMotion = useReducedMotion();
  const [blink, setBlink] = useState(false);

  // Periodic natural blinking cycle during idle
  useEffect(() => {
    if (state !== "idle" || shouldReduceMotion) return;

    const blinkInterval = setInterval(() => {
      setBlink(true);
      const openTimer = setTimeout(() => {
        setBlink(false);
      }, 160);
      return () => clearTimeout(openTimer);
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, [state, shouldReduceMotion]);

  const isWriting = state === "writing";
  const isSubmitted = state === "submitted";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex flex-col items-center justify-end select-none pointer-events-none",
        "w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40",
        className
      )}
    >
      {/* Floating Status Pill / Mood Bubble */}
      <AnimatePresence mode="wait">
        {isWriting && (
          <motion.div
            key="writing-bubble"
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-3 sm:-top-4 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono font-medium text-amber-400 backdrop-blur-md shadow-lg flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>taking notes...</span>
          </motion.div>
        )}

        {isSubmitted && (
          <motion.div
            key="submitted-bubble"
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: -2, scale: 1.05 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25, type: "spring" }}
            className="absolute -top-3 sm:-top-4 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-medium text-emerald-400 backdrop-blur-md shadow-lg flex items-center gap-1"
          >
            <span>Arigato! ✨</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Vector Rig */}
      <motion.svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]"
        animate={
          isSubmitted && !shouldReduceMotion
            ? { y: [0, -6, 0, -4, 0] }
            : { y: 0 }
        }
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <defs>
          {/* Hair Gradient */}
          <linearGradient id="hairGrad" x1="50" y1="20" x2="150" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Hair Highlight */}
          <linearGradient id="hairHighlight" x1="80" y1="40" x2="120" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
          </linearGradient>

          {/* Hoodie Gradient (Matches portfolio dark theme) */}
          <linearGradient id="hoodieGrad" x1="60" y1="100" x2="140" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>

          {/* Desk Gradient */}
          <linearGradient id="deskGrad" x1="20" y1="150" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Pen Glow */}
          <radialGradient id="penGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ================= BACK LAYER: CHAIR & SHADOW ================= */}
        <ellipse cx="100" cy="180" rx="65" ry="10" fill="#000000" fillOpacity="0.35" />
        {/* Back Chair Rest */}
        <rect x="62" y="70" width="76" height="70" rx="14" fill="#0f172a" stroke="#1e293b" strokeWidth="2.5" />

        {/* ================= TORSO & BREATHING CYCLE ================= */}
        <motion.g
          animate={
            !shouldReduceMotion
              ? { y: [0, -1.2, 0] }
              : { y: 0 }
          }
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
        >
          {/* Hoodie Body */}
          <path
            d="M66 112 C66 94, 134 94, 134 112 L144 158 C144 164, 56 164, 56 158 Z"
            fill="url(#hoodieGrad)"
            stroke="#334155"
            strokeWidth="2"
          />

          {/* Hoodie Neck Collar */}
          <path
            d="M84 106 Q100 118 116 106 Q100 124 84 106 Z"
            fill="#0f172a"
          />

          {/* Drawstrings with Accent Orange Tips */}
          <line x1="94" y1="112" x2="94" y2="128" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="94" cy="129" r="1.8" fill="#f97316" />

          <line x1="106" y1="112" x2="106" y2="126" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="106" cy="127" r="1.8" fill="#f97316" />
        </motion.g>

        {/* ================= HEAD & FACE RIG ================= */}
        <motion.g
          animate={
            isWriting && !shouldReduceMotion
              ? { y: 4, rotate: 3 }
              : isSubmitted && !shouldReduceMotion
              ? { y: -2, rotate: 0 }
              : !shouldReduceMotion
              ? { y: [0, -1.5, 0], rotate: [0, 1, 0] }
              : { y: 0, rotate: 0 }
          }
          transition={{
            duration: isWriting ? 0.35 : 3.5,
            repeat: isWriting || isSubmitted ? 0 : Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "100px 95px" }}
        >
          {/* Hair Back Layer */}
          <path
            d="M60 70 C54 36, 146 36, 140 70 C146 95, 142 108, 138 116 C130 108, 126 102, 126 95 L74 95 C74 102, 70 108, 62 116 C58 108, 54 95, 60 70 Z"
            fill="url(#hairGrad)"
          />

          {/* Ears */}
          <ellipse cx="67" cy="78" rx="6.5" ry="8.5" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" />
          <ellipse cx="133" cy="78" rx="6.5" ry="8.5" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" />

          {/* Face Base */}
          <path
            d="M70 66 C70 50, 130 50, 130 66 C130 84, 126 98, 100 103 C74 98, 70 84, 70 66 Z"
            fill="#fef3c7"
          />

          {/* Blushing Cheeks */}
          <ellipse cx="78" cy="81" rx="4.5" ry="2.5" fill="#f472b6" fillOpacity="0.45" />
          <ellipse cx="122" cy="81" rx="4.5" ry="2.5" fill="#f472b6" fillOpacity="0.45" />

          {/* Eyebrows */}
          <path
            d={isWriting ? "M75 64 Q83 67 89 64" : "M75 64 Q83 61 89 64"}
            stroke="#475569"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d={isWriting ? "M111 64 Q117 67 125 64" : "M111 64 Q117 61 125 64"}
            stroke="#475569"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Eyes Expressions */}
          {isSubmitted ? (
            /* Joyful Arc Eyes (^_^) */
            <g stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" fill="none">
              <path d="M76 74 Q82 67 88 74" />
              <path d="M112 74 Q118 67 124 74" />
            </g>
          ) : isWriting ? (
            /* Focused Downward Gaze Eyes */
            <g>
              {/* Sclera & Dark Pupil Looking Down-Right */}
              <ellipse cx="82" cy="73.5" rx="5.5" ry="5.5" fill="#0f172a" />
              <ellipse cx="118" cy="73.5" rx="5.5" ry="5.5" fill="#0f172a" />
              {/* Highlight Specks */}
              <circle cx="83.5" cy="75" r="1.8" fill="#ffffff" />
              <circle cx="119.5" cy="75" r="1.8" fill="#ffffff" />
            </g>
          ) : (
            /* Idle Expressive Anime Eyes (with natural blink) */
            <g>
              {blink ? (
                /* Closed eye line when blinking */
                <g stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" fill="none">
                  <path d="M76 73 Q82 75 88 73" />
                  <path d="M112 73 Q118 75 124 73" />
                </g>
              ) : (
                /* Open Big Sparkly Chibi Eyes */
                <g>
                  {/* Left Eye */}
                  <ellipse cx="82" cy="73" rx="6" ry="7" fill="#0f172a" />
                  <ellipse cx="82" cy="74.5" rx="4.5" ry="4" fill="#38bdf8" />
                  <circle cx="80" cy="71" r="2.2" fill="#ffffff" />
                  <circle cx="84" cy="75" r="1.1" fill="#ffffff" />

                  {/* Right Eye */}
                  <ellipse cx="118" cy="73" rx="6" ry="7" fill="#0f172a" />
                  <ellipse cx="118" cy="74.5" rx="4.5" ry="4" fill="#38bdf8" />
                  <circle cx="116" cy="71" r="2.2" fill="#ffffff" />
                  <circle cx="120" cy="75" r="1.1" fill="#ffffff" />
                </g>
              )}
            </g>
          )}

          {/* Cute Nose Dot */}
          <circle cx="100" cy="80" r="1" fill="#b45309" fillOpacity="0.5" />

          {/* Cute Mouth */}
          {isSubmitted ? (
            /* Wide Happy Smile */
            <path d="M96 85 Q100 91 104 85 Z" fill="#f43f5e" />
          ) : isWriting ? (
            /* Determined Small Focused Mouth */
            <ellipse cx="100" cy="85.5" rx="1.8" ry="1.2" fill="#d97706" />
          ) : (
            /* Gentle Idle Smile */
            <path d="M97 84 Q100 87 103 84" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          )}

          {/* Hair Front Bangs */}
          <path
            d="M62 62 C62 40, 138 40, 138 62 C134 50, 120 46, 114 54 C108 46, 92 46, 86 54 C80 46, 68 50, 62 62 Z"
            fill="url(#hairGrad)"
          />
          {/* Stylized Bang Strands */}
          <path d="M84 52 Q94 68 100 70 Q98 60 102 54" fill="url(#hairGrad)" />
          <path d="M102 54 Q108 66 116 66 Q112 56 114 52" fill="url(#hairGrad)" />

          {/* Soft Hair Highlight Arch */}
          <path
            d="M74 46 Q100 38 126 46"
            stroke="url(#hairHighlight)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </motion.g>

        {/* ================= DESK & STATIONERY LAYER ================= */}
        {/* Desk Surface */}
        <path
          d="M20 148 L180 148 C186 148, 190 152, 190 158 L184 176 C184 180, 180 182, 176 182 L24 182 C20 182, 16 180, 16 176 L10 158 C10 152, 14 148, 20 148 Z"
          fill="url(#deskGrad)"
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Desk Edge Highlight */}
        <line x1="20" y1="149" x2="180" y2="149" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />

        {/* Open Notepad on Desk */}
        <rect
          x="72"
          y="142"
          width="56"
          height="32"
          rx="3"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          transform="rotate(-4 100 158)"
        />
        {/* Notebook Spine & Binding */}
        <line x1="99" y1="141" x2="97" y2="173" stroke="#e2e8f0" strokeWidth="1.5" />
        {/* Subtle Text Lines on Notepad */}
        <line x1="77" y1="147" x2="94" y2="146" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="77" y1="152" x2="93" y2="151" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="77" y1="157" x2="91" y2="156" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />

        {/* Right Page Lines */}
        <line x1="103" y1="146" x2="121" y2="145" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="103" y1="151" x2="119" y2="150" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />

        {/* Dynamic Animated Ink Scribble (Appears only while typing) */}
        {isWriting && (
          <motion.path
            d="M103 158 Q107 156 111 158 Q115 160 119 157"
            stroke="#f97316"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 0.4 }}
          />
        )}

        {/* Mini Coffee Mug on Left Side of Desk */}
        <g>
          <rect x="36" y="142" width="16" height="18" rx="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.2" />
          {/* Mug Handle */}
          <path d="M52 146 C56 146, 56 154, 52 154" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Warm Steam Puff */}
          <motion.path
            d="M44 139 Q42 135 44 132"
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            animate={!shouldReduceMotion ? { y: [-1, -4], opacity: [0.7, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          />
        </g>

        {/* Left Arm (Resting politely on Desk Holding Paper) */}
        <path
          d="M66 122 C64 134, 68 148, 82 152"
          stroke="url(#hoodieGrad)"
          strokeWidth="13"
          strokeLinecap="round"
        />
        {/* Left Hand Holding Paper Corner */}
        <ellipse cx="84" cy="153" rx="4.5" ry="3.5" fill="#fde68a" />

        {/* ================= RIGHT WRITING ARM & PEN RIG ================= */}
        <motion.g
          animate={
            isWriting && !shouldReduceMotion
              ? {
                  rotate: [-6, 7, -4, 6, -5],
                  x: [-1.5, 2.5, -1, 1.8, 0],
                  y: [0, 1.4, -0.6, 1.2, 0],
                }
              : isSubmitted && !shouldReduceMotion
              ? {
                  rotate: -28,
                  x: 6,
                  y: -14,
                }
              : {
                  rotate: 0,
                  x: 0,
                  y: 0,
                }
          }
          transition={
            isWriting
              ? {
                  repeat: Infinity,
                  duration: 0.3,
                  ease: "easeInOut",
                }
              : {
                  duration: 0.35,
                  type: "spring",
                  stiffness: 220,
                }
          }
          style={{ transformOrigin: "128px 120px" }}
        >
          {/* Right Sleeve Arm */}
          <path
            d="M128 120 C132 134, 126 146, 114 153"
            stroke="url(#hoodieGrad)"
            strokeWidth="13"
            strokeLinecap="round"
          />

          {/* Right Hand */}
          <ellipse cx="113" cy="153" rx="5" ry="4" fill="#fde68a" />

          {/* Fountain Pen / Stylus */}
          <g transform="rotate(28 113 153)">
            {/* Pen Barrel */}
            <rect x="111" y="134" width="4.2" height="24" rx="1.5" fill="#f97316" stroke="#ea580c" strokeWidth="0.8" />
            {/* Pen Grip */}
            <rect x="111" y="152" width="4.2" height="6" fill="#0f172a" />
            {/* Pen Metallic Nib */}
            <polygon points="111,158 115.2,158 113.1,164" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
            {/* Pen Tip Glow when writing */}
            {isWriting && (
              <circle cx="113.1" cy="164" r="3" fill="url(#penGlow)" />
            )}
          </g>
        </motion.g>

        {/* Celebration Confetti Sparkles when Submitted */}
        {isSubmitted && !shouldReduceMotion && (
          <g>
            <motion.path
              d="M50 80 L52 74 L58 76 L52 78 Z"
              fill="#fbbf24"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 0], y: [-2, -18], x: [-4, -12], opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.1 }}
            />
            <motion.path
              d="M145 60 L148 54 L154 56 L148 58 Z"
              fill="#f43f5e"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 0], y: [-2, -22], x: [2, 10], opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
            />
            <motion.circle
              cx="100"
              cy="40"
              r="2.5"
              fill="#38bdf8"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 0], y: [-2, -16], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: 0.3 }}
            />
          </g>
        )}
      </motion.svg>
    </div>
  );
}
