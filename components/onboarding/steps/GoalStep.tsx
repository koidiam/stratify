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
        <h2 className="text-2xl font-bold text-foreground mb-2">
          What's your main goal on LinkedIn?
        </h2>
        <p className="text-muted-foreground text-sm">
          This shapes every insight and post we generate for you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 mt-6">
        {GOALS.map((goal) => (
          <button
            key={goal.value}
            type="button"
            onClick={() => onChange(goal.value)}
            className={`flex items-start gap-4 rounded-xl border p-4 text-left transition-all ${
              value === goal.value
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40'
            }`}
          >
            <div>
              <div className="font-semibold text-sm text-foreground">{goal.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{goal.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
