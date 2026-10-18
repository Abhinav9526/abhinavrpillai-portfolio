"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { playSkateRollSound, playOllieSound } from "@/lib/sounds";

interface SkaterInstance {
  id: string;
  duration: number;
}

export default function SkateCharacter() {
  const shouldReduceMotion = useReducedMotion();
  const [skaters, setSkaters] = useState<SkaterInstance[]>([]);

  const spawnSkater = () => {
    const newSkater: SkaterInstance = {
      id: `${Date.now()}-${Math.random()}`,
      duration: 4.8,
    };
    setSkaters((prev) => [...prev, newSkater]);
    playSkateRollSound();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing into input fields, textareas, or contentEditable
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (e.key === "n" || e.key === "N") {
        spawnSkater();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const removeSkater = (id: string) => {
    setSkaters((prev) => prev.filter((skater) => skater.id !== id));
  };

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden select-none"
    >
      <AnimatePresence>
        {skaters.map((skater) => (
          <SkaterItem
            key={skater.id}
            id={skater.id}
            duration={skater.duration}
            onComplete={() => removeSkater(skater.id)}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function SkaterItem({
  id,
  duration,
  onComplete,
  shouldReduceMotion,
}: {
  id: string;
  duration: number;
  onComplete: () => void;
  shouldReduceMotion: boolean | null;
}) {
  const [trickCount, setTrickCount] = useState(0);
  const [isJumping, setIsJumping] = useState(false);

  // Play Ollie sound effect right at jump takeoff (44% of duration)
  useEffect(() => {
    const tSound = setTimeout(() => {
      playOllieSound();
      setIsJumping(true);
    }, duration * 1000 * 0.44);

    const tEndJump = setTimeout(() => {
      setIsJumping(false);
    }, duration * 1000 * 0.65);

    // Hard safety timer: guaranteed removal
    const tClean = setTimeout(() => {
      onComplete();
    }, (duration + 0.4) * 1000);

    return () => {
      clearTimeout(tSound);
      clearTimeout(tEndJump);
      clearTimeout(tClean);
    };
  }, [duration, onComplete]);

  const handleManualTrick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTrickCount((prev) => prev + 1);
    playOllieSound();
  };

  return (
    <>
      {/* Ground Merge Conflict Bug Obstacle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="fixed bottom-6 left-[50vw] -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
      >
        <div className="px-2.5 py-0.5 rounded-full border border-rose-500/50 bg-rose-950/85 text-[10px] font-mono font-bold text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)] backdrop-blur-md flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
          <span>Merge Conflict 🐛</span>
        </div>
        <div className="w-16 h-1 rounded-full bg-rose-500/30 blur-sm mt-0.5" />
      </motion.div>

      {/* Main Continuous Single-Vector Horizontal Motion (GPU Accelerated - Never Freezes) */}
      <motion.div
        key={id}
        initial={{ x: "-280px" }}
        animate={{ x: "calc(100vw + 280px)" }}
        transition={{
          duration: shouldReduceMotion ? 1 : duration,
          ease: "linear",
        }}
        onAnimationComplete={onComplete}
        className="fixed bottom-6 sm:bottom-8 left-0 flex items-end pointer-events-auto cursor-pointer"
        onClick={handleManualTrick}
        title="Click to do a Kickflip! 🛹"
      >
        {/* Trailing Billowing 3D Smoke Puffs */}
        <div className="relative -mr-8 mb-2 flex items-center pointer-events-none">
          <motion.div
            animate={{
              scale: isJumping ? [0.4, 0.9] : [0.6, 1.5, 2.2],
              opacity: isJumping ? 0.35 : [0.95, 0.6, 0],
              x: [-5, -55],
              y: [-2, -10],
            }}
            transition={{ repeat: Infinity, duration: 0.5, ease: "easeOut" }}
            className="size-8 rounded-full bg-gradient-to-tr from-slate-200/90 via-white/85 to-slate-100/40 blur-[2px] shadow-sm"
          />
          <motion.div
            animate={{
              scale: [0.5, 1.3, 1.9],
              opacity: isJumping ? 0.25 : [0.85, 0.5, 0],
              x: [0, -42],
              y: [0, -14],
            }}
            transition={{ repeat: Infinity, duration: 0.45, delay: 0.15, ease: "easeOut" }}
            className="size-7 -ml-4 rounded-full bg-gradient-to-tr from-slate-300/80 via-white/75 to-slate-200/30 blur-[2px]"
          />

          {/* Floating Developer Code Particles Emitted into the Air */}
          <motion.div
            animate={{
              x: [-10, -70],
              y: [-15, -45],
              opacity: [1, 0],
              scale: [0.8, 1.1],
            }}
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeOut" }}
            className="absolute -top-6 -left-4 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 shadow-sm"
          >
            git push
          </motion.div>
          <motion.div
            animate={{
              x: [-5, -60],
              y: [-5, -35],
              opacity: [1, 0],
              scale: [0.7, 1],
            }}
            transition={{ repeat: Infinity, duration: 0.9, delay: 0.35, ease: "easeOut" }}
            className="absolute -top-12 -left-2 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[9px] font-mono text-emerald-300 shadow-sm"
          >
            200 OK
          </motion.div>
        </div>

        {/* Real Skateboard Physics (Crouch -> Ollie Pop -> Gravity Arc -> Suspension Landing) */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : trickCount > 0
              ? {
                  rotate: [0, 360],
                  y: [0, -85, 0],
                  scaleY: [1, 1.1, 0.9, 1],
                }
              : {
                  y: [0, -2, 0, 8, -95, -90, -25, 6, 0, -2, 0],
                  rotate: [0, -1, 0, -3, -16, 0, 10, 3, 0, -1, 0],
                  scaleY: [1, 1, 1, 0.92, 1.05, 1, 0.94, 0.88, 1, 1, 1],
                }
          }
          transition={{
            duration: duration,
            times: [0, 0.2, 0.38, 0.42, 0.47, 0.52, 0.57, 0.62, 0.66, 0.85, 1],
            ease: "easeInOut",
          }}
          className="relative flex flex-col items-center"
        >
          {/* Dynamic Dev Status Pill */}
          <motion.div
            className="absolute -top-9 px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-lg border text-[10px] font-mono font-bold whitespace-nowrap flex items-center gap-1.5"
            style={{
              backgroundColor: isJumping ? "rgba(6, 182, 212, 0.25)" : "rgba(15, 23, 42, 0.85)",
              borderColor: isJumping ? "rgba(6, 182, 212, 0.5)" : "rgba(51, 65, 85, 0.6)",
              color: isJumping ? "#67e8f9" : "#93c5fd",
            }}
          >
            {isJumping ? (
              <span>CODING MID-AIR! 💻⚡</span>
            ) : (
              <span>Hotfixing in prod... 💻💨</span>
            )}
          </motion.div>

          {/* 3D Anime Skater Holding Laptop and Typing SVG Rig */}
          <svg
            width="200"
            height="190"
            viewBox="0 0 200 190"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)]"
          >
            <defs>
              {/* 3D Cyan Hair Gradients */}
              <linearGradient id="hairGrad3D" x1="45" y1="10" x2="105" y2="55" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="45%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>

              <linearGradient id="hairHighlight" x1="60" y1="12" x2="85" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#a5f3fc" />
                <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
              </linearGradient>

              {/* 3D Skin Gradients */}
              <linearGradient id="skinGrad" x1="60" y1="20" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fed7aa" />
                <stop offset="70%" stopColor="#fdba74" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>

              {/* 3D Blue Tank Top */}
              <linearGradient id="tankTopGrad" x1="60" y1="65" x2="105" y2="115" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="55%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>

              {/* 3D Red Shorts */}
              <linearGradient id="shortsGrad" x1="65" y1="110" x2="120" y2="145" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>

              {/* 3D Yellow Skater Sneaker */}
              <linearGradient id="shoeYellow" x1="60" y1="150" x2="95" y2="175" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="60%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>

              {/* 3D Skateboard Deck */}
              <linearGradient id="deckGrad" x1="20" y1="170" x2="165" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="55%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>

              {/* 3D Skateboard Wheels */}
              <radialGradient id="wheelGrad" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="65%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>

              {/* 3D Ground Contact Shadow */}
              <radialGradient id="groundShadow" cx="95" cy="186" r="75" fx="95" fy="186" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
                <stop offset="60%" stopColor="rgba(0,0,0,0.25)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>

              {/* 3D Laptop Body & Screen Gradients */}
              <linearGradient id="laptopBodyGrad" x1="16" y1="84" x2="68" y2="96" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="60%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <linearGradient id="laptopScreenGrad" x1="18" y1="60" x2="62" y2="86" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="60%" stopColor="#0369a1" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Dynamic Ground Contact Shadow */}
            <motion.ellipse
              cx="96"
              cy="185"
              rx={isJumping ? 38 : 72}
              ry={isJumping ? 2.5 : 5}
              fill="url(#groundShadow)"
              animate={{ opacity: isJumping ? 0.35 : 0.8 }}
            />

            {/* ================= 3D SKATEBOARD ================= */}
            <g>
              <rect x="44" y="171" width="12" height="6" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="1" />
              <rect x="134" y="171" width="12" height="6" rx="2" fill="#475569" stroke="#1e293b" strokeWidth="1" />

              <ellipse cx="46" cy="177" rx="7.5" ry="7.5" fill="url(#wheelGrad)" stroke="#334155" strokeWidth="1.2" />
              <circle cx="46" cy="177" r="3" fill="#94a3b8" />
              <circle cx="46" cy="177" r="1.3" fill="#f8fafc" />

              <ellipse cx="140" cy="177" rx="7.5" ry="7.5" fill="url(#wheelGrad)" stroke="#334155" strokeWidth="1.2" />
              <circle cx="140" cy="177" r="3" fill="#94a3b8" />
              <circle cx="140" cy="177" r="1.3" fill="#f8fafc" />

              <path
                d="M24 167 Q34 171 65 171 L135 171 Q168 171 178 165 C181 164, 179 169, 171 172 Q135 177 65 177 Q30 177 20 169 C18 167, 21 166, 24 167 Z"
                fill="url(#deckGrad)"
                stroke="#94a3b8"
                strokeWidth="1.2"
              />
              <text
                x="100"
                y="174"
                fill="#0284c7"
                fontSize="6"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                &lt;CODE_RIDER/&gt;
              </text>
              <path d="M30 168 Q55 171 130 171 Q160 171 168 167" stroke="#64748b" strokeWidth="1.2" fill="none" />
            </g>

            {/* ================= KICKING BACK LEG ================= */}
            <g>
              <path
                d="M102 124 Q125 125 142 135"
                stroke="url(#skinGrad)"
                strokeWidth="11"
                strokeLinecap="round"
              />
              <path
                d="M142 135 Q158 142 165 152"
                stroke="url(#skinGrad)"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <path
                d="M162 148 L170 156"
                stroke="#ffffff"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <g transform="rotate(35 168 158)">
                <rect x="156" y="166" width="22" height="4.5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <path
                  d="M158 166 L160 155 Q164 153 172 155 L176 166 Z"
                  fill="url(#shoeYellow)"
                />
                <path d="M171 156 L176 166 L169 166 Z" fill="#06b6d4" />
                <line x1="162" y1="158" x2="167" y2="158" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="164" y1="161" x2="168" y2="161" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            </g>

            {/* ================= FRONT STANDING LEG ================= */}
            <g>
              <path
                d="M86 122 L86 150"
                stroke="url(#skinGrad)"
                strokeWidth="11"
                strokeLinecap="round"
              />
              <path
                d="M86 148 L86 164"
                stroke="url(#skinGrad)"
                strokeWidth="9.5"
                strokeLinecap="round"
              />
              <rect x="80.5" y="156" width="11" height="8" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />

              <g>
                <rect x="62" y="167" width="36" height="4.5" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <path
                  d="M74 167 L78 156 Q84 154 94 156 L96 167 Z"
                  fill="url(#shoeYellow)"
                />
                <path d="M64 167 Q65 162 70 162 L74 167 Z" fill="#06b6d4" />
                <line x1="80" y1="159" x2="85" y2="159" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
                <line x1="80" y1="162" x2="86" y2="162" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
              </g>
            </g>

            {/* ================= RED ATHLETIC SHORTS ================= */}
            <g>
              <path
                d="M74 106 L108 108 L116 128 C116 132, 98 135, 96 128 L93 118 L84 128 C82 132, 68 130, 70 125 Z"
                fill="url(#shortsGrad)"
                stroke="#b91c1c"
                strokeWidth="1"
              />
              <path
                d="M86 108 L98 128"
                stroke="#ffffff"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
              <path
                d="M82 108 L94 128"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>

            {/* ================= TORSO & CYAN TANK TOP ================= */}
            <g>
              <path
                d="M74 62 C70 56, 96 54, 98 62 L106 108 L76 106 Z"
                fill="url(#tankTopGrad)"
                stroke="#0369a1"
                strokeWidth="1"
              />
              <path
                d="M74 62 Q86 66 98 62"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M76 66 Q72 82 78 88"
                stroke="#ffffff"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M96 66 Q100 82 96 88"
                stroke="#ffffff"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <text
                x="87"
                y="88"
                fill="#ffffff"
                fontSize="7.5"
                fontFamily="monospace"
                fontWeight="900"
                textAnchor="middle"
                fillOpacity="0.95"
              >
                dev:~$
              </text>
            </g>

            {/* ================= LEFT ARM (SUPPORTING LAPTOP BASE) ================= */}
            <g>
              {/* Shoulder down to elbow, then bending forward underneath laptop */}
              <path
                d="M78 76 Q62 82 48 94"
                stroke="url(#skinGrad)"
                strokeWidth="8.5"
                strokeLinecap="round"
              />
              {/* Hand supporting under laptop */}
              <ellipse cx="44" cy="94" rx="5" ry="4" fill="#fdba74" />
            </g>

            {/* ================= THE OPEN 3D LAPTOP ================= */}
            <g>
              {/* Laptop Keyboard Base */}
              <polygon
                points="22,86 64,86 70,95 16,95"
                fill="url(#laptopBodyGrad)"
                stroke="#475569"
                strokeWidth="1"
              />
              {/* Glowing Keyboard Surface */}
              <polygon points="25,87 61,87 66,93 20,93" fill="#0f172a" />
              {/* Mini Keyboard Key Rows */}
              <line x1="26" y1="89" x2="60" y2="89" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2.5 1.5" />
              <line x1="24" y1="91" x2="62" y2="91" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 1.5" />
              {/* Glowing Trackpad */}
              <rect x="38" y="92" width="10" height="2" rx="0.5" fill="#38bdf8" fillOpacity="0.7" />

              {/* Tilted Open Screen */}
              <polygon
                points="24,60 58,60 62,86 18,86"
                fill="url(#laptopScreenGrad)"
                stroke="#0ea5e9"
                strokeWidth="1.2"
              />
              {/* Glowing Screen Code Lines */}
              <line x1="23" y1="65" x2="48" y2="65" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="23" y1="70" x2="55" y2="70" stroke="#38bdf8" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="23" y1="75" x2="42" y2="75" stroke="#4ade80" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="23" y1="80" x2="52" y2="80" stroke="#f472b6" strokeWidth="1.2" strokeLinecap="round" />

              {/* Code text on screen */}
              <text x="38" y="84" fill="#ffffff" fontSize="4.2" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                deploy()
              </text>

              {/* Screen Ambient Cyan Glow Halo */}
              <polygon
                points="24,60 58,60 62,86 18,86"
                fill="#38bdf8"
                fillOpacity="0.12"
              />
            </g>

            {/* ================= RIGHT ARM (SPEED-TYPING ON LAPTOP KEYBOARD) ================= */}
            <motion.g
              animate={
                !shouldReduceMotion
                  ? {
                      y: [0, -3.5, 0.5, -2.5, 0],
                      x: [0, 1.5, -1, 0.8, 0],
                      rotate: [-2, 3, -1, 2, -2],
                    }
                  : {}
              }
              transition={{
                repeat: Infinity,
                duration: 0.16,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: "90px 72px" }}
            >
              {/* Arm reaching across toward the keyboard */}
              <path
                d="M92 74 Q74 72 54 84"
                stroke="url(#skinGrad)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Typing Hand and Fingers tapping keys */}
              <ellipse cx="52" cy="85" rx="5" ry="3.8" fill="#fdba74" />
              <path d="M48 85 L44 87" stroke="#fb923c" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M50 86 L48 89" stroke="#fb923c" strokeWidth="2.2" strokeLinecap="round" />

              {/* Typing Code Sparks flying off the keys */}
              <motion.circle
                cx="46"
                cy="82"
                r="1.5"
                fill="#38bdf8"
                animate={{ y: [-2, -8], opacity: [1, 0], scale: [0.8, 1.4] }}
                transition={{ repeat: Infinity, duration: 0.25 }}
              />
              <motion.circle
                cx="54"
                cy="80"
                r="1.2"
                fill="#4ade80"
                animate={{ y: [-1, -7], opacity: [1, 0], scale: [0.8, 1.3] }}
                transition={{ repeat: Infinity, duration: 0.28, delay: 0.1 }}
              />
            </motion.g>

            {/* ================= 3D STYLIZED HEAD & FACE (FOCUSED ON LAPTOP) ================= */}
            <path d="M82 48 L82 62 L90 62 L90 48 Z" fill="url(#skinGrad)" />

            {/* Face tilted slightly forward watching the screen */}
            <path
              d="M68 39 C64 29, 88 19, 98 29 C104 35, 102 49, 96 55 C88 61, 72 57, 68 47 C66 45, 62 45, 60 42 C58 40, 64 39, 68 39 Z"
              fill="url(#skinGrad)"
              stroke="#ea580c"
              strokeWidth="0.8"
            />
            <path d="M62 42 C59 41, 58 43, 62 45" stroke="#ea580c" strokeWidth="1.2" strokeLinecap="round" fill="none" />

            {/* Intense Focused Eye looking down at laptop screen */}
            <ellipse cx="67" cy="39" rx="3.2" ry="3.5" fill="#0f172a" />
            <circle cx="65.8" cy="40.2" r="1.3" fill="#38bdf8" />
            <circle cx="65.2" cy="39.5" r="0.8" fill="#ffffff" />
            {/* Focused Eyebrow angled with intensity */}
            <path d="M63 34 Q68 32 73 35" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" />

            <ellipse cx="73" cy="45" rx="4" ry="2.5" fill="#f43f5e" fillOpacity="0.4" />
            {/* Grinning excited coder mouth */}
            <path d="M66 49 Q70 54 74 49" stroke="#9a3412" strokeWidth="1.3" strokeLinecap="round" fill="none" />

            {/* Cyan Hair */}
            <path
              d="M66 29 C64 11, 94 7, 104 19 C112 29, 108 43, 102 47 C98 39, 98 33, 92 31 C86 29, 76 35, 68 29 Z"
              fill="url(#hairGrad3D)"
              stroke="#0e7490"
              strokeWidth="1.2"
            />
            <path
              d="M62 27 C56 23, 60 13, 74 13 C82 13, 88 17, 78 23 C70 27, 66 27, 62 27 Z"
              fill="url(#hairGrad3D)"
            />
            <path
              d="M68 15 Q80 13 92 19"
              stroke="url(#hairHighlight)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </motion.div>
    </>
  );
}
