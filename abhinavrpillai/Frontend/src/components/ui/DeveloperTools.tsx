"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Code2, Activity, Zap, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DevMetrics {
  fps: number;
  memory?: number;
  ping?: number;
}

export default function DeveloperTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<DevMetrics>({ fps: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationIdRef = useRef<number | null>(null);

  // FPS Counter
  useEffect(() => {
    setIsMounted(true);
    lastTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const countFrames = () => {
      frameCountRef.current++;
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / elapsed);

        // Get memory info if available
        let memory = 0;
        const performanceWithMemory = performance as Performance & {
          memory?: {
            usedJSHeapSize: number;
          };
        };

        if (performanceWithMemory.memory) {
          memory = Math.round(performanceWithMemory.memory.usedJSHeapSize / 1048576);
        }

        setMetrics({ fps, memory });
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      animationIdRef.current = requestAnimationFrame(countFrames);
    };

    animationIdRef.current = requestAnimationFrame(countFrames);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isMounted]);

  const handleOpenDevTools = () => {
    if (typeof window !== "undefined") {
      window.open("about:blank", "_blank");
      setTimeout(() => {
        (window as any).open("chrome://version", "_blank");
      }, 100);
    }
  };

  const toggleDevTools = () => {
    if (typeof window !== "undefined") {
      // This won't work in browsers, but we can try
      try {
        (document as any).documentElement.style.setProperty("--dev-mode", "true");
      } catch (e) {
        console.log("DevTools: Debug mode toggled via console");
      }
    }
  };

  const fpsColor =
    metrics.fps > 50 ? "text-emerald-400" : metrics.fps > 30 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="fixed bottom-16 sm:bottom-24 left-4 sm:left-6 z-[9991]" suppressHydrationWarning>
      {/* Main Dev Tools Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-cyan-400 transition-all duration-300 border border-cyan-500/50 hover:border-cyan-400 shadow-lg hover:shadow-cyan-500/25"
        aria-label="Developer Tools"
        title="Developer Tools"
      >
        <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Expandable Panel */}
      {isOpen && (
        <div className="absolute bottom-14 sm:bottom-16 left-0 w-[calc(100vw-2rem)] max-w-xs sm:w-64 bg-slate-950/95 backdrop-blur-lg border border-cyan-500/40 rounded-xl shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Dev Tools
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-orange-400" />
                FPS
              </span>
              <span className={cn("font-mono font-bold", fpsColor)}>{metrics.fps}</span>
            </div>

            {metrics.memory !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-purple-400" />
                  Memory
                </span>
                <span className="font-mono text-slate-300">{metrics.memory}MB</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={toggleDevTools}
              className="px-2 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors border border-slate-700 hover:border-cyan-500/50"
              title="Enable debug mode"
            >
              Debug
            </button>
            <button
              onClick={() => {
                const url = `chrome://inspect`;
                console.log("Open DevTools: Press F12 or Ctrl+Shift+I");
              }}
              className="px-2 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors border border-slate-700 hover:border-cyan-500/50"
              title="Open DevTools"
            >
              F12
            </button>
            <button
              onClick={() => {
                console.clear();
                console.log("%c🔧 Developer Console Active", "color: cyan; font-size: 14px; font-weight: bold");
              }}
              className="px-2 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors border border-slate-700 hover:border-cyan-500/50"
              title="Clear console"
            >
              Clear
            </button>
            <button
              onClick={() => {
                console.log("Performance Metrics:", { fps: metrics.fps, memory: metrics.memory });
                console.table(performance.getEntriesByType("navigation"));
              }}
              className="px-2 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors border border-slate-700 hover:border-cyan-500/50"
              title="Log metrics"
            >
              Metrics
            </button>
          </div>

          {/* Info Footer */}
          <div className="pt-2 border-t border-cyan-500/20 text-xs text-slate-400">
            <p>Press <span className="text-cyan-400 font-mono">F12</span> for full DevTools</p>
          </div>
        </div>
      )}
    </div>
  );
}
