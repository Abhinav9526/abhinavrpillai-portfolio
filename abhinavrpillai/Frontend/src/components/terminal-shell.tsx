"use client";
import React, { useState, useEffect, useRef } from "react";
import { Terminal, ChevronRight, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandOutput {
  id: string;
  command: string;
  output: string | React.ReactNode;
  type: "command" | "output" | "error" | "info";
}

export default function TerminalShell() {
  const [commandHistory, setCommandHistory] = useState<CommandOutput[]>([
    {
      id: "0",
      command: "",
      output: (
        <div className="space-y-1">
          <div className="text-cyan-400 font-mono">Welcome to Abhinav's Developer Terminal</div>
          <div className="text-slate-300 text-sm">Type 'help' to see available commands</div>
        </div>
      ),
      type: "info",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const commands: Record<string, (...args: string[]) => Promise<string | React.ReactNode>> = {
    help: async (..._args) => (
      <div className="space-y-1">
        <div className="text-lime-400">Available Commands:</div>
        <div className="text-slate-300 text-sm space-y-0.5">
          <div><span className="text-cyan-300">skills</span> - View technical skills & languages</div>
          <div><span className="text-cyan-300">experience</span> - Show work experience</div>
          <div><span className="text-cyan-300">projects</span> - Browse portfolio projects</div>
          <div><span className="text-cyan-300">contact</span> - Get in touch</div>
          <div><span className="text-cyan-300">about</span> - About me</div>
          <div><span className="text-cyan-300">clear</span> - Clear terminal</div>
          <div><span className="text-cyan-300">github [username]</span> - View GitHub profile</div>
        </div>
      </div>
    ),

    about: async (..._args) => (
      <div className="space-y-2 text-slate-300">
        <div className="text-cyan-400 font-mono">$ About Abhinav R Pillai</div>
        <div>Full Stack Developer with 1+ year of experience</div>
        <div>📍 Specializing in: React.js, Node.js, MongoDB, ASP.NET, C#</div>
        <div>🎯 Passionate about building scalable web applications</div>
        <div>💡 Problem solver & continuous learner</div>
      </div>
    ),

    skills: async (..._args) => (
      <div className="space-y-2">
        <div className="text-lime-400 font-mono">$ Skills & Technologies</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-cyan-400">Frontend</div>
            <div className="text-slate-300">React.js, Next.js, TypeScript</div>
          </div>
          <div>
            <div className="text-cyan-400">Backend</div>
            <div className="text-slate-300">Node.js, NestJS, ASP.NET, C#</div>
          </div>
          <div>
            <div className="text-cyan-400">Database</div>
            <div className="text-slate-300">MongoDB, PostgreSQL, MS SQL</div>
          </div>
          <div>
            <div className="text-cyan-400">Tools & Others</div>
            <div className="text-slate-300">Git, Docker, AWS, Tailwind CSS</div>
          </div>
        </div>
      </div>
    ),

    experience: async (..._args) => (
      <div className="space-y-3 text-slate-300 text-sm">
        <div className="text-lime-400 font-mono">$ Professional Experience</div>
        <div className="border-l-2 border-cyan-500/30 pl-3 space-y-2">
          <div>
            <div className="text-cyan-400">Full Stack Developer</div>
            <div className="text-slate-400 text-xs">1+ years | Building scalable web solutions</div>
            <div className="mt-1">• Developed end-to-end MERN stack applications</div>
            <div>• Implemented responsive UI with React & Tailwind</div>
            <div>• Designed robust APIs with Node.js & Express</div>
          </div>
        </div>
      </div>
    ),

    projects: async (..._args) => (
      <div className="space-y-2">
        <div className="text-lime-400 font-mono">$ Featured Projects</div>
        <div className="text-slate-300 text-sm space-y-2">
          <div className="border border-cyan-500/20 rounded p-2">
            <div className="text-cyan-300">1. E-commerce Platform (BuyIT)</div>
            <div className="text-slate-400">React | Node.js | MongoDB</div>
          </div>
          <div className="border border-cyan-500/20 rounded p-2">
            <div className="text-cyan-300">2. Social Network (PeakPosts)</div>
            <div className="text-slate-400">MERN Stack | Real-time Updates</div>
          </div>
          <div className="border border-cyan-500/20 rounded p-2">
            <div className="text-cyan-300">3. Task Management (Kanbi)</div>
            <div className="text-slate-400">Next.js | Firebase | Drag & Drop</div>
          </div>
        </div>
        <div className="text-slate-400 text-xs">Type 'projects --detail' for more info</div>
      </div>
    ),

    contact: async (..._args) => (
      <div className="space-y-2">
        <div className="text-lime-400 font-mono">$ Let's Connect</div>
        <div className="space-y-1 text-slate-300 text-sm">
          <div>📧 Email: rpillaiabhinav@gmail.com</div>
          <div>🔗 LinkedIn: linkedin.com/in/abhinav-r-pillai-6b7b1a248</div>
          <div>💻 GitHub: github.com/abhinavrpillai</div>
          <div>🌐 Portfolio: https://abhinavrpillai.dev</div>
        </div>
      </div>
    ),

    clear: async (..._args) => {
      setCommandHistory([
        {
          id: String(Date.now()),
          command: "",
          output: <div className="text-slate-400 text-xs">Terminal cleared. Type 'help' for commands.</div>,
          type: "info",
        },
      ]);
      setInputValue("");
      return "";
    },

    github: async (username = "") => {
      if (!username) return "Usage: github [username]";
      return `Opening GitHub profile: github.com/${username}`;
    },

    unknown: async (cmd: string = "") => (
      <div className="text-red-400 text-sm">Command not found: <span className="text-red-300">{cmd}</span></div>
    ),
  };

  const handleExecuteCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsExecuting(true);
    const trimmedInput = inputValue.trim();

    // Add user command to history
    setCommandHistory((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        command: trimmedInput,
        output: "",
        type: "command",
      },
    ]);

    // Parse command
    const [mainCmd, ...args] = trimmedInput.toLowerCase().split(" ");
    const cmdFunction = commands[mainCmd as keyof typeof commands] || commands.unknown;

    try {
      const output = mainCmd === "clear"
      ? ""
      : await cmdFunction(mainCmd === "unknown" ? trimmedInput : args.join(" "));

      if (mainCmd !== "clear") {
        setCommandHistory((prev) => [
          ...prev,
          {
            id: String(Date.now()) + Math.random(),
            command: trimmedInput,
            output,
            type: "output",
          },
        ]);
      }
    } catch (error) {
      setCommandHistory((prev) => [
        ...prev,
        {
          id: String(Date.now()) + Math.random(),
          command: trimmedInput,
          output: `Error executing command: ${error}`,
          type: "error",
        },
      ]);
    }

    setInputValue("");
    setIsExecuting(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 font-mono">
      {/* Terminal Header */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-cyan-500/20 px-4 py-2">
        <div className="flex items-center gap-2 max-w-6xl mx-auto">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 text-xs font-semibold">developer@abhinav:~/portfolio$</span>
          <span className="text-slate-400 text-xs ml-auto">v1.0.0</span>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="max-w-6xl mx-auto p-3 space-y-2 min-h-[calc(100vh-100px)] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-slate-950"
      >
        {commandHistory.map((item, idx) => (
          <div key={item.id} className="space-y-1">
            {item.type === "command" && (
              <div className="flex items-start gap-2 group">
                <ChevronRight className="w-3 h-3 text-lime-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 break-words">
                  <span className="text-lime-400 text-xs">{item.command}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(item.command, item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-800 rounded"
                  title="Copy command"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3 h-3 text-green-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              </div>
            )}
            {item.type !== "command" && item.output && (
              <div className={cn("ml-5 break-words text-xs", {
                "text-red-400": item.type === "error",
                "text-cyan-300": item.type === "info",
              })}>
                {item.output}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Terminal Input */}
      <div className="sticky bottom-0 bg-gradient-to-t from-slate-950 to-slate-950/80 border-t border-cyan-500/20 px-4 py-2">
        <form onSubmit={handleExecuteCommand} className="max-w-6xl mx-auto flex items-center gap-2">
          <ChevronRight className="w-3 h-3 text-lime-400 flex-shrink-0" />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a command... (help)"
            disabled={isExecuting}
            className="flex-1 bg-transparent text-lime-400 placeholder-slate-600 outline-none text-xs"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
