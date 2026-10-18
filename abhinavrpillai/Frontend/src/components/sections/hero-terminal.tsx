"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, CornerDownLeft, Sparkles } from "lucide-react";
import AnimeCoder, { AnimeCoderState } from "../AnimeCoder";
import { cn } from "@/lib/utils";

type LogEntry = {
  text: string;
  type: "input" | "output" | "error" | "system";
};

const COMMANDS = ["help", "skills", "experience", "music", "hack", "clear"];

export default function HeroTerminal() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([
    { text: "Abhinav OS [Version 1.0.0]", type: "system" },
    { text: "Welcome to my interactive shell. Type a command or click a button below.", type: "system" },
  ]);
  const [isMatrixActive, setIsMatrixActive] = useState(false);
  const [coderState, setCoderState] = useState<AnimeCoderState>("idle");
  const [celebrationText, setCelebrationText] = useState("Hurray!");
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll only the internal terminal box to the bottom, without scrolling the main window
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Handle playing click sounds on interaction
  const playClickSound = () => {
    const isMusicOn = localStorage.getItem("bg-music-playing") === "true";
    if (isMusicOn) {
      const audio = new Audio("/assets/keycap-sounds/press.mp3");
      audio.volume = 0.1;
      audio.play().catch(() => {});
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    if (!isMatrixActive) {
      setCoderState("typing");
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        setCoderState("idle");
      }, 950);
    }
  };

  const handleCommand = (cmd: string) => {
    playClickSound();
    const cleanCmd = cmd.trim().toLowerCase();
    if (!cleanCmd) return;

    const newLogs = [...logs, { text: `developer@abhinav:~$ ${cmd}`, type: "input" as const }];

    switch (cleanCmd) {
      case "help":
        newLogs.push({
          text: "Available commands:\n  • help: Shows this menu\n  • skills: Scrolls to Tech Stack section\n  • experience: Scrolls to Experience timeline\n  • music: Toggles background sound\n  • hack: Activates simulated matrix hacking mode\n  • clear: Clears terminal logs",
          type: "output",
        });
        setCoderState("celebrating");
        setTimeout(() => setCoderState("idle"), 1800);
        break;
      case "skills":
        newLogs.push({ text: "Navigating to Tech Stack...", type: "system" });
        document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" });
        setCoderState("celebrating");
        setTimeout(() => setCoderState("idle"), 1800);
        break;
      case "experience":
        newLogs.push({ text: "Navigating to Experience Timeline...", type: "system" });
        document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" });
        setCoderState("celebrating");
        setTimeout(() => setCoderState("idle"), 1800);
        break;
      case "music":
        const btn = document.querySelector("button[aria-label='Toggle Background Music']") as HTMLButtonElement;
        if (btn) {
          btn.click();
          const isMuted = localStorage.getItem("bg-music-playing") !== "true";
          newLogs.push({ text: `Background music toggled: ${isMuted ? "PAUSED" : "PLAYING"}`, type: "system" });
        } else {
          newLogs.push({ text: "Audio player not found in DOM.", type: "error" });
        }
        setCelebrationText("Hurray! 🎉");
        setCoderState("celebrating");
        setTimeout(() => setCoderState("idle"), 1800);
        break;
      case "hack":
        setIsMatrixActive(true);
        setCoderState("hacking");
        newLogs.push({ text: "Initializing matrix hacker protocol...", type: "system" });
        setTimeout(() => {
          setIsMatrixActive(false);
          setCelebrationText("Hurray! ✨");
          setCoderState("celebrating");
          newLogs.push({ text: "Matrix bypass complete. Access granted! 🔓✨", type: "output" });
          setTimeout(() => setCoderState("idle"), 2500);
        }, 5000);
        break;
      case "clear":
        setLogs([]);
        setInput("");
        setCelebrationText("Hurray!");
        setCoderState("celebrating");
        setTimeout(() => setCoderState("idle"), 1500);
        return;
      default:
        newLogs.push({ text: `Unknown command: '${cmd}'. Type 'help' for options.`, type: "error" });
    }

    setLogs(newLogs);
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 relative z-10 pointer-events-auto">
      {/* Cute Anime Coder sitting on top of the Terminal */}
      <div className="absolute -top-16 sm:-top-20 right-3 sm:right-6 pointer-events-none select-none z-20">
        <AnimeCoder state={coderState} celebrationText={celebrationText} />
      </div>

      <CardWindow>
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-background/95 border-b border-border rounded-t-xl select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Terminal className="h-3 w-3 text-primary" />
            developer@abhinav: ~
          </div>
          <div className="w-12" /> {/* alignment spacer */}
        </div>

        {/* Terminal Body */}
        <div
          ref={terminalContainerRef}
          className="p-3 sm:p-4 h-48 sm:h-60 overflow-y-auto font-mono text-xs sm:text-sm relative bg-background/90 text-foreground"
        >
          <AnimatePresence>
            {isMatrixActive ? (
              <MatrixRain key="matrix" />
            ) : (
              <div className="space-y-1.5" key="logs">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={cn(
                      "whitespace-pre-line leading-relaxed",
                      log.type === "input" && "text-foreground font-semibold",
                      log.type === "system" && "text-primary",
                      log.type === "error" && "text-rose-500",
                      log.type === "output" && "text-muted-foreground"
                    )}
                  >
                    {log.text}
                  </div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-b-xl gap-1 border-t bg-background/95 border-border"
        >
          <span className="text-primary font-bold font-mono text-xs sm:text-sm select-none shrink-0">
            dev:~$
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={isMatrixActive}
            className="flex-1 min-w-0 bg-transparent border-0 outline-none focus:ring-0 font-mono text-xs sm:text-sm p-0 text-foreground placeholder:text-muted-foreground"
            placeholder={isMatrixActive ? "Locked..." : "Type command..."}
          />
          <button
            type="submit"
            className="transition-colors p-1 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <CornerDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </form>
      </CardWindow>

      {/* Suggested Command Chips */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mt-2.5 sm:mt-3 select-none px-1">
        {COMMANDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleCommand(cmd)}
            disabled={isMatrixActive}
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-mono font-normal rounded-full border border-border/80 bg-secondary/80 text-muted-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all duration-300"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}

function CardWindow({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/80 bg-background/50 shadow-2xl backdrop-blur-sm overflow-hidden">
      {children}
    </div>
  );
}

function MatrixRain() {
  const [matrixText, setMatrixText] = useState("");

  useEffect(() => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@&";
    const interval = setInterval(() => {
      let result = "";
      for (let i = 0; i < 8; i++) {
        let row = "";
        for (let j = 0; j < 30; j++) {
          row += chars[Math.floor(Math.random() * chars.length)] + " ";
        }
        result += row + "\n";
      }
      setMatrixText(result);
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-xs sm:text-sm text-emerald-400 select-none whitespace-pre leading-snug">
      <div className="text-[10px] text-emerald-500 mb-2 font-bold animate-pulse">
        [!] INFILTRATING MAINFRAME ENCRYPTION...
      </div>
      {matrixText}
    </div>
  );
}
