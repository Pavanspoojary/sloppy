import React from 'react';
import { Stage, Window, Bar } from '@sloppy-ai/kit';

export function CleanFeatureCard() {
  return (
    <Stage width={440} height={320} look="linear">
      <Window title="Customer MRR" look="linear">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-white">$14,200</span>
            <span className="text-xs text-emerald-400">+12%</span>
          </div>
          <Bar width={120} />
          <Bar width={180} />
          <Bar width={90} />
        </div>
      </Window>
    </Stage>
  );
}
