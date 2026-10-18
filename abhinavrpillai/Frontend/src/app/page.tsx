"use client";

import React from "react";
import SmoothScroll from "@/components/smooth-scroll";
import { cn } from "@/lib/utils";
import ThreeBackground from "@/components/three-background";
import SkillsSection from "@/components/sections/skills";
import ExperienceSection from "@/components/sections/experience";
import EducationSection from "@/components/sections/education";
import ProjectsSection from "@/components/sections/projects";
import ContactSection from "@/components/sections/contact";
import HeroSection from "@/components/sections/hero";
import SpotlightGlow from "@/components/spotlight-glow";
import AudioPlayer from "@/components/audio-player";

function MainPage() {
  return (
    <SmoothScroll>
      <ThreeBackground />
      <main className={cn("relative bg-background dark:bg-transparent canvas-overlay-mode")}>
        <AudioPlayer />
        <SpotlightGlow />
        <HeroSection />
        <SkillsSection />
        <ExperienceSection />
        <EducationSection />
        <ProjectsSection />
        <ContactSection />
      </main>
    </SmoothScroll>
  );
}

export default MainPage;
