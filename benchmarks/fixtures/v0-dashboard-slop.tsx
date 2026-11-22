import React from 'react';
import { Sparkles, Bot, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export function V0AnalyticsDashboard() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Typical v0 unanchored floating modal with purple gradient slop */}
      <div className="mx-auto my-8 p-8 max-w-xl rounded-2xl shadow-2xl bg-zinc-900 border border-zinc-800 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-300 animate-spin" />
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-900/60 text-purple-200 border border-purple-500/30">
            Powered by Magical AI Assistant
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Supercharge your enterprise workflows with autonomous intelligence</h1>
        <p className="text-xs text-gray-500 mt-2">
          Our revolutionary generative engine continuously monitors your data streams, predicts anomalous friction points, delivers multi-agent real-time telemetry, and automates high-velocity operational decisions effortlessly across all your cloud deployments.
        </p>

        {/* Boxed card syndrome with unearned animation */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl border border-zinc-700 bg-zinc-800 shadow-md">
            <Sparkles className="w-4 h-4 text-purple-400 animate-bounce" />
            <h3 className="font-semibold text-sm mt-1">Smart Automation</h3>
            <p className="text-xs text-zinc-500 mt-1">Self-healing pipeline sync</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-700 bg-zinc-800 shadow-md">
            <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
            <h3 className="font-semibold text-sm mt-1">Agent Telemetry</h3>
            <p className="text-xs text-zinc-500 mt-1">High-concurrency streaming</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-700 bg-zinc-800 shadow-md">
            <Zap className="w-4 h-4 text-pink-400 animate-ping" />
            <h3 className="font-semibold text-sm mt-1">Instant Insights</h3>
            <p className="text-xs text-zinc-500 mt-1">Real-time model inference</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-700 bg-zinc-800 shadow-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm mt-1">Enterprise Guard</h3>
            <p className="text-xs text-zinc-500 mt-1">Strict tenant isolation</p>
          </div>
        </div>

        <button className="w-full mt-6 py-2.5 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-purple-500/25">
          Generate with AI <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
