import Link from 'next/link';
import { Compass, PenTool, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plan } from '@/types';

export function QuickActions({ plan = 'free' }: { plan?: Plan }) {
  return (
    <div className="flex flex-col flex-wrap sm:flex-row items-center gap-3 w-full bg-[#050505] py-2">
      <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mr-4 hidden md:block">
        System_Commands
      </div>

      <Link href="/generate" className="w-full sm:w-auto flex-1 md:flex-none">
        <Button className="w-full gap-2 rounded-sm bg-white text-black font-bold uppercase tracking-widest text-[11px] h-10 px-6 transition-all hover:bg-white/90">
          <PenTool size={14} />
          <span>Execute Engine</span>
        </Button>
      </Link>

      <Link href="/history" className="w-full sm:w-auto flex-1 md:flex-none">
        <Button variant="outline" className="w-full gap-2 rounded-sm border-white/10 bg-transparent hover:bg-white/5 text-white/90 font-bold uppercase tracking-widest text-[11px] h-10 px-6 transition-colors">
          <Compass size={14} />
          <span>View Archive</span>
        </Button>
      </Link>

      <Link href="/settings" className="w-full sm:w-auto flex-1 md:flex-none">
        <Button variant="outline" className="w-full gap-2 rounded-sm border-white/10 bg-transparent hover:bg-white/5 text-white/90 font-bold uppercase tracking-widest text-[11px] h-10 px-6 transition-colors">
          <Settings size={14} />
          <span>Config</span>
        </Button>
      </Link>
    </div>
  );
}
