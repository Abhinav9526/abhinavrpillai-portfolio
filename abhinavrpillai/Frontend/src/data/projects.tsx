import AceTernityLogo from "@/components/logos/aceternity";
import SlideShow from "@/components/slide-show";
import { Button } from "@/components/ui/button";
import { TypographyH3, TypographyP } from "@/components/ui/typography";
import { ArrowUpRight, ExternalLink, Link2, MoveUpRight } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { SiDotnet, SiMicrosoft, SiHtml5, SiCss3, SiBootstrap } from "react-icons/si";

const BASE_PATH = "/assets/projects-screenshots";

const MaskIcon = ({ src, title }: { src: string; title?: string }) => (
  <span
    role="img"
    aria-label={title}
    className="block bg-current"
    style={{
      width: "1em",
      height: "1em",
      WebkitMaskImage: `url(${src})`,
      maskImage: `url(${src})`,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
      WebkitMaskSize: "contain",
      maskSize: "contain",
    }}
  />
);

const ProjectsLinks = ({ live, repo }: { live?: string; repo?: string }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-start gap-3 my-3 mb-8">
      {live && live !== "#" && (
        <Link
          className="font-mono underline flex gap-2"
          rel="noopener"
          target="_new"
          href={live}
        >
          <Button variant={"default"} size={"sm"}>
            Visit Website
            <ArrowUpRight className="ml-3 w-5 h-5" />
          </Button>
        </Link>
      )}
      {repo && repo !== "#" && (
        <Link
          className="font-mono underline flex gap-2"
          rel="noopener"
          target="_new"
          href={repo}
        >
          <Button variant={"default"} size={"sm"}>
            Github
            <ArrowUpRight className="ml-3 w-5 h-5" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export type Skill = {
  title: string;
  bg: string;
  fg: string;
  icon: ReactNode;
};

const brand = (title: string, file: string): Skill => ({
  title,
  bg: "black",
  fg: "white",
  icon: <MaskIcon src={`/assets/logos/${file}`} title={title} />,
});

const PROJECT_SKILLS = {
  js: brand("JavaScript", "javascript-mono.svg"),
  ts: brand("TypeScript", "typescript-mono.svg"),
  react: brand("React.js", "react-mono.svg"),
  node: brand("Node.js", "nodedotjs-mono.svg"),
  mongo: brand("MongoDB", "mongodb-mono.svg"),
  postgres: brand("PostgreSQL", "postgresql-mono.svg"),
  
  // Custom ones using react-icons
  html: {
    title: "HTML5",
    bg: "black",
    fg: "white",
    icon: <SiHtml5 />,
  },
  css: {
    title: "CSS3",
    bg: "black",
    fg: "white",
    icon: <SiCss3 />,
  },
  bootstrap: {
    title: "Bootstrap",
    bg: "black",
    fg: "white",
    icon: <SiBootstrap />,
  },
  csharp: {
    title: "C#",
    bg: "black",
    fg: "white",
    icon: <SiDotnet className="text-sm" />,
  },
  aspnet: {
    title: "ASP.NET",
    bg: "black",
    fg: "white",
    icon: <SiDotnet className="text-sm" />,
  },
  mssql: {
    title: "MS SQL Server",
    bg: "black",
    fg: "white",
    icon: <SiMicrosoft className="text-sm" />,
  },
};

export type Project = {
  id: string;
  category: string;
  title: string;
  src: string;
  screenshots: string[];
  skills: { frontend: Skill[]; backend: Skill[] };
  content: React.ReactNode | any;
  github?: string;
  live: string;
  redirectOnClick?: boolean;
};

const projects: Project[] = [
  {
    id: "buyit",
    category: "E-Commerce",
    title: "BUYIT: E-Commerce Website",
    src: "/assets/projects-screenshots/buyit/landing.png",
    screenshots: ["landing.png"],
    skills: {
      frontend: [
        PROJECT_SKILLS.html,
        PROJECT_SKILLS.css,
        PROJECT_SKILLS.bootstrap,
      ],
      backend: [
        PROJECT_SKILLS.csharp,
        PROJECT_SKILLS.aspnet,
        PROJECT_SKILLS.mssql,
      ],
    },
    live: "#",
    github: "#",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            A robust, full-featured eCommerce platform built using ASP.NET, C#, and MS SQL Server.
          </TypographyP>
          <TypographyP className="font-mono ">
            BUYIT is a complete eCommerce solution designed with a split architecture: an administrative panel for catalog management, and a user-facing storefront. Features a responsive frontend design for clean layouts and smooth checkout flows.
          </TypographyP>
          <ProjectsLinks live={this.live} repo={this.github} />

          <TypographyH3 className="my-4 mt-8">Admin Panel & Management</TypographyH3>
          <p className="font-mono mb-2">
            The administrator dashboard provides complete control over the platform's inventory and transactions. Admins can create, update, and delete product categories and individual product listings (including descriptions, prices, and stock counts). It also features order tracking and status updates to manage customer purchases efficiently.
          </p>

          <TypographyH3 className="my-4 mt-8">User Storefront & Purchase Flow</TypographyH3>
          <p className="font-mono mb-2">
            On the consumer side, users can browse categories, filter products, view high-quality details, and manage their shopping cart in real time. The checkout pipeline is securely handled via integrated payment simulation and order confirmation steps.
          </p>
        </div>
      );
    },
  },
  {
    id: "frontend_design",
    category: "Frontend UI/UX",
    title: "Responsive Web Page Design",
    src: "/assets/projects-screenshots/frontend_design/landing.png",
    screenshots: ["landing.png"],
    skills: {
      frontend: [
        PROJECT_SKILLS.html,
        PROJECT_SKILLS.css,
        PROJECT_SKILLS.bootstrap,
        PROJECT_SKILLS.js,
      ],
      backend: [],
    },
    live: "#",
    github: "#",
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            Clean, modern, and fully responsive frontend web pages.
          </TypographyP>
          <TypographyP className="font-mono ">
            A collection of web page designs built using HTML5, CSS3, and Bootstrap. Emphasizes clean UI/UX design, mobile-first responsiveness, and structured layouts using modern web design principles.
          </TypographyP>
          <ProjectsLinks live={this.live} repo={this.github} />

          <TypographyH3 className="my-4 mt-8">UI/UX Principles & Layouts</TypographyH3>
          <p className="font-mono mb-2">
            Features custom-tailored navigation menus, structured card grids, hero headers, and contact forms. Designed for maximum accessibility, performance, and clean readability across all screen sizes (mobile, tablet, and desktop).
          </p>
        </div>
      );
    },
  },
  {
    id: "astra",
    category: "AI Chatbot",
    title: "Astra Bot Maker",
    src: "https://image.thum.io/get/width/1200/https://astrabotmaker.netlify.app/",
    screenshots: ["landing.png"],
    skills: {
      frontend: [
        PROJECT_SKILLS.react,
        PROJECT_SKILLS.js,
        PROJECT_SKILLS.css,
      ],
      backend: [],
    },
    live: "https://astrabotmaker.netlify.app/",
    github: "#",
    redirectOnClick: true,
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            AI-powered chatbot landing page and product experience.
          </TypographyP>
          <TypographyP className="font-mono ">
            Astra is a modern AI chatbot landing page designed to showcase chatbot features, conversion-focused messaging, and an elegant SaaS-style product presentation.
          </TypographyP>
          <ProjectsLinks live={this.live} repo={this.github} />

          <TypographyH3 className="my-4 mt-8">Experience Highlights</TypographyH3>
          <p className="font-mono mb-2">
            Built to feel premium and conversion-first, with bold hero messaging, polished CTA flows, and a clean interface that positions the product as an AI customer engagement platform.
          </p>
        </div>
      );
    },
  },
  {
    id: "arivuai",
    category: "AI Learning App",
    title: "Arivu AI",
    src: "https://image.thum.io/get/width/1200/https://arivuai.netlify.app/",
    screenshots: ["landing.png"],
    skills: {
      frontend: [
        PROJECT_SKILLS.react,
        PROJECT_SKILLS.js,
        PROJECT_SKILLS.css,
      ],
      backend: [],
    },
    live: "https://arivuai.netlify.app/",
    github: "#",
    redirectOnClick: true,
    get content() {
      return (
        <div>
          <TypographyP className="font-mono text-2xl text-center">
            Intelligent AI-powered learning companion.
          </TypographyP>
          <TypographyP className="font-mono ">
            Arivu AI is a modern learning-focused product experience with a polished landing page, scalable UI, and an interface designed for intelligent study assistance and note summarization.
          </TypographyP>
          <ProjectsLinks live={this.live} repo={this.github} />

          <TypographyH3 className="my-4 mt-8">Experience Highlights</TypographyH3>
          <p className="font-mono mb-2">
            The design emphasizes clarity, trust, and conversion with a soft blue aesthetic, strong headline messaging, and a streamlined CTA flow for learning-focused users.
          </p>
        </div>
      );
    },
  },
];

export default projects;
