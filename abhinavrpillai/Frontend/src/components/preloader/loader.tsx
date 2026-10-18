"use client";
import styles from "./style.module.scss";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { opacity, slideUp } from "./anim";
import { Play, Terminal } from "lucide-react";

const LOG_STEPS = [
  { percent: 0, text: "Initializing boot sequence..." },
  { percent: 12, text: "Loading system configuration modules..." },
  { percent: 25, text: "Connecting to secure local socket pipelines..." },
  { percent: 38, text: "Compiling Three.js 3D WebGL background models..." },
  { percent: 50, text: "Loading SVG skill assets locally..." },
  { percent: 62, text: "Optimizing DOM structures and layout weights..." },
  { percent: 75, text: "Booting interactive overlays and cursor followers..." },
  { percent: 88, text: "Finalizing performance optimization profiles..." },
  { percent: 100, text: "All systems operational. Click to enter." }
];

export default function Index({
  loadingPercent,
  isReadyToEnter,
  onEnter,
}: {
  loadingPercent: number;
  isReadyToEnter: boolean;
  onEnter: () => void;
}) {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height
    } Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height
    }  L0 0`;
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height
    } Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height}  L0 0`;

  const curve = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] as const, delay: 0.3 },
    },
  };

  // Build the progress bar [=========>......]
  const barLength = 20;
  const filledLength = Math.max(0, Math.floor((loadingPercent / 100) * barLength));
  const progressBar = "[" + "=".repeat(filledLength) + ">" + ".".repeat(Math.max(0, barLength - filledLength - 1)) + "]";

  const activeLogs = LOG_STEPS.filter((step) => loadingPercent >= step.percent);

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      exit="exit"
      className={styles.introduction}
    >
      {dimension.width > 0 && (
        <>
          {/* Main Developer Terminal Loader Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10 select-none">
            <div className="w-full max-w-xl bg-slate-950/95 border border-slate-800/80 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-500 hover:border-primary/30">
              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Terminal className="h-3.5 w-3.5 text-primary" />
                  abhinav@portfolio: ~
                </div>
                <div className="w-12" /> {/* alignment spacer */}
              </div>

              {/* Terminal Body */}
              <div className="p-5 font-mono text-xs sm:text-sm text-slate-300 space-y-4">
                <div className="space-y-1">
                  <div className="text-slate-500">abhinav@portfolio:~$ npm run start:portfolio</div>
                  <div className="text-primary font-bold">&gt; portfolio@2.0.0 start</div>
                  <div className="text-slate-400">&gt; next dev --turbo</div>
                </div>

                {/* Log Outputs */}
                <div className="space-y-1.5 h-[160px] overflow-y-auto scrollbar-none">
                  {activeLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
                      <span className="text-primary font-semibold shrink-0">[LOAD]</span>
                      <span className={idx === activeLogs.length - 1 ? "text-emerald-400 animate-pulse" : "text-slate-300"}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress Bar & Percentage */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-900">
                  <div className="text-slate-400 font-mono text-xs sm:text-sm tracking-widest">
                    {progressBar}
                  </div>
                  <div className="text-emerald-400 font-bold text-sm sm:text-base shrink-0">
                    {loadingPercent.toFixed(0)}% Compiled
                  </div>
                </div>

                {/* Compilation Success & Interactive Enter Button */}
                <div className="h-16 flex items-center justify-center pt-2">
                  {isReadyToEnter ? (
                    <motion.button
                      onClick={onEnter}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center gap-2.5 px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-400 transition-all duration-300 cursor-can-hover"
                    >
                      <Play className="h-3.5 w-3.5 fill-slate-950 text-slate-950" />
                      Boot System
                    </motion.button>
                  ) : (
                    <div className="text-slate-500 text-xs animate-pulse flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-ping" />
                      Compiling assets...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <svg className={styles.bgCurveSvg}>
            <motion.path
              variants={curve}
              initial="initial"
              exit="exit"
            ></motion.path>
          </svg>
        </>
      )}
    </motion.div>
  );
}
