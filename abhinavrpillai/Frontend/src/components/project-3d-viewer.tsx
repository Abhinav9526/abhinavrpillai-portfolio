"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, ExternalLink, Github } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project3D {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  githubUrl?: string;
  liveUrl?: string;
  rotation: number;
  scale: number;
}

const projects: Project3D[] = [
  {
    id: "1",
    title: "E-Commerce Platform (BuyIT)",
    description: "Full-stack e-commerce solution with payment integration and real-time inventory management",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    imageUrl: "/assets/projects-screenshots/buyit/preview.png",
    githubUrl: "https://github.com/abhinavrpillai",
    liveUrl: "https://buyit-demo.com",
    rotation: 0,
    scale: 1,
  },
  {
    id: "2",
    title: "Social Network (PeakPosts)",
    description: "Real-time social platform with live notifications and chat functionality",
    technologies: ["MERN", "Socket.io", "JWT", "Redis"],
    imageUrl: "/assets/projects-screenshots/peakposts/preview.png",
    githubUrl: "https://github.com/abhinavrpillai",
    liveUrl: "https://peakposts-demo.com",
    rotation: 0,
    scale: 1,
  },
  {
    id: "3",
    title: "Task Management (Kanbi)",
    description: "Collaborative task management tool with drag-and-drop and team features",
    technologies: ["Next.js", "Firebase", "Tailwind CSS", "Framer Motion"],
    imageUrl: "/assets/projects-screenshots/kanbi/preview.png",
    githubUrl: "https://github.com/abhinavrpillai",
    liveUrl: "https://kanbi-demo.com",
    rotation: 0,
    scale: 1,
  },
];

export default function Project3DViewer() {
  const [currentProjectIdx, setCurrentProjectIdx] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationY, setRotationY] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentProject = projects[currentProjectIdx];

  // Auto-rotation effect
  useEffect(() => {
    if (!isRotating) return;

    const animate = () => {
      setRotationY((prev) => (prev + 1) % 360);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRotating]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 360;
    setRotationY(x);
  };

  const handleZoom = (direction: "in" | "out") => {
    setScale((prev) => {
      const newScale = direction === "in" ? prev + 0.1 : prev - 0.1;
      return Math.max(0.5, Math.min(2, newScale));
    });
  };

  const nextProject = () => {
    setCurrentProjectIdx((prev) => (prev + 1) % projects.length);
    setRotationY(0);
    setScale(1);
  };

  const prevProject = () => {
    setCurrentProjectIdx((prev) => (prev - 1 + projects.length) % projects.length);
    setRotationY(0);
    setScale(1);
  };

  return (
    <div className="w-full space-y-4">
      {/* 3D Viewer Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsRotating(false)}
        onClick={() => setIsRotating(!isRotating)}
        className="relative w-full aspect-square bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-cyan-500/30 overflow-hidden cursor-move group"
        style={{ perspective: "1200px" }}
      >
        {/* 3D Project Card */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="relative w-4/5 h-4/5 rounded-lg overflow-hidden shadow-2xl"
            style={{
              transform: `rotateY(${rotationY}deg) scale(${scale})`,
              transformStyle: "preserve-3d",
              transition: isRotating ? "none" : "transform 0.3s ease-out",
            }}
          >
            <img
              src={currentProject.imageUrl}
              alt={currentProject.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%231e293b' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='%2364748b' text-anchor='middle' dominant-baseline='middle'%3E" + currentProject.title + "%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>

        {/* Rotation Hint */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black/40 px-2 py-0.5 rounded text-cyan-300 text-xs font-mono">
            {isRotating ? "🔄 Rotating..." : "Click to rotate"}
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
          <button
            onClick={() => handleZoom("in")}
            className="p-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 rounded border border-cyan-500/50 text-cyan-300 transition-all text-sm"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => handleZoom("out")}
            className="p-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 rounded border border-cyan-500/50 text-cyan-300 transition-all text-sm"
            title="Zoom out"
          >
            −
          </button>
        </div>

        {/* Scale Indicator */}
        <div className="absolute top-3 left-3 text-xs text-slate-400 font-mono">
          Scale: {scale.toFixed(1)}x | Rotation: {Math.round(rotationY)}°
        </div>
      </div>

      {/* Project Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-bold text-cyan-400">{currentProject.title}</h3>
          <p className="text-slate-300 mt-1 text-sm">{currentProject.description}</p>
        </div>

        {/* Technologies */}
        <div className="flex flex-wrap gap-1.5">
          {currentProject.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs text-cyan-300"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-2">
          {currentProject.githubUrl && (
            <a
              href={currentProject.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs border border-slate-700 transition-all"
            >
              <Github className="w-3 h-3" />
              View Code
            </a>
          )}
          {currentProject.liveUrl && (
            <a
              href={currentProject.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded text-xs border border-cyan-500/50 transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              Live Demo
            </a>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevProject}
          className="p-1.5 hover:bg-slate-800 rounded transition-all border border-slate-700 text-slate-300"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex gap-1.5">
          {projects.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentProjectIdx(idx)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                idx === currentProjectIdx
                  ? "bg-cyan-400 w-6"
                  : "bg-slate-600 hover:bg-slate-500"
              )}
              aria-label={`Go to project ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextProject}
          className="p-1.5 hover:bg-slate-800 rounded transition-all border border-slate-700 text-slate-300"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Project Counter */}
      <div className="text-center text-slate-400 text-xs font-mono">
        Project {currentProjectIdx + 1} of {projects.length}
      </div>
    </div>
  );
}
