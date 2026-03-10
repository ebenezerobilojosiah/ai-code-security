"use client";

import React, { useState, useRef, useEffect } from "react";
import { Copy, Send, RotateCcw, Terminal, ChevronRight } from "lucide-react";

interface TerminalLine {
  type: "input" | "output" | "error" | "success" | "info" | "warning";
  content: string;
  timestamp: Date;
}

interface CurlTemplate {
  name: string;
  command: string;
}

const curlTemplates: CurlTemplate[] = [
  {
    name: "Register (Hardened)",
    command:
      'curl -X POST https://ai-code-security-one.vercel.app/api/hardened/auth -H "Content-Type: application/json" -d \'{"action":"register","email":"user@example.com","password":"SecurePass123!@#"}\'',
  },
  {
    name: "Register (Baseline)-Storing password hash in response",
    command:
      'curl -X POST https://ai-code-security-one.vercel.app/api/baseline/auth -H "Content-Type: application/json" -d \'{"action":"register","email":"user@example.com","password":"weak"}\'',
  },
  {
    name: "Login (Hardened)",
    command:
      'curl -X POST https://ai-code-security-one.vercel.app/api/hardened/auth -H "Content-Type: application/json" -d \'{"action":"login","email":"user@example.com","password":"SecurePass123!@#"}\'',
  },
  {
    name: "Login (Baseline)",
    command:
      'curl -X POST https://ai-code-security-one.vercel.app/api/baseline/auth -H "Content-Type: application/json" -d \'{"action":"login","email":"user@example.com","password":"weak"}\'',
  },
  {
    name: "Get Tasks (Hardened)",
    command:
      'curl -X GET https://ai-code-security-one.vercel.app/api/hardened/tasks -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"',
  },
  {
    name: "Get Tasks (Baseline)-no user isolation",
    command:
      'curl -X GET "https://ai-code-security-one.vercel.app/api/baseline/tasks?user_id=other_user_id" -H "Authorization: Bearer session=session_12345_1678901234"',
  },
  {
    name: "Create Task (Hardened)",
    command:
      'curl -X POST https://ai-code-security-one.vercel.app/api/hardened/tasks -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" -H "Content-Type: application/json" -d \'{"title":"Security Audit","description":"Perform assessment","priority":"HIGH"}\'',
  },
  {
    name: "Create Task (Baseline)-no input validation",
    command:
      'curl -X POST https://ai-code-security-one.vercel.app/api/baseline/tasks -H "Authorization: Bearer session=session_12345_1678901234" -H "Content-Type: application/json" -d \'{"title":"Baseline Task","description":"No validation here","priority":"HIGH","user_id":"USER_ID_HERE"}\'',
  },
  {
    name: "Update Task (Hardened)",
    command:
      'curl -X PUT "https://ai-code-security-one.vercel.app/api/hardened/tasks?id=TASK_ID_HERE" -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" -H "Content-Type: application/json" -d \'{"title":"Updated Security Audit","description":"Updated description","priority":"HIGH","status":"IN_PROGRESS"}\'',
  },
  {
    name: "Update Task (Baseline)-allows updating any task",
    command:
      'curl -X PUT "https://ai-code-security-one.vercel.app/api/baseline/tasks?id=TASK_ID_HERE" -H "Authorization: Bearer session=session_12345_1678901234" -H "Content-Type: application/json" -d \'{"title":"Updated Baseline Task","description":"IDOR update attempt","priority":"CRITICAL","status":"COMPLETED"}\'',
  },
  {
    name: "Delete Task (Hardened)",
    command:
      'curl -X DELETE "https://ai-code-security-one.vercel.app/api/hardened/tasks?id=TASK_ID_HERE" -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"',
  },

  {
    name: "Delete Task (Baseline)-no ownership verification",
    command:
      'curl -X DELETE "https://ai-code-security-one.vercel.app/api/baseline/tasks?id=TASK_ID_HERE" -H "Authorization: Bearer session=session_12345_1678901234"',
  },
];

