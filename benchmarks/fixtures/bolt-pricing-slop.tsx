import React from 'react';
import { Sparkles } from 'lucide-react';

export function BoltPricingSlop() {
  return (
    <section className="py-16 px-4 bg-zinc-950 text-white flex flex-col items-center justify-center text-center">
      <div className="flex items-center justify-center text-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />
        <span className="text-xs font-medium text-purple-300">AI Powered Pricing Plans</span>
      </div>
      <h2 className="text-3xl font-bold text-center">Simple, transparent pricing for teams</h2>
      <p className="text-sm text-zinc-400 mt-2 text-center max-w-md">
        Choose the plan that fits your growth and start supercharging your software delivery today.
      </p>

      {/* Extreme Boxed card syndrome: 4 identical rounded-xl border p-6 bg-zinc-900 cards */}
      <div className="grid grid-cols-4 gap-6 mt-10 max-w-6xl w-full">
        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg flex flex-col items-center justify-center text-center">
          <h3 className="font-semibold text-lg text-center">Free</h3>
          <p className="text-2xl font-bold mt-2 text-center">$0</p>
          <p className="text-xs text-zinc-500 mt-1 text-center">For hobbyists and explorers</p>
          <button className="mt-6 w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium">Start Free</button>
        </div>

        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg flex flex-col items-center justify-center text-center">
          <h3 className="font-semibold text-lg text-center">Starter</h3>
          <p className="text-2xl font-bold mt-2 text-center">$29</p>
          <p className="text-xs text-zinc-500 mt-1 text-center">For early stage indie developers</p>
          <button className="mt-6 w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium">Get Started</button>
        </div>

        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg flex flex-col items-center justify-center text-center">
          <h3 className="font-semibold text-lg text-center">Professional</h3>
          <p className="text-2xl font-bold mt-2 text-center">$79</p>
          <p className="text-xs text-zinc-500 mt-1 text-center">For growing product engineering teams</p>
          <button className="mt-6 w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-sm font-medium animate-pulse">Upgrade</button>
        </div>

        <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg flex flex-col items-center justify-center text-center">
          <h3 className="font-semibold text-lg text-center">Enterprise</h3>
          <p className="text-2xl font-bold mt-2 text-center">$249</p>
          <p className="text-xs text-zinc-500 mt-1 text-center">Dedicated compute and priority support</p>
          <button className="mt-6 w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium">Contact Us</button>
        </div>
      </div>
    </section>
  );
}
