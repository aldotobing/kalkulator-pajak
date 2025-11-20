# Kalkulator Pajak Pro Indonesia

<div align="center">

**Aplikasi kalkulator pajak profesional untuk Indonesia dengan dukungan AI**
</div>

---

## Deskripsi

**Kalkulator Pajak Pro** adalah aplikasi web modern yang dirancang untuk membantu wajib pajak Indonesia menghitung berbagai jenis pajak dengan cepat, akurat, dan mudah. Aplikasi ini dilengkapi dengan asisten AI berbasis **Google Gemini** yang dapat memberikan konsultasi pajak personal secara real-time.

### Tujuan Proyek

- Menyederhanakan perhitungan pajak yang kompleks
- Memberikan estimasi pajak yang akurat sesuai regulasi terbaru
- Membantu perencanaan keuangan pribadi dan bisnis
- Edukasi perpajakan melalui FAQ dan panduan interaktif

---

## Fitur Utama

### Kalkulator Pajak Lengkap

| Jenis Pajak | Deskripsi | Fitur Khusus |
|-------------|-----------|--------------|
| **PPh 21** | Pajak Penghasilan untuk karyawan dan pekerja | • Perhitungan PTKP otomatis<br>• Dukungan status kawin & tanggungan<br>• Biaya jabatan 5%<br>• Tarif progresif 5 layer |
| **PPh 23** | Pajak atas dividen, royalti, jasa, dan sewa | • Berbagai kategori jasa<br>• Tarif 2% dan 15%<br>• Penyesuaian NPWP |
| **PPh Final** | Pajak final untuk UMKM dan sewa properti | • Sewa tanah/bangunan (10%)<br>• UMKM PP 23/2018 (0.5%)<br>• Konstruksi |
| **PPN** | Pajak Pertambahan Nilai 11% | • Hitung DPP & PPN<br>• Total invoice otomatis |
| **PPnBM** | Pajak Penjualan Barang Mewah | • 8 kategori tarif (10%-95%)<br>• Kendaraan, properti, yacht |

### Asisten AI Pajak

- **Powered by Google Gemini 2.5 Flash**
- Konsultasi pajak dalam Bahasa Indonesia
- Penjelasan regulasi UU HPP, PPh, PPN
- Analisis kontekstual berdasarkan perhitungan aktif
- Chat interface yang intuitif

### Fitur Tambahan

- **📅 Kalender Pajak**: Pengingat deadline pelaporan dan pembayaran
- **📜 Riwayat Perhitungan**: Simpan dan akses kembali perhitungan sebelumnya
- **❓ FAQ & Panduan**: Pusat informasi perpajakan lengkap
- **🖨️ Print-Friendly**: Cetak hasil perhitungan dengan format profesional
- **📱 Responsive Design**: Optimal di desktop, tablet, dan mobile

---

## Instalasi

### Prasyarat

