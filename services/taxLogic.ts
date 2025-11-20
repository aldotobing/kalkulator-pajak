import { PPH21_BRACKETS, PTKP_BASE, PTKP_MARRIED, PTKP_PER_CHILD, MAX_CHILDREN, BIAYA_JABATAN_RATE, MAX_BIAYA_JABATAN_ANNUAL } from '../constants';
import { PPh21State, PPh21Result, MaritalStatus } from '../types';

export const calculatePPh21 = (data: PPh21State): PPh21Result => {
  // 1. Annualize Income
  let annualGross = (data.grossSalary + data.allowance) * 12 + data.thrBonus;
  
  // 2. Biaya Jabatan
  let biayaJabatan = 0;
  if (data.includeBiayaJabatan) {
    biayaJabatan = Math.min(annualGross * BIAYA_JABATAN_RATE, MAX_BIAYA_JABATAN_ANNUAL);
  }

  // 3. Net Income (Penghasilan Neto)
  const netIncome = annualGross - biayaJabatan;

  // 4. Calculate PTKP
  let ptkp = PTKP_BASE;
  if (data.maritalStatus === MaritalStatus.K) {
    ptkp += PTKP_MARRIED;
  }
  // Children cap
  const childCount = Math.min(data.children, MAX_CHILDREN);
  ptkp += childCount * PTKP_PER_CHILD;

  // 5. Calculate PKP (Penghasilan Kena Pajak)
  // PKP is rounded down to thousands usually, but standard floor is fine for estimation
  let pkp = Math.floor((netIncome - ptkp) / 1000) * 1000;
  if (pkp < 0) pkp = 0;

  // 6. Calculate Tax Layers
  let remainingPkp = pkp;
  let annualTax = 0;
  const taxLayers = [];
  
  let previousLimit = 0;

  for (const bracket of PPH21_BRACKETS) {
    if (remainingPkp <= 0) break;

    const range = bracket.limit - previousLimit;
    const taxableAmount = Math.min(remainingPkp, range);
    
    // Apply NPWP penalty if needed (+20% higher rate if no NPWP)
    // Note: As of 2024, NIK is NPWP. This penalty is becoming legacy but technically exists for those strictly without ID.
    // We will apply standard rate here, and surcharge later if selected.
    const taxForLayer = taxableAmount * bracket.rate;
    
    taxLayers.push({
      layer: `${(bracket.rate * 100)}%`,
      rate: bracket.rate,
      amount: taxForLayer
    });

    annualTax += taxForLayer;
    remainingPkp -= taxableAmount;
    previousLimit = bracket.limit;
  }

  // 7. NPWP Surcharge (120% of tax if no NPWP)
  // UU PPh Pasal 21 ayat (5a): 20% lebih tinggi
  if (!data.hasNPWP) {
    annualTax = annualTax * 1.2;
  }

  return {
    annualGross,
    biayaJabatan,
    netIncome,
    ptkp,
    pkp,
    taxLayers,
    annualTax,
    monthlyTax: annualTax / 12
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
