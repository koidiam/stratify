import { Card } from '@/components/ui/card';
import { PenTool, Compass, Trophy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      
      {/* Yeni İçerik */}
      <Card className="bg-[#111] border-[#222] p-6 hover:border-blue-500/50 transition-colors group flex flex-col justify-between">
        <div>
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
            <PenTool size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Strateji & İçerik Üret</h3>
          <p className="text-sm text-gray-400 mb-6">
            Yapay zeka ile nişine uygun, psikolojik altyapısı sağlam postlar oluştur.
          </p>
        </div>
        <Link href="/generate">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Üretime Başla</Button>
        </Link>
      </Card>

      {/* Profil Geliştirme */}
      <Card className="bg-[#111] border-[#222] p-6 flex flex-col justify-between">
        <div>
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
            <Compass size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Geçmiş Analizi</h3>
          <p className="text-sm text-gray-400 mb-6">
            Önceki oluşturduğun postları ve seçtiğin kancaları incele.
          </p>
        </div>
        <Link href="/history">
          <Button variant="outline" className="w-full border-[#2A2A2A] text-gray-300 hover:text-white hover:bg-[#222]">
            Tarihçeyi Gör
          </Button>
        </Link>
      </Card>

      {/* Pro Tiers */}
      <Card className="bg-[#111] border-[#222] p-6 flex flex-col justify-between bg-gradient-to-br from-[#111] to-[#1a1a2e]">
        <div>
          <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-4">
            <Trophy size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Limitsiz Büyüme</h3>
          <p className="text-sm text-gray-400 mb-6">
            Stripe veya Iyzico ile sınırları kaldır. Sınırsız içerik ve derin analitik raporlarıyla büyü.
          </p>
        </div>
        <Button disabled variant="outline" className="w-full border-yellow-500/20 text-yellow-500/50">
          Yakında (Faz 2)
        </Button>
      </Card>

    </div>
  );
}
