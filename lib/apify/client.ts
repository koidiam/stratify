const APIFY_BASE = 'https://api.apify.com/v2';

interface RunActorOptions {
  maxItems?: number;
}

function getApifyToken(): string {
  const token = process.env.APIFY_API_TOKEN;

  if (!token) {
    throw new Error('APIFY_API_TOKEN is not configured.');
  }

  return token;
}

export async function runApifyActor<T>(
  actorId: string,
  input: Record<string, unknown>,
  options: RunActorOptions = {}
): Promise<T[]> {
  const token = getApifyToken();
  const params = new URLSearchParams({
    token,
  });

  if (typeof options.maxItems === 'number') {
    params.set('maxItems', String(options.maxItems));
  }

  // 15 saniyelik timeout kalkanı: Next.js Vercel 60s/10s timeout'undan önce patlamalı
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(
      `${APIFY_BASE}/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?${params.toString()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
        cache: 'no-store',
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Apify actor ${actorId} failed with status ${response.status}.`);
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      throw new Error(`Apify actor ${actorId} returned an unexpected payload.`);
    }

    return data as T[];
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
