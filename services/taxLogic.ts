
import { PPH21_BRACKETS, PTKP_BASE, PTKP_MARRIED, PTKP_PER_CHILD, MAX_CHILDREN, BIAYA_JABATAN_RATE, MAX_BIAYA_JABATAN_ANNUAL, BPJS_JKK_RATE, BPJS_JKM_RATE, BPJS_JHT_EMP_RATE, BPJS_JP_EMP_RATE, BPJS_JP_CAP_BASE } from '../constants';
import { PPh21State, PPh21Result, MaritalStatus, PPh21Method } from '../types';

// TER Categories (PP 58/2023)
const getTERCategory = (status: MaritalStatus, children: number) => {
  // Category C: K/3
  if (status === MaritalStatus.K && children >= 3) return 'C';
  
  // Category B: K/1, K/2
  if (status === MaritalStatus.K && children >= 1) return 'B';
  
  // Category B: TK/2, TK/3
  if (status === MaritalStatus.TK && children >= 2) return 'B';
  // Category B: HB/2, HB/3 (Treated as TK for logic)
  if (status === MaritalStatus.HB && children >= 2) return 'B';
  
  // Category A: TK/0, TK/1, K/0
  return 'A'; 
};

// TER Rates - Strictly matched with PP 58/2023 Regulation
const getTERRate = (category: string, grossInput: number) => {
  const gross = grossInput;
  
  // Kategori A (TK/0, TK/1, K/0)
  if (category === 'A') {
    if (gross <= 5400000) return 0;
    if (gross <= 5650000) return 0.0025;
    if (gross <= 5950000) return 0.005;
    if (gross <= 6300000) return 0.0075;
    if (gross <= 6750000) return 0.01;
    if (gross <= 7500000) return 0.0125;
    if (gross <= 8550000) return 0.015;
    if (gross <= 9650000) return 0.0175;
    if (gross <= 10050000) return 0.02;
    if (gross <= 10350000) return 0.0225;
    if (gross <= 10700000) return 0.025;
    if (gross <= 11050000) return 0.03;
    if (gross <= 11600000) return 0.035;
    if (gross <= 12500000) return 0.04;
    if (gross <= 13750000) return 0.05;
    if (gross <= 15100000) return 0.06;
    if (gross <= 16950000) return 0.07;
    if (gross <= 19750000) return 0.08;
    if (gross <= 24150000) return 0.09;
    if (gross <= 26450000) return 0.10;
    if (gross <= 28000000) return 0.11;
    if (gross <= 30050000) return 0.12;
    if (gross <= 32400000) return 0.13;
    if (gross <= 35400000) return 0.14;
    if (gross <= 39100000) return 0.15;
    if (gross <= 43850000) return 0.16;
    if (gross <= 47800000) return 0.17;
    if (gross <= 51400000) return 0.18;
    if (gross <= 56300000) return 0.19;
    if (gross <= 62200000) return 0.20;
    if (gross <= 68600000) return 0.21;
    if (gross <= 77500000) return 0.22;
    if (gross <= 89000000) return 0.23;
    if (gross <= 103000000) return 0.24;
    if (gross <= 125000000) return 0.25;
    if (gross <= 157000000) return 0.26;
    if (gross <= 206000000) return 0.27;
    if (gross <= 337000000) return 0.28;
    if (gross <= 454000000) return 0.29;
    if (gross <= 550000000) return 0.30;
    if (gross <= 695000000) return 0.31;
    if (gross <= 910000000) return 0.32;
    if (gross <= 1400000000) return 0.33;
    return 0.34;
  }
  
  // Kategori B (TK/2, TK/3, K/1, K/2)
  if (category === 'B') {
    if (gross <= 6200000) return 0;
    if (gross <= 6500000) return 0.0025;
    if (gross <= 6850000) return 0.005;
    if (gross <= 7300000) return 0.0075;
    if (gross <= 9200000) return 0.01;
    if (gross <= 10750000) return 0.015;
    if (gross <= 11250000) return 0.02;
    if (gross <= 11600000) return 0.025;
    if (gross <= 12600000) return 0.03;
    if (gross <= 13600000) return 0.04;
    if (gross <= 14950000) return 0.05;
    if (gross <= 16400000) return 0.06;
    if (gross <= 18450000) return 0.07;
    if (gross <= 21850000) return 0.08;
    if (gross <= 26000000) return 0.09;
    if (gross <= 27700000) return 0.10;
    if (gross <= 29350000) return 0.11;
    if (gross <= 31450000) return 0.12;
    if (gross <= 33950000) return 0.13;
    if (gross <= 37100000) return 0.14;
    if (gross <= 41100000) return 0.15;
    if (gross <= 45800000) return 0.16;
    if (gross <= 49500000) return 0.17;
    if (gross <= 53800000) return 0.18;
    if (gross <= 58500000) return 0.19;
    if (gross <= 64000000) return 0.20;
    if (gross <= 71000000) return 0.21;
    if (gross <= 80000000) return 0.22;
    if (gross <= 93000000) return 0.23;
    if (gross <= 109000000) return 0.24;
    if (gross <= 129000000) return 0.25;
    if (gross <= 163000000) return 0.26;
    if (gross <= 211000000) return 0.27;
    if (gross <= 374000000) return 0.28;
    if (gross <= 459000000) return 0.29;
    if (gross <= 555000000) return 0.30;
    if (gross <= 704000000) return 0.31;
    if (gross <= 957000000) return 0.32;
    if (gross <= 1405000000) return 0.33;
    return 0.34;
  }

  // Kategori C (K/3)
  if (category === 'C') {
    if (gross <= 6600000) return 0;
    if (gross <= 6950000) return 0.0025;
    if (gross <= 7350000) return 0.005;
    if (gross <= 7800000) return 0.0075;
    if (gross <= 8850000) return 0.01;
    if (gross <= 9800000) return 0.0125;
    if (gross <= 10950000) return 0.015;
    if (gross <= 11200000) return 0.0175;
    if (gross <= 12050000) return 0.02;
    if (gross <= 12950000) return 0.03;
    if (gross <= 14150000) return 0.04;
    if (gross <= 15550000) return 0.05;
    if (gross <= 17050000) return 0.06;
    if (gross <= 19500000) return 0.07;
    if (gross <= 22700000) return 0.08;
    if (gross <= 26600000) return 0.09;
    if (gross <= 28100000) return 0.10;
    if (gross <= 30100000) return 0.11;
    if (gross <= 32600000) return 0.12;
    if (gross <= 35400000) return 0.13;
    if (gross <= 38900000) return 0.14;
    if (gross <= 43000000) return 0.15;
    if (gross <= 47400000) return 0.16;
    if (gross <= 51200000) return 0.17;
    if (gross <= 55800000) return 0.18;
    if (gross <= 60400000) return 0.19;
    if (gross <= 66700000) return 0.20;
    if (gross <= 74500000) return 0.21;
    if (gross <= 83200000) return 0.22;
    if (gross <= 95600000) return 0.23;
    if (gross <= 110000000) return 0.24;
    if (gross <= 134000000) return 0.25;
    if (gross <= 169000000) return 0.26;
    if (gross <= 221000000) return 0.27;
    if (gross <= 390000000) return 0.28;
    if (gross <= 463000000) return 0.29;
    if (gross <= 561000000) return 0.30;
    if (gross <= 709000000) return 0.31;
    if (gross <= 965000000) return 0.32;
    if (gross <= 1419000000) return 0.33;
    return 0.34;
  }

  return 0;
};

