import { Rocket, Sparkles, BookOpen, LineChart, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function WelcomeGuide() {
  const steps = [
    {
      icon: <Sparkles className="w-5 h-5 text-primary" />,
      title: '1. Fuel the Engine',
      description: 'Head to the Generate tab. The engine sweeps LinkedIn for live data to find what works in your niche today.',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
      title: '2. Pick Your Angles',
      description: 'Review the extracted insights and psychologically-engineered hooks. The AI writes rough drafts matching your unique tone.',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      icon: <Rocket className="w-5 h-5 text-amber-600" />,
      title: '3. Edit & Publish',
      description: 'Refine your drafts in the built-in editor. Once you are happy, copy them directly to LinkedIn and hit publish.',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      icon: <LineChart className="w-5 h-5 text-purple-600" />,
      title: '4. The Learning Loop',
      description: 'Next week, go to History to log your views and likes. The engine learns what your specific audience loves.',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ];

  return (
    <Card className="border border-border bg-card shadow-sm p-6 sm:p-8 rounded-[24px] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <Rocket size={120} />
      </div>
      
      <div className="relative z-10 mb-8">
        <h2 className="text-xl font-bold text-foreground">The Stratify OS Workflow</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Everything you need to build a consistent, data-backed LinkedIn presence. Follow this 4-step loop to maximize your results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col relative group">
            {/* The line connecting steps (hidden on mobile, visible on lg) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-[1px] bg-gradient-to-r from-border to-transparent -z-10" />
            )}
            
            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center mb-4 ${step.bg} ${step.border} border group-hover:scale-110 transition-transform duration-300`}>
              {step.icon}
            </div>
            
            <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-1.5">
              {step.title}
            </h3>
            
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
