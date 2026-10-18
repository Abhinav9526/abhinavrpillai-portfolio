"use client";
import React from "react";
import { SectionHeader } from "./section-header";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import SectionWrapper from "../ui/section-wrapper";
import { motion } from "motion/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import LottiePlayer from "../lottie-player";

const EDUCATION = [
  {
    id: 1,
    degree: "BCom Commerce with Computer Application",
    institution: "College of Applied Science Adoor",
    duration: "2021 - 2024",
  },
  {
    id: 2,
    degree: "Plus Two Commerce with Computer Application",
    institution: "DVHSS Thalavoor",
    duration: "2019 - 2021",
  },
  {
    id: 3,
    degree: "SSLC",
    institution: "GVHSS Pattazhy",
    duration: "2018 - 2019",
  },
];

const EducationSection = () => {
  return (
    <SectionWrapper
      className="flex flex-col items-center justify-center py-16 sm:py-24 relative overflow-hidden"
    >
      <div className="w-full max-w-3xl px-4 mx-auto relative">
        <div className="flex flex-row items-center justify-between md:justify-start gap-4 mb-10 select-none">
          <SectionHeader
            id="education"
            title="Education"
            desc="My academic foundation."
            className="m-0"
          />
          <div className="w-16 h-16 md:w-20 md:h-20 -mt-2 shrink-0">
            <LottiePlayer src="https://lottie.host/0142fa9f-dc98-4444-934c-d90ab2c4a961/7Q3kG5pD9Y.json" />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {EDUCATION.map((edu, index) => (
            <div key={edu.id} className="w-full">
              <EducationCard education={edu} index={index} />
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

const EducationCard = ({
  education,
  index,
}: {
  education: (typeof EDUCATION)[0];
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
        <CardHeader className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-snug">
                {education.degree}
              </CardTitle>
              <div className="text-sm font-semibold text-primary">
                {education.institution}
              </div>
            </div>
            <Badge variant="secondary" className="w-fit font-mono text-[10px] font-semibold border-primary/20 bg-primary/10 text-primary shrink-0">
              {education.duration}
            </Badge>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
};

export default EducationSection;
