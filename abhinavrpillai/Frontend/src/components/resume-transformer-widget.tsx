"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Terminal, FileText, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

const RAW_MESSY_TEXT = 
  "i did fullstack react node js coding, did mongodb stuff, set up automated testing using playwright and made an ai chatbot with memory to store context.";

const FORMATTED_RESUME = {
  title: "Software Engineer",
  company: "Tech Solutions",
  bulletPoints: [
    "Architected scalable full-stack applications using React.js and Node.js with MongoDB backend engines.",
    "Engineered end-to-end automation pipelines utilizing Playwright, reducing regression times by 40%.",
    "Implemented conversational AI chat agents equipped with custom context-aware memory retention."
  ]
};

export default function ResumeTransformerWidget() {
  const [inputText, setInputText] = useState(RAW_MESSY_TEXT);
  const [status, setStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [progress, setProgress] = useState(0);

  const startTransformation = () => {
    if (status !== "idle") return;
    setStatus("scanning");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("done");
          return 100;
        }
        return prev + 5;
      });
    }, 80);
  };

  const resetWidget = () => {
    setStatus("idle");
    setProgress(0);
    setInputText(RAW_MESSY_TEXT);
  };

  return (
    <div className="mt-6 border border-primary/20 bg-secondary/10 rounded-2xl p-5 md:p-6 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <h4 className="text-base font-bold text-foreground">Interactive Project Demo: AI Resume Transformer</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Try a miniature live simulation of the AI Resume Builder project I built. Watch the AI parse messy notes into executive resume bullets:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Left: Input Textbox */}
        <div className="flex flex-col bg-card border border-border/80 rounded-xl p-4 min-h-[180px] justify-between">
          <div className="w-full">
            <div className="flex items-center gap-2 mb-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
              <Terminal className="h-3.5 w-3.5" />
              Raw Input Notes
            </div>
            {status === "idle" ? (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full text-sm bg-transparent border-0 outline-none focus:ring-0 text-foreground resize-none h-24"
                placeholder="Type some messy experience details here..."
              />
            ) : (
              <div className="text-sm font-mono text-muted-foreground break-words h-24 overflow-y-auto">
                {inputText}
              </div>
            )}
          </div>

          {status === "idle" && (
            <Button
              onClick={startTransformation}
              className="w-full bg-primary hover:bg-primary/95 text-white gap-2 font-medium"
            >
              <Sparkles className="h-4 w-4" />
              Transform with AI
            </Button>
          )}

          {status === "scanning" && (
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-xs font-mono text-primary">
                <span>AI Parsing Input...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <motion.div
                  className="bg-primary h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            </div>
          )}

          {status === "done" && (
            <Button
              onClick={resetWidget}
              variant="outline"
              className="w-full border-border hover:bg-secondary/40 gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Demo
            </Button>
          )}
        </div>

        {/* Right: Output Screen */}
        <div className="relative flex flex-col bg-secondary/20 border border-primary/20 rounded-xl p-4 min-h-[180px] overflow-hidden justify-center items-center">
          {/* Scanning glow bar */}
          {status === "scanning" && (
            <motion.div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent z-10"
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut"
              }}
              style={{
                boxShadow: "0 0 10px #6366f1, 0 0 20px #6366f1"
              }}
            />
          )}

          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-4 text-muted-foreground flex flex-col items-center gap-2"
              >
                <FileText className="h-8 w-8 opacity-40 text-primary" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Output Preview</span>
                <span className="text-xs text-muted-foreground/80">Click transform to begin processing</span>
              </motion.div>
            )}

            {status === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center p-4 space-y-2 text-primary"
              >
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto" />
                <span className="text-xs font-mono">Running LLM Resume Agent...</span>
              </motion.div>
            )}

            {status === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full space-y-3"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4" />
                  Format Succeeded
                </div>

                <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-foreground leading-none">{FORMATTED_RESUME.title}</span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{FORMATTED_RESUME.company}</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-outside ml-3.5 leading-relaxed">
                    {FORMATTED_RESUME.bulletPoints.map((point, index) => (
                      <li key={index}>
                        {point.split(/(React\.js|Node\.js|MongoDB|Playwright|AI Chatbots)/g).map((word, i) => 
                          ["React.js", "Node.js", "MongoDB", "Playwright", "AI Chatbots"].includes(word) ? (
                            <span key={i} className="text-foreground font-semibold">{word}</span>
                          ) : (
                            word
                          )
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
