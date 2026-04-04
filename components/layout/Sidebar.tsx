"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PenTool, History, Settings, LogOut, Menu, X, Lock } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Plan } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const WORKSPACE_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Generate', path: '/generate', icon: PenTool },
  { name: 'History', path: '/history', icon: History },
] as const;

const SYSTEM_ITEMS = [
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
    <div className="flex flex-col h-full bg-[#050505] border-r border-white/5">
      <Link href="/dashboard" onClick={onNavigate} className="block px-6 py-6 transition-opacity hover:opacity-80">
        <div className="text-white">
          <span className="text-lg font-medium tracking-tight">Stratify</span>
          <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/32">
            Weekly Operating System
          </div>
        </div>
      </Link>

      <div className="flex-1 px-4 py-2 space-y-8">
        <div>
          <div className="px-2 mb-3 text-[10px] font-medium text-white/30 tracking-wider uppercase">Core Loop</div>
          <nav className="space-y-0.5">
            {WORKSPACE_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/dashboard');

              return (
                <Link key={item.path} href={item.path} onClick={onNavigate} className="block group">
                  <div
                    className={`relative flex items-center gap-3 px-2 py-2 transition-all duration-200 rounded-sm
                      ${
                        isActive
                          ? 'bg-white/10 text-white font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {isActive && (
                      <motion.div layoutId="active-nav" className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-emerald-500 rounded-r-full" />
                    )}
                    <Icon size={14} className={isActive ? "text-white" : "text-white/40"} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="flex items-center gap-2 text-sm mt-0.5">
                      {item.name}
                      {item.path === '/history' && plan === 'free' ? (
                        <Lock size={10} className="text-white/20 pb-0.5" />
                      ) : null}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-2 mb-3 text-[10px] font-medium text-white/30 tracking-wider uppercase">Configuration</div>
          <nav className="space-y-0.5">
            {SYSTEM_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link key={item.path} href={item.path} onClick={onNavigate} className="block group">
                  <div
                    className={`relative flex items-center gap-3 px-2 py-2 transition-all duration-200 rounded-sm
                      ${
                        isActive
                          ? 'bg-white/10 text-white font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]'
                          : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {isActive && (
                      <motion.div layoutId="active-nav" className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-emerald-500 rounded-r-full" />
                    )}
                    <Icon size={14} className={isActive ? "text-white" : "text-white/40"} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="flex items-center gap-2 text-sm mt-0.5">
                      {item.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-white/5 bg-[#020202]">
        <div className="p-2 space-y-4">
          <div className="flex items-center justify-between group">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-white/40 mb-0.5">Plan</span>
              <span className="text-xs font-medium text-white capitalize">{plan} plan</span>
            </div>
            <Link href="/settings" onClick={onNavigate} className="text-xs font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
              Manage
            </Link>
          </div>
          
          <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
            <div className="text-xs text-white/50 truncate" title={email}>{email || 'user'}</div>
            <button
              onClick={() => void onLogout()}
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors h-6 text-left"
              type="button"
            >
              <LogOut size={12} />
              <span className="text-xs font-medium">Sign out</span>
            </button>
          </div>
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
      <div className="md:hidden flex items-center justify-between bg-[#0A0A0A] border-b border-white/5 p-4 fixed top-0 w-full z-40">
        <Link href="/dashboard" className="text-white transition-opacity hover:opacity-80">
          <span className="text-lg font-medium tracking-tight">Stratify</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="text-white/50 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
      </div>

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
