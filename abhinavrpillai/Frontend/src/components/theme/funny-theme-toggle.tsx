import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FunnyThemeToggle({
  className,
}: {
  className?: string;
}) {
  const { setTheme, theme } = useTheme();

  const toggleTheme = async (newTheme: string, event?: React.MouseEvent) => {
    // @ts-ignore
    if (!document.startViewTransition || !event) {
      setTheme(newTheme);
      return;
    }

    const { top, left, width, height } = (
      event.target as HTMLElement
    ).getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    // @ts-ignore
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme);
      });
    });

    await transition.ready;

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  const handleToggle = (e: React.MouseEvent) => {
    const nextTheme = theme === "light" ? "dark" : "light";
    toggleTheme(nextTheme, e);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "border-none bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-can-hover",
        className
      )}
      onClick={handleToggle}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0 text-amber-500 dark:text-neutral-400" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100 text-neutral-400 dark:text-indigo-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

