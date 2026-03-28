"use client"

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PLAN_LIMITS } from '@/lib/utils/usage';
import { Plan } from '@/types';

interface Props {
  plan: Plan;
  usage: number;
}

export function UsageCard({ plan = 'free', usage = 0 }: Props) {
  const limit = PLAN_LIMITS[plan] || 3;
  const percentage = limit > 0 ? Math.min((usage / limit) * 100, 100) : 0;
  
  const getBadgeColor = () => {
    if (plan === 'pro') return 'bg-blue-600 hover:bg-blue-700 text-white border-none';
    if (plan === 'basic') return 'bg-emerald-600 hover:bg-emerald-700 text-white border-none';
    return 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A] border-none';
  };

  return (
    <Card className="bg-[#111] border-[#222] p-6 shadow-xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Haftalık Hakkın</h2>
          <p className="text-sm text-gray-400">Pazartesi günü sıfırlanır.</p>
        </div>
        <Badge className={`mt-2 sm:mt-0 ${getBadgeColor()}`}>
          {plan.toUpperCase()} PLAN
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end text-sm">
          <span className="text-gray-400">Üretim Limiti</span>
          <span className="text-white font-medium text-lg">
            {usage} <span className="text-gray-500">/ {limit}</span>
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#222]">
          <div
            className="h-full rounded-full bg-blue-500 transition-[width] duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {percentage >= 100 && (
          <p className="text-red-400 text-xs mt-2">Haftalık limitine ulaştın. Daha fazla üretim için planını yükseltmelisin.</p>
        )}
        
        {percentage >= 80 && percentage < 100 && (
          <p className="text-orange-400 text-xs mt-2">Limitinin sonuna yaklaşıyorsun.</p>
        )}
      </div>
    </Card>
  );
}
