
export enum TaxType {
  PPH21 = 'PPH21',
  PPH23 = 'PPH23',
  PPH_FINAL = 'PPH_FINAL',
  PPN = 'PPN',
  PPNBM = 'PPNBM',
  BEA_CUKAI = 'BEA_CUKAI'
}

export enum MaritalStatus {
  TK = 'TK', // Tidak Kawin
  K = 'K',   // Kawin
  HB = 'HB'  // Hidup Berpisah (treated similar to TK usually depending on interpretation, but simpler to map to TK logic for basic apps unless specific PTKP chosen)
}

export interface PPh21State {
  grossSalary: number; // Monthly
  allowance: number; // Tunjangan
  thrBonus: number; // Annual bonus
  maritalStatus: MaritalStatus;
  children: number; // 0-3
  hasNPWP: boolean;
  payPeriod: 'MONTHLY' | 'ANNUAL';
  includeBiayaJabatan: boolean;
}

export interface PPh21Result {
  annualGross: number;
  biayaJabatan: number;
  netIncome: number;
  ptkp: number;
  pkp: number;
  taxLayers: { layer: string; rate: number; amount: number }[];
  annualTax: number;
  monthlyTax: number;
}

export interface PPh23State {
  amount: number;
  type: 'DIVIDEND' | 'RENT' | 'SERVICE' | 'ROYALTY' | 'PRIZE';
  hasNPWP: boolean;
}

export interface GenericResult {
  taxBase: number;
  taxRate: number;
  taxAmount: number;
  finalAmount: number; // e.g., amount after tax deduction or total invoice amount
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: TaxType;
  title: string;
  summary: string; // Short description of inputs e.g. "Gaji 10jt, TK/0"
  resultAmount: number; // The main tax amount
  details?: string; // Full context/breakdown
}
