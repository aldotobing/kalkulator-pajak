
import React, { useState } from 'react';
import { 
  ChevronDown, 
  BookOpen, 
  Info, 
  Calculator, 
  Building2, 
  Percent, 
  Gem,
  FileText,
  Link as LinkIcon,
  User,
  Briefcase,
  Ship,
  PenTool
} from './Icons';

interface FAQItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  colorTheme: string;
  eli5: string; // Explain like I'm 5
  howItWorks: string; // The mechanism
  formula: string; // The math
  legalBasis: string; // UU
  officialLink: string;
}

const faqData: FAQItem[] = [
  {
    id: 'biaya_jabatan',
    title: 'Biaya Jabatan',
    icon: <Briefcase size={20} className="text-white" />,
    colorTheme: 'bg-cyan-500',
    eli5: "Bayangkan ini adalah 'ongkos lelah' atau biaya operasionalmu untuk bekerja. Pemerintah tahu bekerja itu butuh modal (transport, baju kerja, makan siang), jadi mereka memberi diskon pajak otomatis sebesar 5% dari gaji kotor. Kamu tidak perlu kumpulkan bon atau kwitansi, potongan ini otomatis diberikan kepada semua karyawan tetap.",
    howItWorks: "Biaya Jabatan adalah pengurang penghasilan bruto. Jadi sebelum gajimu dihitung pajaknya, dikurangi dulu dengan biaya ini. Syaratnya: kamu harus status karyawan tetap.",
    formula: "5% × Gaji Bruto (Maksimal Rp500.000/bulan atau Rp6.000.000/tahun)",
    legalBasis: "UU PPh Pasal 21 ayat (3) & PMK 250/PMK.03/2008",
    officialLink: "https://www.pajak.go.id/id/pph-pasal-21-karyawan"
  },
  {
    id: 'ptkp',
    title: 'PTKP (Penghasilan Tidak Kena Pajak)',
    icon: <User size={20} className="text-white" />,
    colorTheme: 'bg-pink-500',
    eli5: "Anggap saja ini 'jatah hidup' minimal dari negara. Pemerintah tahu kita butuh uang buat makan dan kebutuhan dasar. Jadi, penghasilanmu sebesar angka PTKP ini dianggap 'uang dapur' dan GRATIS dari pajak. Cuma kelebihannya yang dipajaki.",
    howItWorks: "PTKP berfungsi sebagai pengurang penghasilan neto. Nilainya berbeda-beda tergantung statusmu (Jomblo vs Menikah) dan jumlah tanggungan (Anak/Ortu pensiunan). Semakin banyak tanggungan, semakin besar PTKP, dan semakin kecil pajakmu.",
    formula: "Diri Sendiri: 54Jt | Menikah: +4.5Jt | Per Anak: +4.5Jt (Maks 3)",
    legalBasis: "PMK No. 101/PMK.010/2016",
    officialLink: "https://www.pajak.go.id/id/seri-pph-ptkp"
  },
  {
    id: 'pph21',
    title: 'PPh Pasal 21 (Pajak Karyawan)',
    icon: <Calculator size={20} className="text-white" />,
    colorTheme: 'bg-blue-500',
    eli5: "Bayangkan kamu bekerja dan dapat gaji. Pemerintah minta sedikit bagian dari gajimu itu untuk membangun jalan, sekolah, dan rumah sakit. Tapi tenang, Pemerintah baik hati: jika gajimu di bawah batas tertentu (PTKP), kamu gratis pajak!",
    howItWorks: "Pajak ini dipotong langsung oleh kantor dari gaji bulananmu. Jadi uang yang masuk ke rekeningmu sudah 'bersih'. Sifatnya progresif: makin besar gajimu, persentase potongannya makin besar.",
    formula: "(Gaji Bruto Setahun - Biaya Jabatan - PTKP) × Tarif Lapisan Pajak",
    legalBasis: "UU HPP No. 7 Tahun 2021 & PP 58 Tahun 2023",
    officialLink: "https://pajak.go.id/index.php/id/pph-pasal-2126"
  },
  {
    id: 'nppn',
    title: 'PPh Freelancer (NPPN)',
    icon: <PenTool size={20} className="text-white" />,
    colorTheme: 'bg-teal-500',
    eli5: "Kalau kamu Dokter, Youtuber, atau Freelancer yang tidak terikat satu kantor, kamu boleh pakai metode 'kira-kira' (Norma) untuk hitung keuntungan bersihmu. Jadi kamu tidak perlu pembukuan ribet (catat struk bensin, listrik, dll), cukup catat total omzet setahun saja.",
    howItWorks: "Pemerintah sudah menetapkan persentase keuntungan bersih (Norma) untuk setiap pekerjaan. Misal Dokter dianggap untung 50% dari omzet. Jadi pajakmu dihitung dari 50% omzet itu, dikurangi PTKP, lalu dikalikan tarif pajak biasa. Syaratnya omzet setahun < 4.8 Miliar.",
    formula: "(Omzet × Tarif Norma% - PTKP) × Tarif Progresif",
    legalBasis: "PER-17/PJ/2015 & UU HPP",
    officialLink: "https://www.pajak.go.id/id/norma-penghitungan-penghasilan-neto"
  },
  {
    id: 'bea_cukai',
    title: 'Bea Cukai (Pajak Impor)',
    icon: <Ship size={20} className="text-white" />,
    colorTheme: 'bg-indigo-600',
    eli5: "Kalau kamu beli barang dari luar negeri (impor), itu seperti 'tamu' yang masuk ke rumah kita. Tamu ini harus bayar tiket masuk (Bea Masuk) dan pajak (PPN/PPh). Tujuannya supaya harga barang impor tidak terlalu murah dan mematikan produk lokal.",
    howItWorks: "Pemerintah memberi keringanan: Jika harga barang di bawah USD 3, bebas Bea Masuk (tapi tetap bayar PPN). Jika di atas USD 3, kena Bea Masuk + PPN. Hati-hati untuk Tas, Sepatu, dan Tekstil tarifnya jauh lebih tinggi untuk melindungi industri dalam negeri.",
    formula: "Nilai CIF (Harga+Ongkir+Asuransi) × Kurs × (Bea Masuk% + PPN% + PPh%)",
    legalBasis: "PMK 199/PMK.010/2019 & PMK 96/2023",
    officialLink: "https://www.beacukai.go.id/faq/ketentuan-kepabeanan-cukai-dan-pajak-atas-impor-dan-ekspor-barang-kiriman.html"
  },
  {
    id: 'pph23',
    title: 'PPh Pasal 23 (Jasa & Modal)',
    icon: <Building2 size={20} className="text-white" />,
    colorTheme: 'bg-purple-500',
    eli5: "Ini pajak kalau kamu dapat uang 'santai' atau uang dari keahlian khusus. Contoh: Kamu menyewakan alat kamera, atau kamu dapat dividen (bagi hasil) saham, atau kamu dibayar karena jasa desain. Pemberi uang yang akan memotong pajaknya buat negara.",
    howItWorks: "Pihak yang membayar tagihanmu akan memotong 2% (untuk jasa/sewa) atau 15% (untuk dividen/hadiah) dari total tagihan sebelum membayarnya ke kamu. Awas! Kalau kamu tidak punya NPWP, potongannya jadi 2x lipat (100% lebih mahal).",
    formula: "Nilai Bruto Tagihan × Tarif (2% atau 15%)",
    legalBasis: "UU PPh Pasal 23 & PMK-141/PMK.03/2015",
    officialLink: "https://www.pajak.go.id/id/pph-pasal-23"
  },
  {
    id: 'pph_final',
    title: 'PPh Final (Pasal 4 Ayat 2)',
    icon: <Percent size={20} className="text-white" />,
    colorTheme: 'bg-emerald-500',
    eli5: "Ini adalah pajak 'Selesai di Tempat'. Sekali kamu bayar pajak ini saat transaksi, urusannya selesai. Kamu tidak perlu hitung ulang lagi di akhir tahun. Biasanya kena kalau kamu menyewakan rumah, jualan tanah, atau punya usaha UMKM.",
    howItWorks: "Berbeda dengan PPh 21 yang bisa dihitung ulang (kredit pajak), PPh Final benar-benar putus. Uang yang kamu terima sudah dipotong pajak dan tidak bisa diminta kembali/dikreditkan.",
    formula: "Omzet/Nilai Transaksi × Tarif Tertentu (Misal: 0.5% UMKM, 10% Sewa Gedung)",
    legalBasis: "PP 23 Tahun 2018 (UMKM) & UU PPh Pasal 4 ayat (2)",
    officialLink: "https://www.pajak.go.id/id/pph-final"
  },
  {
    id: 'ppn',
    title: 'PPN (Pajak Pertambahan Nilai)',
    icon: <Percent size={20} className="text-white" />,
    colorTheme: 'bg-orange-500',
    eli5: "Pernah beli jajan di minimarket dan harganya nambah sedikit? Itu PPN. Ini adalah pajak 'titipan' saat kita membeli barang atau jasa. Penjual memungut dari kita, lalu menyetorkannya ke negara.",
    howItWorks: "Setiap ada pertambahan nilai (dari pabrik -> distributor -> toko -> kita), ada pajak 11%. PPN sebenarnya beban konsumen akhir (kita). Pengusaha hanya bertugas memungut dan menyetor.",
    formula: "Harga Jual × 11%",
    legalBasis: "UU HPP (Klaster PPN) - Berlaku Tarif 11% sejak 2022",
    officialLink: "https://www.pajak.go.id/id/ppn"
  },
  {
    id: 'ppnbm',
    title: 'PPnBM (Pajak Barang Mewah)',
    icon: <Gem size={20} className="text-white" />,
    colorTheme: 'bg-rose-500',
    eli5: "Ini pajak khusus 'Sultan'. Kalau kamu beli barang yang super mewah (Ferrari, Yacht, Apartemen Mahal), kamu kena pajak ekstra selain PPN. Tujuannya supaya adil: yang kaya banget bayar pajak lebih banyak.",
    howItWorks: "Hanya dipungut SATU KALI saja, yaitu saat barang itu diproduksi pabrik atau saat diimpor masuk ke Indonesia. Jadi kalau kamu beli mobil bekas mewah, biasanya tidak kena PPnBM lagi.",
    formula: "(Harga Barang - PPN) × Tarif Mewah (10% s.d. 200%)",
    legalBasis: "UU PPN dan PPnBM",
    officialLink: "https://www.pajak.go.id/id/ppnbm"
  }
];

