"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PenTool, History, Settings, LogOut, Menu, X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Plan } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Generate', path: '/generate', icon: PenTool },
  { name: 'History', path: '/history', icon: History },
  { name: 'Settings', path: '/settings', icon: Settings },
] as const;

interface SidebarContentProps {
  email?: string;
  plan: Plan;
  pathname: string;
  onNavigate: () => void;
  onLogout: () => Promise<void>;
}

function SidebarContent({
  email,
  plan,
  pathname,
  onNavigate,
  onLogout,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      
      <div className="px-6 py-8">
        <div className="text-xl font-bold flex items-center gap-3 text-sidebar-foreground">
          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-sm text-primary font-bold">
            S
          </div>
          <span className="tracking-wide">Stratify</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/dashboard');

          return (
            <Link key={item.path} href={item.path} onClick={onNavigate} className="block relative">
              {isActive && (
                <motion.div
                  layoutId="active-nav-tab"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200
                  ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
              >
                <Icon size={18} className={isActive ? "text-primary" : ""} />
                <span className="flex items-center gap-2 text-[14px] font-medium">
                  {item.name}
                  {item.path === '/history' && plan === 'free' ? (
                    <Lock size={12} className="text-amber-500/80 mb-0.5" />
                  ) : null}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="p-3">
          <div className="mb-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-1">Current Plan</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-sidebar-foreground tracking-wide">{plan.toUpperCase()}</span>
              <Link href="/settings" onClick={onNavigate} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                Manage
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center text-[10px] font-bold text-sidebar-foreground/70">
              {email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="text-[13px] text-muted-foreground truncate font-medium" title={email}>{email || 'user'}</div>
          </div>
          <Button
            onClick={() => void onLogout()}
            variant="ghost"
            className="w-full flex items-center justify-start gap-2 text-destructive/80 hover:text-destructive hover:bg-destructive/10 h-8 px-2 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span className="text-[13px] font-medium">Sign out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ email, plan }: { email?: string; plan: Plan }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (pathname === '/onboarding') return null;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-sidebar border-b border-sidebar-border p-4 fixed top-0 w-full z-40">
        <div className="font-bold text-sidebar-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded border border-primary/20 bg-primary/10 flex items-center justify-center text-xs text-primary">S</span>
          Stratify
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-muted-foreground hover:text-sidebar-foreground transition-colors">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-[50] flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
              onClick={() => setMobileOpen(false)} 
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="p-4 w-72 h-full relative z-[60]"
            >
              <button 
                onClick={() => setMobileOpen(false)} 
                className="absolute top-8 right-8 text-muted-foreground hover:text-sidebar-foreground z-[70] bg-background/50 rounded-full p-1 border border-border"
                type="button"
              >
                <X size={20} />
              </button>
              <SidebarContent
                email={email}
                plan={plan}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
                onLogout={handleLogout}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-20 w-64">
        <SidebarContent
          email={email}
          plan={plan}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </div>
    </>
  );
}
