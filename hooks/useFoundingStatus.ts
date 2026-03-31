import { useState, useEffect } from 'react';

export interface FoundingStatus {
  loaded: boolean;
  available: boolean;
  remaining: number;
  claimed: number;
  total: number;
}

export function useFoundingStatus() {
  const [status, setStatus] = useState<FoundingStatus>({
    loaded: false,
    available: false,
    remaining: 0,
    claimed: 0,
    total: 15,
  });

  useEffect(() => {
    fetch('/api/checkout/availability')
      .then(res => res.json())
      .then(data => {
        setStatus({
          loaded: true,
          available: !!data.available,
          remaining: typeof data.remaining === 'number' ? data.remaining : 0,
          claimed: typeof data.claimed === 'number' ? data.claimed : 0,
          total: typeof data.total === 'number' ? data.total : 15,
        });
      })
      .catch((err) => {
        console.error('Failed to load founding status:', err);
        setStatus({ loaded: true, available: false, remaining: 0, claimed: 0, total: 15 });
      });
  }, []);

  return status;
}
