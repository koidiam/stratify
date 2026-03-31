import { useState, useEffect } from 'react';

export type FoundingStatusType = 'loading' | 'available' | 'sold_out' | 'error';

export interface FoundingStatus {
  loaded: boolean;
  status: FoundingStatusType;
  remaining: number;
  claimed: number;
  total: number;
}

export function useFoundingStatus() {
  const [data, setData] = useState<FoundingStatus>({
    loaded: false,
    status: 'loading',
    remaining: 0,
    claimed: 0,
    total: 15,
  });

  useEffect(() => {
    fetch('/api/checkout/availability')
      .then(res => res.json())
      .then(d => {
        if (d.status === 'error' || !d.status) {
           setData({ loaded: true, status: 'error', remaining: 0, claimed: 0, total: 15 });
        } else {
           setData({
             loaded: true,
             status: d.status, // 'available' | 'sold_out'
             remaining: d.remaining ?? 0,
             claimed: d.claimed ?? 0,
             total: d.total ?? 15,
           });
        }
      })
      .catch((err) => {
        console.error('Failed to load founding status:', err);
        setData({ loaded: true, status: 'error', remaining: 0, claimed: 0, total: 15 });
      });
  }, []);

  return data;
}
