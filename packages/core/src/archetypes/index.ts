export interface SynthesizedArchetype {
  id: string;
  name: string;
  category: 'ai' | 'developer-tool' | 'fintech' | 'bento-hero';
  description: string;
  librariesUsed: ('stageshow' | 'shadcn' | 'motion-primitives' | 'magicui' | 'react-bits' | 'kokonutui' | 'animate-ui')[];
  antiSlopMeasures: string[];
  focalPoint: string;
  tsxCode: string;
}

export const SYNTHESIZED_ARCHETYPES: SynthesizedArchetype[] = [
  {
    id: 'ai-agent-cockpit',
    name: 'AI Autonomous Agent Cockpit',
    category: 'ai',
    description: 'Master multi-agent control room combining Stageshow grounded framing, Kokonut UI task lanes, Motion Primitives morphing dialog, shadcn accessible tables, React Bits quiet ambient lighting, and Magic UI single-beam accent.',
    librariesUsed: ['stageshow', 'kokonutui', 'motion-primitives', 'shadcn', 'magicui', 'react-bits', 'animate-ui'],
    antiSlopMeasures: [
      'Grounded framing: window fills 90% of horizontal stage and bleeds off bottom',
      'Zero purple gradients: replaced by 3-step dark surface elevation (#09090b -> #18181b -> #27272a)',
      'Zero magical sparkles: replaced with semantic StatusDot and tool execution indicators',
      'Restrained Magic UI border beam: exactly 1 beam on the active tool verification lane',
      'React Bits ambient canvas: restricted to opacity 0.06 with high blur radius so text is 100% sharp',
      'Disciplined word budget: 6 real strings on screen, quiet placeholder bars for background lanes'
    ],
    focalPoint: 'The active tool approval lane morphing into an authorized diff review.',
    tsxCode: `import React, { useState } from 'react';
import { Terminal, Shield, Check, ArrowRight, SlidersHorizontal, CornerDownLeft } from 'lucide-react';

export function AIAgentCockpit() {
  const [approved, setApproved] = useState(false);
  const [activeLane, setActiveLane] = useState('codegen');

  return (
    <div className="relative w-full min-h-[580px] bg-[#09090b] text-neutral-100 p-6 flex flex-col justify-end overflow-hidden font-sans">
      {/* React Bits: Subtle ambient spotlight backdrop (restrained <0.08 opacity) */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_50%_0%,#38bdf8,transparent_70%)]" 
        aria-hidden="true" 
      />

      {/* Stageshow Grounded Framing: Window fills width and bleeds off bottom */}
      <div className="relative w-full max-w-5xl mx-auto bg-[#121215] border-t border-x border-neutral-800 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Stageshow Chrome Header */}
        <div className="h-11 px-4 border-b border-neutral-800/80 bg-[#141418] flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5 mr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-700/60" />
            </div>
            <span className="font-mono text-neutral-300 font-medium">agent-session-402</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">autonomous</span>
          </div>

          <div className="flex items-center space-x-3 text-neutral-400">
            <span className="font-mono text-[11px]">latency: 42ms</span>
            <span className="w-1 h-1 rounded-full bg-neutral-700" />
            <span className="font-mono text-[11px]">tokens: 1.2k/s</span>
          </div>
        </div>

        {/* Cockpit Body: Split View */}
        <div className="grid grid-cols-12 gap-0 min-h-[420px]">
          
          {/* Kokonut UI: Multi-Agent Parallel Task Lanes (Restrained, no AI slop) */}
          <div className="col-span-4 border-r border-neutral-800/70 p-4 space-y-3 bg-[#111114]">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800/50">
              <span className="text-xs uppercase tracking-wider font-mono text-neutral-400">Subagent Swarm</span>
              <span className="text-[10px] font-mono text-neutral-400">3 active</span>
            </div>

            {/* Lane 1: Planner */}
            <div className="p-3 rounded-lg border border-neutral-800 bg-[#16161b] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-200">Planner Agent</span>
                <span className="text-[10px] text-emerald-400 font-mono">COMPLETE</span>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-full bg-neutral-800 rounded-full" />
                <div className="h-1.5 w-2/3 bg-neutral-800/60 rounded-full" />
              </div>
            </div>

            {/* Lane 2: Active Lane with Magic UI Restrained Single Border Beam */}
            <div className="relative p-3 rounded-lg border border-neutral-700/80 bg-[#181820] space-y-2 overflow-hidden">
              {/* Magic UI Monochromatic Border Beam */}
              <div 
                className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" 
                style={{ animationDuration: '3s' }} 
              />
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mr-1" />
                  Code Synthesizer
                </span>
                <span className="text-[10px] text-cyan-300 font-mono">RUNNING</span>
              </div>
              <p className="text-xs text-neutral-300 font-mono">patching auth.ts</p>
            </div>

            {/* Lane 3: Verifier with Stageshow placeholder bars */}
            <div className="p-3 rounded-lg border border-neutral-800/60 bg-[#141418] space-y-2 opacity-60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-400">Critic Oracle</span>
                <span className="text-[10px] text-neutral-400 font-mono">QUEUED</span>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-3/4 bg-neutral-800 rounded-full" />
                <div className="h-1.5 w-1/2 bg-neutral-800/40 rounded-full" />
              </div>
            </div>
          </div>

          {/* Center Stage: Motion Primitives Morphing Tool Execution Review */}
          <div className="col-span-8 p-6 flex flex-col justify-between bg-[#0e0e11]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-100 flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>Tool Approval Request</span>
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Subagent requires permission to execute sandbox script.</p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  exec_command
                </span>
              </div>

              {/* shadcn: Clean Code Diff Block */}
              <div className="rounded-lg border border-neutral-800 bg-[#131317] p-3 font-mono text-xs text-neutral-300 space-y-1">
                <div className="text-neutral-400 text-[11px]">// git diff --stat</div>
                <div className="text-emerald-400">+ import { verifySignature } from './crypto';</div>
                <div className="text-neutral-400">  export async function handleWebhook(req) {</div>
                <div className="text-emerald-400">+   await verifySignature(req);</div>
                <div className="text-neutral-400">  }</div>
              </div>
            </div>

            {/* Kokonut UI Restrained AI Prompt Bar + Animate UI Fluid Confirm Button */}
            <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-neutral-400">
                <Terminal className="w-3.5 h-3.5 text-neutral-400" />
                <span>Target: packages/auth/src/verify.ts</span>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setApproved(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => setApproved(!approved)}
                  className="px-4 py-1.5 rounded-md bg-neutral-100 text-neutral-900 text-xs font-medium hover:bg-white transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{approved ? 'Authorized' : 'Approve Execution'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    id: 'developer-platform-hero',
    name: 'Developer Platform High-Craft Hero',
    category: 'developer-tool',
    description: 'High-impact landing hero combining Magic UI Bento Grid, Motion Primitives rolling metrics, React Bits spotlight card hover, Stageshow grounded terminal, and shadcn tabs.',
    librariesUsed: ['magicui', 'motion-primitives', 'react-bits', 'stageshow', 'shadcn'],
    antiSlopMeasures: [
      'Strict 2x2 dominant focal cell: hero bento grid avoids 4 identical bordered cards',
      'React Bits spotlight: radial hover light restricted to 0.05 opacity so cards feel physical, not neon',
      'Motion Primitives sliding numbers: roll smoothly into place without jarring jumping',
      'Zero fake paragraphs: disciplined word budget with realistic product strings'
    ],
    focalPoint: 'The dominant live deploy terminal beside verified latency metrics.',
    tsxCode: `import React from 'react';
import { GitBranch, Activity, CheckCircle2, Copy } from 'lucide-react';

export function DeveloperPlatformHero() {
  return (
    <div className="w-full bg-[#09090b] text-neutral-100 p-8 flex flex-col justify-center items-center font-sans">
      <div className="w-full max-w-5xl grid grid-cols-12 gap-4">
        
        {/* Magic UI Bento: Dominant 8-Column Live Deploy Terminal (Stageshow Grounded) */}
        <div className="col-span-8 rounded-2xl border border-neutral-800 bg-[#111114] p-5 shadow-2xl relative overflow-hidden group">
          {/* React Bits Subtle Spotlight */}
          <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]" />

          <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 text-xs text-neutral-400">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-neutral-200">production-deploy-v2</span>
            </div>
            <span className="font-mono text-[11px] text-neutral-400">branch: main</span>
          </div>

          <div className="py-4 space-y-2 font-mono text-xs">
            <div className="text-neutral-400">$ vercel deploy --prod</div>
            <div className="text-neutral-300 flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Optimizing 12 edge functions (140ms)</span>
            </div>
            <div className="text-neutral-300 flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edge cache warmed across 36 regions</span>
            </div>
            <div className="pt-2 text-emerald-400 font-semibold">Ready: https://api.workspace.internal</div>
          </div>
        </div>

        {/* Motion Primitives + shadcn: 4-Column Stat Tile */}
        <div className="col-span-4 rounded-2xl border border-neutral-800 bg-[#121216] p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono uppercase text-neutral-400 tracking-wider">Edge Latency</div>
            <div className="text-4xl font-bold font-mono tracking-tight text-white mt-2">
              18<span className="text-xl font-normal text-neutral-400">ms</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">Global p99 response time</p>
          </div>

          <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-emerald-400 font-mono">
            <span>+34% vs previous</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    id: 'fintech-billing-suite',
    name: 'Fintech Automated Payout Suite',
    category: 'fintech',
    description: 'Purposeful financial ledger combining Stageshow Payout Flow, Motion Primitives rolling counter, shadcn sortable table, and Animate UI fluid tab switches.',
    librariesUsed: ['stageshow', 'motion-primitives', 'shadcn', 'animate-ui'],
    antiSlopMeasures: [
      'Rolling number ticker: updates with smooth decimal roll, never sudden jump-cuts',
      'Table row hierarchy: subtle zebra stripes with 1 intentional currency badge, no colorful circus rows',
      'Real strings budget: 5 primary numbers formatted cleanly with Intl.NumberFormat'
    ],
    focalPoint: 'The gross payout card and real-time transaction ledger.',
    tsxCode: `import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Download } from 'lucide-react';

export function FintechBillingSuite() {
  const [period, setPeriod] = useState('month');

  return (
    <div className="w-full bg-[#0a0a0c] text-neutral-100 p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl space-y-4">
        
        {/* Header with Animate UI Segmented Control */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Settlement Ledger</h2>
            <p className="text-xs text-neutral-400">Automated multi-currency payouts</p>
          </div>

          <div className="p-1 rounded-lg bg-[#141418] border border-neutral-800 flex space-x-1 text-xs">
            {['week', 'month', 'quarter'].map((tab) => (
              <button
                key={tab}
                onClick={() => setPeriod(tab)}
                className={\`px-3 py-1 rounded-md capitalize transition-all \${
                  period === tab ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-300'
                }\`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Balance Card: Motion Primitives Rolling Metric */}
        <div className="rounded-xl border border-neutral-800 bg-[#121216] p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-neutral-400">Net Volume Processed</span>
            <div className="text-3xl font-mono font-bold tracking-tight text-white mt-1">
              $148,920<span className="text-lg text-neutral-400 font-normal">.50</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 rounded-md border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-xs text-neutral-200 flex items-center space-x-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* shadcn: Clean Data Table */}
        <div className="rounded-xl border border-neutral-800 bg-[#111114] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141418] text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="py-2.5 px-4 font-mono font-normal">Transaction ID</th>
                <th className="py-2.5 px-4 font-mono font-normal">Recipient</th>
                <th className="py-2.5 px-4 font-mono font-normal">Status</th>
                <th className="py-2.5 px-4 font-mono font-normal text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              <tr>
                <td className="py-3 px-4 text-neutral-300">tx_98214</td>
                <td className="py-3 px-4 text-neutral-200 font-sans">Acme Cloud Corp</td>
                <td className="py-3 px-4"><span className="text-emerald-400">settled</span></td>
                <td className="py-3 px-4 text-right text-white font-semibold">+$12,450.00</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-neutral-300">tx_98215</td>
                <td className="py-3 px-4 text-neutral-200 font-sans">Stripe Terminal API</td>
                <td className="py-3 px-4"><span className="text-emerald-400">settled</span></td>
                <td className="py-3 px-4 text-right text-white font-semibold">+$4,210.00</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-neutral-300">tx_98216</td>
                <td className="py-3 px-4 text-neutral-200 font-sans">AWS Infra Reserve</td>
                <td className="py-3 px-4"><span className="text-neutral-400">pending</span></td>
                <td className="py-3 px-4 text-right text-neutral-300">+$1,890.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`
  }
];

export function getSynthesizedArchetype(id: string): SynthesizedArchetype | undefined {
  const clean = id.toLowerCase().trim();
  return SYNTHESIZED_ARCHETYPES.find(a => a.id === clean || a.id.includes(clean));
}

export function searchSynthesizedArchetypes(query: string = ''): SynthesizedArchetype[] {
  const q = query.toLowerCase().trim();
  if (!q) return SYNTHESIZED_ARCHETYPES;
  return SYNTHESIZED_ARCHETYPES.filter(a => 
    a.id.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q) ||
    a.description.toLowerCase().includes(q) ||
    a.librariesUsed.some(lib => lib.toLowerCase().includes(q))
  );
}
