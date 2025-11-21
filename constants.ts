
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

// Sanksi / Penalty Constants
export const SANKSI_TYPES = [
  { id: 'TELAT_BAYAR', label: 'Telat Bayar / Pembetulan Sendiri', uplift: 0.05, code: 'Pasal 9 (2a) / Pasal 8 (2)' },
  { id: 'PEMERIKSAAN', label: 'Kurang Bayar (SKPKB) / Pemeriksaan', uplift: 0.20, code: 'Pasal 13 (2)' },
];

export const DEFAULT_KMK_RATE = 0.0583; // Approx 5.83% typical reference, user can edit

// PKB (Pajak Kendaraan Bermotor) Constants (Ref: Perda DKI & Lainnya)
// Progressive rates map: [1st, 2nd, 3rd, 4th, 5th+]
export const PKB_PROVINCES = [
  { 
    id: 'DKI', 
    label: 'DKI Jakarta', 
    rates: [0.02, 0.025, 0.03, 0.04, 0.05],
    legal: 'Perda Prov. DKI Jakarta No. 2 Tahun 2015'
  },
  { 
    id: 'JABAR', 
    label: 'Jawa Barat', 
    rates: [0.0175, 0.0225, 0.0275, 0.0325, 0.0375],
    legal: 'Perda Prov. Jawa Barat No. 13 Tahun 2011'
  },
  { 
    id: 'JATENG', 
    label: 'Jawa Tengah', 
    rates: [0.015, 0.02, 0.025, 0.03, 0.035],
    legal: 'Perda Prov. Jawa Tengah No. 2 Tahun 2011'
  },
  { 
    id: 'JATIM', 
    label: 'Jawa Timur', 
    rates: [0.015, 0.02, 0.025, 0.03, 0.035],
    legal: 'Perda Prov. Jawa Timur No. 9 Tahun 2010'
  },
  { 
    id: 'BANTEN', 
    label: 'Banten', 
    rates: [0.0175, 0.0225, 0.0275, 0.0325, 0.0375],
    legal: 'Perda Prov. Banten No. 1 Tahun 2011'
  },
  { 
    id: 'BALI', 
    label: 'Bali', 
    rates: [0.015, 0.02, 0.025, 0.03, 0.035],
    legal: 'Perda Prov. Bali No. 1 Tahun 2011'
  },
  { 
    id: 'OTHER', 
    label: 'Lainnya (Umum)', 
    rates: [0.015, 0.02, 0.025, 0.03, 0.035],
    legal: 'Estimasi Tarif Umum Nasional (UU HKPD)'
  }
];

export const PKB_PROGRESSIVE_RATES = [
  { id: 1, label: 'Ke-1' },
  { id: 2, label: 'Ke-2' },
  { id: 3, label: 'Ke-3' },
  { id: 4, label: 'Ke-4' }, 
  { id: 5, label: 'Ke-5+' },
];

// Biaya Admin & SWDKLLJ (PP 60/2016 & Jasa Raharja)
export const PKB_COSTS = {
  MOTOR: {
    swdkllj: 35000,
    admin_stnk: 25000, // Pengesahan Tahunan
    admin_tnkb: 60000 // 5-Yearly only
  },
  MOBIL: {
    swdkllj: 143000,
    admin_stnk: 50000, // Pengesahan Tahunan
    admin_tnkb: 100000 // 5-Yearly only
  }
};

// Property Tax (BPHTB & PPh Final)
export const PROPERTY_TAX_CONFIG = {
  PPH_RATE: 0.025, // 2.5% Final (Penjual)
  BPHTB_RATE: 0.05, // 5% (Pembeli)
  NPOPTKP: {
    DKI: 80000000, // DKI Jakarta
    BODETABEK: 60000000, // Common for Bodetabek
    REGIONAL: 60000000 // Minimum Standard
  }
};

// Investment Tax Rates
export const INVESTMENT_RATES = {
  CRYPTO: {
    REGISTERED: { pph: 0.001, ppn: 0.0011 }, // 0.1% + 0.11%
    UNREGISTERED: { pph: 0.002, ppn: 0.0022 }, // 0.2% + 0.22%
  },
  STOCK: {
    SELL: 0.001 // 0.1% Final on selling
  },
  GOLD: {
    BUY_NPWP: 0.0025, // 0.25%
    BUY_NON_NPWP: 0.005 // 0.5%
  },
  BOND: {
    COUPON: 0.10 // 10% Final
  },
  P2P: {
    LENDER_NPWP: 0.15, // 15%
    LENDER_NON_NPWP: 0.30 // 30%
  }
};

// Corporate Tax Constants
export const PPH_BADAN_RATES = {
  UMKM: 0.005, // 0.5% Final
  NORMAL: 0.22, // 22% Standard
  FACILITY_DISCOUNT: 0.50 // 50% Discount for 31E
};

export const PPH_BADAN_THRESHOLDS = {
  UMKM_LIMIT: 4800000000, // 4.8 Miliar
  FACILITY_LIMIT: 50000000000 // 50 Miliar
};

