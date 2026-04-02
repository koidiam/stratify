"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  initialName: string;
  updateName: (name: string) => Promise<{ success?: boolean; error?: string }>;
}

export function ProfileForm({ initialName, updateName }: Props) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === initialName) return;

    setLoading(true);
    try {
      const res = await updateName(name);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Name updated successfully!");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="str-panel rounded-sm border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-2">
      <span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-white/30">Full Name</span>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="flex-1 bg-[#000000]/40 border border-white/10 rounded-sm px-3 py-1.5 text-[11px] font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
        />
        <Button disabled={loading || name === initialName} type="submit" size="sm" variant="outline" className="h-8 rounded-sm text-[9px] font-bold uppercase tracking-widest text-white/90 border-white/10 bg-transparent hover:bg-white/5 shadow-none transition-colors">
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
