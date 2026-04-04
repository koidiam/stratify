"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
        Full Name
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="h-10 rounded-sm border-white/10 bg-black/30 px-3 text-sm text-white placeholder:text-white/25"
        />
        <Button
          disabled={loading || name === initialName}
          type="submit"
          variant="outline"
          className="h-10 rounded-sm border-white/10 bg-transparent px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-white/5 sm:w-auto"
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
