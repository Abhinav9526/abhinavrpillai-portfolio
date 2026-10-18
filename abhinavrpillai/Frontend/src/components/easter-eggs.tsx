"use client";
import { useDevToolsOpen } from "@/hooks/use-devtools-open";
import React, { useEffect, useState } from "react";
import NyanCat from "./nyan-cat";
import { AnimatePresence } from "motion/react";

const EasterEggs = () => {
  const { isDevToolsOpen } = useDevToolsOpen();
  useEffect(() => {
    if (!isDevToolsOpen) return;
    // console.log(
    //   "%cWhoa, look at you! 🕵️‍♂️\n\n" +
    //     "Peeking under the hood, eh? Just be careful, " +
    //     "you might find some 🐛 bugs that even I didn't know about! 😅\n\n" +
    //     "By the way, did you know the console is a portal to another dimension? 🌌 " +
    //     "Just kidding... or am I? 👽\n\n" +
    //     "Keep exploring, brave soul! 🛠️",
    //   "color: #00FF00; font-size: 16px; font-weight: bold; background-color: black; padding: 10px; border-radius: 10px;"
    // );
    // Console welcome messages removed per user request
  }, [isDevToolsOpen]);

  return (
    <>
      <NyanCat />
    </>
  );
};

export default EasterEggs;
