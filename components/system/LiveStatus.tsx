"use client";

import { useEffect, useMemo, useState } from 'react';

interface LiveStatusProps {
  label: string;
  timestamp?: string | null;
  fallback: string;
  justNowLabel?: string;
  pulse?: boolean;
  className?: string;
}

function formatRelativeTime(timestamp: string): string {
  const deltaMs = Date.now() - new Date(timestamp).getTime();

  if (!Number.isFinite(deltaMs)) {
    return 'just now';
  }

  const deltaSeconds = Math.max(0, Math.floor(deltaMs / 1000));

  if (deltaSeconds < 10) return 'just now';
  if (deltaSeconds < 60) return `${deltaSeconds}s ago`;

  const deltaMinutes = Math.floor(deltaSeconds / 60);
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`;

  const deltaHours = Math.floor(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours}h ago`;

  const deltaDays = Math.floor(deltaHours / 24);
  if (deltaDays < 7) return `${deltaDays}d ago`;

  const deltaWeeks = Math.floor(deltaDays / 7);
  return `${deltaWeeks}w ago`;
}

export function LiveStatus({
  label,
  timestamp,
  fallback,
  justNowLabel,
  pulse = false,
  className,
}: LiveStatusProps) {
  const [, setNow] = useState(0);

  useEffect(() => {
    if (!timestamp) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timestamp]);

  const text = useMemo(() => {
    if (!timestamp) {
      return fallback;
    }

    const relative = formatRelativeTime(timestamp);

    if (relative === 'just now') {
      return justNowLabel ?? `${label} just now`;
    }

    return `${label} ${relative}`;
  }, [fallback, justNowLabel, label, timestamp]);

  return (
    <div
      className={`str-live-row ${className ?? ''}`.trim()}
      title={timestamp ? new Date(timestamp).toLocaleString() : undefined}
    >
      <span className={pulse && timestamp ? 'str-live-dot' : 'h-1.5 w-1.5 rounded-full bg-white/28'} />
      <span>{text}</span>
    </div>
  );
}
