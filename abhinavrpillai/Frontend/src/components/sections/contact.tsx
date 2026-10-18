"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ContactForm from "../ContactForm";
import { config } from "@/data/config";
import { SectionHeader } from "./section-header";
import SectionWrapper from "../ui/section-wrapper";
import LottiePlayer from "../lottie-player";

const ContactSection = () => {
  return (
    <SectionWrapper id="contact" className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
      <SectionHeader id='contact' className="relative mb-6 sm:mb-14" title={
        <>
          LET&apos;S WORK <br />
          TOGETHER
        </>} />
      <div className="grid grid-cols-1 md:grid-cols-2 z-[9999] gap-6 md:gap-8 items-center">
        <Card className="w-full bg-white/70 dark:bg-black/70 backdrop-blur-sm rounded-xl mt-4 md:mt-12">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-4xl">Contact Form</CardTitle>
            <CardDescription>
              Please contact me directly at{" "}
              <a
                target="_blank"
                href={`mailto:${config.email}`}
                className="text-primary hover:underline cursor-can-hover rounded-lg font-medium"
              >
       
              </a>{" "}
              or drop your info here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
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
