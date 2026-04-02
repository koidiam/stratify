'use client';

import { useState } from 'react';

const GOALS = [
  { value: 'build_audience', label: 'Build a larger audience', description: 'Grow followers and reach' },
  { value: 'get_clients',    label: 'Get clients or customers', description: 'Generate inbound leads' },
  { value: 'build_authority',label: 'Build authority in my niche', description: 'Become the go-to voice' },
  { value: 'land_opportunity',label: 'Land a job or opportunity', description: 'Attract recruiters or partners' },
];

interface GoalStepProps {
  value: string;
  onChange: (value: string) => void;
}

export function GoalStep({ value, onChange }: GoalStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest text-sm">
          Primary Objective Vector
        </h2>
        <p className="text-white/50 text-[11px] font-mono max-w-md">
          This directs the final output orientation for every computation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 mt-6">
        {GOALS.map((goal) => (
          <button
            key={goal.value}
            type="button"
            onClick={() => onChange(goal.value)}
            className={`flex items-start gap-4 rounded-sm border p-4 text-left transition-colors ${
              value === goal.value
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-white/5 bg-[#000000]/40 hover:border-white/20'
            }`}
          >
            <div>
              <div className={`font-bold text-[11px] uppercase tracking-widest mb-1.5 ${value === goal.value ? 'text-emerald-500' : 'text-white/80'}`}>{goal.label}</div>
              <div className="text-[10px] font-mono text-white/40">{goal.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