// Calculate Real Monthly TER (Iterative/Dynamic Rate Method for Gross Up)
export const calculateTERDetails = (data: PPh21State) => {
  const salary = data.grossSalary;
  const allowance = data.allowance;
  
  // Check for JKK/JKM if enabled (Adds to Gross Income)
  let insuranceAmount = 0;
  if (data.includeJKK_JKM) {
     insuranceAmount = (salary * BPJS_JKK_RATE) + (salary * BPJS_JKM_RATE);
  }
  
  const baseMonthlyCash = salary + allowance + insuranceAmount;
  const category = getTERCategory(data.maritalStatus, data.children);
  
  let finalGrossForTER = baseMonthlyCash;
  let taxAllowance = 0;
  let terRate = 0;
  let tax = 0;

  if (data.method === PPh21Method.GROSS) {
    terRate = getTERRate(category, baseMonthlyCash);
    tax = baseMonthlyCash * terRate;
    finalGrossForTER = baseMonthlyCash;
  } else {
    // Gross Up (Iterative Method)
    let currentAllowance = 0;
    let iterations = 0;
    
    // Initial guess
    let currentRate = getTERRate(category, baseMonthlyCash);
    
    if (currentRate === 0) {
        taxAllowance = 0;
        terRate = 0;
        finalGrossForTER = baseMonthlyCash;
        tax = 0;
    } else {
        while (iterations < 50) {
            // Formula: Tax = (Gross + Allowance) * Rate -> Allowance = (Gross * Rate) / (1 - Rate)
            const calculatedAllowance = (baseMonthlyCash * currentRate) / (1 - currentRate);
            
            // Check if this allowance pushes us to a new bracket
            const testGross = baseMonthlyCash + calculatedAllowance;
            const newRate = getTERRate(category, testGross);
            
            if (newRate === currentRate) {
                // Converged
                taxAllowance = calculatedAllowance;
                break;
            }
            
            // Rate changed, update and retry with new rate
            currentRate = newRate;
            // Keep track of the last calculated allowance in case we exit due to max iterations
            taxAllowance = calculatedAllowance;
            
            iterations++;
        }
        
        terRate = currentRate;
        finalGrossForTER = baseMonthlyCash + taxAllowance;
        tax = taxAllowance;
    }
  }

  return {
    category,
    grossForTax: finalGrossForTER, // Includes Insurance + Allowance
    insuranceAmount,
    allowance: taxAllowance,
    rate: terRate,
    tax: tax
  };
};

