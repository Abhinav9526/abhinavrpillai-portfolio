"use client";
import React from "react";
import { EXPERIENCE, SkillNames, SKILLS } from "@/data/constants";
import { SectionHeader } from "./section-header";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import SectionWrapper from "../ui/section-wrapper";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ExperienceSection = () => {
  return (
    <SectionWrapper
      className="flex flex-col items-center justify-center py-16 sm:py-24 relative overflow-hidden"
    >
      <div className="w-full max-w-3xl px-4 mx-auto relative">
        <SectionHeader
          id="experience"
          title="Experience"
          desc="My professional journey."
          className="mb-12 md:mb-16 mt-0"
        />

        <div className="flex flex-col gap-10">
          {EXPERIENCE.map((exp, index) => (
            <div key={exp.id} className="w-full">
              <ExperienceCard experience={exp} index={index} />
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

const ExperienceCard = ({
  experience,
  index,
}: {
  experience: (typeof EXPERIENCE)[0];
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.05,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      viewport={{ once: true, margin: "-80px" }}
      className="w-full"
    >
      <Card
        className={cn(
          "bg-card/45 backdrop-blur-md text-card-foreground border-border/80 w-full",
          "hover:border-primary/30 transition-[border-color,box-shadow] duration-500",
          "shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
        )}
      >
        <CardHeader className="pb-3 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {experience.title}
              </CardTitle>
              <div className="text-sm font-semibold text-primary">
                {experience.company}
              </div>
            </div>
            <Badge variant="secondary" className="w-fit font-mono text-[10px] font-semibold border-primary/20 bg-primary/10 text-primary shrink-0">
              {experience.startDate} - {experience.endDate}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-5 sm:p-6 pt-0">
          <ul className="list-disc list-outside ml-4 space-y-2 text-sm text-muted-foreground leading-relaxed">
            {experience.description.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
            {experience.skills.map((skillName) => {
              const skill = SKILLS[skillName as SkillNames];
              if (!skill) return null;
              return (
                <Badge
                  key={skillName}
                  variant="outline"
                  className="gap-2 text-[10px] font-mono font-normal bg-secondary/40 hover:bg-secondary/70 transition-colors border-border/60 text-muted-foreground hover:text-foreground"
                >
                  <img
                    src={skill.icon}
                    alt={skill.label}
                    className="w-3.5 h-3.5 object-contain opacity-80"
                  />
                  {skill.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExperienceSection;
