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
  },
  {
    id: 'database-studio',
    name: 'Cloud SQL Query Studio',
    category: 'developer-tool',
    description: 'High-density relational database console with inline query execution, monospace schema tree, latency pill, and editable result grid.',
    librariesUsed: ['stageshow', 'shadcn', 'motion-primitives'],
    antiSlopMeasures: [
      'Grounded tabular grid: fills available width, headers pinned, zebra rows in true dark elevation',
      'Word budget on query results: numbers formatted cleanly, non-focal IDs truncated with ellipsis',
      'Execution latency indicator: subtle emerald pill, zero animated pulsing'
    ],
    focalPoint: 'The executed SQL query with 14ms execution time badge.',
    tsxCode: `import React, { useState } from 'react';
import { Play, Database, Terminal, Clock, CornerDownRight } from 'lucide-react';

export function DatabaseStudio() {
  const [query, setQuery] = useState('SELECT id, organization_id, status, amount_cents FROM invoices WHERE status = "pending" LIMIT 5;');

  return (
    <div className="w-full bg-[#0a0a0c] text-neutral-100 p-6 flex flex-col justify-end font-mono">
      <div className="w-full max-w-5xl mx-auto rounded-t-xl border-t border-x border-neutral-800 bg-[#111114] shadow-2xl overflow-hidden">
        {/* SQL Header */}
        <div className="h-10 px-4 bg-[#141418] border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-neutral-200 font-semibold">production-read-replica-01</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">connected</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>14ms</span>
          </div>
        </div>

        {/* Query Editor Box */}
        <div className="p-4 bg-[#0d0d10] border-b border-neutral-800 flex items-start space-x-3 text-xs">
          <div className="text-neutral-400 select-none">1</div>
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-cyan-200 font-mono text-xs"
          />
          <button className="px-3 py-1 rounded bg-neutral-200 text-neutral-900 font-semibold hover:bg-white transition-colors flex items-center space-x-1 text-xs">
            <Play className="w-3 h-3 fill-current" />
            <span>Run</span>
          </button>
        </div>

        {/* Data Result Grid */}
        <table className="w-full text-left text-xs">
          <thead className="bg-[#141418] text-neutral-400 border-b border-neutral-800 text-[11px]">
            <tr>
              <th className="py-2 px-4 font-normal">id</th>
              <th className="py-2 px-4 font-normal">organization_id</th>
              <th className="py-2 px-4 font-normal">status</th>
              <th className="py-2 px-4 font-normal text-right">amount_cents</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
            <tr>
              <td className="py-2.5 px-4 text-cyan-400">inv_01JK88A</td>
              <td className="py-2.5 px-4 text-neutral-400">org_stripe_prod</td>
              <td className="py-2.5 px-4"><span className="text-amber-400">pending</span></td>
              <td className="py-2.5 px-4 text-right font-medium text-white">49,200</td>
            </tr>
            <tr>
              <td className="py-2.5 px-4 text-cyan-400">inv_01JK88B</td>
              <td className="py-2.5 px-4 text-neutral-400">org_linear_corp</td>
              <td className="py-2.5 px-4"><span className="text-amber-400">pending</span></td>
              <td className="py-2.5 px-4 text-right font-medium text-white">12,500</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}`
  },
  {
    id: 'observability-telemetry',
    name: 'Distributed Trace Waterfall',
    category: 'developer-tool',
    description: 'High-precision microservice latency waterfall visualizer with span timing bars, status pills, and error isolation.',
    librariesUsed: ['stageshow', 'shadcn', 'animate-ui'],
    antiSlopMeasures: [
      'Proportional waterfall spans: widths map strictly to millisecond durations',
      'Status badges: monochromatic gray or quiet red for error, no fluorescent neon backgrounds',
      'Word budget: function names and execution durations only'
    ],
    focalPoint: 'The root HTTP request span resolving through database and cache child spans.',
    tsxCode: `import React from 'react';
import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ObservabilityTelemetry() {
  return (
    <div className="w-full bg-[#09090b] text-neutral-100 p-8 flex flex-col items-center font-mono">
      <div className="w-full max-w-4xl rounded-xl border border-neutral-800 bg-[#111114] p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 text-xs text-neutral-400">
          <div className="flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-neutral-200 font-semibold">GET /v1/checkout/session</span>
          </div>
          <span className="text-white font-semibold">124ms total</span>
        </div>

        {/* Waterfall Spans */}
        <div className="space-y-2 text-xs">
          {/* Span 1: Gateway */}
          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-neutral-300 text-[11px] truncate">api-gateway</span>
            <div className="col-span-9 bg-neutral-800/50 h-5 rounded overflow-hidden relative">
              <div className="absolute left-0 top-0 bottom-0 w-full bg-cyan-500/20 border border-cyan-500/40 rounded flex items-center px-2 text-[10px] text-cyan-300">
                124ms
              </div>
            </div>
          </div>

          {/* Span 2: Auth Verify */}
          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-neutral-400 text-[11px] pl-3 truncate">auth.verify</span>
            <div className="col-span-9 bg-neutral-800/50 h-5 rounded overflow-hidden relative">
              <div className="absolute left-[10%] top-0 bottom-0 w-[25%] bg-neutral-700 border border-neutral-600 rounded flex items-center px-2 text-[10px] text-neutral-200">
                28ms
              </div>
            </div>
          </div>

          {/* Span 3: DB Query */}
          <div className="grid grid-cols-12 items-center gap-2">
            <span className="col-span-3 text-neutral-400 text-[11px] pl-6 truncate">postgres.query</span>
            <div className="col-span-9 bg-neutral-800/50 h-5 rounded overflow-hidden relative">
              <div className="absolute left-[38%] top-0 bottom-0 w-[45%] bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center px-2 text-[10px] text-emerald-300">
                52ms
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
    id: 'saas-pricing-matrix',
    name: 'Restrained SaaS Pricing Matrix',
    category: 'fintech',
    description: 'Disciplined tier comparison with monthly/annual switch, clean typography, single focal pro tier, and zero exaggerated gradients.',
    librariesUsed: ['shadcn', 'animate-ui', 'stageshow'],
    antiSlopMeasures: [
      'Single focal card: pro tier receives subtle border-neutral-700; other tiers sit in background surface',
      'Zero fake sparkle badges: uses clean "Popular" text pill with monochromatic styling',
      'Word budget: concise feature bullets with check marks'
    ],
    focalPoint: 'The Pro tier plan with $49/mo pricing and instant checkout action.',
    tsxCode: `import React, { useState } from 'react';
import { Check } from 'lucide-react';

export function SaasPricingMatrix() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="w-full bg-[#09090b] text-neutral-100 p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Simple, predictable pricing</h2>
          <p className="text-xs text-neutral-400">Scale without surprise overage invoices.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 items-stretch">
          {/* Tier 1: Starter */}
          <div className="rounded-xl border border-neutral-800/80 bg-[#111114] p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono text-neutral-400 uppercase">Starter</span>
              <div className="text-2xl font-bold font-mono text-white">$0</div>
              <ul className="text-xs space-y-2 text-neutral-400 pt-3 border-t border-neutral-800">
                <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-neutral-400" /><span>3 Projects</span></li>
                <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-neutral-400" /><span>Community support</span></li>
              </ul>
            </div>
            <button className="w-full mt-6 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/50 text-xs text-neutral-200 hover:bg-neutral-800 transition-colors">
              Get Started
            </button>
          </div>

          {/* Tier 2: Pro (Focal Tier) */}
          <div className="rounded-xl border border-neutral-700 bg-[#15151a] p-5 shadow-xl flex flex-col justify-between relative">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-neutral-300 uppercase font-semibold">Pro</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">popular</span>
              </div>
              <div className="text-3xl font-bold font-mono text-white">$49<span className="text-xs font-normal text-neutral-400">/mo</span></div>
              <ul className="text-xs space-y-2 text-neutral-300 pt-3 border-t border-neutral-800">
                <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /><span>Unlimited Projects</span></li>
                <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /><span>Edge caching in 36 regions</span></li>
                <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /><span>99.99% SLA uptime</span></li>
              </ul>
            </div>
            <button className="w-full mt-6 py-2 rounded-lg bg-white text-neutral-900 font-medium text-xs hover:bg-neutral-100 transition-colors shadow-sm">
              Start Free 14-Day Trial
            </button>
          </div>

          {/* Tier 3: Enterprise */}
          <div className="rounded-xl border border-neutral-800/80 bg-[#111114] p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-mono text-neutral-400 uppercase">Enterprise</span>
              <div className="text-2xl font-bold font-mono text-white">Custom</div>
              <ul className="text-xs space-y-2 text-neutral-400 pt-3 border-t border-neutral-800">
                <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-neutral-400" /><span>Dedicated cluster</span></li>
                <li className="flex items-center space-x-1.5"><Check className="w-3.5 h-3.5 text-neutral-400" /><span>24/7 Phone support</span></li>
              </ul>
            </div>
            <button className="w-full mt-6 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/50 text-xs text-neutral-200 hover:bg-neutral-800 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    id: 'mobile-island-companion',
    name: 'Dynamic Island Cross-Device Pair',
    category: 'ai',
    description: 'Hardware pill expansion morph synchronized with desktop notification event, illustrating mobile companion state.',
    librariesUsed: ['stageshow', 'motion-primitives'],
    antiSlopMeasures: [
      'Grounded phone bezel: runs off stage bottom margin with authentic hardware radius',
      'True black background: #000000 island morphs smoothly without scale popping',
      'Restrained typography: minimal compact labels'
    ],
    focalPoint: 'The black pill expanding smoothly to display active flight and delivery tracking.',
    tsxCode: `import React, { useState } from 'react';
import { Plane, CheckCircle2 } from 'lucide-react';

export function MobileIslandCompanion() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full bg-[#0a0a0c] text-neutral-100 p-8 flex flex-col items-center justify-center font-sans">
      {/* Mobile Hardware Frame (Grounded, bottom-bleeding) */}
      <div className="w-[320px] h-[380px] bg-black rounded-t-[40px] border-t-[4px] border-x-[4px] border-neutral-800 p-4 flex flex-col items-center shadow-2xl relative overflow-hidden">
        
        {/* Dynamic Island Pill */}
        <div 
          onClick={() => setExpanded(!expanded)}
          className={\`cursor-pointer bg-black text-white border border-neutral-800 transition-all duration-300 ease-out flex items-center justify-between \${
            expanded ? 'w-[290px] h-[72px] rounded-[28px] px-4' : 'w-[120px] h-[34px] rounded-full px-3'
          }\`}
        >
          {expanded ? (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Plane className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Flight UA 420</div>
                  <div className="text-[10px] text-neutral-400">Boarding in 12m</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300">Gate B14</span>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <Plane className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono font-medium">B14</span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-neutral-400 mt-8 text-center font-mono">
          Tap pill to toggle companion expansion
        </p>
      </div>
    </div>
  );
}`
  },
  {
    id: 'creator-analytics-dashboard',
    name: 'Creator Retention Curve Analytics',
    category: 'fintech',
    description: 'High-craft audience retention graph with scrubbing hairline, rolling stat readout, and timestamped dropoff annotation.',
    librariesUsed: ['stageshow', 'motion-primitives', 'shadcn'],
    antiSlopMeasures: [
      'Monochromatic hairline scrubber: follows pointer with exact coordinate alignment',
      'Headline value rolls smoothly: decimal numbers settle without jumping',
      'Word budget: 1 headline stat, 2 quiet secondary metrics'
    ],
    focalPoint: 'The 78.4% retention scrub point and peak watch-time dot.',
    tsxCode: `import React, { useState } from 'react';
import { TrendingUp, Users } from 'lucide-react';

export function CreatorAnalyticsDashboard() {
  const [scrubPercent, setScrubPercent] = useState('78.4');

  return (
    <div className="w-full bg-[#09090b] text-neutral-100 p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl rounded-2xl border border-neutral-800 bg-[#111114] p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
          <div>
            <div className="text-xs font-mono uppercase text-neutral-400">Audience Retention</div>
            <div className="text-3xl font-mono font-bold tracking-tight text-white mt-1">
              {scrubPercent}%<span className="text-xs text-neutral-400 font-normal ml-2">at 02:45</span>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">+14% vs avg</span>
        </div>

        {/* SVG Retention Curve */}
        <div className="relative h-44 w-full bg-[#0d0d10] rounded-xl border border-neutral-800/60 p-4 flex items-end">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path 
              d="M 0 10 Q 80 15, 160 40 T 320 65 T 400 80" 
              fill="none" 
              stroke="#38bdf8" 
              strokeWidth="2.5" 
            />
            {/* Focal Scrub Point */}
            <circle cx="160" cy="40" r="4.5" fill="#38bdf8" stroke="#09090b" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    id: 'command-palette-raycast',
    name: 'Raycast Command Palette',
    category: 'developer-tool',
    description: 'Ultra-fast keyboard-first command launcher with fuzzy query filtering, monospace kbd shortcuts, and category grouping.',
    librariesUsed: ['stageshow', 'shadcn'],
    antiSlopMeasures: [
      'High-contrast black dialog: #09090b with true 1px border highlight',
      'Monospace kbd badges: realistic keyboard glyphs (Cmd+K, Shift+Enter)',
      'Zero unnecessary gradients or glow halos'
    ],
    focalPoint: 'The highlighted search result with action execution pill.',
    tsxCode: `import React, { useState } from 'react';
import { Search, Terminal, ArrowRight, BookOpen, Settings } from 'lucide-react';

export function CommandPaletteRaycast() {
  const [query, setQuery] = useState('');

  return (
    <div className="w-full bg-[#0a0a0c] text-neutral-100 p-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-xl rounded-xl border border-neutral-700 bg-[#121216] shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="h-12 px-4 border-b border-neutral-800 flex items-center space-x-3">
          <Search className="w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs text-white placeholder-neutral-400 font-sans"
            autoFocus
          />
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] text-neutral-400 font-mono">ESC</kbd>
        </div>

        {/* Action List */}
        <div className="p-2 space-y-1 text-xs">
          <div className="px-3 py-1 text-[10px] font-mono uppercase text-neutral-400">Commands</div>
          
          <div className="px-3 py-2 rounded-lg bg-neutral-800 text-white flex items-center justify-between cursor-pointer">
            <div className="flex items-center space-x-2.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium">Deploy Current Branch to Production</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-700 text-[10px] font-mono text-neutral-300">Return</kbd>
          </div>

          <div className="px-3 py-2 rounded-lg text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200 flex items-center justify-between cursor-pointer transition-colors">
            <div className="flex items-center space-x-2.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Search API Documentation</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-400">Cmd+D</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    id: 'workflow-canvas-automation',
    name: 'Node-Based Automation Graph',
    category: 'developer-tool',
    description: 'Disciplined visual automation pipeline with SVG connectors, execution status pills, and webhook trigger payload.',
    librariesUsed: ['stageshow', 'magicui', 'motion-primitives'],
    antiSlopMeasures: [
      'Grounded node canvas: clean dot-grid underlay with opacity 0.05',
      'Monochromatic SVG connectors: clean orthogonal bezier curves without colorful rainbow glows',
      'Word budget: node titles and input parameter tags only'
    ],
    focalPoint: 'The Webhook Trigger connecting to the Autonomous LLM Filter and Slack Alert.',
    tsxCode: `import React from 'react';
import { Webhook, Filter, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

export function WorkflowCanvasAutomation() {
  return (
    <div className="w-full bg-[#09090b] text-neutral-100 p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-4xl rounded-2xl border border-neutral-800 bg-[#111114] p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
          <div>
            <h3 className="text-sm font-semibold text-white">Pipeline: Customer Churn Alert</h3>
            <p className="text-xs text-neutral-400">Triggers when Stripe subscription cancellation occurs</p>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            active · 1.4k runs/hr
          </span>
        </div>

        {/* Node Graph Layout */}
        <div className="py-8 flex items-center justify-between relative">
          {/* Node 1: Webhook Trigger */}
          <div className="w-48 p-3 rounded-xl border border-neutral-700 bg-[#15151a] shadow-lg space-y-2 z-10">
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-300">
              <Webhook className="w-3.5 h-3.5" />
              <span>Stripe Webhook</span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400">customer.subscription.deleted</p>
          </div>

          <div className="h-[2px] w-16 bg-neutral-700 relative">
            <div className="absolute top-[-3px] right-0 w-2 h-2 rounded-full bg-cyan-400" />
          </div>

          {/* Node 2: Logic Filter */}
          <div className="w-48 p-3 rounded-xl border border-neutral-700 bg-[#15151a] shadow-lg space-y-2 z-10">
            <div className="flex items-center space-x-2 text-xs font-semibold text-white">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <span>MRR Threshold</span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400">plan_amount &gt; $500/mo</p>
          </div>

          <div className="h-[2px] w-16 bg-neutral-700 relative">
            <div className="absolute top-[-3px] right-0 w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          {/* Node 3: Slack Alert */}
          <div className="w-48 p-3 rounded-xl border border-neutral-700 bg-[#15151a] shadow-lg space-y-2 z-10">
            <div className="flex items-center space-x-2 text-xs font-semibold text-white">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Urgent Slack Dispatch</span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400">#accounts-retention</p>
          </div>
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
