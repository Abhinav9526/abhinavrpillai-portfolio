const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const config = {
  title: "Abhinav R Pillai | Full Stack Software Developer in Kerala",
  description: {
    long: "Abhinav R Pillai is a full stack software developer in Kerala with hands-on experience building scalable web applications using React.js, Node.js, MongoDB, and AI-powered features. He creates fast, responsive, SEO-friendly digital products for startups and businesses.",
    short:
      "Discover the portfolio of Abhinav R Pillai, a full stack software developer in Kerala specializing in React.js, Node.js, MongoDB, ASP.NET, and AI-driven web experiences.",
  },
  keywords: [
    "Abhinav R Pillai",
    "Abhinav R",
    "Pillai",
    "Kerala software developer",
    "software developer in Kerala",
    "best software developer in Kerala",
    "full stack developer Kerala",
    "React developer Kerala",
    "web developer Kerala",
    "portfolio",
    "full stack developer",
    "software engineer",
    "web development",
    "React.js",
    "Node.js",
    "MongoDB",
    "ASP.NET",
    "C#",
    "PostgreSQL",
    "MS SQL",
    "NestJS",
    "ERP Software",
    "HRMS",
  ],
  author: "Abhinav R Pillai",
  email: "rpillaiabhinav@gmail.com",
  site: siteUrl,

  // for github stars button (keep repo name, update user)
  githubUsername: "abhinavrpillai",
  githubRepo: "3d-portfolio",

  get ogImg() {
    return this.site + "/assets/seo/og-image.png";
  },
  social: {
    twitter: "#",
    linkedin: "https://linkedin.com/in/abhinav-r-pillai-6b7b1a248",
    instagram: "https://www.instagram.com/abhinavrpillai/",
    facebook: "#",
    github: "https://github.com/abhinavrpillai",
  },
};
export { config };
