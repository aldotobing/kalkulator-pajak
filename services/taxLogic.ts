
import { PPH21_BRACKETS, PTKP_BASE, PTKP_MARRIED, PTKP_PER_CHILD, MAX_CHILDREN, BIAYA_JABATAN_RATE, MAX_BIAYA_JABATAN_ANNUAL } from '../constants';
import { PPh21State, PPh21Result, MaritalStatus, PPh21Method } from '../types';

// BPJS Constants (Employee Share)
// JHT: 2%
// JP: 1% (Max base ~10jt)
// JKn (Health): 1% (Max base 12jt)
const BPJS_JHT_RATE = 0.02;
const BPJS_JP_RATE = 0.01;
const BPJS_JKN_RATE = 0.01;
const MAX_JP_BASE = 10042300; // 2024 Cap Estimate
const MAX_JKN_BASE = 12000000; // 2024 Cap

export const calculatePPh21 = (data: PPh21State): PPh21Result => {
  // 1. Determine Base Annual Gross (Without Tax Allowance)
  const baseAnnualGross = (data.grossSalary + data.allowance) * 12 + data.thrBonus;
  
  // Helper function to calculate tax for a specific Gross Income
  const calculateTaxForGross = (currentGross: number) => {
    // Biaya Jabatan
    let biayaJabatan = 0;
    if (data.includeBiayaJabatan) {
      biayaJabatan = Math.min(currentGross * BIAYA_JABATAN_RATE, MAX_BIAYA_JABATAN_ANNUAL);
    }

    // Net Income
    const netIncome = currentGross - biayaJabatan;

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

    // Tax Layers
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

    return {
      biayaJabatan,
      netIncome,
      ptkp,
      pkp,
      taxLayers,
      totalTax
    };
  };

  let taxAllowance = 0;
  let finalResult = calculateTaxForGross(baseAnnualGross);

  // 2. Gross Up Logic (Iterative)
  // If Gross Up, the company gives an allowance equal to the tax.
  // Since Tax depends on Gross, and Gross depends on Tax Allowance, we iterate until convergence.
  if (data.method === PPh21Method.GROSS_UP) {
    let iter = 0;
    let diff = 1;
    
    while (diff > 1 && iter < 50) {
      const prevAllowance = taxAllowance;
      
      // Calculate Tax based on (Base + Previous Allowance)
      const tempGross = baseAnnualGross + prevAllowance;
      const res = calculateTaxForGross(tempGross);
      
      // The new allowance should cover the tax
      const newAllowance = res.totalTax;
      
      diff = Math.abs(newAllowance - prevAllowance);
      taxAllowance = newAllowance;
      finalResult = res; // Update result state
      iter++;
    }
    // Re-run one last time with final allowance to ensure consistency in return object
    finalResult = calculateTaxForGross(baseAnnualGross + taxAllowance);
  }

  const finalAnnualGross = baseAnnualGross + taxAllowance;

  return {
    annualGross: finalAnnualGross,
    biayaJabatan: finalResult.biayaJabatan,
    netIncome: finalResult.netIncome,
    ptkp: finalResult.ptkp,
    pkp: finalResult.pkp,
    taxLayers: finalResult.taxLayers,
    annualTax: finalResult.totalTax,
    monthlyTax: finalResult.totalTax / 12,
    taxAllowance: taxAllowance
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

// Reverse Calculator: Find Gross needed for Target Net
// Net = Gross - Tax(Gross) - BPJS(Gross)
// Since function is monotonic increasing, we can use binary search
export const calculateReverseSalary = (
  targetNet: number,
  status: MaritalStatus,
  children: number,
  hasNPWP: boolean
) => {
  let low = targetNet;
  let high = targetNet * 2; // Upper bound heuristic
  let iterations = 0;
  let calculatedGross = 0;
  
  // Helper to get Net from Gross
  const getNetFromGross = (gross: number) => {
    // 1. BPJS Deductions (Employee Share)
    const jht = gross * BPJS_JHT_RATE;
    const jp = Math.min(gross, MAX_JP_BASE) * BPJS_JP_RATE;
    const jkn = Math.min(gross, MAX_JKN_BASE) * BPJS_JKN_RATE;
    const totalBpjs = jht + jp + jkn;
    
    // 2. Tax
    const pphRes = calculatePPh21({
      grossSalary: gross,
      allowance: 0,
      thrBonus: 0,
      maritalStatus: status,
      children: children,
      hasNPWP: hasNPWP,
      payPeriod: 'MONTHLY',
      includeBiayaJabatan: true,
      method: PPh21Method.GROSS
    });
    
    const tax = pphRes.monthlyTax;
    
    return {
      gross,
      tax,
      bpjs: totalBpjs,
      net: gross - tax - totalBpjs
    };
  };

  // Binary Search for 50 iterations or until close enough
  while (iterations < 50) {
    const mid = (low + high) / 2;
    const res = getNetFromGross(mid);
    
    if (Math.abs(res.net - targetNet) < 500) { // Tolerance Rp 500
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
