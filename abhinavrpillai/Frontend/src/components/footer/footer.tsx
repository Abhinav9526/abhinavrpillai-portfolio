import React, { Suspense } from "react";
import Link from "next/link";
import { footer } from "./config";
import { Button } from "../ui/button";
import SocialMediaButtons from "../social/social-media-icons";
import { config } from "@/data/config";

function CopyrightYear() {
  const year = new Date().getFullYear();
  return <>{year}</>;
}

function Footer() {
  return (
    <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t border-border bg-background px-4 pt-6 pb-24 text-foreground sm:pb-6 sm:flex-row md:px-6 sm:justify-between">
      <p className="text-xs text-gray-500 dark:text-gray-400 sm:pl-32 text-center sm:text-left">
        ©{" "}
        <Suspense fallback={null}>
          <CopyrightYear />
        </Suspense>{" "}
        {config.author}. All rights reserved.
      </p>
      <SocialMediaButtons />
      <nav className="flex gap-4 sm:gap-6 z-10">
        {footer.map((link, index) => {
          const { title, href } = link;

          return (
            <Button variant={"link"} asChild key={`l_${index}`}>
              <Link
                className="text-xs underline-offset-4 hover:underline"
                href={href}
              >
                {title}
              </Link>
            </Button>
          );
        })}
      </nav>
    </footer>
  );
}

export default Footer;
