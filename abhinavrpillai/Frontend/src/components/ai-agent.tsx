"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Radio,
  CheckCircle2,
  Wifi,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
}

const QUICK_TOPICS = [
  { label: "💼 Work Experience", prompt: "Can you tell me about your work experience at Thoughtline and NDimensionZ?" },
  { label: "🚀 Top Projects", prompt: "What are your top full-stack and AI projects you've built?" },
  { label: "⚡ Tech Stack", prompt: "What technologies and frameworks do you use the most?" },
  { label: "🎓 Education", prompt: "Where did you study and what is your academic background?" },
  { label: "📞 Contact Abhinav", prompt: "How can a recruiter or client reach out to you?" },
];

export default function AIAgent() {
  const [callState, setCallState] = useState<"idle" | "ringing" | "connected" | "ended">("idle");
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const [micStatus, setMicStatus] = useState<"idle" | "listening" | "speaking" | "muted" | "error" | "thinking">("idle");
  const [hasMicError, setHasMicError] = useState(false);
  const [spectrumBars, setSpectrumBars] = useState<number[]>(new Array(24).fill(12));
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [liveInterimText, setLiveInterimText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ringingGainRef = useRef<GainNode | null>(null);

  // Speech Recognition & Synthesis refs
  const recognitionRef = useRef<any>(null);
  const isAiSpeakingRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(isMuted);
  const isSpeakerOnRef = useRef<boolean>(isSpeakerOn);
  const callStateRef = useRef(callState);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    // Preload available voices
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Look for Indian English voice or best natural male voice
        const indianVoice = voices.find(
          (v) => (v.lang === "en-IN" || v.lang.includes("IN")) && (v.name.toLowerCase().includes("male") || !v.name.toLowerCase().includes("female"))
        ) || voices.find((v) => v.lang === "en-IN");

        const englishMaleVoice = voices.find(
          (v) => (v.lang.startsWith("en") && v.name.toLowerCase().includes("male") && !v.name.toLowerCase().includes("female"))
        );

        const defaultEn = voices.find((v) => v.lang.startsWith("en"));
        selectedVoiceRef.current = indianVoice || englishMaleVoice || defaultEn || voices[0] || null;
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
    isSpeakerOnRef.current = isSpeakerOn;
    callStateRef.current = callState;
  }, [isMuted, isSpeakerOn, callState]);

  // Duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (callState === "connected") {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  // Scroll to bottom of transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, liveInterimText, showChat]);

  // Audio spectrum wave animation
  const startSpectrumAnimation = useCallback(() => {
    let frame = 0;
    const animate = () => {
      frame++;
      if (callStateRef.current === "connected") {
        if (isAiSpeakingRef.current) {
          // Dynamic vivid voice frequency simulation
          const bars = new Array(24).fill(0).map((_, i) => {
            const harmonic1 = Math.sin(frame * 0.18 + i * 0.5) * 35;
            const harmonic2 = Math.cos(frame * 0.28 + i * 0.3) * 25;
            const jitter = (i % 3 === 0 ? 15 : 5);
            return Math.min(100, Math.max(18, 45 + harmonic1 + harmonic2 + jitter));
          });
          setSpectrumBars(bars);
        } else if (micStatus === "listening") {
          // Responsive listener pulse
          const bars = new Array(24).fill(0).map((_, i) => {
            const wave = Math.sin(frame * 0.12 + i * 0.4) * 20;
            return Math.min(100, Math.max(12, 28 + wave));
          });
          setSpectrumBars(bars);
        } else {
          // Gentle ambient breathing wave
          const bars = new Array(24).fill(0).map((_, i) => {
            return 12 + Math.sin(frame * 0.06 + i * 0.3) * 8;
          });
          setSpectrumBars(bars);
        }
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, [micStatus]);

  const playRingTone = (ctx: AudioContext, startTime: number) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(440, startTime);
    osc2.frequency.setValueAtTime(480, startTime);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
    gainNode.gain.setValueAtTime(0.12, startTime + 0.55);
    gainNode.gain.linearRampToValueAtTime(0, startTime + 0.6);

    gainNode.gain.setValueAtTime(0, startTime + 0.85);
    gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.9);
    gainNode.gain.setValueAtTime(0.12, startTime + 1.4);
    gainNode.gain.linearRampToValueAtTime(0, startTime + 1.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + 1.55);
    osc2.stop(startTime + 1.55);

    ringingGainRef.current = gainNode;
  };

  const stopRingingSound = () => {
    if (ringingGainRef.current) {
      try {
        ringingGainRef.current.gain.setValueAtTime(0, 0);
        ringingGainRef.current.disconnect();
      } catch (e) {}
      ringingGainRef.current = null;
    }
  };

  // Speaks AI response cleanly with zero stutter and zero acoustic echo
  const speakAiResponse = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (!isSpeakerOnRef.current) return;

    // Stop any speech recognition while AI talks to prevent hearing itself!
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Cancel any previous utterance
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoiceRef.current) {
      utterance.voice = selectedVoiceRef.current;
    }
    utterance.rate = 1.05; // Natural modern conversation pace
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      isAiSpeakingRef.current = true;
      setMicStatus("speaking");
    };

    utterance.onend = () => {
      isAiSpeakingRef.current = false;
      if (callStateRef.current === "connected" && !isMutedRef.current) {
        setMicStatus("listening");
        // Resume listening automatically for next user question
        startListening();
      } else {
        setMicStatus("idle");
      }
    };

    utterance.onerror = () => {
      isAiSpeakingRef.current = false;
      if (callStateRef.current === "connected") {
        setMicStatus("listening");
        startListening();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start continuous Native Speech Recognition
  const startListening = () => {
    if (typeof window === "undefined") return;
    if (isAiSpeakingRef.current || isMutedRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        if (!isAiSpeakingRef.current && !isMutedRef.current) {
          setMicStatus("listening");
        }
      };

      recognition.onresult = (event: any) => {
        if (isAiSpeakingRef.current) return;

        let interim = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setLiveInterimText(interim);
        }

        if (finalTranscript.trim()) {
          setLiveInterimText("");
          handleUserQuery(finalTranscript.trim());
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== "no-speech") {
          console.warn("Speech recognition error:", e.error);
        }
      };

      recognition.onend = () => {
        // Automatically restart listening if still in active call and AI not speaking
        if (callStateRef.current === "connected" && !isAiSpeakingRef.current && !isMutedRef.current) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Failed to initialize speech recognition:", err);
    }
  };

  // Handle user speech query -> Call secure /api/chat route
  const handleUserQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    // Stop speaking immediately if user interrupts
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    isAiSpeakingRef.current = false;

    // Add user message to transcript
    const userMsg: Message = {
      id: String(Date.now()),
      type: "user",
      content: queryText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setMicStatus("thinking");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          history: messages.slice(-4), // Contextual history
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || "I am here! How can I help you today?";

      // Add AI reply to transcript
      const aiMsg: Message = {
        id: String(Date.now() + 1),
        type: "agent",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Speak aloud through zero-lag voice driver
      speakAiResponse(reply);
    } catch (error) {
      console.error("Failed to query AI chat:", error);
      const fallbackMsg: Message = {
        id: String(Date.now() + 1),
        type: "agent",
        content: "I am a Software Engineer at Thoughtline with 1+ year of full-stack experience in React, Node, and AI. What would you like to know about my work?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakAiResponse(fallbackMsg.content);
    }
  };

  const connectCall = () => {
    setCallState("connected");
    setMicStatus("speaking");
    startSpectrumAnimation();

    const initialGreeting = "Hello! I am Abhinav R Pillai. How can I help you today?";
    const greetingMsg: Message = {
      id: "greeting",
      type: "agent",
      content: initialGreeting,
      timestamp: new Date(),
    };

    setMessages([greetingMsg]);
    speakAiResponse(initialGreeting);
  };

  const startCall = async () => {
    setHasMicError(false);

    // Request microphone permission cleanly
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.warn("Microphone permission not granted:", err);
        setHasMicError(true);
      }
    }

    setCallState("ringing");
    setDuration(0);
    setMessages([]);
    setLiveInterimText("");
    setIsOpen(true);

    document.dispatchEvent(new CustomEvent("stop-bg-music"));

    const AudioContextClass =
      typeof window !== "undefined" ? window.AudioContext || (window as any).webkitAudioContext : null;

    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      ctx.resume().catch((e) => console.warn(e));

      const t = ctx.currentTime;
      playRingTone(ctx, t);
      playRingTone(ctx, t + 1.8);
    }

    ringingTimeoutRef.current = setTimeout(() => {
      stopRingingSound();
      connectCall();
    }, 3400);
  };

  const endCall = () => {
    setCallState("idle");
    setIsOpen(false);
    setShowChat(false);
    setMicStatus("idle");
    setLiveInterimText("");
    setHasMicError(false);

    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }
    stopRingingSound();

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    isAiSpeakingRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    document.dispatchEvent(new CustomEvent("resume-bg-music"));
  };

  const handleTextSubmit = () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue("");
    handleUserQuery(text);
  };

  const handleTopicClick = (prompt: string) => {
    handleUserQuery(prompt);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Call Trigger Button */}
      {callState === "idle" && (
        <motion.button
          onClick={startCall}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="fixed bottom-24 right-5 sm:right-8 z-[9997] p-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-blue-500/25 border border-white/20 backdrop-blur-md flex items-center gap-2 group transition-all"
          aria-label="Call Abhinav's AI"
          title="Call Abhinav's AI"
        >
          <div className="relative">
            <Phone className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>
          <span className="text-xs font-semibold pr-1 hidden sm:inline tracking-wide">Call Abhinav</span>
        </motion.button>
      )}

      {/* Futuristic Smartphone Call Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            ref={chatContainerRef}
            className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-6 z-[9998] sm:w-[380px] sm:h-[650px] bg-[#030712] sm:bg-slate-950/95 sm:border sm:border-blue-500/30 sm:rounded-[42px] shadow-2xl sm:shadow-blue-500/10 flex flex-col justify-between overflow-hidden sm:backdrop-blur-2xl"
          >
            {/* Ambient Lights */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            </div>

            {/* Dynamic Island Status Bar */}
            <div className="relative z-10 w-full pt-4 px-6 flex items-center justify-between text-slate-400 text-[11px] font-mono select-none">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white tracking-wide">
                  {callState === "connected" ? formatDuration(duration) : "00:00"}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-[10px] text-emerald-400 font-sans font-semibold">Edge Voice</span>
              </div>

              {/* Dynamic Island Notch */}
              <div className="px-3 py-1 bg-black/80 rounded-full border border-white/10 flex items-center gap-2 shadow-inner">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    callState === "connected" ? "bg-emerald-400 animate-pulse" : "bg-blue-400 animate-ping"
                  )}
                />
                <span className="text-[9px] font-sans font-semibold text-slate-300">
                  {callState === "ringing" ? "Ringing..." : isAiSpeakingRef.current ? "AI Speaking" : "Live"}
                </span>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-slate-400" />
                <div className="w-5 h-2.5 border border-slate-500 rounded-sm p-0.5 flex items-center">
                  <div className="h-full w-full bg-emerald-400 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Caller Header Card */}
            <div className="relative z-10 text-center mt-3 px-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10px] font-medium tracking-wide">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>Zero-Lag Realtime AI</span>
              </div>
              <h2 className="text-white text-xl font-bold tracking-tight mt-2 flex items-center justify-center gap-1.5">
                <span>Abhinav R Pillai</span>
                <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-400/20" />
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Software Engineer • Full Stack AI</p>

              {/* Dynamic Status Badge */}
              <div className="flex justify-center mt-2">
                <span
                  className={cn(
                    "text-[10px] px-3 py-1 rounded-full border font-semibold tracking-wide transition-all duration-300 shadow-sm",
                    micStatus === "speaking" && "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10 animate-pulse",
                    micStatus === "listening" && "bg-blue-500/15 border-blue-500/40 text-blue-300 shadow-blue-500/10 animate-pulse",
                    micStatus === "thinking" && "bg-purple-500/15 border-purple-500/40 text-purple-300 animate-pulse",
                    micStatus === "muted" && "bg-red-500/15 border-red-500/40 text-red-300",
                    micStatus === "error" && "bg-amber-500/15 border-amber-500/40 text-amber-300",
                    micStatus === "idle" && "bg-slate-800/80 border-slate-700/80 text-slate-300"
                  )}
                >
                  {micStatus === "speaking" && "🎙️ Abhinav Speaking..."}
                  {micStatus === "listening" && "🎧 Listening to you..."}
                  {micStatus === "thinking" && "⚡ Thinking..."}
                  {micStatus === "muted" && "🔇 Microphone Muted"}
                  {micStatus === "error" && "⚠️ Mic Off • Tap Topics / Chat"}
                  {micStatus === "idle" && "✨ Ready to talk"}
                </span>
              </div>
            </div>

            {/* Holographic Avatar & Pulse Rings */}
            <div className="relative z-10 flex flex-col items-center justify-center my-3">
              <div className="relative flex items-center justify-center w-36 h-36">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-dashed border-blue-400/30"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border border-blue-500/20"
                />

                <div
                  className={cn(
                    "absolute inset-3 rounded-full transition-all duration-700",
                    callState === "ringing"
                      ? "bg-blue-500/10 animate-ping"
                      : isAiSpeakingRef.current
                      ? "bg-emerald-500/20 animate-pulse"
                      : "bg-blue-500/10"
                  )}
                />

                <div
                  className={cn(
                    "w-24 h-24 rounded-full bg-gradient-to-br flex items-center justify-center border-2 shadow-2xl relative z-10 transition-all duration-500",
                    callState === "ringing"
                      ? "from-blue-600 to-indigo-700 border-blue-400/50 shadow-blue-500/30"
                      : isAiSpeakingRef.current
                      ? "from-emerald-600 to-teal-700 border-emerald-400/60 shadow-emerald-500/30"
                      : "from-blue-600 via-indigo-600 to-purple-700 border-white/20 shadow-indigo-500/25"
                  )}
                >
                  <Phone
                    className={cn(
                      "w-9 h-9 text-white transition-transform duration-300",
                      callState === "ringing" ? "animate-bounce" : isAiSpeakingRef.current ? "scale-110" : ""
                    )}
                  />
                </div>
              </div>

              {/* Dynamic 24-Bar Audio Spectrum */}
              <div className="flex items-center justify-center gap-1 mt-3 px-6 h-9 w-full max-w-[280px]">
                {spectrumBars.map((height, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${height}%` }}
                    className={cn(
                      "w-1 rounded-full transition-all duration-75",
                      isAiSpeakingRef.current
                        ? "bg-gradient-to-t from-emerald-500 to-teal-300 shadow-sm shadow-emerald-500/30"
                        : micStatus === "listening"
                        ? "bg-gradient-to-t from-blue-500 to-indigo-300 shadow-sm shadow-blue-500/30"
                        : "bg-slate-700"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Quick Topic Chips (Mobile First - 1 Tap to Ask) */}
            <div className="relative z-10 px-4 py-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1 flex items-center gap-1">
                <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
                <span>Tap to ask instantly:</span>
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                {QUICK_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => handleTopicClick(topic.prompt)}
                    disabled={callState !== "connected"}
                    className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-blue-900/40 border border-slate-800 hover:border-blue-500/40 text-[11px] font-medium text-slate-300 hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Transcript & Real-Time Interim Speech */}
            <div className="relative z-10 px-4">
              <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-3 backdrop-blur-md transition-all">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5 text-[10px] text-slate-400">
                  <span className="font-semibold tracking-wide">Live Conversation</span>
                  <button
                    onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                    className="flex items-center gap-0.5 text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    <span>{isTranscriptExpanded ? "Compact" : "View all"}</span>
                    {isTranscriptExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  </button>
                </div>

                <div
                  className={cn(
                    "overflow-y-auto text-[11px] leading-relaxed text-slate-300 scrollbar-thin scrollbar-thumb-white/5 pt-2 transition-all duration-300",
                    isTranscriptExpanded ? "h-32" : "h-14"
                  )}
                >
                  {messages.length === 0 && !liveInterimText ? (
                    <p className="text-slate-500 italic text-center py-2">Connecting to Abhinav...</p>
                  ) : (
                    <div className="space-y-1.5">
                      {(isTranscriptExpanded ? messages : messages.slice(-2)).map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "p-1.5 rounded-lg text-left",
                            msg.type === "user"
                              ? "bg-blue-950/40 text-blue-200 border border-blue-500/20"
                              : "bg-emerald-950/30 text-emerald-200 border border-emerald-500/20"
                          )}
                        >
                          <span className="font-bold text-[10px] uppercase opacity-75 mr-1">
                            {msg.type === "user" ? "You: " : "Abhinav: "}
                          </span>
                          <span>{msg.content}</span>
                        </div>
                      ))}
                      {liveInterimText && (
                        <div className="p-1.5 rounded-lg text-left bg-blue-950/20 text-blue-300/80 italic border border-blue-500/10 animate-pulse">
                          <span className="font-bold text-[10px] uppercase mr-1">Listening: </span>
                          <span>{liveInterimText}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="relative z-10 w-full px-6 pt-2 pb-6 flex flex-col items-center gap-3">
              {showChat && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="w-full flex gap-2"
                >
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleTextSubmit();
                      }
                    }}
                    placeholder="Type a question for Abhinav..."
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={!inputValue.trim()}
                    className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-2xl transition-all shadow-md shadow-blue-600/30 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              <div className="flex items-center justify-around w-full max-w-[280px]">
                {/* Mute Button */}
                <button
                  onClick={() => {
                    const next = !isMuted;
                    setIsMuted(next);
                    if (next && recognitionRef.current) {
                      try {
                        recognitionRef.current.stop();
                      } catch (e) {}
                    } else if (!next && !isAiSpeakingRef.current) {
                      startListening();
                    }
                  }}
                  disabled={callState !== "connected"}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200 active:scale-95 shadow-md",
                    isMuted
                      ? "bg-red-500/20 border-red-500/60 text-red-400 shadow-red-500/20"
                      : "bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  )}
                  title={isMuted ? "Unmute mic" : "Mute mic"}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Keyboard Chat Toggle */}
                <button
                  onClick={() => setShowChat(!showChat)}
                  disabled={callState !== "connected"}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200 active:scale-95 shadow-md",
                    showChat
                      ? "bg-blue-500/20 border-blue-500/60 text-blue-400 shadow-blue-500/20"
                      : "bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  )}
                  title="Toggle keyboard input"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>

                {/* Speaker Toggle */}
                <button
                  onClick={() => {
                    const next = !isSpeakerOn;
                    setIsSpeakerOn(next);
                    if (!next && typeof window !== "undefined" && "speechSynthesis" in window) {
                      window.speechSynthesis.cancel();
                      isAiSpeakingRef.current = false;
                    }
                  }}
                  disabled={callState !== "connected"}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-200 active:scale-95 shadow-md",
                    !isSpeakerOn
                      ? "bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-amber-500/20"
                      : "bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  )}
                  title={isSpeakerOn ? "Mute speaker" : "Unmute speaker"}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>

                {/* End Call Button */}
                <button
                  onClick={endCall}
                  className="w-14 h-14 bg-gradient-to-tr from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/40 hover:scale-105 active:scale-95 transition-all duration-200"
                  title="End Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
