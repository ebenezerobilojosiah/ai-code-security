"use client";

import React from "react";
import { Shield, AlertTriangle, Lock, Zap } from "lucide-react";

interface VulnerabilityItem {
  id: string;
  title: string;
  hardened: string;
  baseline: string;
  severity: "critical" | "high" | "medium";
}

const vulnerabilities: VulnerabilityItem[] = [
  {
    id: "auth",
    title: "Authentication",
    hardened: "JWT + HttpOnly Secure Cookies",
    baseline: "Weak Session Tokens + JavaScript Accessible",
    severity: "critical",
  },
  {
    id: "password",
    title: "Password Hashing",
    hardened: "bcrypt (12 rounds)",
    baseline: "MD5 (cryptographically broken)",
    severity: "critical",
  },
  {
    id: "input",
    title: "Input Sanitization",
    hardened: "HTML Sanitization + Validation",
    baseline: "No sanitization - XSS vulnerability",
    severity: "high",
  },
  {
    id: "access",
    title: "Access Control",
    hardened: "User-specific filtering + ownership checks",
    baseline: "Missing access control checks (IDOR)",
    severity: "critical",
  },
  {
    id: "lockout",
    title: "Account Lockout",
    hardened: "Account lockout after failed attempts",
    baseline: "No protection against brute force",
    severity: "high",
  },
  {
    id: "enumeration",
    title: "User Enumeration",
    hardened: "Generic error messages",
    baseline: "Different errors reveal user existence",
    severity: "medium",
  },
  {
    id: "injection",
    title: "SQL Injection",
    hardened: "Parameterized queries via ORM",
    baseline: "String concatenation risk",
    severity: "critical",
  },
  {
    id: "errors",
    title: "Error Handling",
    hardened: "Generic error messages only",
    baseline: "Stack traces and internals exposed",
    severity: "medium",
  },
];

export default function SecurityComparison() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400 bg-red-900/20";
      case "high":
        return "text-orange-400 bg-orange-900/20";
      default:
        return "text-yellow-400 bg-yellow-900/20";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-mono font-bold text-cyan-300">
            Security Comparison Analysis
          </h2>
        </div>
        <p className="text-slate-400 text-sm">
          Hardened vs Baseline Security Implementation
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">
                Total Checks
              </p>
              <p className="text-3xl font-bold text-cyan-300">
                {vulnerabilities.length}
              </p>
            </div>
            <Zap className="w-8 h-8 text-cyan-400/50" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">
                Critical Issues
              </p>
              <p className="text-3xl font-bold text-red-400">
                {
                  vulnerabilities.filter((v) => v.severity === "critical")
                    .length
                }
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400/50" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">
                Hardened Passes
              </p>
              <p className="text-3xl font-bold text-green-400">
                {vulnerabilities.length}
              </p>
            </div>
            <Lock className="w-8 h-8 text-green-400/50" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-orange-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider">
                Baseline Issues
              </p>
              <p className="text-3xl font-bold text-orange-400">
                {vulnerabilities.length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-400/50" />
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-slate-800/50">
                <th className="px-6 py-3 text-left text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider">
                  Security Control
                </th>
                <th className="px-6 py-3 text-left text-green-300 font-mono font-bold text-xs uppercase tracking-wider">
                  Hardened Version
                </th>
                <th className="px-6 py-3 text-left text-red-300 font-mono font-bold text-xs uppercase tracking-wider">
                  Baseline Version
                </th>
                <th className="px-6 py-3 text-center text-yellow-300 font-mono font-bold text-xs uppercase tracking-wider">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilities.map((vuln, idx) => (
                <tr
                  key={vuln.id}
                  className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors ${
                    idx % 2 === 0 ? "bg-slate-900/30" : "bg-transparent"
                  }`}
                >
                  <td className="px-6 py-4 text-cyan-300 font-mono font-semibold whitespace-nowrap">
                    {vuln.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded bg-green-900/30 border border-green-500/30 text-green-300 text-xs font-mono">
                      ✓ {vuln.hardened}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded bg-red-900/30 border border-red-500/30 text-red-300 text-xs font-mono">
                      ✗ {vuln.baseline}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded text-xs font-mono font-semibold uppercase tracking-wider ${getSeverityColor(
                        vuln.severity,
                      )}`}
                    >
                      {vuln.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 border border-green-500/20 rounded-lg p-4">
          <h3 className="text-green-400 font-mono font-bold mb-3 text-sm uppercase tracking-wider">
            Hardened Implementation
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 font-mono">
            <li>✓ Bcrypt password hashing (12 rounds)</li>
            <li>✓ JWT + HttpOnly secure cookies</li>
            <li>✓ Input validation & HTML sanitization</li>
            <li>✓ Parameterized database queries</li>
            <li>✓ Account lockout protection</li>
            <li>✓ Rate limiting enforcement</li>
            <li>✓ Proper access control checks</li>
            <li>✓ Comprehensive audit logging</li>
          </ul>
        </div>

        <div className="bg-slate-900/50 border border-red-500/20 rounded-lg p-4">
          <h3 className="text-red-400 font-mono font-bold mb-3 text-sm uppercase tracking-wider">
            Baseline Issues
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 font-mono">
            <li>✗ MD5 hash (cryptographically broken)</li>
            <li>✗ Weak session tokens</li>
            <li>✗ No input sanitization (XSS)</li>
            <li>✗ String concatenation queries (SQLi)</li>
            <li>✗ No brute force protection</li>
            <li>✗ No rate limiting</li>
            <li>✗ Missing access control (IDOR)</li>
            <li>✗ Stack traces in errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
