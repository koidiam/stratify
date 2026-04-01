import Link from 'next/link';
import { Compass, PenTool, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Plan } from '@/types';

export function QuickActions({ plan = 'free' }: { plan?: Plan }) {
  return (
    <div className="flex flex-col flex-wrap sm:flex-row items-center gap-3 w-full bg-card p-4 rounded-[16px] border border-border shadow-sm">
      <div className="text-sm font-medium text-muted-foreground mr-2 hidden md:block">
        System Commands:
      </div>

      <Link href="/generate" className="w-full sm:w-auto flex-1 md:flex-none">
        <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-10 px-6 transition-all shadow-md shadow-primary/20 hover:scale-[1.02]">
          <PenTool size={16} />
          <span>Run Engine</span>
        </Button>
      </Link>

      <Link href="/history" className="w-full sm:w-auto flex-1 md:flex-none">
        <Button variant="outline" className="w-full gap-2 border-border bg-transparent hover:bg-secondary text-foreground font-medium h-10 px-6 transition-all">
          <Compass size={16} />
          <span>View History</span>
        </Button>
      </Link>

      <Link href="/settings" className="w-full sm:w-auto flex-1 md:flex-none">
        <Button variant="outline" className="w-full gap-2 border-border bg-transparent hover:bg-secondary text-foreground font-medium h-10 px-6 transition-all">
          <Settings size={16} />
          <span>Settings</span>
        </Button>
      </Link>
    </div>
  );
}