// Tax Codes Directory (KAP & KJS)
export interface TaxCodeItem {
  kap: string;
  kjs: string;
  desc: string;
  category: 'PPH' | 'PPN' | 'FINAL' | 'SANKSI';
}

export const TAX_CODES: TaxCodeItem[] = [
  // PPh 21 (411121)
  { kap: '411121', kjs: '100', desc: 'PPh 21 Masa (Bulanan)', category: 'PPH' },
  { kap: '411121', kjs: '200', desc: 'PPh 21 Tahunan (SPT Tahunan)', category: 'PPH' },
  { kap: '411121', kjs: '300', desc: 'STP PPh Pasal 21 (Denda)', category: 'SANKSI' },
  { kap: '411121', kjs: '401', desc: 'PPh 21 Final (Pesangon/JHT Sekaligus)', category: 'FINAL' },
  { kap: '411121', kjs: '402', desc: 'PPh 21 Final (Honor Pejabat/PNS APBN/D)', category: 'FINAL' },
  
  // PPh 22 (411122)
  { kap: '411122', kjs: '100', desc: 'PPh 22 Masa (Impor/Badan Usaha)', category: 'PPH' },
  { kap: '411122', kjs: '900', desc: 'PPh 22 Pemungut Bendaharawan', category: 'PPH' },
  { kap: '411122', kjs: '300', desc: 'STP PPh Pasal 22', category: 'SANKSI' },

  // PPh 23 (411124)
  { kap: '411124', kjs: '100', desc: 'PPh 23 Masa (Jasa/Sewa Harta)', category: 'PPH' },
  { kap: '411124', kjs: '101', desc: 'PPh 23 Dividen', category: 'PPH' },
  { kap: '411124', kjs: '102', desc: 'PPh 23 Bunga', category: 'PPH' },
  { kap: '411124', kjs: '103', desc: 'PPh 23 Royalti', category: 'PPH' },
  { kap: '411124', kjs: '104', desc: 'PPh 23 Hadiah/Penghargaan/Bonus', category: 'PPH' },
  { kap: '411124', kjs: '300', desc: 'STP PPh Pasal 23', category: 'SANKSI' },

  // PPh 25/29 (Orang Pribadi & Badan)
  { kap: '411125', kjs: '100', desc: 'PPh 25 Orang Pribadi (Angsuran Bulanan)', category: 'PPH' },
  { kap: '411125', kjs: '200', desc: 'PPh 29 Orang Pribadi (Kurang Bayar Tahunan)', category: 'PPH' },
  { kap: '411126', kjs: '100', desc: 'PPh 25 Badan (Angsuran Bulanan)', category: 'PPH' },
  { kap: '411126', kjs: '200', desc: 'PPh 29 Badan (Kurang Bayar Tahunan)', category: 'PPH' },
  { kap: '411125', kjs: '300', desc: 'STP PPh Orang Pribadi', category: 'SANKSI' },
  { kap: '411126', kjs: '300', desc: 'STP PPh Badan', category: 'SANKSI' },

  // PPh Final 4 Ayat 2 (411128)
  { kap: '411128', kjs: '401', desc: 'PPh Final Bunga Obligasi', category: 'FINAL' },
  { kap: '411128', kjs: '403', desc: 'PPh Final Sewa Tanah dan/atau Bangunan', category: 'FINAL' },
  { kap: '411128', kjs: '405', desc: 'PPh Final Hadiah Undian', category: 'FINAL' },
  { kap: '411128', kjs: '409', desc: 'PPh Final Jasa Konstruksi', category: 'FINAL' },
  { kap: '411128', kjs: '411', desc: 'PPh Final Pengalihan Hak Tanah/Bangunan', category: 'FINAL' },
  { kap: '411128', kjs: '417', desc: 'PPh Final Bunga Deposito/Tabungan', category: 'FINAL' },
  { kap: '411128', kjs: '420', desc: 'PPh Final UMKM (PP 23 / PP 55 Setor Sendiri)', category: 'FINAL' },
  { kap: '411128', kjs: '423', desc: 'PPh Final UMKM (Pemungutan Pihak Lain)', category: 'FINAL' },

  // PPN (411211)
  { kap: '411211', kjs: '100', desc: 'PPN Dalam Negeri (Masa)', category: 'PPN' },
  { kap: '411211', kjs: '101', desc: 'PPN Pemanfaatan JKP/BKP Luar Negeri (Google/Meta Ads)', category: 'PPN' },
  { kap: '411211', kjs: '102', desc: 'PPN Pemungut Selain Bendaharawan', category: 'PPN' },
  { kap: '411211', kjs: '300', desc: 'STP PPN Dalam Negeri', category: 'SANKSI' },
  { kap: '411211', kjs: '900', desc: 'PPN Pemungut Bendaharawan', category: 'PPN' },
  { kap: '411212', kjs: '100', desc: 'PPN Impor', category: 'PPN' },

  // Sanksi Umum
  { kap: '411619', kjs: '300', desc: 'Sanksi Administrasi (Bunga/Denda) Umum', category: 'SANKSI' },
];