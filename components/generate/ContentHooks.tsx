import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, LightbulbIcon, Hash } from 'lucide-react';

interface Post {
  content: string;
  type: string;
  explanation: string;
}

interface Idea {
  idea: string;
  type: string;
}

interface Props {
  hooks: string[];
  ideas: Idea[];
  posts: Post[];
  onSelectPost: (post: string) => void;
  onBack: () => void;
}

export function ContentHooks({ hooks, ideas, posts, onSelectPost, onBack }: Props) {
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold text-white">Hook ve taslak merkezi</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-white/58">
          Burada dikkat cekici acilislar, alternatif icerik acilari ve secip duzenleyebilecegin
          final taslaklar bir arada durur.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-[28px] border border-white/10 bg-[#09111b] p-6">
           <h3 className="font-bold text-white flex items-center gap-2 mb-4">
             <Hash className="text-blue-500" size={18} />
             Güçlü Kancalar (Hooks)
           </h3>
           <ul className="space-y-3">
             {hooks.map((h, i) => (
               <li key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/72 transition-colors hover:border-blue-500/30">
                 {h}
               </li>
             ))}
           </ul>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#09111b] p-6">
           <h3 className="font-bold text-white flex items-center gap-2 mb-4">
             <LightbulbIcon className="text-yellow-500" size={18} />
             Alternatif Fikirler
           </h3>
           <ul className="space-y-3">
             {ideas.slice(0, 5).map((idea, i) => (
               <li key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/72">
                 <span className="mb-1 block text-xs font-bold text-yellow-400">{idea.type}</span>
                 {idea.idea}
               </li>
             ))}
           </ul>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-xl font-bold text-white">Hazir post taslaklari</h2>
        <p className="mb-6 text-sm leading-7 text-white/58">Asagidaki taslaklardan birini secip son edit ekranina gecebilirsin.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <Card key={idx} className="flex flex-col justify-between rounded-[28px] border-white/10 bg-[#09111b] p-6 transition-colors hover:border-blue-500/40">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase text-blue-400">{post.type}</span>
                </div>
                <div className="mb-4 line-clamp-6 whitespace-pre-wrap font-mono text-sm leading-relaxed text-white/76">
                  {post.content}
                </div>
                <p className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs leading-6 text-white/46">
                  <span className="mb-1 block font-semibold text-white/52">Neden bu yapı?</span>
                  {post.explanation}
                </p>
              </div>
              <Button 
                onClick={() => onSelectPost(post.content)}
                className="mt-4 w-full rounded-full bg-[#122033] text-white transition-colors hover:bg-blue-600"
              >
                Bu Taslağı Düzenle
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={onBack} variant="ghost" className="text-gray-400 hover:text-white">
          Geri Dön
        </Button>
      </div>

    </div>
  );
}
