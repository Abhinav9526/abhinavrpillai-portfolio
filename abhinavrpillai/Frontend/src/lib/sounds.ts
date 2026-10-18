"use client";

// Plays a quiet tactile mechanical keyboard click sound
export const playKeycapClick = () => {
  if (typeof window === "undefined") return;
  
  try {
    const audio = new Audio("/assets/keycap-sounds/press.mp3");
    audio.volume = 0.05; // 5% volume for a subtle, satisfying click
    audio.play().catch(() => {
      // Catch browser blocking audio play
    });
  } catch (err) {
    // Avoid console log clutter
  }
};
