"use client";
import React, { useState } from "react";
import TerminalShell from "@/components/terminal-shell";
import Project3DViewer from "@/components/project-3d-viewer";
import LiveCodeEditor from "@/components/live-code-editor";

type SectionType = "terminal" | "projects" | "code" | "about";

export default function EnhancedPortfolioPage() {
  const [activeSection, setActiveSection] = useState<SectionType>("terminal");

  return (
    <div className="w-full min-h-screen bg-slate-950 relative z-10">
      {/* Navigation Tabs */}
      <div className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 py-2 flex gap-3 overflow-x-auto scrollbar-hide">
          {[
            { id: "terminal", label: "Terminal", icon: "💻" },
            { id: "projects", label: "3D Projects", icon: "🎯" },
            { id: "code", label: "Code Snippets", icon: "📝" },
            { id: "about", label: "About", icon: "👤" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as SectionType)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap text-xs ${
                activeSection === tab.id
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                  : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 min-h-[calc(100vh-80px)]">
        {/* Terminal Section */}
        {activeSection === "terminal" && (
          <div className="animate-fade-in">
            <TerminalShell />
          </div>
        )}

        {/* Projects Section */}
        {activeSection === "projects" && (
          <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl font-bold text-cyan-400 mb-1">Interactive 3D Projects</h1>
                <p className="text-slate-400 text-sm">
                  Hover or click to rotate • Scroll to zoom • Navigate with arrow buttons
                </p>
              </div>
              <Project3DViewer />
            </div>
          </div>
        )}

        {/* Code Section */}
        {activeSection === "code" && (
          <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl font-bold text-cyan-400 mb-1">Code Snippets</h1>
                <p className="text-slate-400 text-sm">
                  Explore my favorite code snippets and implementations
                </p>
              </div>
              <LiveCodeEditor />
            </div>
          </div>
        )}

        {/* About Section */}
        {activeSection === "about" && (
          <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
            <div className="space-y-5">
              <div>
                <h1 className="text-3xl font-bold text-cyan-400 mb-1">About Me</h1>
                <p className="text-slate-400 text-sm">Full Stack Developer | Problem Solver | Tech Enthusiast</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Bio */}
                <div className="space-y-3">
                  <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-cyan-400 mb-2">Who Am I?</h3>
                    <p className="text-slate-300 leading-relaxed text-sm">
                      I'm a Full Stack Developer with 1+ year of hands-on experience building scalable web applications. I specialize in creating intuitive user interfaces and robust backend solutions that solve real-world problems.
                    </p>
                  </div>

                  <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-cyan-400 mb-2">My Passion</h3>
                    <p className="text-slate-300 leading-relaxed text-sm">
                      I'm passionate about building products that make a difference. Whether it's optimizing performance, crafting beautiful UIs, or architecting scalable systems, I bring creativity and technical excellence to every project.
                    </p>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-3">
                  <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-cyan-400 mb-2">Core Technologies</h3>
                    <div className="space-y-2">
                      {[
                        { category: "Frontend", skills: "React.js, Next.js, TypeScript, Tailwind CSS" },
                        { category: "Backend", skills: "Node.js, NestJS, ASP.NET, C#" },
                        { category: "Database", skills: "MongoDB, PostgreSQL, MS SQL" },
                        { category: "Tools", skills: "Git, Docker, AWS, GSAP, Three.js" },
                      ].map((item) => (
                        <div key={item.category}>
                          <div className="text-cyan-400 font-semibold text-xs">{item.category}</div>
                          <div className="text-slate-300 text-xs">{item.skills}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-cyan-400 mb-2">Let's Connect</h3>
                    <div className="space-y-1.5">
                      <a
                        href="mailto:rpillaiabhinav@gmail.com"
                        className="block text-cyan-300 hover:text-cyan-400 text-xs"
                      >
                        📧 rpillaiabhinav@gmail.com
                      </a>
                      <a
                        href="https://linkedin.com/in/abhinav-r-pillai-6b7b1a248"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-cyan-300 hover:text-cyan-400 text-xs"
                      >
                        🔗 LinkedIn
                      </a>
                      <a
                        href="https://github.com/abhinavrpillai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-cyan-300 hover:text-cyan-400 text-xs"
                      >
                        💻 GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
