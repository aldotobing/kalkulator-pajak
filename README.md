# Kalkulator Pajak Pro Indonesia

**Aplikasi kalkulator pajak profesional untuk Indonesia dengan dukungan AI**

---

## 📋 Daftar Isi

- [Deskripsi](#-deskripsi)
- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Deployment](#-deployment)
- [Logika Perhitungan](#-logika-perhitungan)
- [Keamanan & Privacy](#-keamanan--privacy)
- [Struktur Folder](#-struktur-folder)
- [SEO & Analytics](#-seo--analytics)
- [License](#-license)
- [Disclaimer](#-disclaimer)

---

## 📖 Deskripsi

Kalkulator Pajak Pro adalah aplikasi web modern untuk menghitung berbagai jenis pajak Indonesia dengan cepat dan akurat. Dilengkapi dengan asisten AI berbasis **Google Gemini** untuk konsultasi pajak real-time.

Aplikasi ini dirancang untuk:
- ✅ Karyawan yang ingin menghitung PPh 21
- ✅ Freelancer & pekerja bebas (NPPN)
- ✅ UMKM & pengusaha kecil
- ✅ Konsultan pajak & akuntan
- ✅ Siapa saja yang perlu menghitung pajak Indonesia

---

## ✨ Fitur Utama

### 🧮 Kalkulator Pajak

| Jenis Pajak | Deskripsi |
|-------------|-----------|
| **PPh 21** | Pajak karyawan dengan PTKP otomatis & tarif progresif (TER 2025) |
| **PPh 23** | Dividen, royalti, jasa, sewa harta (tarif 2% & 15%) |
| **PPh Final** | UMKM 0.5%, sewa tanah/bangunan 10%, pesangon |
| **PPN** | Pajak Pertambahan Nilai 11% (inklusif & eksklusif) |
| **PPnBM** | Pajak Barang Mewah (10%-95%) untuk mobil, apartemen, yacht |
| **Bea Cukai** | Pajak impor & barang kiriman (threshold $3 USD) |
| **NPPN** | Pajak freelancer dengan Norma Penghitungan (dokter, pengacara, dll) |
| **Sanksi** | Denda telat bayar & telat lapor SPT |
| **PKB** | Pajak Kendaraan Bermotor (semua provinsi) |
| **BPHTB** | Pajak jual beli properti (5% + PPh 2.5%) |
| **Pajak Investasi** | Kripto, saham, emas, obligasi, P2P lending |
| **PPh Badan** | Pajak perusahaan (UMKM 0.5%, normal 22%) |

### 🛠️ Fitur Tambahan

| Fitur | Deskripsi |
|-------|-----------|
| 🤖 **Asisten AI** | Konsultasi pajak real-time dengan Google Gemini |
| 📝 **Pembuat Surat** | Generate surat pajak (SP2DK, keberatan, permohonan) |
| 📅 **Kalender Pajak** | Deadline lapor & bayar SPT Masa/Tahunan |
| 📊 **Komparasi Pajak** | Bandingkan beban pajak karyawan vs UMKM vs freelancer |
| 🏥 **Cek Risiko Pajak** | Deteksi potensi SP2DK & audit dengan benchmark industri |
| 📈 **Simulasi Gaji** | Negosiasi gross-to-net salary |
| 📜 **Riwayat** | Simpan & ekspor history perhitungan |
| 🖨️ **Print-Friendly** | Export hasil ke PDF |
| 📱 **Responsive** | Optimal di desktop, tablet, & mobile |
| 🌐 **SEO Optimized** | Structured data, dynamic meta tags, sitemap |

---

## 🚀 Teknologi

### Frontend
- **React 19** - UI Library
- **TypeScript 5.8** - Type safety
- **Vite 6** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library
- **Recharts** - Data visualization

### AI & Backend
- **Google Gemini 2.5 Flash** - AI tax assistant
- **Cloudflare Pages** - Hosting & deployment
- **Cloudflare Pages Functions** - Serverless API proxy

### DevOps
- **pnpm** - Package manager
- **Docker** - Containerization
- **nginx** - Web server (Docker)

---

## 📦 Instalasi

### Prasyarat

- **Node.js** 18+ (recommended: 20+)
- **pnpm** 8+ (`npm install -g pnpm`)
- **Git** (untuk clone repository)

### Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd kalkulator-pajak-pro

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env.local

# 4. Edit .env.local dan tambahkan API key
# Dapatkan dari: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_actual_api_key_here

# 5. Jalankan development server
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### Build untuk Production

```bash
# Build
pnpm build

# Preview production build
pnpm preview
```

Output akan tersimpan di folder `dist/`

---

## ⚙️ Konfigurasi

### Environment Variables

Buat file `.env.local` di root directory:

```env
# Gemini API Key (Required untuk AI features)
# Dapatkan dari: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Cloudflare Turnstile (untuk production)
# VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

### 🔒 Keamanan API Key

**PENTING:** Jangan pernah commit `.env.local` ke Git!

File `.env.local` sudah ditambahkan ke `.gitignore`. Hanya `.env.example` yang di-commit sebagai template.

### Mendapatkan Gemini API Key

1. Kunjungi [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Login dengan akun Google
3. Klik "Create API Key"
4. Copy key dan paste ke `.env.local`
5. **Optional:** Restrict API key ke domain Anda untuk keamanan tambahan

---

## 🌐 Deployment

### Cloudflare Pages (Recommended)

```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login ke Cloudflare
wrangler login

# 3. Deploy
wrangler pages deploy dist/ --project-name=kalkulator-pajak-pro
```

**Setting Environment Variables di Cloudflare:**

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih **Workers & Pages** → Project Anda
3. **Settings** → **Environment Variables**
4. Tambahkan:
   - `GEMINI_API_KEY` = your_api_key
5. **Redeploy** untuk apply changes

### Docker Deployment

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env dengan API key Anda

# 2. Build dan jalankan
docker-compose up -d

# 3. Akses aplikasi
# http://localhost:8080
```

### Manual Deployment (VPS/Shared Hosting)

```bash
# 1. Build aplikasi
pnpm build

# 2. Upload folder 'dist' ke server

# 3. Konfigurasi nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🧮 Logika Perhitungan

### PPh 21 (Karyawan)

```
Penghasilan Bruto = (Gaji + Tunjangan) × 12 + Bonus
Biaya Jabatan = min(Bruto × 5%, Rp 6.000.000)
Penghasilan Neto = Bruto - Biaya Jabatan

Iuran Pensiun = min(Gaji × 1%, Rp 10.042.300 × 1%)
Iuran JHT = Gaji × 2%

Penghasilan Neto Setelah Iuran = Neto - Iuran Pensiun - Iuran JHT
PTKP = Penghasilan Tidak Kena Pajak (lihat tabel)

PKP = Neto Setelah Iuran - PTKP
PPh 21 Terutang = PKP × Tarif Progresif
```

### Tarif Progresif PPh 21 (UU HPP)

| Lapisan PKP | Tarif |
|-------------|-------|
| 0 - 60 juta | 5% |
| 60 - 250 juta | 15% |
| 250 - 500 juta | 25% |
| 500 juta - 5 miliar | 30% |
| > 5 miliar | 35% |

### PTKP (Per Tahun 2025)

| Status | PTKP |
|--------|------|
| TK/0 (Lajang) | Rp 54.000.000 |
| K/0 (Menikah, 0 anak) | Rp 58.500.000 |
| K/1 (1 anak) | Rp 63.000.000 |
| K/2 (2 anak) | Rp 67.500.000 |
| K/3 (3 anak) | Rp 72.000.000 |

*Catatan: Maksimal 3 anak untuk PTKP*

### PPh 23

| Jenis Penghasilan | Tarif |
|-------------------|-------|
| Dividen | 15% |
| Royalti | 15% |
| Hadiah/Penghargaan | 15% |
| Jasa (teknik, manajemen, dll) | 2% |
| Sewa harta (selain tanah/bangunan) | 2% |

### PPN (Pajak Pertambahan Nilai)

```
PPN = Dasar Pengenaan Pajak × 11%
```

### Bea Cukai (Impor)

```
Bea Masuk = Nilai CIF × Tarif BM (sesuai kategori)
PPN Impor = (Nilai CIF + Bea Masuk) × 11%
PPh Impor = Nilai CIF × Tarif PPh (0% - 10%)

Total = Bea Masuk + PPN Impor + PPh Impor
```

**Threshold:** $3 USD (de minimis)

---

## 🔒 Keamanan & Privacy

### Keamanan Data

- ✅ **No backend** - Semua perhitungan dilakukan di browser client
- ✅ **LocalStorage** - Data tersimpan lokal di device pengguna
- ✅ **No tracking** - Tidak ada analytics atau tracking pihak ketiga
- ✅ **HTTPS** - Enkripsi data in-transit (di production)
- ✅ **API Proxy** - Gemini API key terlindungi di serverless function

### Privacy

- ✅ Data tidak dikirim ke server (kecuali untuk AI queries)
- ✅ Tidak ada cookies tracking
- ✅ Tidak ada iklan
- ✅ Open source - kode dapat diaudit publik

### Best Practices

1. **Jangan share API key** - Simpan `.env.local` dengan aman
2. **Gunakan API restrictions** - Batasi Gemini API key ke domain tertentu
3. **Enable HTTPS** - Wajib untuk production
4. **Regular updates** - Update dependencies secara berkala

---

## 📁 Struktur Folder

```
kalkulator-pajak-pro/
├── public/
│   ├── favicon.ico          # Favicon
│   ├── og-image.jpg         # Open Graph image
│   ├── robots.txt           # Crawl directives
│   └── sitemap.xml          # Sitemap untuk SEO
├── src/
│   ├── components/          # React components
│   │   ├── CalculatorPPH21.tsx
│   │   ├── CalculatorNPPN.tsx
│   │   ├── AIWidget.tsx
│   │   ├── SplashScreen.tsx
│   │   └── ...
│   ├── services/
│   │   └── geminiService.ts # AI service
│   ├── constants.ts         # Tax constants & rates
│   ├── App.tsx              # Main app component
│   └── index.tsx            # Entry point
├── .env.example             # Environment template
├── .env.local               # Local environment (gitignored)
├── docker-compose.yml       # Docker configuration
├── Dockerfile               # Docker build instructions
├── nginx.conf               # Nginx configuration
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite configuration
└── README.md                # This file
```

---

## 🔍 SEO & Analytics

### Fitur SEO

- ✅ **Meta tags** - Dynamic title & description per calculator
- ✅ **Open Graph** - Social media sharing optimization
- ✅ **Twitter Cards** - Twitter sharing optimization
- ✅ **JSON-LD** - Structured data untuk rich snippets
- ✅ **Sitemap** - XML sitemap untuk semua calculator
- ✅ **Robots.txt** - Crawl directives untuk search engines
- ✅ **Canonical URLs** - Prevent duplicate content
- ✅ **Mobile-friendly** - Responsive design

### Structured Data

Aplikasi menggunakan JSON-LD untuk:
- **WebApplication** - Deskripsi aplikasi
- **Organization** - Informasi organisasi
- **FAQPage** - FAQ untuk rich snippets

### URL Parameters

Akses langsung ke calculator spesifik:

```
https://kalkulator-pajak.pages.dev/?type=pph21      # PPh 21 Karyawan
https://kalkulator-pajak.pages.dev/?type=nppn       # Freelancer
https://kalkulator-pajak.pages.dev/?type=sanksi     # Sanksi Pajak
https://kalkulator-pajak.pages.dev/?type=pph23      # PPh 23
https://kalkulator-pajak.pages.dev/?type=final      # PPh Final
https://kalkulator-pajak.pages.dev/?type=ppn        # PPN
https://kalkulator-pajak.pages.dev/?type=ppnbm      # PPnBM
https://kalkulator-pajak.pages.dev/?type=beacukai   # Bea Cukai
https://kalkulator-pajak.pages.dev/?type=pkb        # Pajak Kendaraan
https://kalkulator-pajak.pages.dev/?type=bphtb      # Pajak Properti
```

---

## 📝 License

MIT License - Lihat [LICENSE](./LICENSE)

### Ringkasan License

- ✅ Bebas digunakan untuk keperluan pribadi & komersial
- ✅ Bebas dimodifikasi & didistribusikan
- ✅ Harus menyertakan copyright notice
- ❌ Tidak ada garansi

---

## ⚠️ Disclaimer

**PENTING:**

1. **Aplikasi ini adalah alat bantu estimasi** dan **BUKAN** pengganti konsultasi pajak profesional.

2. **Akurasi:** Meskipun kami berusaha memberikan perhitungan yang akurat sesuai regulasi terbaru, peraturan pajak dapat berubah. Selalu verifikasi dengan:
   - Konsultan pajak bersertifikat
   - Kantor Pelayanan Pajak (KPP) terdekat
   - Situs resmi Direktorat Jenderal Pajak (pajak.go.id)

3. **Tanggung Jawab:** Pengembang **TIDAK bertanggung jawab** atas:
   - Kerugian finansial atau hukum dari penggunaan aplikasi
   - Perbedaan perhitungan dengan ketentuan resmi
   - Keterlambatan atau kesalahan pelaporan pajak

4. **Update:** Aplikasi ini diupdate secara berkala, namun mungkin tidak selalu mencerminkan perubahan regulasi terbaru.

5. **AI Disclaimer:** Jawaban dari AI assistant adalah informasi umum dan **BUKAN** nasihat pajak resmi. Selalu konsultasikan dengan profesional untuk kasus spesifik.

---

## 🤝 Kontribusi

Kontribusi sangat diapresiasi! Silakan:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📞 Support

- **Email:** support@pajakkupro.com (contoh)
- **Issues:** GitHub Issues
- **Dokumentasi:** Wiki repository

---

<div align="center">

**Dibuat dengan ❤️ untuk Wajib Pajak Indonesia**

*Kalkulator Pajak Pro - Solusi Pajak Lengkap Indonesia*

⭐ Star repository ini jika bermanfaat!

</div>
