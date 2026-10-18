"use client";
import React, { useEffect, useState } from "react";

export default function SpotlightGlow() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setOpacity(0.5); // Reveal glow on first movement
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
      style={{
        opacity,
        background: `radial-gradient(800px at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.12), rgba(6, 182, 212, 0.04), transparent 80%)`,
      }}
    />
  );
}
