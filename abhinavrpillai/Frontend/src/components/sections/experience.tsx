"use client";

import React, { useState, useRef, type CSSProperties } from "react";
import { EXPERIENCE, SkillNames, SKILLS } from "@/data/constants";
import { SectionHeader } from "./section-header";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import SectionWrapper from "../ui/section-wrapper";
import { motion, useReducedMotion } from "motion/react";
import { playSargamNote } from "@/lib/sounds";
import { GitBranch, GitCommit, Terminal, Calendar, Building, Sparkles } from "lucide-react";

// Mock realistic git commit hashes for storytelling
const GIT_COMMITS = [
  { hash: "7f2a9c1", branch: "feat/lead-software-eng", tag: "HEAD -> main (v2.0)" },
  { hash: "e4d8b20", branch: "feat/erp-hrms-supplyco", tag: "release/erp-v1.4" },
  { hash: "1a9c3f4", branch: "feat/aspnet-internship", tag: "init/foundations" },
];

const ExperienceSection = () => {
  return (
    <SectionWrapper
      id="experience"
      className="flex flex-col items-center justify-center py-16 sm:py-24 relative overflow-hidden"
    >
      <div className="w-full max-w-4xl px-3 sm:px-6 mx-auto relative">
        <SectionHeader
          id="experience"
          title="Experience"
          desc="My professional journey."
          className="mb-4 sm:mb-6 mt-0"
        />

        {/* Git Branch & Graph Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 mb-8 sm:mb-12 rounded-xl bg-secondary/30 border border-border/80 backdrop-blur-md font-mono text-xs text-muted-foreground select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-foreground font-semibold flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-primary" />
              branch: career/main
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
            <span className="hidden sm:inline-block text-primary/80">
              git log --graph --decorate
            </span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
              3 commits merged
            </span>
          </div>
        </div>

        {/* Git Commit Graph Timeline */}
        <div className="relative">
          {/* Vertical Glowing Laser Rail (Shared absolute track) */}
          <div className="absolute left-3 sm:left-5 top-3 bottom-6 w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary via-indigo-500/50 to-border/40">
            {/* Animated Laser Pulse traveling down the rail */}
            <motion.div
              animate={{ y: ["0%", "100%"] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "linear" }}
              className="w-1.5 -ml-0.5 h-24 rounded-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-[1px] opacity-75"
            />
          </div>

          <div className="space-y-10 sm:space-y-12">
            {EXPERIENCE.map((exp, index) => (
              <GitExperienceCard
                key={exp.id}
                experience={exp}
                index={index}
                commit={GIT_COMMITS[index % GIT_COMMITS.length]}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

function GitExperienceCard({
  experience,
  index,
  commit,
}: {
  experience: (typeof EXPERIENCE)[0];
  index: number;
  commit: (typeof GIT_COMMITS)[0];
}) {
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const isCurrentRole = experience.endDate.toLowerCase().includes("present");

  return (
    <div className="relative pl-8 sm:pl-12 group">
      {/* Git Commit Node Orb: Exactly centered at left-3 sm:left-5 on the laser rail */}
      <div className="absolute left-3 sm:left-5 top-5 -translate-x-1/2 flex items-center justify-center select-none z-20">
        {isCurrentRole ? (
          <div className="relative flex items-center justify-center size-6 sm:size-7">
            <span className="absolute size-full rounded-full bg-emerald-400/30 animate-ping" />
            <div className="size-4 sm:size-4.5 rounded-full bg-emerald-500 border-2 border-background shadow-[0_0_15px_rgba(16,185,129,0.7)] flex items-center justify-center">
              <span className="size-1.5 rounded-full bg-white" />
            </div>
          </div>
        ) : (
          <div className="size-4 sm:size-4.5 rounded-full bg-primary border-2 border-background shadow-[0_0_12px_rgba(99,102,241,0.5)] flex items-center justify-center transition-transform duration-300 group-hover:scale-125">
            <span className="size-1.5 rounded-full bg-white" />
          </div>
        )}
      </div>

      {/* Commit Header Meta Pill */}
      <div className="flex flex-wrap items-center gap-2 mb-2.5 font-mono text-[11px] text-muted-foreground select-none">
        <span className="flex items-center gap-1 font-semibold text-primary">
          <GitCommit className="h-3 w-3" />
          {commit.hash}
        </span>
        <span className="text-border">&bull;</span>
        <span className="text-muted-foreground/80">{commit.branch}</span>
        <span className="text-border">&bull;</span>
        <span className="px-1.5 py-0.2 rounded bg-secondary/60 border border-border/60 text-[10px] text-foreground/80">
          {commit.tag}
        </span>
      </div>

      {/* 3D Spotlight Card */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
          "hover:border-primary/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25),0_0_25px_rgba(99,102,241,0.15)]"
        )}
      >
        {/* Dynamic Mouse Spotlight Fill */}
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.12), transparent 75%)`,
          }}
        />

        {/* Dynamic Mouse Spotlight Border Glow */}
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.5), transparent 70%)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />

        {/* Role & Company Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-border/40">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {experience.title}
              </h3>
              {isCurrentRole && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 shadow-sm">
                  <span className="size-1 rounded-full bg-emerald-400 animate-ping" />
                  CURRENT
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary/90">
              <Building className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{experience.company}</span>
            </div>
          </div>

          <Badge
            variant="secondary"
            className="w-fit font-mono text-[10px] font-semibold border-primary/25 bg-primary/10 text-primary shrink-0 flex items-center gap-1 shadow-sm"
          >
            <Calendar className="h-3 w-3" />
            {experience.startDate} — {experience.endDate}
          </Badge>
        </div>

        {/* Bullet Description */}
        <div className="relative z-10 my-4">
          <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {experience.description.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-primary mt-1 select-none font-bold">&gt;</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Interactive Skills with Musical Chimes & Spring Physics */}
        <div className="relative z-10 pt-4 border-t border-border/40">
          <div className="text-[10px] font-mono text-muted-foreground mb-2 flex items-center gap-1">
            <Terminal className="h-3 w-3 text-primary" />
            <span>dependencies installed:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {experience.skills.map((skillName, skillIndex) => {
              const skill = SKILLS[skillName as SkillNames];
              if (!skill) return null;

              return (
                <motion.div
                  key={skillName}
                  whileHover={!shouldReduceMotion ? { y: -3, scale: 1.06 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  onMouseEnter={() => playSargamNote(skillIndex)}
                  style={{ "--badge-color": skill.color } as CSSProperties}
                  className={cn(
                    "group/skill relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg",
                    "text-[10px] font-mono font-medium select-none cursor-pointer",
                    "border border-border/60 bg-secondary/35 text-foreground/80",
                    "transition-all duration-300",
                    "hover:border-[var(--badge-color)] hover:text-foreground hover:bg-slate-950/50",
                    "hover:shadow-[0_0_12px_var(--badge-color)]"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={skill.icon}
                    alt={skill.label}
                    className="w-3.5 h-3.5 object-contain transition-transform group-hover/skill:scale-115"
                  />
                  <span>{skill.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ExperienceSection;