// Annual Calculation (Pasal 17) for December / Yearly View
export const calculatePPh21 = (data: PPh21State): PPh21Result => {
  // 1. Determine Monthly Basis (TER)
  const terDetails = calculateTERDetails(data);
  const monthlyGrossForTax = terDetails.grossForTax; 
  const insuranceAmount = terDetails.insuranceAmount;
  const taxAllowance = terDetails.allowance;

  // 2. Annualize Gross
  const annualGross = (monthlyGrossForTax * 12) + data.thrBonus;
  
  // 3. Deductions (Pengurang Bruto)
  // Biaya Jabatan (5% capped 6jt/yr or 500k/mo)
  let biayaJabatan = 0;
  if (data.includeBiayaJabatan) {
    biayaJabatan = Math.min(annualGross * BIAYA_JABATAN_RATE, MAX_BIAYA_JABATAN_ANNUAL);
  }

  // Pension Deductions
  let totalPensionDeduction = 0;
  if (data.manualPensionFee > 0) {
     totalPensionDeduction = data.manualPensionFee * 12;
  } else {
     const salary = data.grossSalary;
     const annualJHT = salary * BPJS_JHT_EMP_RATE * 12;
     const annualJP = Math.min(salary, BPJS_JP_CAP_BASE) * BPJS_JP_EMP_RATE * 12;
     totalPensionDeduction = annualJHT + annualJP;
  }

  // Zakat
  const annualZakat = (data.zakat || 0) * 12;

  // Net Income
  const netIncome = annualGross - biayaJabatan - totalPensionDeduction - annualZakat;

  // PTKP
  let ptkp = PTKP_BASE;
  if (data.maritalStatus === MaritalStatus.K) {
    ptkp += PTKP_MARRIED;
  }
  
  const childCount = Math.min(data.children, MAX_CHILDREN);
  ptkp += childCount * PTKP_PER_CHILD;

  // PKP
  let pkp = Math.floor((netIncome - ptkp) / 1000) * 1000;
  if (pkp < 0) pkp = 0;

  // Tax Layers (Pasal 17)
  let remainingPkp = pkp;
  let totalTax = 0;
  const taxLayers = [];
  let previousLimit = 0;

  for (const bracket of PPH21_BRACKETS) {
    if (remainingPkp <= 0) break;
    const range = bracket.limit - previousLimit;
    const taxableAmount = Math.min(remainingPkp, range);
    const taxForLayer = taxableAmount * bracket.rate;
    
    taxLayers.push({
      layer: `${(bracket.rate * 100)}%`,
      rate: bracket.rate,
      amount: taxForLayer
    });

    totalTax += taxForLayer;
    remainingPkp -= taxableAmount;
    previousLimit = bracket.limit;
  }

  // NPWP Penalty
  if (!data.hasNPWP) {
    totalTax = totalTax * 1.2;
  }

  // December Reconciliation
  const taxPaidJanToNov = terDetails.tax * 11;
  const taxDecember = totalTax - taxPaidJanToNov;

  return {
    annualGross: annualGross,
    biayaJabatan: biayaJabatan,
    netIncome: netIncome,
    ptkp: ptkp,
    pkp: pkp,
    taxLayers: taxLayers,
    annualTax: totalTax,
    monthlyTax: terDetails.tax, // TER Amount
    taxAllowance: taxAllowance, 
    terCategory: terDetails.category,
    terRate: terDetails.rate,
    insuranceAmount: insuranceAmount,
    pensionDeduction: totalPensionDeduction / 12, // Monthly avg
    taxJanToNov: taxPaidJanToNov,
    taxDecember: taxDecember,
    grossForTax: monthlyGrossForTax
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

// Reverse Calculator
export const calculateReverseSalary = (
  targetNet: number,
  status: MaritalStatus,
  children: number,
  hasNPWP: boolean
) => {
  let low = targetNet;
  let high = targetNet * 2.5;
  let iterations = 0;
  let calculatedGross = 0;
  
  const getNetFromGross = (gross: number) => {
    // 1. BPJS Deductions (Employee Share)
    const jht = gross * BPJS_JHT_EMP_RATE;
    const jp = Math.min(gross, BPJS_JP_CAP_BASE) * BPJS_JP_EMP_RATE;
    const jkn = Math.min(gross, 12000000) * 0.01; 
    const totalBpjs = jht + jp + jkn;
    
    // 2. Tax (TER)
    const terDetails = calculateTERDetails({
      grossSalary: gross,
      allowance: 0,
      thrBonus: 0,
      maritalStatus: status,
      children: children,
      hasNPWP: hasNPWP,
      payPeriod: 'MONTHLY',
      includeBiayaJabatan: true,
      includeJKK_JKM: false, 
      method: PPh21Method.GROSS,
      zakat: 0,
      manualPensionFee: 0
    });
    
    return {
      gross,
      tax: terDetails.tax,
      bpjs: totalBpjs,
      net: gross - terDetails.tax - totalBpjs
    };
  };

  while (iterations < 50) {
    const mid = (low + high) / 2;
    const res = getNetFromGross(mid);
    
    if (Math.abs(res.net - targetNet) < 1000) {
      calculatedGross = mid;
      break;
    }
    
    if (res.net < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
    iterations++;
    calculatedGross = mid;
  }
  
  return getNetFromGross(calculatedGross);
};
