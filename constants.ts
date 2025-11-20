
// PTKP Constants (Per Tahun)
export const PTKP_BASE = 54000000;
export const PTKP_MARRIED = 4500000;
export const PTKP_PER_CHILD = 4500000;
export const MAX_CHILDREN = 3;

// Biaya Jabatan
export const BIAYA_JABATAN_RATE = 0.05;
export const MAX_BIAYA_JABATAN_ANNUAL = 6000000;

// PPh 21 Brackets (UU HPP)
export const PPH21_BRACKETS = [
  { limit: 60000000, rate: 0.05 },
  { limit: 250000000, rate: 0.15 },
  { limit: 500000000, rate: 0.25 },
  { limit: 5000000000, rate: 0.30 },
  { limit: Infinity, rate: 0.35 },
];

// PPh 23 Rates
export const PPH23_RATES = {
  DIVIDEND: 0.15,
  ROYALTY: 0.15,
  PRIZE: 0.15, // Hadiah
  RENT: 0.02,  // Sewa Harta (selain tanah/bangunan)
  SERVICE: 0.02, // Jasa Teknik, Manajemen, etc.
};

// PPN Rate
export const PPN_RATE = 0.11; // 11% per 2024

// PPh Final Rates (Selected common ones)
export const PPH_FINAL_RATES = [
  { id: 'RENT_LAND_BUILDING', label: 'Sewa Tanah/Bangunan', rate: 0.10 },
  { id: 'CONSTRUCTION_SME', label: 'Konstruksi (Kecil)', rate: 0.0175 },
  { id: 'CONSTRUCTION_MID_LARGE', label: 'Konstruksi (Menengah/Besar)', rate: 0.0265 },
  { id: 'SME_TURNOVER', label: 'UMKM (Omzet Bruto < 4.8M)', rate: 0.005 }, // PP 23/2018
];

// PPNBM Rates (Categorized simplified)
export const PPNBM_RATES = [
  { id: '10', label: '10% - Kendaraan Umum, Alat Rumah Tangga', rate: 0.10 },
  { id: '20', label: '20% - Hunian Mewah, Apartemen, Townhouse', rate: 0.20 },
  { id: '30', label: '30% - Peralatan Olahraga (Golf, dsb)', rate: 0.30 },
  { id: '40', label: '40% - Balon Udara, Peluru Senjata', rate: 0.40 },
  { id: '50', label: '50% - Pesawat Udara, Helikopter, Senjata Api', rate: 0.50 },
  { id: '60', label: '60% - Kendaraan Bermotor Roda 2 (>250cc-500cc)', rate: 0.60 },
  { id: '75', label: '75% - Kapal Pesiar, Yacht', rate: 0.75 },
  { id: '95', label: '95% - Supercar / Kendaraan Sangat Mewah', rate: 0.95 },
];

// BEA CUKAI (Import) Constants
export const BC_THRESHOLD_USD = 3.00; // De Minimis Value
export const BC_GENERAL_BM_RATE = 0.075; // 7.5%
export const BC_GENERAL_PPH_RATE = 0; // 0% for general goods > $3 under CN
export const BC_PPN_RATE = 0.11; // 11%

// Specific Goods (MFN Rates Estimation)
export const BC_GOODS_CATEGORY = [
  { id: 'GENERAL', label: 'Umum (General)', bm: 0.075, pph: 0 },
  { id: 'BAGS', label: 'Tas (Bags)', bm: 0.20, pph: 0.075 }, // Range 15-20%, PPh 7.5-10%
  { id: 'SHOES', label: 'Sepatu (Shoes)', bm: 0.30, pph: 0.10 }, // Range 25-30%, PPh 10%
  { id: 'TEXTILE', label: 'Tekstil / Baju', bm: 0.25, pph: 0.05 }, // Range 15-25%
];

// NPPN Professions (Freelancer / Pekerjaan Bebas)
// Ref: PER-17/PJ/2015 (Approximation for 10 Ibukota Propinsi which is most common)
export const NPPN_PROFESSIONS = [
  { id: 'DOCTOR', label: 'Dokter', rate: 0.50 },
  { id: 'LAWYER', label: 'Pengacara', rate: 0.50 },
  { id: 'CONSULTANT', label: 'Konsultan', rate: 0.50 },
  { id: 'NOTARY', label: 'Notaris', rate: 0.50 },
  { id: 'ARCHITECT', label: 'Arsitek', rate: 0.50 },
  { id: 'ACCOUNTANT', label: 'Akuntan', rate: 0.50 },
  { id: 'ARTIST', label: 'Seniman / Musisi / Aktor', rate: 0.50 },
  { id: 'WRITER', label: 'Penulis / Sastrawan', rate: 0.50 },
  { id: 'RESEARCHER', label: 'Peneliti / Pengajar', rate: 0.50 },
  { id: 'ATHLETE', label: 'Olahragawan', rate: 0.35 },
  { id: 'AGENT', label: 'Agen Asuransi / Perantara', rate: 0.50 },
  { id: 'DISTRIBUTOR_MLM', label: 'Distributor MLM', rate: 0.50 },
  { id: 'OTHER', label: 'Jasa Lainnya', rate: 0.50 },
];
