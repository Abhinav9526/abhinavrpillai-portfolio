export enum SkillNames {
  JS = "js",
  TS = "ts",
  HTML = "html",
  CSS = "css",
  REACT = "react",
  NODEJS = "nodejs",
  POSTGRES = "postgres",
  MONGODB = "mongodb",
  WORDPRESS = "wordpress",
  
  // Mapping new skills to the 3D Spline keyboard's physical keycaps:
  CSHARP = "docker",       // C# mapped to Docker keycap
  ASPNET = "vercel",       // ASP.NET mapped to Vercel keycap
  AWS = "aws",             // AWS mapped to AWS keycap (matches logo!)
  MSSQL = "linux",         // MS SQL mapped to Linux keycap
  MYSQL = "express",       // MySQL mapped to Express keycap
  NESTJS = "nextjs",       // NestJS mapped to Next.js keycap
  BOOTSTRAP = "tailwind",   // Bootstrap mapped to Tailwind keycap
  PHP = "vue",             // PHP mapped to Vue keycap
  POWERBI = "nginx",       // Power BI mapped to Nginx keycap
  ERP = "gcp",             // ERP mapped to GCP keycap
  HRMS = "firebase",       // HRMS mapped to Firebase keycap
  AITOOLS = "npm",         // AI Tools mapped to NPM keycap
  PROMPTING = "vim",       // Prompting mapped to Vim keycap
  ADONET = "adonet",       // ADO.NET skill (grid only, doesn't map to 3D keycap)
}

export type Skill = {
  id: number;
  name: string;
  label: string;
  shortDescription: string;
  color: string;
  icon: string;
};

