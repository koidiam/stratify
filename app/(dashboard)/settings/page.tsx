import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, CreditCard, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  const { data: onboarding } = await supabase
    .from('onboarding')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Ayarlar</h1>
        <p className="text-gray-400 mt-2 text-lg">Hesap detayları, faturalandırma ve kişisel profil seçenekleri.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Abonelik ve Plan */}
        <Card className="bg-[#111] border-[#222] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 flex justify-end items-start opacity-10">
            <CreditCard size={100} />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
               <Shield className="text-blue-500" /> Plan ve Fatura
            </h3>
            <div className="mt-6 mb-8">
              <span className="text-sm text-gray-500 uppercase tracking-widest font-bold block mb-1">Mevcut Tarife</span>
              <span className={`text-2xl font-black ${profile?.plan === 'pro' ? 'text-blue-500' : 'text-gray-300'}`}>
                {profile?.plan?.toUpperCase() || 'FREE'} PLAN
              </span>
            </div>
            
            {profile?.plan === 'free' ? (
              <Button disabled variant="secondary" className="bg-blue-600 hover:bg-blue-700 text-white border-transparent w-full opacity-50 cursor-not-allowed">
                Pro Plana Yukselt (Yakinda)
              </Button>
            ) : (
               <Button variant="outline" className="w-full border-[#2A2A2A] text-white">
                 Aboneliği Yönet
               </Button>
            )}
          </div>
        </Card>

        {/* Profil Bilgisi */}
        <Card className="bg-[#111] border-[#222] p-6">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
             <User className="text-gray-400" /> Onboarding (Strateji) Bilgileri
          </h3>
          <p className="text-sm text-gray-400 mb-6">Stratify algoritması bu metriklere dayanarak üretim yapar.</p>
          
          <div className="space-y-4">
            <div>
              <span className="text-xs text-gray-500 font-medium block">Adres / Account</span>
              <span className="text-sm text-gray-300">{session.user.email}</span>
            </div>
            <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#2A2A2A]">
               <span className="text-xs text-gray-500 font-medium block mb-1">Seçilen Niş</span>
               <span className="text-sm text-white capitalize">{onboarding?.niche || 'Belirtilmedi'}</span>
            </div>
            <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#2A2A2A]">
               <span className="text-xs text-gray-500 font-medium block mb-1">Ses Tonu</span>
               <span className="text-sm text-white capitalize">{onboarding?.tone || 'Belirtilmedi'}</span>
            </div>
            <Link href="/onboarding" className="block mt-4">
               <Button variant="outline" className="w-full border-blue-500/30 text-blue-400 hover:text-white hover:bg-blue-600/20">
                 <Sparkles size={16} className="mr-2" />
                 Algoritmayı Yeniden Öğret
               </Button>
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
}
