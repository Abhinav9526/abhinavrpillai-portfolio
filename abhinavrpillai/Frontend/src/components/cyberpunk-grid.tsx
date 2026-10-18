"use client";
import React, { useEffect, useRef } from "react";

export default function CyberpunkGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollYRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track scroll
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Track mouse for subtle parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth) - 0.5,
        y: (e.clientY / window.innerHeight) - 0.5,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Handle resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Star field config
    const stars: { x: number; y: number; size: number; speed: number }[] = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * 2000 - 1000,
        y: Math.random() * 500 - 250,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.05 + 0.02,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.5;
      const scrollY = scrollYRef.current;
      const mouse = mouseRef.current;

      // Clear with deep cosmic purple gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, "#08060f"); // Deep indigo-black
      bgGrad.addColorStop(0.5, "#0e091d"); // Deep violet
      bgGrad.addColorStop(1, "#150a2b"); // Radiant purple base
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Parallax shifts based on mouse & scroll
      const horizonY = height * 0.45 + (mouse.y * 30);
      const centerX = width / 2 - (mouse.x * 50);

      // --- Draw Stars ---
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      stars.forEach((star) => {
        const sx = centerX + star.x + (time * star.speed * 10) % 2000 - 1000;
        const sy = horizonY - 150 + star.y;
        if (sy < horizonY) {
          ctx.beginPath();
          ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // --- Draw Cyberpunk Sun ---
      const sunR = Math.min(width, height) * 0.15;
      const sunX = centerX;
      const sunY = horizonY - 20;

      // Sun glow
      ctx.shadowBlur = 40;
      ctx.shadowColor = "#8b5cf6"; // Violet glow
      const sunGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
      sunGrad.addColorStop(0, "#ff007f"); // Deep Pink
      sunGrad.addColorStop(0.5, "#8b5cf6"); // Purple
      sunGrad.addColorStop(1, "#00f2fe"); // Cyber Cyan
      ctx.fillStyle = sunGrad;

      // Draw sun with horizontal retro lines (sliced sun effect)
      ctx.save();
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2, sunR * 2);

      // Slices (reverse mask)
      ctx.fillStyle = "#08060f";
      ctx.shadowBlur = 0; // Turn off shadow for cuts
      for (let y = sunY - sunR; y < sunY + sunR; y += 12) {
        const sliceH = Math.max(1, (y - (sunY - sunR)) / 15);
        ctx.fillRect(sunX - sunR - 10, y, sunR * 2 + 20, sliceH);
      }
      ctx.restore();

      // Reset shadow for peaks
      ctx.shadowBlur = 0;

      // --- Draw Distant Mountains ---
      ctx.save();
      const drawMountains = (
        seed: number,
        color: string,
        heightFactor: number,
        parallax: number
      ) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, horizonY);
        for (let x = 0; x <= width; x += 15) {
          // Double sine wave mountain generator
          const mx = x - centerX * parallax;
          const my =
            horizonY -
            Math.sin(mx * 0.005 + seed) * 45 * heightFactor -
            Math.sin(mx * 0.015) * 15 * heightFactor -
            10;
          ctx.lineTo(x, my);
        }
        ctx.lineTo(width, horizonY);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      };

      // Back mountains (dark indigo)
      drawMountains(1.2, "rgba(18, 11, 41, 0.95)", 0.8, 0.2);
      // Mid mountains (neon violet silhouette)
      drawMountains(4.5, "rgba(29, 14, 69, 0.98)", 0.6, 0.4);
      // Front mountain ridge with cyan outline glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00f2fe";
      ctx.strokeStyle = "#00f2fe";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let x = 0; x <= width; x += 10) {
        const mx = x - centerX * 0.6;
        const my =
          horizonY -
          Math.sin(mx * 0.008 + 10) * 30 -
          Math.sin(mx * 0.02) * 8 -
          5;
        if (x === 0) ctx.moveTo(x, my);
        else ctx.lineTo(x, my);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset
      ctx.restore();

      // --- Draw 3D Grid ---
      ctx.strokeStyle = "#00f2fe"; // Neon Cyan Grid
      ctx.lineWidth = 1.5;

      // Speed increases with scroll
      const baseSpeed = 0.8;
      const scrollSpeedBoost = scrollY * 0.02;
      const speed = baseSpeed + scrollSpeedBoost;
      
      const gridOffset = (time * speed) % 80;

      const numPerspectiveLines = 36;
      const gridDepth = height - horizonY;

      // Vertical (Longitudinal) perspective lines radiating from Vanishing Point
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00f2fe";
      ctx.beginPath();
      for (let i = -numPerspectiveLines; i <= numPerspectiveLines; i++) {
        const startX = centerX + (i * 18);
        const endX = centerX + (i * 240);
        ctx.moveTo(startX, horizonY);
        ctx.lineTo(endX, height);
      }
      ctx.stroke();

      // Horizontal (Lateral) lines moving forward in 3D perspective
      ctx.beginPath();
      for (let i = 0; i < 20; i++) {
        // Logarithmic scale spacing for perfect 3D perspective depth
        const ratio = (i * 8 + gridOffset) / 160;
        if (ratio > 1) continue;
        const y = horizonY + (gridDepth * Math.pow(ratio, 2.5));
        
        // Dynamic opacity: grid lines fade out near the horizon
        ctx.strokeStyle = `rgba(0, 242, 254, ${Math.pow(ratio, 1.5)})`;
        ctx.shadowColor = `rgba(0, 242, 254, ${Math.pow(ratio, 1.5) * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.shadowBlur = 0; // Reset

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 w-full h-full pointer-events-none" />;
}
