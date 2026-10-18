"use client";
import React, { useState } from "react";
import { Copy, Check, Play, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  output?: string;
  category: string;
}

const codeSnippets: CodeSnippet[] = [
  {
    id: "1",
    title: "Express Server Setup",
    description: "Initialize a basic Express.js server with middleware",
    language: "javascript",
    category: "Backend",
    code: `const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/api/data', (req, res) => {
  res.json({ message: 'Success!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
    output: "Server running on port 3000",
  },
  {
    id: "2",
    title: "React Hook Example",
    description: "Custom hook for fetching data with loading state",
    language: "typescript",
    category: "Frontend",
    code: `const useFetch = (url: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
};`,
    output: "Hook ready to use",
  },
  {
    id: "3",
    title: "MongoDB Query",
    description: "Find and update documents in MongoDB",
    language: "javascript",
    category: "Database",
    code: `const user = await User.findById(userId);

const updated = await User.updateOne(
  { _id: userId },
  { $set: { email: newEmail } }
);

const users = await User.find({ 
  role: 'admin' 
}).limit(10).sort({ createdAt: -1 });`,
    output: "Query executed successfully",
  },
  {
    id: "4",
    title: "Tailwind Component",
    description: "Reusable button component with variants",
    language: "typescript",
    category: "Frontend",
    code: `export const Button = ({ 
  children, 
  variant = 'primary', 
  ...props 
}: ButtonProps) => (
  <button
    className={cn(
      'px-4 py-2 rounded font-medium transition-all',
      {
        'bg-blue-500 hover:bg-blue-600': variant === 'primary',
        'bg-gray-200 hover:bg-gray-300': variant === 'secondary',
      }
    )}
    {...props}
  >
    {children}
  </button>
);`,
    output: "Component exported",
  },
];

const languageColors: Record<string, string> = {
  javascript: "text-yellow-400",
  typescript: "text-blue-400",
  python: "text-green-400",
  sql: "text-purple-400",
  jsx: "text-cyan-400",
  tsx: "text-cyan-400",
};

export default function LiveCodeEditor() {
  const [selectedSnippet, setSelectedSnippet] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [executedCode, setExecutedCode] = useState<string | null>(null);

  const snippet = codeSnippets[selectedSnippet];

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const runCode = (id: string) => {
    setExecutedCode(id);
    setTimeout(() => setExecutedCode(null), 2000);
  };

  const categories = [...new Set(codeSnippets.map((s) => s.category))];

  return (
    <div className="w-full space-y-4">
      {/* Snippet Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {codeSnippets.map((snippet, idx) => (
          <button
            key={snippet.id}
            onClick={() => setSelectedSnippet(idx)}
            className={cn(
              "p-2 rounded-lg border transition-all text-left text-xs",
              idx === selectedSnippet
                ? "bg-cyan-500/20 border-cyan-500/50"
                : "bg-slate-800/50 border-slate-700 hover:bg-slate-800/70"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-xs font-semibold text-slate-300">{snippet.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{snippet.description}</p>
              </div>
              <span className={cn("text-xs font-mono px-2 py-1 rounded bg-slate-900", languageColors[snippet.language])}>
                {snippet.language}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Code Editor Display */}
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-800/50 px-3 py-2 rounded-t-lg border border-cyan-500/20">
          <div>
            <h3 className="text-xs font-bold text-cyan-400">{snippet.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{snippet.description}</p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => runCode(snippet.id)}
              className={cn(
                "p-1.5 rounded border transition-all",
                executedCode === snippet.id
                  ? "bg-green-500/20 border-green-500/50"
                  : "bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20"
              )}
              title="Run code"
            >
              {executedCode === snippet.id ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Play className="w-3 h-3 text-cyan-300" />
              )}
            </button>
            <button
              onClick={() => copyCode(snippet.code, snippet.id)}
              className="p-1.5 rounded border bg-slate-700/50 border-slate-600 hover:bg-slate-700 transition-all"
              title="Copy code"
            >
              {copiedId === snippet.id ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Code Block */}
        <div className="bg-slate-950/80 border border-cyan-500/10 rounded-b-lg overflow-hidden">
          <pre className="p-3 overflow-x-auto text-xs text-slate-300 font-mono leading-relaxed">
            <code>{snippet.code}</code>
          </pre>
        </div>

        {/* Output */}
        {snippet.output && (
          <div className="bg-slate-900/50 border border-lime-500/20 rounded p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-xs font-mono text-lime-400">OUTPUT</span>
            </div>
            <div className="text-xs font-mono text-lime-300">{snippet.output}</div>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-gradient-to-r from-slate-800/20 to-cyan-500/5 border border-cyan-500/10 rounded p-3">
        <div className="text-xs">
          <div className="text-cyan-400 font-semibold">✨ Syntax Highlighting</div>
          <div className="text-slate-400 text-xs mt-0.5">Color-coded for readability</div>
        </div>
        <div className="text-xs">
          <div className="text-cyan-400 font-semibold">📋 Copy & Paste Ready</div>
          <div className="text-slate-400 text-xs mt-0.5">One-click code copying</div>
        </div>
        <div className="text-xs">
          <div className="text-cyan-400 font-semibold">▶️ Execution Preview</div>
          <div className="text-slate-400 text-xs mt-0.5">See expected output instantly</div>
        </div>
      </div>

      {/* Categories Info */}
      <div className="text-xs text-slate-400 font-mono">
        Showing {codeSnippets.length} code snippets • Categories: {categories.join(", ")}
      </div>
    </div>
  );
}
