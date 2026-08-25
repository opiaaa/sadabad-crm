# Sadabad Emlak CRM — Scaffold

Next.js + PostgreSQL + Prisma + NextAuth. Rol bazlı: **ADMIN** tüm lead/portföyü görür,
**AGENT** kendi atanmış lead'lerini + paylaşımlı portföy havuzunu görür.

## Kurulum

```bash
npm install
cp .env.example .env   # DATABASE_URL ve NEXTAUTH_SECRET'i doldur
npx prisma migrate dev --name init
npm run prisma:seed    # örnek admin + danışman hesabı oluşturur
npm run dev
```

Seed sonrası giriş bilgileri:
- admin@sadabademlak.com / degistir123
- danisman1@sadabademlak.com / degistir123

**İlk girişten sonra bu şifreleri mutlaka değiştirin** (şu an değiştirme ekranı yok — Prisma Studio üzerinden ya da eklenecek bir "şifre değiştir" sayfasından yapılmalı).

## Şu an ne çalışıyor

- Lead ekleme, listeleme, aşama güncelleme (Yeni → Görüşüldü → Gösterim → Teklif → Kazanıldı/Kaybedildi)
- Portföy ekleme ve listeleme (paylaşımlı havuz)
- Görev (Task) modeli ve API'si
- **Soğuyan lead tespiti**: 3 gündür temas edilmeyen lead'ler `/api/leads/stale` üzerinden dashboard'da kırmızı listelenir
- Rol bazlı erişim: danışman sadece kendi lead'lerini düzenleyebilir, admin hepsini görür

## Henüz eklenmedi — sıradaki adımlar

1. **Görev ekleme arayüzü** — API hazır (`/api/tasks`), sayfa yok. Dashboard'dan "hatırlatma ekle" formu eklenmeli.
2. **Otomatik günlük hatırlatma bildirimi** — şu an sadece dashboard'a girince görünüyor. Cron job + email/WhatsApp bildirimi eklenirse takip disiplini pasif değil aktif hale gelir (önerilir).
3. **Lead-portföy eşleştirme UI** — `LeadPropertyMatch` modeli veritabanında var, arayüzü yok. Bir lead'in kriterlerine uyan portföyleri otomatik listeleyen bir görünüm eklenmeli.
4. **Etkileşim geçmişi (Interaction) UI** — model hazır, "not ekle / arama kaydı" formu eklenmeli.
5. Kullanıcı yönetimi ekranı (admin yeni danışman eklesin) — şu an sadece seed script veya Prisma Studio ile yapılıyor.
6. Fotoğraf yükleme (şu an sadece `photoUrls: string[]` alanı var, dosya yükleme entegrasyonu yok — S3/Cloudinary önerilir).

## Barındırma

VPS üzerinde Docker ile: Postgres container + Next.js `npm run build && npm run start`.
Basit alternatif: Vercel (frontend/API) + Supabase/Neon (Postgres) — kurulum daha hızlı ama aylık maliyet oluşur.
