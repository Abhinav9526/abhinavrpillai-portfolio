import { cn } from "@/lib/utils"
import Link from "next/link"
import { BoxReveal } from "../reveal-animations"
import { ReactNode } from "react"

export const SectionHeader = ({ id, title, desc, className }: { id: string, title: string | ReactNode, desc?: string, className?: string }) => {
  return (

    <div className={cn("top-[70px] relative md:sticky mb-10 md:mb-96 px-2", className)}>
      <Link href={`#${id}`}>
        <BoxReveal width="100%">
          <h2
            className={cn(
              "text-3xl sm:text-5xl md:text-7xl text-center font-bold",
              "text-foreground tracking-tight"
            )}
          >
            {title}
          </h2>
        </BoxReveal>
      </Link>
      <p className="mx-auto mt-2 line-clamp-4 max-w-3xl font-normal text-sm sm:text-base text-center text-muted-foreground">
        {desc}
      </p>
    </div>
  )
}
