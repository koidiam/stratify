import { useState, useEffect } from 'react';

export interface FoundingStatus {
  loaded: boolean;
  available: boolean;
  remaining: number;
}

export function useFoundingStatus() {
  const [status, setStatus] = useState<FoundingStatus>({
    loaded: false,
    available: false,
    remaining: 0,
  });

  useEffect(() => {
    fetch('/api/checkout/availability')
      .then(res => res.json())
      .then(data => {
        setStatus({
          loaded: true,
          available: !!data.available,
          remaining: typeof data.remaining === 'number' ? data.remaining : 0,
        });
      })
      .catch((err) => {
        console.error('Failed to load founding status:', err);
        setStatus({ loaded: true, available: false, remaining: 0 });
      });
  }, []);

  return status;
}
