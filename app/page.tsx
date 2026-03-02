"use client";

import React, { useState } from "react";
import { Terminal, Shield, Zap, Code, Database, Lock } from "lucide-react";
import HackerTerminal from "@/components/terminal";
import SecurityComparison from "@/components/security-comparison";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"terminal" | "comparison">(
    "terminal",
  );
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 211, 238, 0.03) 2px, rgba(34, 211, 238, 0.03) 4px)",
              animation: "scanlines 8s linear infinite",
            }}
          />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-8">
          {/* Logo */}
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-3">
              <Shield className="w-12 h-12 text-cyan-400 animate-pulse" />
              <Code className="w-12 h-12 text-blue-400" />
              <Lock className="w-12 h-12 text-cyan-400 animate-pulse" />
            </div>

            <h1 className="text-5xl md:text-6xl font-mono font-black tracking-tighter">
              <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                SECURITY
              </span>
              <br />
              <span className="text-cyan-300">TESTING FRAMEWORK</span>
            </h1>

            <p className="text-cyan-400/80 font-mono text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              &gt; Hardened vs Baseline API Security Assessment
              <br />
              &gt; Master&apos;s Level Cybersecurity Research
              <br />
              &gt; NIST SSDF & OWASP ASVS Level 2 Compliant
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
              <Terminal className="w-6 h-6 text-cyan-400 mb-2" />
              <h3 className="font-mono font-bold text-cyan-300 text-sm mb-1">
                Testing Terminal
              </h3>
              <p className="text-slate-400 text-xs">
                Execute curl commands against both API versions
              </p>
            </div>

            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
              <Zap className="w-6 h-6 text-cyan-400 mb-2" />
              <h3 className="font-mono font-bold text-cyan-300 text-sm mb-1">
                Security Analysis
              </h3>
              <p className="text-slate-400 text-xs">
                Compare hardened vs baseline vulnerabilities
              </p>
            </div>

            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
              <Database className="w-6 h-6 text-cyan-400 mb-2" />
              <h3 className="font-mono font-bold text-cyan-300 text-sm mb-1">
                Next.js API Routes
              </h3>
              <p className="text-slate-400 text-xs">
                Full TypeScript implementation with complete security
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowWelcome(false)}
              className="relative px-8 py-3 font-mono font-bold text-cyan-300 border-2 border-cyan-400 rounded group overflow-hidden transition-all hover:shadow-lg hover:shadow-cyan-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <span className="relative flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                ENTER TESTING FRAMEWORK
              </span>
            </button>
          </div>

          {/* Tech Stack */}
          <div className="text-center text-xs font-mono text-slate-500 space-y-1">
            <p>
              Next.js 16 • TypeScript • Node.js • Hardened vs Baseline
              Comparison
            </p>
            <p>
              bcrypt • JWT • Input Sanitization • Access Control • Rate Limiting
            </p>
          </div>
        </div>

        <style>{`
          @keyframes scanlines {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(10px);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6">
      {/* Animated background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34, 211, 238, 0.03) 2px, rgba(34, 211, 238, 0.03) 4px)",
            animation: "scanlines 8s linear infinite",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="w-8 h-8 text-cyan-400" />
                <div className="absolute inset-0 animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-4xl font-mono font-black tracking-tighter">
                <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  SECURITY TESTING
                </span>
                <br />
                <span className="text-cyan-300">FRAMEWORK</span>
              </h1>
            </div>
            <p className="text-slate-400 font-mono text-sm">
              &gt; Hardened vs Baseline API Security Assessment Suite
            </p>
          </div>

          <button
            onClick={() => setShowWelcome(true)}
            className="px-4 py-2 font-mono text-sm text-slate-400 border border-slate-600 rounded hover:border-slate-500 hover:text-slate-300 transition-all"
          >
            EXIT
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-3 border-b border-cyan-500/20 overflow-x-auto">
          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "terminal"
                ? "text-cyan-400 border-cyan-400 shadow-lg shadow-cyan-500/20"
                : "text-slate-400 border-transparent hover:text-slate-300"
            }`}
          >
            <Terminal className="w-4 h-4" />
            Testing Terminal
          </button>
          <button
            onClick={() => setActiveTab("comparison")}
            className={`flex items-center gap-2 px-4 py-3 font-mono text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
              activeTab === "comparison"
                ? "text-cyan-400 border-cyan-400 shadow-lg shadow-cyan-500/20"
                : "text-slate-400 border-transparent hover:text-slate-300"
            }`}
          >
            <Zap className="w-4 h-4" />
            Security Analysis
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[600px] bg-gradient-to-b from-slate-900/50 to-slate-950/50 border border-cyan-500/20 rounded-lg p-6 backdrop-blur-sm overflow-auto">
          {activeTab === "terminal" && <HackerTerminal />}
          {activeTab === "comparison" && <SecurityComparison />}
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded p-4 hover:border-cyan-500/40 transition-all">
            <div className="text-cyan-400 mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Status
            </div>
            <div className="text-slate-300">System Operational</div>
          </div>

          <div className="bg-slate-900/50 border border-cyan-500/20 rounded p-4 hover:border-cyan-500/40 transition-all">
            <div className="text-cyan-400 mb-2">API Endpoints</div>
            <div className="text-slate-300 text-xs">
              /api/hardened & /api/baseline
            </div>
          </div>

          <div className="bg-slate-900/50 border border-cyan-500/20 rounded p-4 hover:border-cyan-500/40 transition-all">
            <div className="text-cyan-400 mb-2">Backend</div>
            <div className="text-slate-300">
              Next.js API Routes • TypeScript
            </div>
          </div>

          <div className="bg-slate-900/50 border border-cyan-500/20 rounded p-4 hover:border-cyan-500/40 transition-all">
            <div className="text-cyan-400 mb-2">Version</div>
            <div className="text-slate-300">Framework v2.0.1</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanlines {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(10px);
          }
        }

        @keyframes glitch {
          0% {
            clip-path: inset(40% 0 61% 0);
            transform: translate(0);
          }
          20% {
            clip-path: inset(92% 0 1% 0);
            transform: translate(-2px, 2px);
          }
          40% {
            clip-path: inset(43% 0 1% 0);
            transform: translate(-2px, -2px);
          }
          60% {
            clip-path: inset(25% 0 58% 0);
            transform: translate(2px, 2px);
          }
          80% {
            clip-path: inset(54% 0 7% 0);
            transform: translate(2px, -2px);
          }
          100% {
            clip-path: inset(58% 0 43% 0);
            transform: translate(0);
          }
        }

        .animate-glitch {
          animation: glitch 0.3s infinite;
        }

        .neon-cyan {
          text-shadow: 0 0 10px rgba(34, 211, 238, 0.8),
                      0 0 20px rgba(34, 211, 238, 0.5),
                      0 0 30px rgba(34, 211, 238, 0.3);
        }

        .neon-green {
          text-shadow: 0 0 10px rgba(74, 222, 128, 0.8),
                      0 0 20px rgba(74, 222, 128, 0.5),
                      0 0 30px rgba(74, 222, 128, 0.3);
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.3);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.5);
        }
      `}</style>
    </div>
  );
}