export const SKILLS: Record<SkillNames, Skill> = {
  [SkillNames.JS]: {
    id: 1,
    name: "js",
    label: "JavaScript",
    shortDescription: "yeeting code into the DOM since '95, no cap! 💯🚀",
    color: "#f0db4f",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  [SkillNames.TS]: {
    id: 2,
    name: "ts",
    label: "TypeScript",
    shortDescription:
      "JavaScript's overachieving cousin who's always flexing 💯🔒",
    color: "#007acc",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  [SkillNames.HTML]: {
    id: 3,
    name: "html",
    label: "HTML",
    shortDescription: "the internet's granddad,  still bussin' fr fr! 💀🔥",
    color: "#e34c26",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  },
  [SkillNames.CSS]: {
    id: 4,
    name: "css",
    label: "CSS",
    shortDescription: "styling with the ultimate drip, no cap 💁‍♂️🔥",
    color: "#563d7c",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  },
  [SkillNames.REACT]: {
    id: 5,
    name: "react",
    label: "React",
    shortDescription: `"use using" using use = useUsing("use")`,
    color: "#61dafb",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  [SkillNames.NODEJS]: {
    id: 9,
    name: "nodejs",
    label: "Node.js",
    shortDescription: "JavaScript said 'sike, I'm backend now', deadass! 🔙🔚",
    color: "#6cc24a",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  [SkillNames.POSTGRES]: {
    id: 11,
    name: "postgres",
    label: "PostgreSQL",
    shortDescription: "SQL but make it fashion, purr 💅🐘",
    color: "#336791",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  },
  [SkillNames.MONGODB]: {
    id: 12,
    name: "mongodb",
    label: "MongoDB",
    shortDescription: "flexin' with that NoSQL drip, respectfully! 💪🍃",
    color: "#336791",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  },
  [SkillNames.WORDPRESS]: {
    id: 18,
    name: "wordpress",
    label: "WordPress",
    shortDescription: "the grandpa of CMS, still rocking that cane 🧓👴",
    color: "#007acc",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg",
  },

  // Mapped skills:
  [SkillNames.CSHARP]: {
    id: 26,
    name: "docker",
    label: "C#",
    shortDescription: "Java's cool younger sibling who loves game dev and enterprise code 🎮✨",
    color: "#178600",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg",
  },
  [SkillNames.ASPNET]: {
    id: 27,
    name: "vercel",
    label: "ASP.NET",
    shortDescription: "building robust APIs and web apps that never back down 💪🌐",
    color: "#512bd4",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg",
  },
  [SkillNames.AWS]: {
    id: 22,
    name: "aws",
    label: "AWS",
    shortDescription: "Amazon Web Services, hosting and scaling applications in the cloud ☁️🚀",
    color: "#ff9900",
    icon: "/assets/logos/aws-mono.svg",
  },
  [SkillNames.MSSQL]: {
    id: 29,
    name: "linux",
    label: "MS SQL Server",
    shortDescription: "Microsoft's heavy-duty database beast, keeping queries fast and structured 🏢⚡",
    color: "#cc292b",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg",
  },
  [SkillNames.MYSQL]: {
    id: 30,
    name: "express",
    label: "MySQL",
    shortDescription: "the world's most popular open-source database, solid and dependable 🐬📈",
    color: "#00758f",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  },
  [SkillNames.NESTJS]: {
    id: 31,
    name: "nextjs",
    label: "NestJS",
    shortDescription: "Angular vibes but for the backend, architecture so clean you could eat off it 🏛️🚀",
    color: "#ea2845",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg",
  },
  [SkillNames.BOOTSTRAP]: {
    id: 32,
    name: "tailwind",
    label: "Bootstrap",
    shortDescription: "responsiveness out of the box, grid system goes brrr 📦📱",
    color: "#563d7c",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg",
  },
  [SkillNames.PHP]: {
    id: 33,
    name: "vue",
    label: "PHP",
    shortDescription: "running half the internet and still going strong, respect the veteran! 🐘🔥",
    color: "#777bb4",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg",
  },
  [SkillNames.POWERBI]: {
    id: 34,
    name: "nginx",
    label: "Power BI",
    shortDescription: "turning messy data into beautiful, interactive business stories 📊🎨",
    color: "#f2c811",
    icon: "/assets/logos/powerbi.svg",
  },
  [SkillNames.ERP]: {
    id: 35,
    name: "gcp",
    label: "ERP Software",
    shortDescription: "the brain of business operations, keeping workflows perfectly in sync ⚙️💼",
    color: "#008fd3",
    icon: "/assets/logos/sap.svg",
  },
  [SkillNames.HRMS]: {
    id: 36,
    name: "firebase",
    label: "HRMS",
    shortDescription: "managing human resources like a boss, tracking attendance and payroll effortlessly 👥💳",
    color: "#e36f1e",
    icon: "/assets/logos/workday.svg",
  },
  [SkillNames.AITOOLS]: {
    id: 38,
    name: "npm",
    label: "AI Tools",
    shortDescription: "leveraging cutting-edge AI APIs to build smart, context-aware platforms 🤖🔮",
    color: "#ffd21e",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/huggingface.svg",
  },
  [SkillNames.PROMPTING]: {
    id: 39,
    name: "vim",
    label: "Prompting",
    shortDescription: "the art of whispering to AI to get exactly what you want 🗣️🧠",
    color: "#10a37f",
    icon: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/openai.svg",
  },
  [SkillNames.ADONET]: {
    id: 42,
    name: "adonet",
    label: "ADO.NET",
    shortDescription: "the OG data access bridge, connecting C# to databases since day one 🔌💾",
    color: "#512bd4",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dotnetcore/dotnetcore-original.svg",
  },
};

export type Experience = {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  company: string;
  description: string[];
  skills: SkillNames[];
};

export const EXPERIENCE: Experience[] = [
  {
    id: 1,
    startDate: "Jan 2025",
    endDate: "Present",
    title: "Software Engineer",
    company: "Thoughtline Digital",
    description: [
      "Managed multiple client and internal web applications, balancing independent end-to-end development with collaborative team-based work.",
      "Built and deployed full-stack web applications from the ground up, handling everything from architectural decisions and development to testing and production releases.",
      "Implemented automated end-to-end testing using Playwright, ensuring application stability and reducing manual testing efforts before production releases.",
      "Developed an AI-powered full-stack application that automatically transforms messy, unstructured data into polished, professionally formatted resumes from scratch.",
      "Built a comprehensive fleet management system to streamline logistics, track assets, and improve overall operational efficiency.",
      "Integrated AI capabilities into various platforms, including custom AI chatbots with memory handling and APIs for automated data processing.",
      "Built scalable e-commerce applications featuring complete product management, seamless user checkout flows, and secure payment integrations.",
      "Developed online learning platforms with dynamic content delivery, structured course management, and strict user access controls.",
      "Designed interactive Power BI dashboards, working directly with business users to translate their requirements into clear data models and visual insights.",
      "Secured multiple applications by implementing robust role-based access control (RBAC), user authentication, and safe API handling.",
      "Partnered daily with designers, fellow developers, and stakeholders to ensure all features were delivered on time and met business goals.",
    ],
    skills: [
      SkillNames.REACT,
      SkillNames.NODEJS,
      SkillNames.MONGODB,
      SkillNames.TS,
      SkillNames.JS,
      SkillNames.HTML,
      SkillNames.CSS,
      SkillNames.POWERBI,
      SkillNames.AITOOLS,
    ],
  },
  {
    id: 2,
    startDate: "Oct 2024",
    endDate: "Dec 2024",
    title: "ERP & HRMS Implementation Support",
    company: "NDimensionZ Solutions Pvt Ltd (Supplyco Project)",
    description: [
      "Supported the implementation of ERP software for accounting, procurement, and inventory management, ensuring seamless integration with business operations.",
      "Assisted in data migration, system configuration, and testing to align ERP systems with organizational workflows.",
      "Provided post-implementation support and conducted user training to ensure smooth ERP system adoption and improved efficiency.",
      "Assisted in the deployment and management of HRMS (Human Resource Management System) to handle employee data, including attendance, payroll, and other personnel details.",
      "Ensured smooth operation of HRMS by troubleshooting and providing ongoing support for system enhancements.",
    ],
    skills: [
      SkillNames.ERP,
      SkillNames.HRMS,
      SkillNames.MYSQL,
    ],
  },
  {
    id: 3,
    startDate: "Jun 2024",
    endDate: "Nov 2024",
    title: "ASP .NET Full Stack Intern",
    company: "Luminar Technolab",
    description: [
      "Acquired hands-on experience in full-stack web development using ASP.NET, C#, and SQL Server.",
      "Built responsive web pages and connected them to relational databases using ADO.NET.",
      "Learned modern software engineering principles and collaborative project workflows.",
    ],
    skills: [
      SkillNames.ASPNET,
      SkillNames.CSHARP,
      SkillNames.ADONET,
      SkillNames.MSSQL,
      SkillNames.HTML,
      SkillNames.CSS,
      SkillNames.BOOTSTRAP,
    ],
  },
];

export const themeDisclaimers = {
  light: [
    "Warning: Light mode emits a gazillion lumens of pure radiance!",
    "Caution: Light mode ahead! Please don't try this at home.",
    "Only trained professionals can handle this much brightness. Proceed with sunglasses!",
    "Brace yourself! Light mode is about to make everything shine brighter than your future.",
    "Flipping the switch to light mode... Are you sure your eyes are ready for this?",
  ],
  dark: [
    "Light mode? I thought you went insane... but welcome back to the dark side!",
    "Switching to dark mode... How was life on the bright side?",
    "Dark mode activated! Thanks you from the bottom of my heart, and my eyes too.",
    "Welcome back to the shadows. How was life out there in the light?",
    "Dark mode on! Finally, someone who understands true sophistication.",
  ],
};
