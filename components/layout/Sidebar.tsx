"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PenTool, History, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const MENU_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Generate', path: '/generate', icon: PenTool },
  { name: 'History', path: '/history', icon: History },
  { name: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarContentProps {
  email?: string;
  pathname: string;
  onNavigate: () => void;
  onLogout: () => Promise<void>;
}

function SidebarContent({
  email,
  pathname,
  onNavigate,
  onLogout,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-[#111111] border-r border-[#222]">
      <div className="p-6">
        <div className="text-xl font-bold flex items-center gap-2 text-white">
          <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm">S</span>
          Stratify
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.path || (pathname.startsWith(item.path) && item.path !== '/dashboard');

          return (
            <Link key={item.path} href={item.path} onClick={onNavigate}>
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-500 font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-[#222]'
                  }`}
              >
                <Icon size={18} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#222]">
        <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#2A2A2A]">
          <div className="text-xs text-gray-500 mb-2 truncate" title={email}>{email || 'user'}</div>
          <Button
            onClick={() => void onLogout()}
            variant="ghost"
            className="w-full flex items-center justify-start gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 h-8 px-2"
          >
            <LogOut size={16} />
            <span className="text-sm">Çıkış Yap</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ email }: { email?: string }) {
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
      <div className="md:hidden flex items-center justify-between bg-[#111] border-b border-[#222] p-4 fixed top-0 w-full z-40">
        <div className="font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-xs">S</span>
          Stratify
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-gray-300">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="w-64 bg-[#111] h-full relative z-10 animate-in slide-in-from-left">
            <button 
              onClick={() => setMobileOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              type="button"
            >
              <X size={24} />
            </button>
            <SidebarContent
              email={email}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-screen fixed inset-y-0 left-0 z-20">
        <SidebarContent
          email={email}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
      </div>
    </>
  );
}
