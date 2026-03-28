# Stratify

LinkedIn icerik stratejisi ve haftalik post uretimi icin Next.js + Supabase tabanli uygulama.

## Hizli Baslangic

1. Bagimliliklari yukle:

```bash
npm install
```

2. `.env.local` icine su degiskenleri ekle:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Supabase semasini kur:

- `supabase/migrations/20260328143000_initial_schema.sql`
- `supabase/README.md`

4. Gelistirme sunucusunu baslat:

```bash
npm run dev
```

## Table Editor'da Gormen Gerekenler

SQL dosyasini calistirdiktan sonra `public` schema altinda su tablolar gorunur:

- `profiles`
- `onboarding`
- `content_history`
- `usage_tracking`
- `post_feedback`
- `subscriptions`

`subscriptions` tablosu billing entegrasyonu icin hazirlik amaclidir. Uygulamanin bugunku zorunlu akisi halen `profiles.plan` alanini kullanir.
