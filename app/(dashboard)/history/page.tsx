import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { PenTool, Hash } from 'lucide-react';

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) redirect('/login');

  const { data: history, error } = await supabase
    .from('content_history')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Üretim Geçmişi</h1>
        <p className="text-gray-400 mt-2 text-lg">Önceki haftalarda oluşturduğun içerikler ve stratejiler.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!error && history && history.length > 0 ? (
          history.map((record) => (
            <Card key={record.id} className="bg-[#111] border-[#222] p-6 flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Hafta {record.week_number} • {record.year}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(record.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                
                <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                   <Hash size={16} className="text-gray-400" /> Kancalar ({record.hooks?.length || 0})
                </h3>
                <ul className="text-sm text-gray-400 space-y-1 mb-4 list-disc list-inside">
                  {record.hooks?.slice(0, 3).map((hook: string, i: number) => (
                    <li key={i} className="truncate">{hook}</li>
                  ))}
                  {(record.hooks?.length || 0) > 3 && <li className="text-gray-600">...</li>}
                </ul>

                <h3 className="font-bold text-white mb-2 flex items-center gap-2 mt-4 pt-4 border-t border-[#222]">
                   <PenTool size={16} className="text-gray-400" /> Üretilen Postlar
                </h3>
                <p className="text-sm text-gray-400">
                   Toplam {record.posts?.length || 0} taslak oluşturulmuştur.
                </p>
              </div>
            </Card>
          ))
        ) : error ? (
          <div className="col-span-full py-20 text-center border border-dashed border-[#222] rounded-xl">
            <p className="text-gray-500">Geçmiş kayıtları şu anda alınamadı.</p>
          </div>
        ) : (
          <div className="col-span-full py-20 text-center border border-dashed border-[#222] rounded-xl">
             <p className="text-gray-500">Henüz hiçbir içerik üretmedin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
