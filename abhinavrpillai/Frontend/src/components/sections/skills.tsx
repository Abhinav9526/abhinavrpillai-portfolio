"use client";

import type { CSSProperties } from "react";
import SectionWrapper from "../ui/section-wrapper";
import { SectionHeader } from "./section-header";
import { SKILLS } from "@/data/constants";
import { usePerfProfile } from "@/hooks/use-perf-profile";
import { cn } from "@/lib/utils";
import { playKeycapClick } from "@/lib/sounds";

/**
 * Tech-stack section.
 *
 * On capable devices the skills live in the interactive 3D keyboard's keycaps,
 * so this is just a header and the section is tall (the keyboard scrubs through
 * it on scroll). When the 3D scene is disabled (low-end / reduced-motion), the
 * keyboard isn't there to convey the skills — so we render them as a real HTML
 * grid instead. Progressive enhancement: the content survives without WebGL.
 */
const SkillsSection = () => {
  return (
    <SectionWrapper
      id="skills"
      className="flex w-full min-h-screen flex-col justify-center py-24"
    >
      <SectionHeader
        id="skills"
        title="Tech Stack"
        desc="Tools I build with"
        className="static mb-14"
      />
      <ul className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
        {Object.values(SKILLS)
          .filter((skill) => !["Copilot", "GitHub Copilot"].includes(skill.label))
          .map((skill) => (
            <li
              key={skill.name}
              style={{ "--skill": skill.color } as CSSProperties}
              onMouseEnter={playKeycapClick}
              className={cn(
                "pointer-events-auto",
                "group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl p-5",
                "border border-border/60 bg-secondary/15 backdrop-blur-sm",
                "transition-[transform,border-color,background-color,box-shadow] duration-300",
                "hover:-translate-y-1 hover:border-[var(--skill)] hover:bg-slate-950/40",
                "hover:shadow-[0_0_20px_rgba(255,255,255,0.05),0_0_15px_var(--skill)]"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={skill.icon}
                alt={skill.label}
                width={44}
                height={44}
                loading="lazy"
                className="relative size-9 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110 md:size-11"
              />
              <span className="relative text-center text-xs font-medium text-foreground/80 transition-colors group-hover:text-foreground md:text-sm">
                {skill.label}
              </span>
            </li>
          ))}
      </ul>
    </SectionWrapper>
  );
};

export default SkillsSection;
