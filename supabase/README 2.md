# Supabase Kurulumu

Bu projede Supabase Table Editor'da gorunmesi gereken ana tablolar sunlar:

- `profiles`
- `onboarding`
- `content_history`
- `usage_tracking`
- `post_feedback`
- `subscriptions`

`subscriptions` tablosu mevcut uygulama akisi icin zorunlu degildir; aktif kod su an plan bilgisini `profiles.plan` uzerinden okur. Yine de ileride Stripe veya baska bir odeme sistemi baglandiginda veri modeli hazir olsun diye eklendi.

Kurulum:

1. Supabase Dashboard -> SQL Editor ac.
2. `supabase/migrations/20260328143000_initial_schema.sql` dosyasindaki SQL'i calistir.
3. Ardindan Table Editor'da yukaridaki tablolari goruyor olman gerekir.

Notlar:

- `auth.users` Supabase tarafindan yonetilir; `public` schema altinda gorunmez.
- `profiles` tablosu yeni auth kullanicisi olusunca trigger ile otomatik kayit acar.
- Uygulama tarafinda billing UI henuz tam degil, bu yuzden `subscriptions` daha cok hazirlik amaclidir.