Pastikan Anda telah menginstal:
- **Node.js** versi 16 atau lebih baru
- **pnpm** (package manager)

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd kalkulator-pajak-pro
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Konfigurasi Environment**
   
   Buat file `.env.local` di root folder:
   ```env
   API_KEY=your_google_gemini_api_key_here
   ```
   
   > **Cara mendapatkan API Key:**
   > 1. Kunjungi [Google AI Studio](https://aistudio.google.com/)
   > 2. Login dengan akun Google
   > 3. Buat API Key baru
   > 4. Copy dan paste ke file `.env.local`

4. **Jalankan aplikasi**
   ```bash
   pnpm dev
   ```

5. **Buka browser**
   
   Aplikasi akan berjalan di `http://localhost:3000`

### 🐳 Deployment dengan Docker (Production)

Untuk deployment production-ready menggunakan Docker:

1. **Quick Start dengan Docker Compose**
   ```bash
   # Set environment variable
   cp .env.example .env
   # Edit .env dan masukkan GEMINI_API_KEY
   
   # Build dan jalankan
   docker-compose up -d
   ```

2. **Akses aplikasi**
   
   Aplikasi akan berjalan di `http://localhost:8080`

3. **Dokumentasi lengkap**
   
   Lihat [DOCKER.md](./DOCKER.md) untuk:
   - Production deployment guide
   - Cloud platform deployment (GCP, AWS, DigitalOcean)
   - Troubleshooting
   - Best practices

---

## Cara Penggunaan

### 1. Menghitung PPh 21 (Pajak Karyawan)

1. Pilih tab **PPh 21** di navigasi atas
2. Masukkan data:
   - Gaji pokok bulanan
   - Tunjangan (jika ada)
   - THR/Bonus tahunan
   - Status pernikahan (TK/K)
   - Jumlah tanggungan (0-3)
   - Status NPWP
3. Klik **Hitung Pajak**
4. Lihat breakdown detail:
   - Penghasilan bruto tahunan
   - Biaya jabatan
   - PTKP (Penghasilan Tidak Kena Pajak)
   - PKP (Penghasilan Kena Pajak)
   - Pajak per layer (5%, 15%, 25%, 30%, 35%)
   - **Pajak bulanan** yang harus dibayar

### 2. Menggunakan Asisten AI

1. Klik ikon **chat** di pojok kanan bawah
2. Ketik pertanyaan Anda, misalnya:
   - "Bagaimana cara menghemat pajak PPh 21?"
   - "Apa bedanya PPh 23 dan PPh Final?"
   - "Jelaskan tentang PTKP"
3. AI akan memberikan jawaban kontekstual berdasarkan perhitungan aktif

### 3. Menyimpan & Melihat Riwayat

1. Setelah menghitung pajak, klik **Simpan ke Riwayat**
2. Akses riwayat melalui tombol **History** di navigasi
3. Klik item riwayat untuk melihat detail lengkap
4. Export atau hapus riwayat sesuai kebutuhan

### 4. Mencetak Hasil

1. Setelah perhitungan selesai, klik **Print** atau **Cetak**
2. Browser akan membuka dialog print
3. Pilih printer atau "Save as PDF"
4. Hasil akan tercetak dengan format profesional

---

## 🛠️ Teknologi

### Frontend Framework
- **React 19.2.0** - UI library dengan React Compiler
- **TypeScript 5.8.2** - Type safety
- **Vite 6.2.0** - Build tool & dev server

### Styling
- **Tailwind CSS** (via CDN) - Utility-first CSS
- **Plus Jakarta Sans** - Modern typography
- **Glassmorphism** - Premium UI effects

### AI & Services
- **Google Gemini AI 1.30.0** - Asisten pajak AI
- **Lucide React 0.554.0** - Icon library

### State Management
- React Hooks (useState, useEffect)
- LocalStorage untuk persistensi data

### Arsitektur Folder

```
kalkulator-pajak-pro/
├── components/           # React components
│   ├── CalculatorPPH21.tsx
│   ├── CalculatorPPH23.tsx
│   ├── CalculatorFinal.tsx
│   ├── CalculatorPPN.tsx
│   ├── CalculatorPPNBM.tsx
│   ├── AIWidget.tsx      # Chat AI widget
│   ├── HistoryPage.tsx   # Halaman riwayat
│   ├── TaxCalendar.tsx   # Kalender pajak
│   ├── FAQPage.tsx       # FAQ & panduan
│   └── Icons.tsx         # Icon components
├── services/             # Business logic
│   ├── taxLogic.ts       # Logika perhitungan pajak
│   ├── geminiService.ts  # Integrasi Gemini AI
│   └── historyService.ts # Manajemen riwayat
├── types.ts              # TypeScript interfaces
├── constants.ts          # Konstanta pajak (PTKP, tarif, dll)
├── App.tsx               # Main app component
├── index.tsx             # Entry point
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies
```

---

## 📐 Logika Perhitungan

### PPh 21 (Pasal 21)

Berdasarkan **UU HPP (Harmonisasi Peraturan Perpajakan)**:

1. **Penghasilan Bruto Tahunan**
   ```
   = (Gaji Bulanan + Tunjangan) × 12 + THR/Bonus
   ```

2. **Biaya Jabatan** (5% dari penghasilan bruto, max 6 juta/tahun)
   ```
   = min(Penghasilan Bruto × 5%, Rp 6.000.000)
   ```

3. **Penghasilan Neto**
   ```
   = Penghasilan Bruto - Biaya Jabatan
   ```

4. **PTKP (Penghasilan Tidak Kena Pajak)**
   - TK/0: Rp 54.000.000
   - K/0: Rp 58.500.000 (TK + Rp 4.500.000)
   - K/1: Rp 63.000.000 (K/0 + Rp 4.500.000)
   - K/2: Rp 67.500.000 (K/1 + Rp 4.500.000)
   - K/3: Rp 72.000.000 (K/2 + Rp 4.500.000)

5. **PKP (Penghasilan Kena Pajak)**
   ```
   = Penghasilan Neto - PTKP
   ```

6. **Tarif Pajak Progresif**
   | Layer | PKP Tahunan | Tarif |
   |-------|-------------|-------|
   | 1 | 0 - 60 juta | 5% |
   | 2 | 60 juta - 250 juta | 15% |
   | 3 | 250 juta - 500 juta | 25% |
   | 4 | 500 juta - 5 miliar | 30% |
   | 5 | > 5 miliar | 35% |

7. **Surcharge tanpa NPWP**: +20% dari pajak terutang

### PPh 23

- **Dividen, Royalti, Hadiah**: 15%
- **Jasa Teknik, Manajemen, Konsultan**: 2%
- **Sewa Harta (selain tanah/bangunan)**: 2%

### PPN (Pajak Pertambahan Nilai)

- **Tarif**: 11% (berlaku sejak April 2022)
- **Rumus**: 
  ```
  PPN = DPP × 11%
  Total Invoice = DPP + PPN
  ```

---

## 🔒 Keamanan & Privacy

- ✅ **No Backend**: Semua perhitungan dilakukan di browser
- ✅ **LocalStorage Only**: Data riwayat tersimpan lokal di device
- ✅ **No Data Collection**: Tidak ada tracking atau analytics
- ✅ **API Key Protection**: Gemini API key disimpan di environment variable
- ⚠️ **Disclaimer**: Hasil perhitungan bersifat estimasi, konsultasikan dengan konsultan pajak profesional untuk keputusan final

---

## 📄 License

Proyek ini dilisensikan di bawah **MIT License**.

Lihat file [LICENSE](./LICENSE) untuk detail lengkap.

---

## 🙏 Acknowledgments

- **Direktorat Jenderal Pajak (DJP)** - Referensi regulasi perpajakan
- **Google Gemini AI** - AI assistant technology
- **React Community** - Framework & ecosystem
- **Tailwind CSS** - Styling framework
- **Lucide Icons** - Beautiful icon set

---

## ⚖️ Disclaimer Legal

> **PENTING**: Aplikasi ini adalah alat bantu estimasi pajak dan **BUKAN** pengganti konsultasi pajak profesional. Hasil perhitungan bersifat indikatif dan dapat berbeda dengan perhitungan resmi DJP. Selalu konsultasikan dengan konsultan pajak bersertifikat atau petugas pajak untuk keputusan perpajakan yang mengikat secara hukum.
> 
> Pengembang tidak bertanggung jawab atas kerugian finansial atau hukum yang timbul dari penggunaan aplikasi ini.

---

<div align="center">

**Dibuat dengan ❤️ untuk Wajib Pajak Indonesia**

⭐ **Star** repository ini jika bermanfaat!

</div>
