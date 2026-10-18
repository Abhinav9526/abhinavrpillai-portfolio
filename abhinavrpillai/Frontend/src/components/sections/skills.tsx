"use client";

import { useState, type CSSProperties } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import SectionWrapper from "../ui/section-wrapper";
import { SectionHeader } from "./section-header";
import { SKILLS } from "@/data/constants";
import { cn } from "@/lib/utils";
import { playSargamNote } from "@/lib/sounds";

const SARGAM_NOTES = [
  { note: "Sa", freq: 261.63 }, // C4
  { note: "Re", freq: 293.66 }, // D4
  { note: "Ga", freq: 329.63 }, // E4
  { note: "Ma", freq: 349.23 }, // F4
  { note: "Pa", freq: 392.00 }, // G4
  { note: "Dha", freq: 440.00 }, // A4
  { note: "Ni", freq: 493.88 }, // B4
  { note: "Sa'", freq: 523.25 }, // C5
  { note: "Re'", freq: 587.33 }, // D5
  { note: "Ga'", freq: 659.25 }, // E5
  { note: "Ma'", freq: 698.46 }, // F5
  { note: "Pa'", freq: 783.99 }, // G5
  { note: "Dha'", freq: 880.00 }, // A5
  { note: "Ni'", freq: 987.77 }, // B5
  { note: "Sa''", freq: 1046.50 }, // C6
];

interface SkillItem {
  id: number;
  name: string;
  label: string;
  shortDescription: string;
  color: string;
  icon: string;
}

function SkillCard({ skill, index = 0 }: { skill: SkillItem; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const isReact = skill.label.toLowerCase().includes("react");
  const sargamItem = SARGAM_NOTES[Math.abs(index) % SARGAM_NOTES.length];

  return (
    <motion.li
      style={{ "--skill": skill.color } as CSSProperties}
      onMouseEnter={() => {
        setIsHovered(true);
        playSargamNote(index);
      }}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={!shouldReduceMotion ? { y: -6 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "pointer-events-auto",
        "group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl p-5",
        "border border-border/60 bg-secondary/15 backdrop-blur-sm",
        "transition-colors duration-300",
        "hover:border-[var(--skill)] hover:bg-slate-950/40",
        "hover:shadow-[0_0_25px_rgba(255,255,255,0.06),0_0_20px_var(--skill)]"
      )}
    >
      {/* Musical Sargam Note badge appearing on hover */}
      <AnimatePresence>
        {isHovered && !shouldReduceMotion && (
          <motion.span
            initial={{ opacity: 0, scale: 0.6, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: -4 }}
            transition={{ duration: 0.18 }}
            className="absolute top-2 right-2.5 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border border-white/10 bg-black/60 shadow-sm backdrop-blur-md select-none"
            style={{ color: skill.color, borderColor: `${skill.color}50` }}
          >
            ♪ {sargamItem.note}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Ambient brand color bloom glowing behind logo */}
      <motion.div
        aria-hidden="true"
        animate={
          isHovered && !shouldReduceMotion
            ? { opacity: 0.55, scale: 1.5 }
            : { opacity: 0, scale: 0.8 }
        }
        transition={{ duration: 0.3 }}
        className="pointer-events-none absolute size-14 rounded-full blur-xl -top-2"
        style={{ backgroundColor: skill.color }}
      />

      {/* Interactive Animated Logo */}
      <div className="relative flex items-center justify-center size-10 md:size-12">
        <motion.img
          src={skill.icon}
          alt={skill.label}
          width={44}
          height={44}
          loading="lazy"
          animate={
            shouldReduceMotion
              ? {}
              : isHovered
              ? isReact
                ? {
                    scale: 1.25,
                    rotate: 360,
                    filter: `drop-shadow(0 0 14px ${skill.color})`,
                  }
                : {
                    scale: [1, 1.22, 1.18],
                    y: [0, -6, -4],
                    rotate: [0, -10, 8, -4, 2, 0],
                    filter: `drop-shadow(0 4px 14px ${skill.color}90)`,
                  }
              : {
                  scale: 1,
                  y: 0,
                  rotate: 0,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                }
          }
          transition={
            isReact && isHovered
              ? {
                  rotate: { repeat: Infinity, duration: 4, ease: "linear" },
                  scale: { type: "spring", stiffness: 350, damping: 15 },
                }
              : {
                  duration: 0.5,
                  ease: "easeOut",
                }
          }
          className="size-9 object-contain md:size-11 select-none"
        />
      </div>

      <span className="relative text-center text-xs font-medium text-foreground/80 transition-colors group-hover:text-foreground md:text-sm select-none">
        {skill.label}
      </span>
    </motion.li>
  );
}

/**
 * Tech-stack section.
 */
const SkillsSection = () => {
  return (
    <SectionWrapper
      id="skills"
      className="flex w-full flex-col justify-center py-16 sm:py-24 px-3 sm:px-6"
    >
      <SectionHeader
        id="skills"
        title="Tech Stack"
        desc="Tools I build with"
        className="mb-6 sm:mb-8"
      />
      <ul className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Object.values(SKILLS)
          .filter((skill) => !["Copilot", "GitHub Copilot"].includes(skill.label))
          .map((skill, index) => (
            <SkillCard key={skill.name} skill={skill as SkillItem} index={index} />
          ))}
      </ul>
    </SectionWrapper>
  );
};

export default SkillsSection;