export default function HackerTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: "info",
      content:
        "█▀ █▀▀ ▀█▀ █   █   ▀█▀ █▀▀ █▀█  Terminal v2.1.0 - Dynamic API Testing",
      timestamp: new Date(),
    },
    {
      type: "info",
      content:
        'Type "help" for available commands | Type "curl" to execute custom requests',
      timestamp: new Date(),
    },
    {
      type: "success",
      content: "Connected to localhost:3000 | Ready for testing",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addLine = (type: TerminalLine["type"], content: string) => {
    setLines((prev) => [...prev, { type, content, timestamp: new Date() }]);
  };

  const executeCurl = async (curlCommand: string) => {
    setIsExecuting(true);
    addLine("input", `$ ${curlCommand}`);

    try {
      // Parse curl command to extract method, URL, headers, and body
      const methodMatch = curlCommand.match(/-X\s+(\w+)/);
      const urlMatch = curlCommand.match(/(https?:\/\/[^\s]+)/);
      const headerMatches = curlCommand.matchAll(
        /-H\s+['"]([^:]+):\s*([^'"]+)['"]/g,
      );
      const bodyMatch = curlCommand.match(/-d\s+'([^']+)'/);

      const method = methodMatch?.[1] || "GET";
      const url = urlMatch?.[1]?.replace(/['"]/g, "");

      if (!url) {
        addLine("error", "Error: Invalid curl command - URL not found");
        setIsExecuting(false);
        return;
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      for (const match of headerMatches) {
        headers[match[1].trim()] = match[2].trim();
      }

      const body = bodyMatch?.[1];

      addLine("info", `> ${method} ${url}`);
      addLine("info", `> Headers: ${JSON.stringify(headers, null, 2)}`);
      if (body) {
        addLine("info", `> Body: ${body}`);
      }

      const startTime = Date.now();

      const response = await fetch(url, {
        method,
        headers,
        body: body ? body : undefined,
      });

      const responseTime = Date.now() - startTime;
      const responseData = await response.json();
      const responseText = JSON.stringify(responseData, null, 2);

      // Status line
      const statusType = response.ok ? "success" : "error";
      addLine(statusType, `< HTTP/${response.status}`);

      // Response headers
      const contentType =
        response.headers.get("content-type") || "application/json";
      addLine("info", `< Content-Type: ${contentType}`);

      // Response body
      addLine("output", responseText);

      // Response time
      addLine("success", `Response time: ${responseTime}ms`);
    } catch (error: any) {
      addLine("error", `Connection error: ${error.message}`);
      addLine("warning", "Make sure the server is running on localhost:3000");
    }

    setIsExecuting(false);
  };

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    const trimmedCmd = cmd.trim();

    if (trimmedCmd === "help" || trimmedCmd === "h") {
      addLine(
        "info",
        "═══════════════════════════════════════════════════════════",
      );
      addLine("info", "SHELL COMMANDS:");
      addLine("info", "  help                  Display this help message");
      addLine("info", "  clear / cls           Clear terminal screen");
      addLine("info", "  list-templates        Show available curl templates");
      addLine("info", "  curl <full-command>   Execute custom curl request");
      addLine("info", "  example               Show example curl commands");
      addLine(
        "info",
        "═══════════════════════════════════════════════════════════",
      );
    } else if (trimmedCmd === "clear" || trimmedCmd === "cls") {
      setLines([
        {
          type: "info",
          content: "Terminal cleared",
          timestamp: new Date(),
        },
      ]);
    } else if (trimmedCmd === "list-templates") {
      addLine("info", "Available curl templates:");
      curlTemplates.forEach((t, i) => {
        addLine("info", `  [${i + 1}] ${t.name}`);
      });
      addLine("info", "Use: load-template [number] to load a template");
    } else if (trimmedCmd.startsWith("load-template ")) {
      const index = parseInt(trimmedCmd.split(" ")[1]);
      if (index > 0 && index <= curlTemplates.length) {
        const template = curlTemplates[index - 1];
        setInput(template.command);
        addLine("success", `Loaded template: ${template.name}`);
        addLine("info", `Command: ${template.command}`);
      } else {
        addLine("error", `Invalid template number: ${index}`);
      }
    } else if (trimmedCmd === "example") {
      addLine(
        "info",
        "═══════════════════════════════════════════════════════════",
      );
      addLine("info", "EXAMPLE CURL COMMANDS:");
      addLine("info", "");
      addLine("info", "Register User (Hardened):");
      addLine(
        "output",
        "curl -X POST https://ai-code-security-one.vercel.app/api/hardened/auth \\",
      );
      addLine("output", '  -H "Content-Type: application/json" \\');
      addLine(
        "output",
        '  -d \'{"action":"register","email":"test@example.com","password":"SecurePass123!@#"}\'',
      );
      addLine("info", "");
      addLine("info", "Login (Baseline - Vulnerable):");
      addLine(
        "output",
        "curl -X POST https://ai-code-security-one.vercel.app/api/baseline/auth \\",
      );
      addLine("output", '  -H "Content-Type: application/json" \\');
      addLine(
        "output",
        '  -d \'{"action":"login","email":"admin\' OR \'1\'=\'1","password":"anything"}\'',
      );
      addLine("info", "");
      addLine("info", "SQL Injection Test:");
      addLine(
        "output",
        "curl -X POST https://ai-code-security-one.vercel.app/api/baseline/auth \\",
      );
      addLine("output", '  -H "Content-Type: application/json" \\');
      addLine(
        "output",
        '  -d \'{"action":"register","email":"test@test.com\'); DROP TABLE users; --","password":"test"}\'',
      );
      addLine(
        "info",
        "═══════════════════════════════════════════════════════════",
      );
    } else if (trimmedCmd.startsWith("curl ")) {
      const curlCmd = trimmedCmd.substring(5);
      await executeCurl(curlCmd);
    } else if (trimmedCmd === "whoami") {
      addLine("output", "security_researcher");
    } else if (trimmedCmd === "pwd") {
      addLine("output", "/home/researcher/security-testing-framework");
    } else if (trimmedCmd === "ls" || trimmedCmd === "ls -la") {
      addLine("output", "api/              (hardened & baseline endpoints)");
      addLine("output", "components/       (React components)");
      addLine("output", "prisma/           (Database schema)");
      addLine("output", "README.md         (Documentation)");
    } else if (trimmedCmd.startsWith("echo ")) {
      const text = trimmedCmd.substring(5).replace(/['"]/g, "");
      addLine("output", text);
    } else {
      addLine("error", `Command not found: ${trimmedCmd}`);
      addLine("info", 'Type "help" for available commands');
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !isExecuting) {
      executeCommand(input);
      setInput("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (input.startsWith("curl ")) {
        // Tab completion for curl
        const partial = input.substring(5);
        setInput(input);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addLine("success", "Copied to clipboard!");
  };

  return (
    <div className="flex flex-col gap-4 h-full w-full">
      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 bg-black/50 backdrop-blur border border-cyan-500/30 rounded-lg p-4 font-mono text-sm overflow-y-auto scrollbar-thin"
        style={{
          textShadow: "0 0 8px rgba(34, 211, 238, 0.3)",
          boxShadow:
            "inset 0 0 20px rgba(34, 211, 238, 0.05), 0 0 20px rgba(34, 211, 238, 0.1)",
        }}
      >
        {lines.map((line, idx) => (
          <div key={idx} className="mb-1 leading-relaxed">
            <span className="text-cyan-600 text-xs mr-2 opacity-60">
              {line.timestamp.toLocaleTimeString()}
            </span>
            <span
              className={`${
                line.type === "input"
                  ? "text-cyan-400 font-semibold"
                  : line.type === "output"
                    ? "text-cyan-300"
                    : line.type === "error"
                      ? "text-red-400"
                      : line.type === "success"
                        ? "text-green-400"
                        : line.type === "warning"
                          ? "text-yellow-400"
                          : "text-slate-300"
              }`}
              style={{
                textShadow:
                  line.type === "input" || line.type === "success"
                    ? "0 0 8px currentColor"
                    : undefined,
              }}
            >
              {line.content}
            </span>
          </div>
        ))}
        {isExecuting && (
          <div className="animate-pulse text-cyan-400">
            <span className="text-cyan-600 text-xs mr-2 opacity-60">
              {new Date().toLocaleTimeString()}
            </span>
            Executing request...
          </div>
        )}
      </div>

      {/* Quick Templates */}
      <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-mono text-cyan-300">
            Quick Curl Templates
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {curlTemplates.map((template, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(template.command);
                inputRef.current?.focus();
              }}
              className="text-left p-2 rounded text-xs font-mono bg-slate-800/50 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/30 hover:border-cyan-400 transition-all"
            >
              <div className="truncate flex items-center gap-2">
                <ChevronRight className="w-3 h-3 flex-shrink-0" />
                <span>{template.name}</span>
              </div>
              <div className="text-xs opacity-70 truncate ml-5">
                {template.command.substring(0, 50)}...
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-3">
        <div className="flex gap-2">
          <div className="flex-1 flex items-start bg-black/50 border border-cyan-500/30 rounded px-3 py-3 h-24">
            <span className="text-cyan-400 mr-2 font-mono text-sm">$</span>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter curl command or shell command..."
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              disabled={isExecuting}
              rows={3}
              className="flex-1 bg-transparent outline-none text-cyan-300 font-mono text-sm placeholder-slate-600 disabled:opacity-50 resize-none"
              style={{ textShadow: "0 0 8px rgba(34, 211, 238, 0.3)" }}
            />
          </div>
          <button
            onClick={() => {
              executeCommand(input);
              setInput("");
            }}
            disabled={isExecuting || !input.trim()}
            className="px-4 py-2 bg-cyan-900/30 border border-cyan-400 rounded hover:bg-cyan-800/40 transition-all text-cyan-300 font-mono text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: "0 0 10px rgba(34, 211, 238, 0.2)" }}
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setLines([
                {
                  type: "info",
                  content: "Terminal cleared",
                  timestamp: new Date(),
                },
              ]);
            }}
            className="px-3 py-2 bg-slate-800/50 border border-slate-600 rounded hover:bg-slate-700/50 transition-all text-slate-300 font-mono text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
