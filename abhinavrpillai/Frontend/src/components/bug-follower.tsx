"use client";
import React, { useEffect, useRef, useState } from "react";
import { Bug } from "lucide-react";
import { cn } from "@/lib/utils";
import { playKeycapClick } from "@/lib/sounds";

interface AntsCursorOptions {
  element?: HTMLElement;
  numberOfAnts?: number;
  followRange?: number;
  color?: string;
  speed?: number;
  zIndex?: string;
}

export default function BugFollower() {
  const [isActive, setIsActive] = useState(false);
  const activeEffectRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (activeEffectRef.current) {
        activeEffectRef.current.destroy();
        activeEffectRef.current = null;
      }
      return;
    }

    // Initialize the official ants cursor algorithm
    const effect = runAntsCursor({
      numberOfAnts: 22,
      followRange: 80,
      color: "#c7d2fe", // Glowing lavender-indigo matching the theme
      speed: 1.6,       // Walking speed
      zIndex: "999999",
    });

    activeEffectRef.current = effect;

    return () => {
      if (activeEffectRef.current) {
        activeEffectRef.current.destroy();
        activeEffectRef.current = null;
      }
    };
  }, [isActive]);

  const toggleBugs = () => {
    playKeycapClick();
    setIsActive(!isActive);
  };

  return (
    <button
      onClick={toggleBugs}
      className={cn(
        "flex items-center justify-center p-1.5 rounded-full text-white transition-all duration-300 border border-slate-800",
        isActive 
          ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.35)]" 
          : "bg-slate-900 hover:bg-slate-800"
      )}
      aria-label="Toggle Debug Mouse Easter Egg"
      title="Debug Mouse (Spawn Ants)"
      suppressHydrationWarning
    >
      <Bug className={cn("h-3.5 w-3.5 transition-transform duration-300", isActive && "rotate-12 scale-110")} />
    </button>
  );
}

