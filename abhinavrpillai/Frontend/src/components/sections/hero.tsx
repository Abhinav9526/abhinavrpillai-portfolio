import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { File, Github, Linkedin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePreloader } from "../preloader";
import { BlurIn, BoxReveal } from "../reveal-animations";
import ScrollDownIcon from "../scroll-down-icon";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";
import { config } from "@/data/config";

import SectionWrapper from "../ui/section-wrapper";
import HeroTerminal from "./hero-terminal";
import LottiePlayer from "../lottie-player";

const HeroSection = () => {
  const { isLoading } = usePreloader();

  return (
    <SectionWrapper id="hero" className={cn("relative w-full min-h-screen md:h-screen")}>
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">
        <div
          className={cn(
            "min-h-[auto] md:h-[calc(100dvh-4rem)] z-[2]",
            "col-span-1",
            "flex flex-col justify-start md:justify-center items-start",
            "pt-24 sm:pt-28 pb-6 px-4 sm:px-8 md:p-16 lg:p-20 xl:p-24"
          )}
        >
          {!isLoading && (
            <div className="flex flex-col w-full">
              <div>
                <BlurIn delay={0.7}>
                  <p
                    className={cn(
                      "self-start mt-2 sm:mt-4 font-medium text-sm sm:text-base md:text-xl text-slate-500 dark:text-zinc-400",
                      "cursor-default whitespace-nowrap bg-clip-text"
                    )}
                  >
                    Hi, I am
                  </p>
                </BlurIn>

                <BlurIn delay={0.9}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <h1
                        className={cn(
                          "leading-tight sm:leading-none text-transparent text-slate-800 text-left",
                          "font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl",
                          "cursor-pointer text-edge-outline font-display tracking-tight select-none"
                        )}
                      >
                        <ScrambleText
                          text={config.author.split(" ")[0]}
                          delay={900}
                        />
                        <ScrambleText
                          text={config.author.split(" ").slice(1).join(" ")}
                          delay={1300}
                        />
                      </h1>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="dark:bg-white dark:text-black font-mono text-xs"
                    >
                      Hover to scramble text
                    </TooltipContent>
                  </Tooltip>
                </BlurIn>
                <BlurIn delay={1.2}>
                  <p
                    className={cn(
                      "self-start mt-3 sm:mt-4 font-medium text-base sm:text-lg md:text-xl text-slate-500 dark:text-zinc-400",
                      "cursor-default bg-clip-text"
                    )}
                  >
                    A Full Stack Web Developer
                  </p>
                </BlurIn>
              </div>
              <div className="mt-6 sm:mt-8 flex flex-col gap-3 w-full sm:w-fit">
                <Link href="/resume" className="w-full sm:w-auto">
                  <BoxReveal delay={2} width="100%">
                    <Button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5">
                      <File size={20} />
                      <p>Resume</p>
                    </Button>
                  </BoxReveal>
                </Link>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link href={"#contact"} className="flex-1 sm:flex-none">
                        <Button
                          variant={"outline"}
                          className="w-full sm:w-auto px-6 overflow-hidden"
                        >
                          Hire Me
                        </Button>
                      </Link>
                    </TooltipTrigger>
                  </Tooltip>
                  <div className="flex items-center gap-2">
                    <Link
                      href={config.social.twitter}
                      target="_blank"
                    >
                      <Button variant={"outline"} size="icon" className="h-10 w-10">
                        <SiX size={18} />
                      </Button>
                    </Link>
                    <Link
                      href={config.social.github}
                      target="_blank"
                      className="cursor-can-hover"
                    >
                      <Button variant={"outline"} size="icon" className="h-10 w-10">
                        <SiGithub size={18} />
                      </Button>
                    </Link>
                    <Link
                      href={config.social.linkedin}
                      target="_blank"
                      className="cursor-can-hover"
                    >
                      <Button variant={"outline"} size="icon" className="h-10 w-10">
                        <SiLinkedin size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-span-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 z-[2] gap-3 pb-20 md:pb-12">
          {!isLoading && (
            <>
              <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 select-none -mb-2">
                <LottiePlayer src="https://lottie.host/76fa1c30-df53-4dc9-980b-222a0ec12b2e/KqD5o6wJjW.json" />
              </div>
              <HeroTerminal />
            </>
          )}
        </div>
      </div>
      <div className="hidden md:block absolute bottom-8 left-[50%] translate-x-[-50%] pointer-events-none">
        <ScrollDownIcon />
      </div>
    </SectionWrapper>
  );
};

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";

function ScrambleText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = React.useState(text);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const startScramble = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let iteration = 0;
    const totalSteps = text.length * 3;

    intervalRef.current = setInterval(() => {
      setDisplayText(() => {
        return text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            // Gradually resolve letters from left to right
            if (index < iteration / 3) {
              return text[index];
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("");
      });

      iteration += 1;
      if (iteration > totalSteps) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setDisplayText(text);
      }
    }, 30);
  }, [text]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      startScramble();
    }, delay);

    return () => {
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [delay, startScramble]);

  return (
    <span
      onMouseEnter={startScramble}
      className="block whitespace-nowrap transition-transform duration-200 hover:scale-[1.01] hover:text-foreground"
    >
      {displayText}
    </span>
  );
}

export default HeroSection;
