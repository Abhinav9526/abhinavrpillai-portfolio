"use client";
import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import BugFollower from "./bug-follower";

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Load audio from public assets
    const audio = new Audio("/assets/sounds/0570. Winner - AShamaluevMusic.mp3");
    audio.loop = true;
    audio.volume = 0.15; // Set soft background volume level
    audioRef.current = audio;

    // Check if player preference exists in localStorage
    const storedState = localStorage.getItem("bg-music-playing");
    const shouldPlay = storedState === "true" || storedState === null; // Default to play if not set

    const startAudio = () => {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          localStorage.setItem("bg-music-playing", "true");
          window.dispatchEvent(new CustomEvent("bg-music-change", { detail: { isPlaying: true } }));
        })
        .catch((err) => {
          console.log("Autoplay blocked or audio failed:", err);
        });
      // Remove listener after first interaction
      window.removeEventListener("click", startAudio);
    };

    if (shouldPlay) {
      window.addEventListener("click", startAudio);
    }

    const handleStopMusic = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    const handleResumeMusic = () => {
      if (!audioRef.current) return;
      const storedState = localStorage.getItem("bg-music-playing");
      const shouldPlayAgain = storedState === "true" || storedState === null;
      if (shouldPlayAgain) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => console.log("Failed to resume audio:", err));
      }
    };

    document.addEventListener("stop-bg-music", handleStopMusic);
    document.addEventListener("resume-bg-music", handleResumeMusic);

    return () => {
      audio.pause();
      window.removeEventListener("click", startAudio);
      document.removeEventListener("stop-bg-music", handleStopMusic);
      document.removeEventListener("resume-bg-music", handleResumeMusic);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      localStorage.setItem("bg-music-playing", "false");
      window.dispatchEvent(new CustomEvent("bg-music-change", { detail: { isPlaying: false } }));
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          localStorage.setItem("bg-music-playing", "true");
          window.dispatchEvent(new CustomEvent("bg-music-change", { detail: { isPlaying: true } }));
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[9990] flex items-center gap-2 sm:gap-3 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-xl pointer-events-auto scale-90 sm:scale-100 origin-bottom-left">
      {/* Animated Sound Wave Visualizer */}
      <div className="flex items-end gap-0.5 h-3.5 w-6 justify-center pb-0.5">
        {[1, 2, 3, 4, 5].map((bar) => (
          <span
            key={bar}
            className={cn(
              "w-0.5 bg-primary rounded-full transition-all duration-300",
              isPlaying ? "animate-sound-wave" : "h-1"
            )}
            style={{
              animationDelay: `${bar * 0.12}s`,
              height: isPlaying ? undefined : "3px",
            }}
          />
        ))}
      </div>

      <button
        onClick={togglePlay}
        className="flex items-center justify-center p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white transition-colors border border-slate-800"
        aria-label="Toggle Background Music"
        suppressHydrationWarning
      >
        {isPlaying ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      </button>

      {/* Divider */}
      <span className="w-px h-4 bg-slate-800" />

      {/* Debug Follower Button */}
      <BugFollower />
    </div>
  );
}