// Custom implementation of Tim Holman's antsCursor in typed TypeScript
function runAntsCursor(options?: AntsCursorOptions) {
  if (typeof window === "undefined") return { destroy: () => {} };

  const hasWrapperEl = options && options.element;
  const element = options?.element || document.body;

  let width = window.innerWidth;
  let height = window.innerHeight;
  const cursor = { x: width / 2, y: height / 2 };
  const ants: Ant[] = [];
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D | null;
  let animationFrameId: number;

  const numberOfAnts = options?.numberOfAnts || 20;
  const followRange = options?.followRange || 60;
  const antColor = options?.color || "#4a2c0a";
  const antSpeed = options?.speed || 1.2;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  class Ant {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    angle: number;
    wanderAngle: number;
    index: number;
    following: boolean;
    target: { x: number; y: number } | null;
    legPhase: number;
    size: number;

    constructor(x: number, y: number, index: number) {
      this.position = { x, y };
      this.velocity = { x: 0, y: 0 };
      this.angle = Math.random() * Math.PI * 2;
      this.wanderAngle = this.angle;
      this.index = index;
      this.following = false;
      this.target = null;
      this.legPhase = Math.random() * Math.PI * 2;
      this.size = 2.0 + Math.random() * 1.5; // Scale size up slightly for visibility
    }

    wander() {
      // Random wandering behavior when cursor is still
      this.wanderAngle += (Math.random() - 0.5) * 0.3;

      const targetVx = Math.cos(this.wanderAngle) * antSpeed * 0.5;
      const targetVy = Math.sin(this.wanderAngle) * antSpeed * 0.5;

      this.velocity.x += (targetVx - this.velocity.x) * 0.05;
      this.velocity.y += (targetVy - this.velocity.y) * 0.05;

      // Bounce off edges
      if (this.position.x < 20) this.wanderAngle = 0;
      if (this.position.x > canvas.width - 20) this.wanderAngle = Math.PI;
      if (this.position.y < 20) this.wanderAngle = Math.PI / 2;
      if (this.position.y > canvas.height - 20) this.wanderAngle = -Math.PI / 2;
    }

    moveToward(target: { x: number; y: number }) {
      const dx = target.x - this.position.x;
      const dy = target.y - this.position.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 8) {
        const targetAngle = Math.atan2(dy, dx);

        // Smoothly interpolate angle
        let angleDiff = targetAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        this.angle += angleDiff * 0.3;

        const speed = Math.min(antSpeed * 1.8, dist * 0.15);
        const targetVx = Math.cos(this.angle) * speed;
        const targetVy = Math.sin(this.angle) * speed;

        this.velocity.x += (targetVx - this.velocity.x) * 0.2;
        this.velocity.y += (targetVy - this.velocity.y) * 0.2;
      } else {
        // Slow down when close to target
        this.velocity.x *= 0.8;
        this.velocity.y *= 0.8;
      }
    }

    update() {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      // Update angle based on velocity
      if (Math.hypot(this.velocity.x, this.velocity.y) > 0.1) {
        this.angle = Math.atan2(this.velocity.y, this.velocity.x);
      }

      // Keep within bounds
      this.position.x = Math.max(5, Math.min(canvas.width - 5, this.position.x));
      this.position.y = Math.max(5, Math.min(canvas.height - 5, this.position.y));

      // Animate legs based on movement speed
      this.legPhase += Math.hypot(this.velocity.x, this.velocity.y) * 0.3;
    }

    draw(ctx: CanvasRenderingContext2D) {
      ctx.save();
      ctx.translate(this.position.x, this.position.y);
      ctx.rotate(this.angle);

      const s = this.size;
      const phase = this.legPhase;

      // Draw legs - alternating tripod gait
      ctx.strokeStyle = antColor;
      ctx.lineWidth = 0.6;

      const legPositions = [
        { x: s * 0.4, side: -1, group: 0 },   // front-left
        { x: s * 0.4, side: 1, group: 1 },    // front-right
        { x: 0, side: -1, group: 1 },          // middle-left
        { x: 0, side: 1, group: 0 },           // middle-right
        { x: -s * 0.5, side: -1, group: 0 },  // back-left
        { x: -s * 0.5, side: 1, group: 1 },   // back-right
      ];

      legPositions.forEach((leg) => {
        const wiggle = Math.sin(phase + leg.group * Math.PI) * 0.4;
        const extendY = s * 0.95 * leg.side;
        const extendX = leg.x - s * 0.3 + wiggle * s * 0.3;

        ctx.beginPath();
        ctx.moveTo(leg.x, 0);
        ctx.lineTo(extendX, extendY);
        ctx.stroke();
      });

      // Draw body segments
      ctx.fillStyle = antColor;

      // 1. Head
      ctx.beginPath();
      ctx.ellipse(s * 0.9, 0, s * 0.5, s * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Thorax (middle)
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.5, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Abdomen (back)
      ctx.beginPath();
      ctx.ellipse(-s * 1.1, 0, s * 0.7, s * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Antennae
      ctx.strokeStyle = antColor;
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(s * 1.2, -s * 0.2);
      ctx.quadraticCurveTo(s * 1.6, -s * 0.6, s * 1.8, -s * 0.3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(s * 1.2, s * 0.2);
      ctx.quadraticCurveTo(s * 1.6, s * 0.6, s * 1.8, s * 0.3);
      ctx.stroke();

      ctx.restore();
    }
  }

  function init() {
    if (prefersReducedMotion.matches) return;

    canvas = document.createElement("canvas");
    context = canvas.getContext("2d");
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = options?.zIndex || "999999";

    if (hasWrapperEl) {
      canvas.style.position = "absolute";
      element.appendChild(canvas);
      canvas.width = element.clientWidth;
      canvas.height = element.clientHeight;
    } else {
      canvas.style.position = "fixed";
      document.body.appendChild(canvas);
      canvas.width = width;
      canvas.height = height;
    }

    // Spawn ants at cursor location initially so they appear immediately
    for (let i = 0; i < numberOfAnts; i++) {
      ants.push(new Ant(cursor.x, cursor.y, i));
    }

    bindEvents();
    loop();
  }

  function bindEvents() {
    element.addEventListener("mousemove", onMouseMove);
    element.addEventListener("touchmove", onTouchMove, { passive: true });
    element.addEventListener("touchstart", onTouchMove, { passive: true });
    window.addEventListener("resize", onWindowResize);
  }

  function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;

    if (hasWrapperEl) {
      canvas.width = element.clientWidth;
      canvas.height = element.clientHeight;
    } else {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (e.touches.length > 0) {
      if (hasWrapperEl) {
        const boundingRect = element.getBoundingClientRect();
        cursor.x = e.touches[0].clientX - boundingRect.left;
        cursor.y = e.touches[0].clientY - boundingRect.top;
      } else {
        cursor.x = e.touches[0].clientX;
        cursor.y = e.touches[0].clientY;
      }
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (hasWrapperEl) {
      const boundingRect = element.getBoundingClientRect();
      cursor.x = e.clientX - boundingRect.left;
      cursor.y = e.clientY - boundingRect.top;
    } else {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    }
  }

  function updateAnts() {
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Reset following state
    ants.forEach((ant) => {
      ant.following = false;
      ant.target = null;
    });

    const followingAnts: Ant[] = [];

    // Only the single closest ant to cursor follows it directly
    let closestToCursor: Ant | null = null;
    let closestDist = Infinity;

    ants.forEach((ant) => {
      const dist = Math.hypot(
        ant.position.x - cursor.x,
        ant.position.y - cursor.y
      );
      if (dist < followRange && dist < closestDist) {
        closestDist = dist;
        closestToCursor = ant;
      }
    });

    if (closestToCursor) {
      (closestToCursor as Ant).following = true;
      (closestToCursor as Ant).target = cursor;
      followingAnts.push(closestToCursor);
    }

    // Chain: other ants follow the nearest ant that's already following
    let addedNew = true;
    while (addedNew) {
      addedNew = false;
      ants.forEach((ant) => {
        if (ant.following) return;

        let nearestDist = Infinity;
        let nearestAnt: Ant | null = null;

        followingAnts.forEach((followingAnt) => {
          const dist = Math.hypot(
            ant.position.x - followingAnt.position.x,
            ant.position.y - followingAnt.position.y
          );
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestAnt = followingAnt;
          }
        });

        if (nearestDist < followRange && nearestAnt) {
          ant.following = true;
          ant.target = (nearestAnt as Ant).position;
          followingAnts.push(ant);
          addedNew = true;
        }
      });
    }

    // Update and draw all ants
    ants.forEach((ant) => {
      if (ant.following && ant.target) {
        ant.moveToward(ant.target);
      } else {
        ant.wander();
      }
      ant.update();
      if (context) ant.draw(context);
    });
  }

  function loop() {
    updateAnts();
    animationFrameId = requestAnimationFrame(loop);
  }

  function destroy() {
    if (canvas) canvas.remove();
    cancelAnimationFrame(animationFrameId);
    element.removeEventListener("mousemove", onMouseMove);
    element.removeEventListener("touchmove", onTouchMove as any);
    element.removeEventListener("touchstart", onTouchMove as any);
    window.removeEventListener("resize", onWindowResize);
  }

  init();

  return {
    destroy
  };
}
