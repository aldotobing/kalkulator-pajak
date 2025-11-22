# Kalkulator Pajak Pro Indonesia

**Aplikasi kalkulator pajak profesional untuk Indonesia dengan dukungan AI**

---

## Deskripsi

Aplikasi web modern untuk menghitung berbagai jenis pajak Indonesia dengan cepat dan akurat. Dilengkapi asisten AI berbasis **Google Gemini** untuk konsultasi pajak real-time.

---

## Fitur Utama

### Kalkulator Pajak
- **PPh 21** - Pajak karyawan dengan PTKP otomatis & tarif progresif
- **PPh 23** - Dividen, royalti, jasa (tarif 2% & 15%)
- **PPh Final** - UMKM & sewa properti
- **PPN** - Pajak Pertambahan Nilai 11%
- **PPnBM** - Pajak Barang Mewah (10%-95%)

### Fitur Lainnya
- 🤖 **Asisten AI** - Konsultasi pajak dengan Google Gemini
- 📅 **Kalender Pajak** - Pengingat deadline
- 📜 **Riwayat** - Simpan perhitungan
- 🖨️ **Print-Friendly** - Export ke PDF
- 📱 **Responsive** - Optimal di semua device

---

## Instalasi

### Prasyarat
- Node.js 16+
- pnpm

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd kalkulator-pajak-pro

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local dan tambahkan:
# - GEMINI_API_KEY dari https://aistudio.google.com/
# - VITE_TURNSTILE_SITE_KEY (opsional, sudah ada default untuk development)

# Jalankan aplikasi
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:3000`

### 🔒 Cloudflare Turnstile (Security)

Aplikasi ini menggunakan **Cloudflare Turnstile** sebagai lapisan keamanan untuk melindungi dari bot dan automated attacks. Turnstile adalah alternatif modern dari CAPTCHA yang lebih user-friendly.

**Mengapa Turnstile?**
- ✅ Melindungi dari bot dan spam
- ✅ Pengalaman pengguna lebih baik (tanpa puzzle CAPTCHA)
- ✅ Gratis untuk penggunaan standar
- ✅ Privacy-focused (tidak tracking pengguna)

**Konfigurasi:**

**Development (Default):**
- Sudah dikonfigurasi dengan test key yang selalu pass
- Tidak perlu setup tambahan untuk development lokal
- Test key: `1x00000000000000000000AA`

**Production:**
1. Daftar di [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Buat Turnstile site key baru
3. Tambahkan ke `.env.local`:
   ```env
   VITE_TURNSTILE_SITE_KEY=your_production_site_key
   ```

### Docker Deployment

```bash
# Setup environment
cp .env.example .env

# Build dan jalankan
docker-compose up -d
```

Aplikasi akan berjalan di `http://localhost:8080`

Lihat [DOCKER.md](./DOCKER.md) untuk deployment lengkap.

---

## Teknologi

- **React 19** + **TypeScript 5.8** + **Vite 6**
- **Tailwind CSS** - Styling
- **Google Gemini AI** - Asisten pajak
- **LocalStorage** - Persistensi data

---

## Logika Perhitungan

### PPh 21

```
Penghasilan Bruto = (Gaji + Tunjangan) × 12 + Bonus
Biaya Jabatan = min(Bruto × 5%, Rp 6.000.000)
Penghasilan Neto = Bruto - Biaya Jabatan
PKP = Neto - PTKP
```

**Tarif Progresif:**
- 0-60 juta: 5%
- 60-250 juta: 15%
- 250-500 juta: 25%
- 500 juta-5 miliar: 30%
- >5 miliar: 35%

**PTKP:**
- TK/0: Rp 54 juta
- K/0: Rp 58,5 juta
- K/1: Rp 63 juta
- K/2: Rp 67,5 juta
- K/3: Rp 72 juta

---

## Keamanan & Privacy

- ✅ No backend - semua perhitungan di browser
- ✅ Data tersimpan lokal (LocalStorage)
- ✅ Tidak ada tracking
- ⚠️ Hasil bersifat estimasi - konsultasikan dengan konsultan pajak profesional

---

## License

MIT License - Lihat [LICENSE](./LICENSE)

---

## Disclaimer

**PENTING**: Aplikasi ini adalah alat bantu estimasi dan **BUKAN** pengganti konsultasi pajak profesional. Pengembang tidak bertanggung jawab atas kerugian finansial atau hukum dari penggunaan aplikasi ini.

---

<div align="center">

**Dibuat dengan ❤️ untuk Wajib Pajak Indonesia**

⭐ Star repository ini jika bermanfaat!

</div>
