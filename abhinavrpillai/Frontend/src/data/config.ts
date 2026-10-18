const config = {
  title: "Abhinav R Pillai | Full Stack Developer",
  description: {
    long: "Full Stack Developer with 1+ year of hands-on experience building scalable web applications using React.js, Node.js, and MongoDB. Proficient in developing end-to-end solutions, including responsive front-end interfaces and robust backend APIs.",
    short:
      "Discover the portfolio of Abhinav R Pillai, a Full Stack Developer specializing in React.js, Node.js, MongoDB, and ASP.NET.",
  },
  keywords: [
    "Abhinav R Pillai",
    "Abhinav R",
    "Pillai",
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
  site: "https://linkedin.com/in/abhinav-r-pillai-6b7b1a248",

  // for github stars button (keep repo name, update user)
  githubUsername: "abhinavrpillai",
  githubRepo: "3d-portfolio",

  get ogImg() {
    return this.site + "/assets/seo/og-image.png";
  },
  social: {
    twitter: "#",
    linkedin: "https://linkedin.com/in/abhinav-r-pillai-6b7b1a248",
    instagram: "#",
    facebook: "#",
    github: "https://github.com/abhinavrpillai",
  },
};
export { config };
