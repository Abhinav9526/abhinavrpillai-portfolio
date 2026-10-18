"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ContactForm from "../ContactForm";
import AnimeWriter, { AnimeWriterState } from "../AnimeWriter";
import { SectionHeader } from "./section-header";
import SectionWrapper from "../ui/section-wrapper";
import LottiePlayer from "../lottie-player";

const ContactSection = () => {
  const [characterState, setCharacterState] = useState<AnimeWriterState>("idle");

  return (
    <SectionWrapper id="contact" className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
      <SectionHeader id="contact" className="relative mb-6 sm:mb-14" title={
        <>
          LET&apos;S WORK <br />
          TOGETHER
        </>} />
      <div className="grid grid-cols-1 md:grid-cols-2 z-[9999] gap-6 md:gap-8 items-center">
        <Card className="w-full bg-white/70 dark:bg-black/70 backdrop-blur-sm rounded-xl mt-4 md:mt-12 relative overflow-visible border border-border/50 shadow-2xl">
          <CardHeader className="relative pr-24 sm:pr-36">
            <CardTitle className="text-2xl sm:text-4xl">Contact Form</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Have a project in mind or want to collaborate? Send me a message below and I&apos;ll get back to you promptly.
            </CardDescription>

            {/* Interactive Anime Writing Character positioned cleanly in top-right */}
            <div className="absolute -top-10 sm:-top-14 right-2 sm:right-4 pointer-events-none select-none z-20">
              <AnimeWriter state={characterState} />
            </div>
          </CardHeader>
          <CardContent>
            <ContactForm onStateChange={setCharacterState} />
          </CardContent>
        </Card>
        <div className="flex items-center justify-center p-6 select-none mt-10 md:mt-20">
          <div className="w-full max-w-[280px] sm:max-w-[340px] h-auto aspect-square">
            <LottiePlayer src="https://lottie.host/d19b78b0-8bf1-42e1-8884-bb9e1b78292c/W7GskWb3tX.json" />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default ContactSection;
