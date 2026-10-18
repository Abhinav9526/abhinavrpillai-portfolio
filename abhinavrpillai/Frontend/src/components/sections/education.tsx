"use client";

import React, { useState, useRef } from "react";
import { SectionHeader } from "./section-header";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import SectionWrapper from "../ui/section-wrapper";
import { motion, useReducedMotion } from "motion/react";
import { playSargamNote } from "@/lib/sounds";
import { GitBranch, GitCommit, GraduationCap, School, Calendar, Award } from "lucide-react";

const EDUCATION = [
  {
    id: 1,
    degree: "BCom Commerce with Computer Application",
    institution: "College of Applied Science Adoor",
    duration: "2021 - 2024",
    commit: { hash: "a09f8c1", branch: "feat/degree-bcom-cs", tag: "release/undergraduate" },
    highlights: [
      "Specialized in Computer Applications, Database Management & System Design",
      "Built full-stack academic projects combining commercial software with database systems",
      "Core foundation in Information Systems, Business Logic, and Algorithmic Thinking",
    ],
  },
  {
    id: 2,
    degree: "Plus Two Commerce with Computer Application",
    institution: "DVHSS Thalavoor",
    duration: "2019 - 2021",
    commit: { hash: "b21e7d4", branch: "feat/higher-secondary", tag: "release/plus-two" },
    highlights: [
      "Focused on Computer Applications, Logic Design, and Structured Programming",
      "Advanced quantitative problem solving and business analytics",
    ],
  },
  {
    id: 3,
    degree: "SSLC (Secondary School Leaving Certificate)",
    institution: "GVHSS Pattazhy",
    duration: "2018 - 2019",
    commit: { hash: "c34d5e2", branch: "init/academic-roots", tag: "genesis/sslc" },
    highlights: [
      "Foundational Secondary Education in Mathematics, Science, and Analytical Studies",
    ],
  },
];

const EducationSection = () => {
  return (
    <SectionWrapper
      id="education"
      className="flex flex-col items-center justify-center py-16 sm:py-24 relative overflow-hidden"
    >
      <div className="w-full max-w-4xl px-3 sm:px-6 mx-auto relative">
        <SectionHeader
          id="education"
          title="Education"
          desc="My academic foundation."
          className="mb-4 sm:mb-6 mt-0"
        />

        {/* Academic Branch Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 mb-8 sm:mb-12 rounded-xl bg-secondary/30 border border-border/80 backdrop-blur-md font-mono text-xs text-muted-foreground select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-foreground font-semibold flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
              branch: foundation/academics
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
            <span className="hidden sm:inline-block text-cyan-400/80">
              git merge-base main
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold">
              3 milestones completed
            </span>
          </div>
        </div>

        {/* Academic Git Timeline Rail */}
        <div className="relative">
          {/* Vertical Cyan Laser Beam (Shared absolute track) */}
          <div className="absolute left-3 sm:left-5 top-3 bottom-6 w-0.5 -translate-x-1/2 bg-gradient-to-b from-cyan-400 via-primary/50 to-border/40">
            <motion.div
              animate={{ y: ["0%", "100%"] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="w-1.5 -ml-0.5 h-20 rounded-full bg-gradient-to-b from-transparent via-cyan-300 to-transparent blur-[1px] opacity-75"
            />
          </div>

          <div className="space-y-10 sm:space-y-12">
            {EDUCATION.map((edu, index) => (
              <GitEducationCard key={edu.id} education={edu} index={index} />
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

function GitEducationCard({
  education,
  index,
}: {
  education: (typeof EDUCATION)[0];
  index: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="relative pl-8 sm:pl-12 group">
      {/* Git Commit Academic Orb: Exactly centered at left-3 sm:left-5 on the laser rail */}
      <div className="absolute left-3 sm:left-5 top-5 -translate-x-1/2 flex items-center justify-center select-none z-20">
        <div className="size-4 sm:size-4.5 rounded-full bg-cyan-400 border-2 border-background shadow-[0_0_14px_rgba(6,182,212,0.6)] flex items-center justify-center transition-transform duration-300 group-hover:scale-125">
          <span className="size-1.5 rounded-full bg-slate-950" />
        </div>
      </div>

      {/* Commit Meta Pill */}
      <div className="flex flex-wrap items-center gap-2 mb-2.5 font-mono text-[11px] text-muted-foreground select-none">
        <span className="flex items-center gap-1 font-semibold text-cyan-400">
          <GitCommit className="h-3 w-3" />
          {education.commit.hash}
        </span>
        <span className="text-border">&bull;</span>
        <span className="text-muted-foreground/80">{education.commit.branch}</span>
        <span className="text-border">&bull;</span>
        <span className="px-1.5 py-0.2 rounded bg-secondary/60 border border-border/60 text-[10px] text-foreground/80">
          {education.commit.tag}
        </span>
      </div>

      {/* 3D Spotlight Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => playSargamNote(index + 3)}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.1,
          ease: [0.21, 0.47, 0.32, 0.98],
        }}
        viewport={{ once: true, margin: "-60px" }}
        whileHover={!shouldReduceMotion ? { y: -4 } : {}}
        className={cn(
          "relative overflow-hidden rounded-2xl p-5 sm:p-7 w-full",
          "border border-border/80 bg-card/50 backdrop-blur-md text-card-foreground",
          "transition-all duration-300 shadow-sm",
          "hover:border-cyan-400/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25),0_0_25px_rgba(6,182,212,0.15)]"
        )}
      >
        {/* Dynamic Mouse Spotlight Fill */}
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.12), transparent 75%)`,
          }}
        />

        {/* Dynamic Mouse Spotlight Border Glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.5), transparent 70%)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />

        {/* Degree & Institution Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-border/40">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-cyan-400 shrink-0" />
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-cyan-400 transition-colors">
                {education.degree}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <School className="h-3.5 w-3.5 shrink-0 text-cyan-400/80" />
              <span>{education.institution}</span>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="w-fit font-mono text-[10px] font-semibold border-cyan-400/25 bg-cyan-400/10 text-cyan-400 shrink-0 flex items-center gap-1 shadow-sm"
          >
            <Calendar className="h-3 w-3" />
            {education.duration}
          </Badge>
        </div>

        {/* Academic Highlights */}
        <div className="relative z-10 pt-4">
          <div className="text-[10px] font-mono text-muted-foreground mb-2 flex items-center gap-1">
            <Award className="h-3 w-3 text-cyan-400" />
            <span>key takeaways:</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {education.highlights.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-cyan-400 mt-0.5 select-none font-bold">&gt;</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export default EducationSection;
