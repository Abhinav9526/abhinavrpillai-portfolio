"use client";
import React, { useState, useRef, useEffect } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageSquare, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  type: "user" | "agent";
  content: string;
  timestamp: Date;
}

// Resample floating point buffer from input rate to output rate
function resampleBuffer(inputBuffer: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array {
  if (inputSampleRate === outputSampleRate) {
    return inputBuffer;
  }
  const ratio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(inputBuffer.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const nextIndex = Math.round(i * ratio);
    if (nextIndex < inputBuffer.length) {
      result[i] = inputBuffer[nextIndex];
    }
  }
  return result;
}

// Convert float32 [-1.0, 1.0] samples to 16-bit signed PCM ArrayBuffer
function float32ToPcm16(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    // Preserve the microphone level. Artificial amplification also amplifies
    // speaker echo, which can cause the live model to interrupt itself.
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // true for little endian
  }
  return buffer;
}

// Convert 16-bit PCM ArrayBuffer to Float32Array
function pcm16ToFloat32(arrayBuffer: ArrayBuffer): Float32Array {
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    return new Float32Array(0);
  }

  if (arrayBuffer.byteLength % 2 !== 0) {
    console.warn("PCM buffer length is not even; dropping trailing byte.", arrayBuffer.byteLength);
  }

  const int16Array = new Int16Array(arrayBuffer.slice(0, Math.floor(arrayBuffer.byteLength / 2) * 2));
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    const sample = int16Array[i];
    float32Array[i] = sample / 32768.0;
  }
  return float32Array;
}

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
  const [micStatus, setMicStatus] = useState<"idle" | "listening" | "speaking" | "muted" | "error" | "not-supported">("idle");
  const [hasMicError, setHasMicError] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const ringingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ringingGainRef = useRef<GainNode | null>(null);

  // Live streaming WebSocket refs
  const socketRef = useRef<WebSocket | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const isAiSpeakingRef = useRef<boolean>(false);
  const speakingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const callStateRef = useRef(callState);
  const isMutedRef = useRef(isMuted);
  const isSpeakerOnRef = useRef(isSpeakerOn);
  const hasMicErrorRef = useRef(hasMicError);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    callStateRef.current = callState;
    isMutedRef.current = isMuted;
    isSpeakerOnRef.current = isSpeakerOn;
    hasMicErrorRef.current = hasMicError;
  }, [callState, isMuted, isSpeakerOn, hasMicError]);

  // Call duration timer
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

  // Scroll to bottom when message log changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showChat]);

  const playRingTone = (ctx: AudioContext, startTime: number) => {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(440, startTime);
    osc2.frequency.setValueAtTime(480, startTime);

    gainNode.gain.setValueAtTime(0, startTime);
    // Ring 1 (duration 0.6s)
    gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
    gainNode.gain.setValueAtTime(0.12, startTime + 0.55);
    gainNode.gain.linearRampToValueAtTime(0, startTime + 0.60);

    // Ring 2 (duration 0.6s after 0.25s pause)
    gainNode.gain.setValueAtTime(0, startTime + 0.85);
    gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.90);
    gainNode.gain.setValueAtTime(0.12, startTime + 1.40);
    gainNode.gain.linearRampToValueAtTime(0, startTime + 1.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + 1.55);
    osc2.stop(startTime + 1.55);

    // Save gainNode to allow stopping early
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

  // Playback helper: queue real-time audio blocks from Gemini Live
  const queueAudioChunk = (float32Data: Float32Array) => {
    if (!audioContextRef.current) {
      console.warn("queueAudioChunk aborted: AudioContext is null");
      return;
    }
    if (audioContextRef.current.state === "closed") {
      console.warn("queueAudioChunk aborted: AudioContext is closed");
      return;
    }
    if (!isSpeakerOnRef.current) {
      console.log("queueAudioChunk aborted: Speaker is toggled off");
      return;
    }
    if (!float32Data || float32Data.length === 0) {
      return;
    }

    const audioCtx = audioContextRef.current;

    // Safety check in case AudioContext suspended
    if (audioCtx.state === "suspended") {
      console.log("AudioContext is suspended. Attempting to resume...");
      audioCtx.resume().catch((e) => console.warn("Failed to resume AudioContext inside chunk queue:", e));
    }

    try {
      const safeSamples = new Float32Array(float32Data.length);
      for (let i = 0; i < float32Data.length; i++) {
        const sample = float32Data[i];
        safeSamples[i] = Number.isFinite(sample) ? Math.max(-1, Math.min(1, sample)) : 0;
      }

      // Gemini Live API returns audio at 24000Hz PCM.
      const audioBuffer = audioCtx.createBuffer(1, safeSamples.length, 24000);
      audioBuffer.getChannelData(0).set(safeSamples);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = audioCtx.createGain();
      // Values above 1 can clip PCM peaks and make hosted audio sound distorted.
      gainNode.gain.value = 1;
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const curTime = audioCtx.currentTime;
      // Audio buffering / jitter control:
      // If the timeline fell behind or is just starting, add a small 60ms lead
      // to let chunks overlap seamlessly without inserting silent gaps.
      if (nextPlayTimeRef.current < curTime + 0.02) {
        nextPlayTimeRef.current = curTime + 0.06;
      }

      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += audioBuffer.duration;

      isAiSpeakingRef.current = true;
      setMicStatus("speaking");
      if (speakingTimerRef.current) {
        clearTimeout(speakingTimerRef.current);
      }
      // Hold speaking status until the buffered audio actually completes
      const remainingSec = Math.max(0.1, nextPlayTimeRef.current - curTime);
      speakingTimerRef.current = setTimeout(() => {
        isAiSpeakingRef.current = false;
        setMicStatus("idle");
      }, remainingSec * 1000 + 150);

      activeSourcesRef.current.push(source);
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      };
    } catch (err) {
      console.error("Failed to queue audio buffer chunk:", err);
    }
  };

  // Interruption logic: stop all queue sources immediately
  const clearAudioQueue = () => {
    if (speakingTimerRef.current) {
      clearTimeout(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }
    isAiSpeakingRef.current = false;
    setMicStatus("idle");

    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
  };

  const connectCall = () => {
    setCallState("connected");
    
    // Force resume AudioContext inside event flow
    if (audioContextRef.current) {
      audioContextRef.current.resume().catch((e) => console.warn("Failed to resume AudioContext in connectCall:", e));
    }
    
    const greeting = "Hello, I am Abhinav's personal AI Assistant. Do you have any questions about Abhinav?";
    const greetingMessage: Message = {
      id: "greeting",
      type: "agent",
      content: greeting,
      timestamp: new Date(),
    };

    // If microphone blocked or not allowed, insert warning and enable keyboard chat
    if (hasMicErrorRef.current) {
      const warningMessage: Message = {
        id: "mic-warning",
        type: "agent",
        content: "System Alert: Microphone permission blocked or not available in this secure context. Please click the keyboard icon below to type your questions directly to Gemini!",
        timestamp: new Date(),
      };
      setMessages([greetingMessage, warningMessage]);
      setShowChat(true);
      setMicStatus("error");
    } else {
      setMessages([greetingMessage]);
    }

    // Attempt to establish WebSocket connection only when call connects
    if (typeof window !== "undefined") {
      const configuredWsUrl = process.env.NEXT_PUBLIC_AI_WS_URL?.trim();
      const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = configuredWsUrl || (
        isLocal
          ? `ws://${window.location.hostname}:3005/web-stream`
          : `${protocol}//${window.location.host}/web-stream`
      );

      console.log("Attempting to connect to Gemini Live proxy server:", wsUrl);

      const socket = new WebSocket(wsUrl);
      socket.binaryType = "arraybuffer";
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Connected to low-latency Gemini Live WebSocket server!");
        
        // Initialize microphone audio capture if permission allowed and context available
        if (audioContextRef.current && micStreamRef.current) {
          try {
            const audioCtx = audioContextRef.current;
            const mediaSource = audioCtx.createMediaStreamSource(micStreamRef.current);
            mediaStreamSourceRef.current = mediaSource;

            const scriptNode = audioCtx.createScriptProcessor(8192, 1, 1);
            mediaSource.connect(scriptNode);
            // ScriptProcessor nodes need an output connection to keep receiving
            // audio callbacks. Route it through a muted gain instead of sending
            // the microphone back through the speakers (which creates feedback).
            const mutedMonitor = audioCtx.createGain();
            mutedMonitor.gain.value = 0;
            scriptNode.connect(mutedMonitor);
            mutedMonitor.connect(audioCtx.destination);
            scriptProcessorRef.current = scriptNode;

            let chunkCount = 0;
            scriptNode.onaudioprocess = (e) => {
              if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && !isMutedRef.current) {
                const inputData = e.inputBuffer.getChannelData(0);

                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                  sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / inputData.length);
                if (rms > 0.015) {
                  // Only show listening if AI is not already speaking
                  if (!isAiSpeakingRef.current) {
                    setMicStatus("listening");
                  }
                } else {
                  if (!isAiSpeakingRef.current) {
                    setMicStatus("idle");
                  }
                }

                // Throttle log to avoid console spamming, prints roughly every 8 seconds
                chunkCount++;
                if (chunkCount % 50 === 0) {
                  console.log(`Microphone capturing active: sent ${chunkCount} chunks, RMS volume = ${rms.toFixed(4)}`);
                }

                const resampled = resampleBuffer(inputData, audioCtx.sampleRate, 16000);
                const pcm16 = float32ToPcm16(resampled);
                socketRef.current.send(pcm16);
              }
            };
            setMicStatus("listening");
          } catch (err) {
            console.warn("Failed to capture mic source (e.g. permission violation):", err);
          }
        }
      };

      socket.onmessage = (event) => {
        if (typeof event.data === "string") {
          try {
            const data = JSON.parse(event.data);
            if (data.event === "clear") {
              console.log("Gemini interrupted: Clearing playback queue.");
              clearAudioQueue();
            } else if (data.event === "transcription") {
              const text = data.text;
              const sender = data.sender;
              
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.type === (sender === "user" ? "user" : "agent")) {
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...last,
                      content: text,
                    },
                  ];
                } else {
                  return [
                    ...prev,
                    {
                      id: String(Date.now() + Math.random()),
                      type: sender === "user" ? "user" : "agent",
                      content: text,
                      timestamp: new Date(),
                    },
                  ];
                }
              });
            }
          } catch (e) {
            console.error("Error parsing string message from server:", e);
          }
        } else {
          // Binary audio data (24kHz PCM from Gemini)
          const float32Audio = pcm16ToFloat32(event.data);
          queueAudioChunk(float32Audio);
          setMicStatus("speaking");
        }
      };

      socket.onerror = (err) => {
        console.warn("WebSocket proxy error:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            type: "agent",
            content: "Connection Error: Failed to connect to Gemini Live voice server. Please make sure the local node server is running on port 3005.",
            timestamp: new Date(),
          }
        ]);
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed.");
      };
    }
  };

  const startCall = async () => {
    // Reset mic status
    hasMicErrorRef.current = false;
    setHasMicError(false);

    // Check secure context availability
    if (typeof navigator !== "undefined" && !navigator.mediaDevices) {
      console.warn("navigator.mediaDevices is undefined (insecure origin). Marking mic error.");
      hasMicErrorRef.current = true;
      setHasMicError(true);
    } else {
      // Request microphone permissions
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices) {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              channelCount: 1,
            },
          });
          micStreamRef.current = stream;
          console.log("Microphone permission granted via getUserMedia");
        }
      } catch (err) {
        console.warn("Microphone permission denied or not available:", err);
        hasMicErrorRef.current = true;
        setHasMicError(true);
      }
    }

    setCallState("ringing");
    setDuration(0);
    setMessages([]);
    setIsOpen(true);

    // Stop background music
    document.dispatchEvent(new CustomEvent("stop-bg-music"));

    // Ring tone oscillators
    const AudioContextClass = typeof window !== "undefined"
      ? (window.AudioContext || (window as any).webkitAudioContext)
      : null;

    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      
      // Resume AudioContext IMMEDIATELY synchronously inside user gesture!
      ctx.resume().catch((e) => console.warn("Failed to resume AudioContext inside user gesture:", e));
      
      // Start ringing oscillator
      const t = ctx.currentTime;
      playRingTone(ctx, t);
      playRingTone(ctx, t + 2.0);
    }

    // Transition to connected after 4 seconds (first two ringing bells)
    ringingTimeoutRef.current = setTimeout(() => {
      stopRingingSound();
      connectCall();
    }, 4000);
  };

  const endCall = () => {
    setCallState("idle");
    setIsOpen(false);
    setShowChat(false);
    setMicStatus("idle");
    hasMicErrorRef.current = false;
    setHasMicError(false);

    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }

    stopRingingSound();

    // Close WebSocket
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch (e) {}
      socketRef.current = null;
    }

    // Stop active audio nodes
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.onaudioprocess = null;
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      try {
        mediaStreamSourceRef.current.disconnect();
      } catch (e) {}
      mediaStreamSourceRef.current = null;
    }
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      micStreamRef.current = null;
    }

    // Interrupt playback queue
    clearAudioQueue();

    // Close main audio context
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }

    // Resume background music
    document.dispatchEvent(new CustomEvent("resume-bg-music"));
  };

  const handleUserSpeech = async (text: string) => {
    const userMessage: Message = {
      id: String(Date.now()),
      type: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Send text payload directly to Gemini Live WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify({
          event: "chat",
          text: text
        }));
      } catch (e) {}
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          type: "agent",
          content: "Offline: Voice connection is not active. Please ensure the voice calling server is online.",
          timestamp: new Date(),
        }
      ]);
    }
  };

  const handleTextSubmit = () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    
    // Explicitly force AudioContext resume in click gesture handler
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().catch((e) => console.warn("Failed to resume AudioContext in text submit:", e));
    }

    setInputValue("");
    handleUserSpeech(text);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (!mounted) return null;

  return (
    <>
      {/* AI Agent Button */}
      {callState === "idle" && (
        <button
          onClick={startCall}
          className="fixed bottom-24 right-6 z-[9997] p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110"
          aria-label="Call AI Assistant"
          title="Call AI Assistant"
          suppressHydrationWarning
        >
          <Phone className="w-5 h-5" />
        </button>
      )}

      {/* AI Call Smartphone Screen */}
      {isOpen && (
        <div
          ref={chatContainerRef}
          className="fixed inset-x-2 bottom-4 sm:inset-x-auto sm:bottom-24 sm:right-6 z-[9996] sm:w-[340px] h-[85vh] max-h-[560px] sm:h-[520px] bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 border border-blue-500/30 rounded-3xl sm:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-xl"
          suppressHydrationWarning
        >
          {/* Smartphone notch and status bar */}
          <div className="w-full px-6 pt-4 flex items-center justify-between text-slate-400 text-[10px] font-mono select-none">
            <span>{callState === "connected" ? formatDuration(duration) : "00:00"}</span>
            <div className="w-16 h-4 bg-black/60 rounded-full border border-white/5 flex items-center justify-center">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full bg-green-500",
                callState === "connected" ? "animate-pulse" : "opacity-30"
              )} />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-end gap-0.5 h-2">
                <span className="w-0.5 h-1 bg-slate-400 rounded-full" />
                <span className="w-0.5 h-1.5 bg-slate-400 rounded-full" />
                <span className="w-0.5 h-2 bg-slate-400 rounded-full" />
              </div>
              <span className="text-[9px]">5G</span>
            </div>
          </div>

          {/* Caller Details */}
          <div className="text-center mt-5 px-4">
            <h3 className="text-white text-base font-bold tracking-wide">Abhinav's Personal AI</h3>
            <p className={cn(
              "text-[10px] mt-1 font-semibold uppercase tracking-widest",
              callState === "ringing" ? "text-blue-400 animate-pulse" : "text-emerald-400"
            )}>
              {callState === "ringing" ? "Ringing..." : "Connected"}
            </p>
            
            {/* Mic Status Badge */}
            <div className="flex justify-center mt-1.5">
              <span className={cn(
                "text-[8px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider transition-colors duration-300",
                micStatus === "listening" && "bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse",
                micStatus === "speaking" && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse",
                micStatus === "muted" && "bg-red-500/10 border-red-500/30 text-red-400",
                micStatus === "error" && "bg-red-500/20 border-red-500/50 text-red-500 shadow-md shadow-red-500/10 animate-pulse",
                micStatus === "not-supported" && "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
                micStatus === "idle" && "bg-slate-800 border-slate-700 text-slate-400"
              )}>
                {micStatus === "listening" && "Live Streaming..."}
                {micStatus === "speaking" && "AI Speaking..."}
                {micStatus === "muted" && "Muted"}
                {micStatus === "error" && "Mic Blocked / Secure context needed"}
                {micStatus === "not-supported" && "Mic not supported"}
                {micStatus === "idle" && "Standby"}
              </span>
            </div>
            
            {/* Live Connection Mode indicator */}
            <div className="text-[7px] text-slate-500 mt-1 uppercase font-mono tracking-wider select-none">
              Mode: Multimodal Live Voice
            </div>
          </div>

          {/* Avatar & Pulse Ripples */}
          <div className="relative flex items-center justify-center my-4 flex-1">
            {/* Concentric ripples */}
            <div className={cn(
              "absolute w-36 h-36 rounded-full border border-blue-500/10 transition-all duration-1000 scale-125",
              callState === "ringing" ? "animate-ping" : "animate-pulse border-emerald-500/10"
            )} />
            <div className={cn(
              "absolute w-28 h-28 rounded-full border border-blue-500/20 transition-all duration-1000 scale-110",
              callState === "ringing" ? "animate-pulse" : "animate-ping border-emerald-500/20"
            )} />

            {/* Avatar Circle */}
            <div className={cn(
              "w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center border border-white/10 shadow-2xl relative z-10 transition-all duration-700",
              callState === "ringing" 
                ? "from-blue-600 to-blue-800 shadow-blue-500/30" 
                : "from-emerald-600 to-emerald-800 shadow-emerald-500/30"
            )}>
              <Phone className={cn(
                "w-7 h-7 text-white",
                callState === "ringing" ? "animate-bounce" : "animate-pulse"
              )} />
            </div>
          </div>

          {/* Live Transcript Area */}
          <div className="w-[88%] mx-auto bg-black/40 border border-white/5 rounded-2xl p-4 h-24 overflow-y-auto text-[10px] leading-relaxed text-slate-300 backdrop-blur-sm select-none scrollbar-thin scrollbar-thumb-white/5">
            {messages.length === 0 ? (
              <p className="text-slate-500 italic text-center py-2">Calling...</p>
            ) : (
              <div className="space-y-1.5">
                {messages.slice(-3).map((msg) => (
                  <p key={msg.id} className={cn(msg.type === "user" ? "text-blue-300 text-right" : "text-emerald-300 text-left")}>
                    <span className="font-semibold">{msg.type === "user" ? "You: " : "AI: "}</span>
                    {msg.content}
                  </p>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls & End Call */}
          <div className="w-full px-6 pb-6 pt-3 flex flex-col items-center gap-3">
            {/* Grid options */}
            <div className="flex justify-around w-full max-w-[200px]">
              {/* Mic/Mute */}
              <button
                onClick={() => {
                  const nextMute = !isMuted;
                  setIsMuted(nextMute);
                }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300",
                  isMuted 
                    ? "bg-red-500/20 border-red-500/50 text-red-500 shadow-md shadow-red-500/10" 
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                )}
                disabled={callState !== "connected" || hasMicError}
                title={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Chat Toggle */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300",
                  showChat 
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-md shadow-blue-500/10" 
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                )}
                disabled={callState !== "connected"}
                title="Toggle text input"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              {/* Speaker Toggle */}
              <button
                onClick={() => {
                  const nextSpeaker = !isSpeakerOn;
                  setIsSpeakerOn(nextSpeaker);
                  if (!nextSpeaker) {
                    clearAudioQueue();
                  }
                }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300",
                  !isSpeakerOn 
                    ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-500 shadow-md shadow-yellow-500/10" 
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                )}
                disabled={callState !== "connected"}
                title={isSpeakerOn ? "Turn speaker off" : "Turn speaker on"}
              >
                {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-white" />}
              </button>
            </div>

            {/* Keyboard Chat Input Field */}
            {showChat && (
              <div className="w-[90%] flex gap-1.5 mt-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                  placeholder="Type message..."
                  className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1 text-[11px] text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={!inputValue.trim()}
                  className="p-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Hangup Red Button */}
            <button
              onClick={endCall}
              className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-600/30 hover:scale-110 active:scale-95 transition-all duration-300 mt-1"
              title="End Voice Call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
