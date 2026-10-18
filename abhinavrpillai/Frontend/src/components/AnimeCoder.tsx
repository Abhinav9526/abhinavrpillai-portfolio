"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { playInhaleSound, playSneezeSound } from "@/lib/sounds";

export type AnimeCoderState = "idle" | "typing" | "hacking" | "celebrating";

interface AnimeCoderProps {
  state?: AnimeCoderState;
  celebrationText?: string;
  className?: string;
}

export default function AnimeCoder({
  state = "idle",
  celebrationText = "Hurray! ✨",
  className,
}: AnimeCoderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [blink, setBlink] = useState(false);
  const [hasHeadphonesOn, setHasHeadphonesOn] = useState(false);
  const [sneezePhase, setSneezePhase] = useState<"none" | "inhale" | "sneeze" | "recover">("none");
  const sneezeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync headphone visibility with background music playback
  useEffect(() => {
    const stored = localStorage.getItem("bg-music-playing");
    setHasHeadphonesOn(stored === "true");

    const handleMusicChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isPlaying: boolean }>;
      setHasHeadphonesOn(Boolean(customEvent.detail?.isPlaying));
    };

    window.addEventListener("bg-music-change", handleMusicChange);
    return () => window.removeEventListener("bg-music-change", handleMusicChange);
  }, []);

  // Periodic natural blinking during idle
  useEffect(() => {
    if (state !== "idle" || shouldReduceMotion || sneezePhase !== "none") return;

    const blinkInterval = setInterval(() => {
      setBlink(true);
      const timer = setTimeout(() => setBlink(false), 150);
      return () => clearTimeout(timer);
    }, 4200);

    return () => clearInterval(blinkInterval);
  }, [state, shouldReduceMotion, sneezePhase]);

  // Clean up sneeze timers on unmount
  useEffect(() => {
    return () => {
      if (sneezeTimerRef.current) clearTimeout(sneezeTimerRef.current);
    };
  }, []);

  const isTyping = state === "typing";
  const isHacking = state === "hacking";
  const isCelebrating = state === "celebrating";
  const isSneezing = sneezePhase !== "none";

  // Trigger anime sneeze sequence on face hover
  const handleFaceHover = () => {
    if (isSneezing || isTyping || isHacking) return;

    // Phase 1: Inhale & anticipation (head tilts back, scrunched eyes)
    setSneezePhase("inhale");
    playInhaleSound();

    sneezeTimerRef.current = setTimeout(() => {
      // Phase 2: Explosive sneeze! (ACHOO!)
      setSneezePhase("sneeze");
      playSneezeSound();

      sneezeTimerRef.current = setTimeout(() => {
        // Phase 3: Recover with blushing smile
        setSneezePhase("recover");

        sneezeTimerRef.current = setTimeout(() => {
          setSneezePhase("none");
        }, 900);
      }, 420);
    }, 420);
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex flex-col items-center justify-end select-none pointer-events-none",
        "w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32",
        className
      )}
    >
      {/* Floating Status Pill */}
      <AnimatePresence mode="wait">
        {sneezePhase === "inhale" ? (
          <motion.div
            key="inhale-pill"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-3 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[9px] font-mono font-bold text-rose-300 backdrop-blur-md shadow-lg"
          >
            <span>Ah... ah...</span>
          </motion.div>
        ) : sneezePhase === "sneeze" ? (
          <motion.div
            key="sneeze-pill"
            initial={{ opacity: 0, scale: 0.6, y: 6 }}
            animate={{ opacity: 1, scale: [0.8, 1.25, 1.15], y: [-2, -6, -3] }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-4 px-2.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-500/60 text-[10px] font-mono font-black text-amber-200 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.65)] flex items-center gap-1"
          >
            <span>ACHOO! 🤧💨</span>
            <span className="text-[9px] animate-ping">✨</span>
          </motion.div>
        ) : sneezePhase === "recover" ? (
          <motion.div
            key="recover-pill"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-3 px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-[9px] font-mono text-slate-300 backdrop-blur-md"
          >
            <span>Excuse me! 😅</span>
          </motion.div>
        ) : isHacking ? (
          <motion.div
            key="hacking-pill"
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-3 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono font-bold text-emerald-400 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>ROOT_BYPASS</span>
          </motion.div>
        ) : isTyping ? (
          <motion.div
            key="typing-pill"
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-3 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[9px] font-mono font-medium text-cyan-300 backdrop-blur-md shadow-lg flex items-center gap-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>compiling...</span>
          </motion.div>
        ) : isCelebrating ? (
          <motion.div
            key="celebrating-pill"
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-3 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono font-bold text-amber-300 backdrop-blur-md shadow-lg"
          >
            <span>{celebrationText}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Interactive Face Sneeze Hit Target (HTML overlay for 100% reliable mouse hover across all browsers) */}
      <div
        onMouseEnter={handleFaceHover}
        className="absolute top-[22%] left-[32%] w-[36%] h-[36%] rounded-full cursor-pointer pointer-events-auto z-30"
        title="Tickle nose to sneeze! 🤧"
        aria-label="Tickle face to sneeze"
      />

      {/* Main Anime Boy Rig */}
      <motion.svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
        animate={
          isCelebrating && !shouldReduceMotion
            ? { y: [0, -5, 0, -3, 0] }
            : { y: 0 }
        }
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <defs>
          {/* Cool Boy Hair Gradient */}
          <linearGradient id="boyHair" x1="40" y1="20" x2="120" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Hair Highlight */}
          <linearGradient id="hairSheen" x1="60" y1="35" x2="100" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0" />
          </linearGradient>

          {/* Headset Arc Gradient */}
          <linearGradient id="headsetGrad" x1="30" y1="50" x2="130" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Laptop Glow Screen */}
          <linearGradient id="screenGlow" x1="60" y1="120" x2="100" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={isHacking ? "#22c55e" : "#38bdf8"} stopOpacity="0.95" />
            <stop offset="100%" stopColor={isHacking ? "#15803d" : "#0284c7"} stopOpacity="0.45" />
          </linearGradient>

          {/* Hoodie Gradient */}
          <linearGradient id="boyHoodie" x1="50" y1="80" x2="110" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0b0f19" />
          </linearGradient>
        </defs>

        {/* ================= LEGS (CALM, RESTING ON TERMINAL) ================= */}
        <g>
          <path
            d="M62 136 L62 152 Q62 156 68 156 L72 156"
            stroke="#1e293b"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <ellipse cx="70" cy="155" rx="5" ry="3" fill="#f97316" />

          <path
            d="M98 136 L98 152 Q98 156 92 156 L88 156"
            stroke="#1e293b"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <ellipse cx="90" cy="155" rx="5" ry="3" fill="#f97316" />
        </g>

        {/* ================= TORSO & HOODIE (STATIC IN IDLE) ================= */}
        <g>
          <path
            d="M52 100 C52 86, 108 86, 108 100 L114 138 C114 142, 46 142, 46 138 Z"
            fill="url(#boyHoodie)"
            stroke="#334155"
            strokeWidth="1.8"
          />

          <text
            x="80"
            y="118"
            fill="#38bdf8"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
            fillOpacity="0.85"
          >
            {isHacking ? "</>" : "{;}"}
          </text>
        </g>

        {/* ================= ANIME BOY HEAD & HAIR RIG ================= */}
        <motion.g
          animate={
            sneezePhase === "inhale"
              ? { y: -5, rotate: -7, scale: 0.97 }
              : sneezePhase === "sneeze"
              ? { y: 8, rotate: 10, scale: 1.05 }
              : sneezePhase === "recover"
              ? { y: [2, 0], rotate: [2, 0] }
              : isHacking && !shouldReduceMotion
              ? { y: [0, 1.2, 0], rotate: [-1, 1, -1] }
              : isTyping && !shouldReduceMotion
              ? { y: 2, rotate: 0 }
              : !shouldReduceMotion
              ? { y: [0, -1.2, 0], rotate: [0, 0.8, 0] }
              : { y: 0, rotate: 0 }
          }
          transition={
            sneezePhase === "sneeze"
              ? { duration: 0.12, type: "spring", stiffness: 400 }
              : sneezePhase === "inhale"
              ? { duration: 0.4, ease: "easeOut" }
              : {
                  duration: isHacking ? 0.2 : isTyping ? 0.3 : 3,
                  repeat: isHacking || (state === "idle" && !isSneezing) ? Infinity : 0,
                  ease: "easeInOut",
                }
          }
          style={{ transformOrigin: "80px 75px" }}
        >
          {/* Short Boy Hair Back Layer */}
          <path
            d="M50 56 C46 32, 114 32, 110 56 C112 72, 108 78, 100 80 L60 80 C52 78, 48 72, 50 56 Z"
            fill="url(#boyHair)"
          />

          {/* Boy Chibi Face */}
          <path
            d="M55 52 C55 40, 105 40, 105 52 C105 68, 102 78, 80 82 C58 78, 55 68, 55 52 Z"
            fill="#fef3c7"
          />

          {/* Blushing Cheeks (Turn deeper red during sneeze/recover) */}
          <circle
            cx="63"
            cy="66"
            r={isSneezing ? 4.5 : 3}
            fill={isSneezing ? "#f43f5e" : "#f472b6"}
            fillOpacity={isSneezing ? 0.65 : 0.4}
          />
          <circle
            cx="97"
            cy="66"
            r={isSneezing ? 4.5 : 3}
            fill={isSneezing ? "#f43f5e" : "#f472b6"}
            fillOpacity={isSneezing ? 0.65 : 0.4}
          />

          {/* ================= EYES / CYBER VISOR ================= */}
          {sneezePhase === "inhale" || sneezePhase === "sneeze" ? (
            /* Tightly scrunched anime sneeze eyes (> <) */
            <g stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M60 56 L67 60 L60 64" />
              <path d="M100 56 L93 60 L100 64" />
            </g>
          ) : sneezePhase === "recover" ? (
            /* Sheepish curved eyes */
            <g stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none">
              <path d="M60 60 Q65 56 70 60" />
              <path d="M90 60 Q95 56 100 60" />
            </g>
          ) : isHacking ? (
            /* Matrix Cyber Shades */
            <g>
              <rect x="58" y="52" width="44" height="13" rx="3" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5" />
              <line x1="62" y1="58" x2="74" y2="58" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
              <line x1="86" y1="58" x2="98" y2="58" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : isCelebrating ? (
            /* Joyful Closed Arc Eyes */
            <g stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" fill="none">
              <path d="M60 60 Q65 54 70 60" />
              <path d="M90 60 Q95 54 100 60" />
            </g>
          ) : isTyping ? (
            /* Focused Coding Eyes */
            <g>
              <ellipse cx="65" cy="60" rx="4.5" ry="4.5" fill="#0f172a" />
              <ellipse cx="95" cy="60" rx="4.5" ry="4.5" fill="#0f172a" />
              <circle cx="66" cy="61" r="1.5" fill="#ffffff" />
              <circle cx="96" cy="61" r="1.5" fill="#ffffff" />
            </g>
          ) : (
            /* Idle Expressive Anime Boy Eyes */
            <g>
              {blink ? (
                <g stroke="#0f172a" strokeWidth="2" strokeLinecap="round" fill="none">
                  <path d="M60 60 Q65 62 70 60" />
                  <path d="M90 60 Q95 62 100 60" />
                </g>
              ) : (
                <g>
                  {/* Left Eye */}
                  <ellipse cx="65" cy="59" rx="5" ry="6" fill="#0f172a" />
                  <ellipse cx="65" cy="60" rx="3.5" ry="3.5" fill="#0ea5e9" />
                  <circle cx="63.5" cy="57.5" r="1.8" fill="#ffffff" />
                  <circle cx="66.5" cy="61" r="0.9" fill="#ffffff" />

                  {/* Right Eye */}
                  <ellipse cx="95" cy="59" rx="5" ry="6" fill="#0f172a" />
                  <ellipse cx="95" cy="60" rx="3.5" ry="3.5" fill="#0ea5e9" />
                  <circle cx="93.5" cy="57.5" r="1.8" fill="#ffffff" />
                  <circle cx="96.5" cy="61" r="0.9" fill="#ffffff" />
                </g>
              )}
            </g>
          )}

          {/* Eyebrows */}
          <path d="M60 52 Q66 50 71 53" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M89 53 Q94 50 100 52" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />

          {/* Cute Mouth */}
          {sneezePhase === "sneeze" ? (
            /* Wide open sneeze mouth */
            <path d="M76 68 Q80 77 84 68 Z" fill="#f43f5e" />
          ) : sneezePhase === "inhale" ? (
            /* Inhale small O mouth */
            <circle cx="80" cy="70" r="1.8" fill="#78350f" />
          ) : sneezePhase === "recover" ? (
            /* Sheepish wavy smile */
            <path d="M77 69 Q80 67 83 69" stroke="#78350f" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          ) : isCelebrating ? (
            <path d="M77 69 Q80 74 83 69 Z" fill="#f43f5e" />
          ) : (
            <path d="M78 69 Q80 71 82 69" stroke="#78350f" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          )}

          {/* Sneeze Wind Gust & Anime Particles (Explosive burst during sneeze) */}
          {sneezePhase === "sneeze" && (
            <motion.g
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: [0.6, 1.35, 1.2], x: [0, 12, 16], y: [0, 3, 5] }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {/* Anime Wind Gust Arcs */}
              <path d="M86 68 Q106 62 128 66" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M84 74 Q108 76 134 72" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M88 78 Q104 84 124 82" stroke="#0ea5e9" strokeWidth="1.8" strokeLinecap="round" fill="none" />

              {/* Sneeze Air Puff Clouds */}
              <circle cx="104" cy="70" r="5" fill="#e0f2fe" fillOpacity="0.75" />
              <circle cx="116" cy="67" r="4" fill="#bae6fd" fillOpacity="0.65" />
              <circle cx="112" cy="76" r="3.5" fill="#e0f2fe" fillOpacity="0.7" />

              {/* Dynamic Sneeze Droplets & Sparkle Stars */}
              <circle cx="126" cy="62" r="2.2" fill="#38bdf8" />
              <circle cx="138" cy="71" r="1.8" fill="#fbbf24" />
              <circle cx="122" cy="84" r="2" fill="#f43f5e" />
              <circle cx="132" cy="78" r="1.5" fill="#38bdf8" />
              <circle cx="142" cy="66" r="1.4" fill="#ffffff" />

              {/* Sneeze Sparkle Star */}
              <polygon
                points="126,69 128,74 133,74 129,77 131,82 126,79 121,82 123,77 119,74 124,74"
                fill="#fde047"
              />
            </motion.g>
          )}

          {/* Stylish Layered Spiky Boy Hair Bangs */}
          <path
            d="M48 48 C48 30, 112 30, 112 48 C108 42, 98 42, 94 48 C90 40, 78 40, 74 48 C70 42, 58 42, 48 48 Z"
            fill="url(#boyHair)"
          />
          <polygon points="56,38 64,28 68,36" fill="url(#boyHair)" />
          <polygon points="72,34 80,24 86,34" fill="url(#boyHair)" />
          <polygon points="90,36 98,28 104,38" fill="url(#boyHair)" />
          <polygon points="62,46 68,58 72,46" fill="url(#boyHair)" />
          <polygon points="74,46 80,62 86,46" fill="url(#boyHair)" />
          <polygon points="88,46 94,56 100,46" fill="url(#boyHair)" />

          {/* Hair Soft Highlight Sheen */}
          <path d="M62 38 Q80 32 98 38" stroke="url(#hairSheen)" strokeWidth="3" strokeLinecap="round" />

          {/* Chibi Ears */}
          <ellipse cx="54" cy="62" rx="4" ry="6" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" />
          <ellipse cx="106" cy="62" rx="4" ry="6" fill="#fde68a" stroke="#d97706" strokeWidth="0.8" />

          {/* Gaming Headset (When music is playing) */}
          {hasHeadphonesOn && (
            <motion.g
              initial={{ opacity: 0, y: -6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.9 }}
              transition={{ duration: 0.25 }}
            >
              <path
                d="M48 64 C46 32, 114 32, 112 64"
                stroke="url(#headsetGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse cx="48" cy="62" rx="4.5" ry="7.5" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.5" />
              <ellipse cx="112" cy="62" rx="4.5" ry="7.5" fill="#06b6d4" stroke="#0891b2" strokeWidth="1.5" />
              <path d="M48 64 Q46 76 56 75" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <circle cx="57" cy="75" r="1.8" fill="#f97316" />
            </motion.g>
          )}

          {/* ================= INTERACTIVE SNEEZE TRIGGER ON FACE ================= */}
          <circle
            cx="80"
            cy="64"
            r="28"
            fill="#ffffff"
            fillOpacity="0.001"
            style={{ pointerEvents: "all" }}
            className="pointer-events-auto cursor-pointer"
            onMouseEnter={handleFaceHover}
          >
            <title>Tickle nose to sneeze! 🤧</title>
          </circle>
        </motion.g>

        {/* ================= LAPTOP & STATIC BASE ================= */}
        <polygon points="54,124 106,124 114,136 46,136" fill="#1e293b" stroke="#334155" strokeWidth="1.2" />
        <rect x="74" y="130" width="12" height="4" rx="1" fill="#0f172a" />

        <polygon
          points="58,102 102,102 106,124 54,124"
          fill="url(#screenGlow)"
          stroke="#38bdf8"
          strokeWidth="1.2"
        />
        <line x1="62" y1="108" x2="78" y2="108" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.85" strokeLinecap="round" />
        <line x1="62" y1="113" x2="88" y2="113" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.85" strokeLinecap="round" />
        <line x1="62" y1="118" x2="72" y2="118" stroke="#ffffff" strokeWidth="1.2" strokeOpacity="0.85" strokeLinecap="round" />

        {/* ================= ARMS & HANDS (100% STATIC IN IDLE, TYPING ONLY ON USER INPUT) ================= */}
        {isTyping || isHacking ? (
          <motion.g
            animate={
              !shouldReduceMotion
                ? { y: [0, -2.5, 0], rotate: [-2, 3, -2] }
                : {}
            }
            transition={{
              repeat: Infinity,
              duration: isHacking ? 0.12 : 0.18,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "52px 104px" }}
          >
            <path d="M52 104 Q56 120 66 126" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" fill="none" />
            <ellipse cx="67" cy="126" rx="3.5" ry="3" fill="#fde68a" />
          </motion.g>
        ) : (
          <g>
            <path d="M52 104 Q56 120 66 126" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" fill="none" />
            <ellipse cx="67" cy="126" rx="3.5" ry="3" fill="#fde68a" />
          </g>
        )}

        {isTyping || isHacking ? (
          <motion.g
            animate={
              !shouldReduceMotion
                ? { y: [-2.5, 0, -2.5], rotate: [3, -2, 3] }
                : {}
            }
            transition={{
              repeat: Infinity,
              duration: isHacking ? 0.12 : 0.18,
              ease: "easeInOut",
            }}
            style={{ transformOrigin: "108px 104px" }}
          >
            <path d="M108 104 Q104 120 94 126" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" fill="none" />
            <ellipse cx="93" cy="126" rx="3.5" ry="3" fill="#fde68a" />
          </motion.g>
        ) : (
          <g>
            <path d="M108 104 Q104 120 94 126" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" fill="none" />
            <ellipse cx="93" cy="126" rx="3.5" ry="3" fill="#fde68a" />
          </g>
        )}
      </motion.svg>
    </div>
  );
}
