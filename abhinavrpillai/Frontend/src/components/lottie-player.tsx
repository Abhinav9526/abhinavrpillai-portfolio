"use client";
import React, { useEffect, useRef, useState } from "react";

interface LottiePlayerProps {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function LottiePlayer({
  src,
  className,
  style,
}: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);

    // If script is already in the document, just mark as loaded
    if (document.getElementById("lottie-cdn-script")) {
      setScriptLoaded(true);
      return;
    }

    // Load minified player build dynamically in browser context
    const script = document.createElement("script");
    script.id = "lottie-cdn-script";
    script.src = "https://unpkg.com/lottie-web@5.12.2/build/player/lottie.min.js";
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.error("LottiePlayer: Failed to load player script from CDN");
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mounted || !scriptLoaded || !containerRef.current) return;

    const lottie = (window as any).lottie || (window as any).bodymovin;
    if (!lottie) {
      console.error("LottiePlayer: lottie global object not found on window");
      return;
    }

    // Render native inline SVG animation
    const anim = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: src,
    });

    return () => {
      anim.destroy();
    };
  }, [mounted, scriptLoaded, src]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        ...style,
      }}
    />
  );
}
