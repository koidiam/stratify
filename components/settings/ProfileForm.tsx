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
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-secondary p-4 flex flex-col gap-2">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Name</span>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button disabled={loading || name === initialName} type="submit" size="sm" variant="outline" className="h-8 shadow-sm">
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
