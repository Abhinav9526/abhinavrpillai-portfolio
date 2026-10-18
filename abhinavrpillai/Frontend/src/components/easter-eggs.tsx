"use client";
import { useDevToolsOpen } from "@/hooks/use-devtools-open";
import React, { useEffect, useState } from "react";
import SkateCat from "./skate-cat";

const EasterEggs = () => {
  const { isDevToolsOpen } = useDevToolsOpen();
  useEffect(() => {
    if (!isDevToolsOpen) return;
  }, [isDevToolsOpen]);

  return (
    <>
      <SkateCat />
    </>
  );
};

export default EasterEggs;
