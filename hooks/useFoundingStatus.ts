import { useState, useEffect } from 'react';

export type FoundingStatusType = 'loading' | 'available' | 'sold_out' | 'error';

interface FoundingAvailabilityResponse {
  status?: FoundingStatusType;
  remaining?: number;
  claimed?: number;
  total?: number;
  code?: string;
  fallback?: boolean;
}

export interface FoundingStatus {
  loaded: boolean;
  status: FoundingStatusType;
  remaining: number;
  claimed: number;
  total: number;
}

const DEFAULT_TOTAL = 15;

function isValidStatusResponse(data: unknown): data is FoundingAvailabilityResponse {
  if (!data || typeof data !== 'object') return false;

  const candidate = data as FoundingAvailabilityResponse;

  return (
    candidate.status === 'available' ||
    candidate.status === 'sold_out' ||
    candidate.status === 'error'
  );
}

export function useFoundingStatus() {
  const [data, setData] = useState<FoundingStatus>({
    loaded: false,
    status: 'loading',
    remaining: 0,
    claimed: 0,
    total: DEFAULT_TOTAL,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadFoundingStatus() {
      try {
        const response = await fetch('/api/checkout/availability', {
          cache: 'no-store',
          signal: controller.signal,
        });

        const payload: unknown = await response.json();

        if (!response.ok || !isValidStatusResponse(payload)) {
          throw new Error('Invalid founding availability response');
        }

        if (payload.fallback) {
          console.warn('[FoundingStatus] Using fallback founding availability response.', payload.code ?? 'unknown');
        }

        if (payload.status === 'error') {
          console.warn('[FoundingStatus] Founding availability unavailable.', payload.code ?? 'unknown');
          setData({
            loaded: true,
            status: 'error',
            remaining: 0,
            claimed: 0,
            total: payload.total ?? DEFAULT_TOTAL,
          });
          return;
        }

        setData({
          loaded: true,
          status: payload.status,
          remaining: payload.remaining ?? 0,
          claimed: payload.claimed ?? 0,
          total: payload.total ?? DEFAULT_TOTAL,
        });
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error('Failed to load founding status:', err);
        setData({
          loaded: true,
          status: 'error',
          remaining: 0,
          claimed: 0,
          total: DEFAULT_TOTAL,
        });
      }
    }

    void loadFoundingStatus();

    return () => controller.abort();
  }, []);

  return data;
}