const FAQPage: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('biaya_jabatan');

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* Header Card - Compact Version */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-slate-200/50 flex flex-col md:flex-row items-center gap-5 border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        
        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner shrink-0">
           <BookOpen size={24} className="text-blue-300" />
        </div>
        
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-lg md:text-xl font-bold mb-1 tracking-tight text-white">Pusat Edukasi Pajak</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Penjelasan sederhana mengenai jenis-jenis pajak, dirangkum dari peraturan resmi Indonesia.
          </p>
        </div>
      </div>

      {/* Accordion List */}
      <div className="grid grid-cols-1 gap-3">
        {faqData.map((item) => {
          const isOpen = openId === item.id;
          
          return (
            <div 
              key={item.id}
              className={`bg-white rounded-2xl transition-all duration-300 border overflow-hidden ${
                isOpen 
                  ? 'shadow-lg shadow-blue-100/40 border-blue-100 ring-1 ring-blue-50' 
                  : 'shadow-sm border-slate-100 hover:border-slate-200'
              }`}
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggle(item.id)}
                className="w-full p-5 flex items-center justify-between text-left focus:outline-none group"
              >
                <div className="flex items-center gap-4 md:gap-5">
                  <div className={`p-2.5 md:p-3 rounded-xl transition-transform duration-500 group-hover:scale-110 shadow-md shadow-blue-500/10 shrink-0 ${item.colorTheme}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className={`text-base md:text-lg font-bold transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-700'}`}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium group-hover:text-blue-500 transition-colors">
                      {isOpen ? 'Klik untuk menutup' : 'Klik untuk pelajari detail'}
                    </p>
                  </div>
                </div>
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border transition-all duration-300 shrink-0 ${isOpen ? 'rotate-180 bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-400'}`}>
                  <ChevronDown size={16} />
                </div>
              </button>
              
              {/* Accordion Body */}
              <div 
                className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-6 md:px-8 md:pb-8 pt-0 space-y-6">
                    
                    {/* Section 1: ELI5 */}
                    <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                          Penjelasan Simpel
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm md:text-base leading-relaxed font-medium">
                        "{item.eli5}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                      {/* Section 2: Technical Logic */}
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold uppercase tracking-wider text-[10px]">
                            <Info size={14} className="text-blue-500" />
                            Cara Kerja
                          </div>
                          <p className="text-slate-600 text-xs md:text-sm leading-relaxed text-justify">
                            {item.howItWorks}
                          </p>
                        </div>
                        
                        <div className="bg-slate-900 rounded-xl p-4 text-white font-sans text-xs md:text-sm shadow-md relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-2 opacity-10">
                             <Calculator size={32} />
                          </div>
                          <div className="text-slate-400 text-[10px] uppercase font-bold mb-1 relative z-10">Rumus Dasar</div>
                          <div className="relative z-10 leading-relaxed font-medium">{item.formula}</div>
                        </div>
                      </div>

                      {/* Section 3: Legal & Links */}
                      <div className="flex flex-col h-full justify-between">
                         <div>
                            <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold uppercase tracking-wider text-[10px]">
                              <FileText size={14} className="text-blue-500" />
                              Dasar Hukum
                            </div>
                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                              <div className="flex items-start gap-2.5">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                                <span className="text-xs md:text-sm font-medium text-slate-700">{item.legalBasis}</span>
                              </div>
                            </div>
                         </div>

                         <a 
                           href={item.officialLink} 
                           target="_blank" 
                           rel="noreferrer"
                           className="mt-4 md:mt-0 flex items-center justify-between w-full p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all group font-bold text-xs md:text-sm"
                         >
                           <span className="flex flex-col items-start">
                             <span>Baca Selengkapnya</span>
                             <span className="text-[10px] font-normal opacity-70 group-hover:text-blue-100">di Situs Resmi DJP / Bea Cukai</span>
                           </span>
                           <div className="bg-white/50 p-1.5 rounded-full group-hover:bg-white/20 transition-colors">
                              <LinkIcon size={14} className="group-hover:translate-x-0.5 transition-transform" />
                           </div>
                         </a>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="flex items-center justify-center gap-2 mt-8 text-slate-400 text-xs font-medium bg-white/50 py-2 px-4 rounded-full w-fit mx-auto backdrop-blur-sm border border-slate-100">
         <Info size={12} />
         <p>Informasi merujuk pada peraturan perpajakan Indonesia terbaru (UU HPP & PMK).</p>
      </div>
    </div>
  );
};

export default FAQPage;
