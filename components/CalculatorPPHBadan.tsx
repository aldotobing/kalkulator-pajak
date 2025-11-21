
import React, { useState, useEffect } from 'react';
import { PPH_BADAN_RATES, PPH_BADAN_THRESHOLDS } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { TaxType } from '../types';
import { Factory, Building2, RefreshCw, Info, Save, Check, Printer, Copy, Check as CheckIcon, PieChart, ChevronDown } from './Icons';

interface Props {
  onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const CalculatorPPHBadan: React.FC<Props> = ({ onContextUpdate }) => {
  const [omzet, setOmzet] = useState(3000000000); // 3M
  const [displayOmzet, setDisplayOmzet] = useState(formatNumberInput(3000000000));
  
  const [hpp, setHpp] = useState(2000000000); // 2M
  const [displayHpp, setDisplayHpp] = useState(formatNumberInput(2000000000));
  
  const [expenses, setExpenses] = useState(500000000); // 500jt
  const [displayExpenses, setDisplayExpenses] = useState(formatNumberInput(500000000));
  
  const [fiscalCorrection, setFiscalCorrection] = useState(0);
  const [displayFiscalCorrection, setDisplayFiscalCorrection] = useState('');

  const [useUMKM, setUseUMKM] = useState(true); // Toggle UMKM vs Normal for <4.8M
  
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Logic
  const isSmallBusiness = omzet <= PPH_BADAN_THRESHOLDS.UMKM_LIMIT;
  const isMediumBusiness = omzet > PPH_BADAN_THRESHOLDS.UMKM_LIMIT && omzet <= PPH_BADAN_THRESHOLDS.FACILITY_LIMIT;
  
  // Auto-switch to Normal if > 4.8M
  useEffect(() => {
    if (!isSmallBusiness && useUMKM) {
      setUseUMKM(false);
    }
  }, [isSmallBusiness, useUMKM]);

  // 1. Commercial Profit
  const commercialProfit = omzet - hpp - expenses;
  
  // 2. Fiscal Profit (PKP)
  const pkp = commercialProfit + fiscalCorrection;
  const pkpFinal = Math.max(0, pkp); // Cannot tax loss

  // 3. Tax Calculation
  let taxAmount = 0;
  let taxMethod = '';
  let facilityAmount = 0;
  let nonFacilityAmount = 0;

  if (useUMKM && isSmallBusiness) {
    // Final 0.5% of Gross
    taxAmount = omzet * PPH_BADAN_RATES.UMKM;
    taxMethod = 'PPh Final UMKM (PP 23/2018)';
  } else {
    // Normal Rate (Pasal 17)
    if (isSmallBusiness) {
      // Entire PKP gets 50% discount (Effective 11%)
      taxAmount = pkpFinal * (PPH_BADAN_RATES.NORMAL * PPH_BADAN_RATES.FACILITY_DISCOUNT);
      taxMethod = 'Tarif Umum (Fasilitas 31E Penuh)';
    } else if (isMediumBusiness) {
      // Pro-rata Facility
      // Portion getting facility = (4.8M / Omzet) * PKP
      const facilityPortion = (PPH_BADAN_THRESHOLDS.UMKM_LIMIT / omzet) * pkpFinal;
      const nonFacilityPortion = pkpFinal - facilityPortion;
      
      facilityAmount = facilityPortion * (PPH_BADAN_RATES.NORMAL * PPH_BADAN_RATES.FACILITY_DISCOUNT); // 11%
      nonFacilityAmount = nonFacilityPortion * PPH_BADAN_RATES.NORMAL; // 22%
      
      taxAmount = facilityAmount + nonFacilityAmount;
      taxMethod = 'Tarif Umum (Fasilitas 31E Sebagian)';
    } else {
      // Large Business (>50M) -> Flat 22%
      taxAmount = pkpFinal * PPH_BADAN_RATES.NORMAL;
      taxMethod = 'Tarif Umum (Flat 22%)';
    }
  }

  // Effective Rate
  const effectiveRate = omzet > 0 ? (taxAmount / omzet) * 100 : 0;

  useEffect(() => {
    onContextUpdate(`
      Kalkulator: PPh Badan (Perusahaan)
      Metode: ${taxMethod}
      Omzet Bruto: ${formatCurrency(omzet)}
      HPP: ${formatCurrency(hpp)}
      Biaya Operasional: ${formatCurrency(expenses)}
      Laba Komersial: ${formatCurrency(commercialProfit)}
      Koreksi Fiskal: ${formatCurrency(fiscalCorrection)}
      Laba Kena Pajak (PKP): ${formatCurrency(pkpFinal)}
      
      Pajak Terutang: ${formatCurrency(taxAmount)}
      Tarif Efektif (dari Omzet): ${effectiveRate.toFixed(2)}%
    `);
  }, [omzet, hpp, expenses, fiscalCorrection, pkpFinal, taxAmount, taxMethod, effectiveRate, onContextUpdate]);

  useEffect(() => { if (isSaved) setIsSaved(false); }, [omzet, hpp, expenses, fiscalCorrection, useUMKM]);

  const handleReset = () => {
    setOmzet(0); setDisplayOmzet('');
    setHpp(0); setDisplayHpp('');
    setExpenses(0); setDisplayExpenses('');
    setFiscalCorrection(0); setDisplayFiscalCorrection('');
    setUseUMKM(true);
    setIsSaved(false);
  };

  const handleNumberChange = (setter: (v: number) => void, displaySetter: (v: string) => void, val: string) => {
    const cleanVal = val.replace(/[^0-9-]/g, ''); // Allow negative for fiscal correction? No, keep absolute for now, maybe add sign
    const numVal = cleanVal ? parseInt(cleanVal.replace(/-/g, '')) : 0; // Handle sign carefully if needed, assuming standard positive input
    setter(numVal);
    displaySetter(cleanVal ? new Intl.NumberFormat('id-ID').format(numVal) : '');
  };

  const handleSave = () => {
    const details = `
Metode: ${taxMethod}
Omzet: ${formatCurrency(omzet)}
Laba Komersial: ${formatCurrency(commercialProfit)}
PKP: ${formatCurrency(pkpFinal)}
--------------------------------
Pajak Terutang: ${formatCurrency(taxAmount)}
    `.trim();

    saveHistoryItem({
      type: TaxType.PPH_BADAN,
      title: 'PPh Badan',
      summary: `Omzet ${formatCurrency(omzet)}`,
      resultAmount: taxAmount,
      details: details
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopyResult = () => {
    const text = `
Estimasi PPh Badan
------------------
Omzet: ${formatCurrency(omzet)}
Laba Fiskal (PKP): ${formatCurrency(pkpFinal)}
Metode: ${taxMethod}

Pajak Terutang: ${formatCurrency(taxAmount)}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Styles
  const LABEL_STYLE = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";
  const INPUT_CONTAINER_STYLE = "relative group";
  const INPUT_FIELD_STYLE = "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all font-bold text-base text-slate-900 placeholder:text-slate-300 h-[50px]";
  const INPUT_ICON_STYLE = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm no-print group-focus-within:text-blue-500 transition-colors";

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-900 pb-12">
      
      {/* PRINT HEADER */}
      <div className="print-only mb-8 border-b-2 border-slate-800 pb-4">
         <div className="flex justify-between items-end">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Laporan PPh Badan</h1>
               <p className="text-sm text-slate-500">Dihasilkan oleh PajakKu Pro</p>
            </div>
            <div className="text-right">
               <p className="text-xs font-bold text-slate-400 uppercase">Tanggal Cetak</p>
               <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
            </div>
         </div>
      </div>

      <div className="rounded-[2rem] bg-white shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Inputs */}
        <div className="p-8 md:p-10 md:w-7/12 relative">
          <div className="absolute top-8 right-8 z-10 no-print">
            <button onClick={handleReset} title="Reset Input" className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group">
               <RefreshCw size={18} className="group-hover:-rotate-180 transition-transform duration-500"/>
            </button>
          </div>

          <div className="mb-8 pr-10">
             <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                   <Building2 size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">PPh Badan (Perusahaan)</h2>
             </div>
             <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                <span>Hitung Pajak PT/CV dengan Tarif Umum atau Final UMKM.</span>
             </div>
          </div>

          <div className="space-y-6">
            
            {/* Omzet */}
            <div>
              <label className={LABEL_STYLE}>Peredaran Bruto (Omzet)</label>
              <div className={INPUT_CONTAINER_STYLE}>
                <span className={INPUT_ICON_STYLE}><Factory size={18}/></span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayOmzet}
                  onChange={(e) => handleNumberChange(setOmzet, setDisplayOmzet, e.target.value)}
                  className={INPUT_FIELD_STYLE}
                  placeholder="0"
                />
              </div>
            </div>

            {/* UMKM Toggle (Only visible if eligible) */}
            {isSmallBusiness ? (
               <div className="animate-fade-up">
                  <label className={LABEL_STYLE}>Metode Perhitungan</label>
                  <div className="grid grid-cols-2 gap-4">
                     <button
                        onClick={() => setUseUMKM(true)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${useUMKM ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                     >
                        <span className={`text-sm font-bold ${useUMKM ? 'text-blue-800' : 'text-slate-600'}`}>Final UMKM</span>
                        <span className="text-[10px] font-medium text-slate-400">0.5% x Omzet</span>
                     </button>
                     <button
                        onClick={() => setUseUMKM(false)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${!useUMKM ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                     >
                        <span className={`text-sm font-bold ${!useUMKM ? 'text-blue-800' : 'text-slate-600'}`}>Tarif Umum</span>
                        <span className="text-[10px] font-medium text-slate-400">22% x Laba (Net)</span>
                     </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 ml-1 flex items-center gap-1">
                     <Info size={12}/> UMKM (0.5%) memiliki batas waktu (3 Tahun PT, 4 Tahun CV). Jika lewat, gunakan Tarif Umum.
                  </p>
               </div>
            ) : (
               <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-center">
                  <Info size={18} className="text-amber-600" />
                  <p className="text-xs font-medium text-amber-800">
                     Omzet diatas 4.8 Miliar wajib menggunakan <strong>Tarif Umum</strong> (Pembukuan).
                  </p>
               </div>
            )}

            {/* Detailed Costs (Only needed for Normal Rate) */}
            {(!useUMKM || !isSmallBusiness) && (
               <div className="animate-slide-up-reveal space-y-6 pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                     <PieChart size={16} className="text-blue-500"/>
                     Data Keuangan (Laba Rugi)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={LABEL_STYLE}>HPP (Harga Pokok Penjualan)</label>
                        <div className={INPUT_CONTAINER_STYLE}>
                           <span className={INPUT_ICON_STYLE}>Rp</span>
                           <input
                              type="text"
                              inputMode="numeric"
                              value={displayHpp}
                              onChange={(e) => handleNumberChange(setHpp, setDisplayHpp, e.target.value)}
                              className={INPUT_FIELD_STYLE}
                              placeholder="0"
                           />
                        </div>
                     </div>
                     <div>
                        <label className={LABEL_STYLE}>Biaya Operasional</label>
                        <div className={INPUT_CONTAINER_STYLE}>
                           <span className={INPUT_ICON_STYLE}>Rp</span>
                           <input
                              type="text"
                              inputMode="numeric"
                              value={displayExpenses}
                              onChange={(e) => handleNumberChange(setExpenses, setDisplayExpenses, e.target.value)}
                              className={INPUT_FIELD_STYLE}
                              placeholder="0"
                           />
                        </div>
                     </div>
                  </div>

                  <div>
                     <label className={LABEL_STYLE}>Koreksi Fiskal (Net)</label>
                     <div className={INPUT_CONTAINER_STYLE}>
                        <span className={INPUT_ICON_STYLE}>+/-</span>
                        <input
                           type="text"
                           inputMode="numeric"
                           value={displayFiscalCorrection}
                           onChange={(e) => handleNumberChange(setFiscalCorrection, setDisplayFiscalCorrection, e.target.value)}
                           className={INPUT_FIELD_STYLE}
                           placeholder="Contoh: 10.000.000"
                        />
                     </div>
                     <p className="text-[10px] text-slate-400 mt-2 ml-1">
                        Masukkan selisih antara Laba Komersial dan Fiskal (Biaya yang tidak boleh dibebankan pajak, natura, dsb).
                     </p>
                  </div>
               </div>
            )}

          </div>
        </div>

        {/* Right Side: Result (Clean Dark Theme) */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Subtle Gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-600/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pajak Terutang (Tahunan)</p>
                   <button 
                      onClick={handleCopyResult} 
                      className="text-slate-500 hover:text-emerald-400 transition-colors no-print p-1.5 rounded-lg hover:bg-white/10"
                      title="Salin Hasil"
                   >
                      {isCopied ? <CheckIcon size={16} className="text-emerald-400" /> : <Copy size={16} />}
                   </button>
                </div>
                <div className="flex items-baseline gap-2">
                   <div className="text-white font-bold text-2xl lg:text-4xl tracking-tight">
                     {formatCurrency(taxAmount)}
                   </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-4">
                 {useUMKM && isSmallBusiness ? (
                    <div className="flex justify-between items-center">
                       <span className="text-slate-400 text-sm">Tarif UMKM</span>
                       <span className="text-lg font-bold text-white">0.5%</span>
                    </div>
                 ) : (
                    <>
                       <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                          <span className="text-slate-400 text-sm">Laba Komersial</span>
                          <span className="text-lg font-bold text-white">{formatCurrency(commercialProfit)}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-sm">PKB (Fiskal)</span>
                          <span className="text-lg font-bold text-emerald-400">{formatCurrency(pkpFinal)}</span>
                       </div>
                    </>
                 )}
              </div>

              <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
                 <div className="mt-0.5 text-blue-400"><Info size={16}/></div>
                 <div>
                    <p className="text-xs text-blue-100 leading-relaxed font-medium">
                       {taxMethod}
                    </p>
                    {!useUMKM && (
                        <p className="text-[10px] text-blue-200/70 mt-1">
                           {isSmallBusiness 
                              ? 'Mendapat fasilitas diskon tarif 50% (Pasal 31E) untuk seluruh PKP karena omzet < 4.8M.' 
                              : isMediumBusiness 
                                 ? 'Mendapat fasilitas diskon tarif 50% secara proporsional (4.8M / Omzet).'
                                 : 'Tidak mendapat fasilitas pengurangan tarif (Omzet > 50M).'}
                        </p>
                    )}
                 </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-8 border-t border-slate-800 flex items-center gap-4 no-print">
               <button onClick={() => window.print()} className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2 group">
                  Cetak
                  <Printer size={16} className="group-hover:scale-110 transition-transform" />
               </button>
               <button 
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`ml-auto px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all duration-200 ${isSaved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}`}
               >
                  {isSaved ? <CheckIcon size={14}/> : <Save size={14}/>}
                  {isSaved ? 'Tersimpan' : 'Simpan'}
               </button>
            </div>
        </div>
      </div>

      {/* Breakdown Accordion */}
      <div className="rounded-[2rem] bg-white shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden mt-6">
         <button 
            onClick={() => setShowDetail(!showDetail)}
            className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-slate-50 transition-colors group"
         >
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                  <Info size={18}/>
               </div>
               <h4 className="text-xl md:text-2xl font-bold text-slate-900">Rincian Perhitungan</h4>
            </div>
            <div className={`p-2 rounded-full border transition-all duration-300 ${showDetail ? 'rotate-180 bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-400'}`}>
               <ChevronDown size={16} />
            </div>
         </button>
         
         {showDetail && (
            <div className="px-6 md:px-8 pb-8 space-y-6 animate-enter">
               
               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
                  <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                     <Info size={16} className="text-blue-600"/>
                     Logika Perhitungan
                  </h5>
                  
                  {useUMKM && isSmallBusiness ? (
                     <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 font-medium">
                        <li>Omzet Bruto &lt; 4.8 Miliar setahun.</li>
                        <li>Menggunakan skema <strong>PP 23 Tahun 2018</strong> (UMKM).</li>
                        <li>Pajak = 0.5% x Omzet Bruto.</li>
                     </ul>
                  ) : (
                     <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 font-medium">
                        <li>Menghitung Laba Fiskal (PKP) = Laba Komersial +/- Koreksi.</li>
                        {isSmallBusiness && <li>Karena Omzet &lt; 4.8M, seluruh PKP mendapat fasilitas diskon 50% (Tarif Efektif 11%).</li>}
                        {isMediumBusiness && <li>Karena Omzet 4.8M - 50M, fasilitas diberikan proporsional. Sebagian PKP kena 11%, sisanya 22%.</li>}
                        {!isSmallBusiness && !isMediumBusiness && <li>Karena Omzet &gt; 50M, seluruh PKP kena tarif normal 22%.</li>}
                     </ul>
                  )}
               </div>

               {!useUMKM && (
                  <div className="relative pl-6 border-l-2 border-slate-100">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Detail Laba Fiskal</h5>
                     <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
                        <div className="flex justify-between">
                           <span>Laba Komersial (Omzet - HPP - Biaya)</span>
                           <span className="font-bold text-slate-700">{formatCurrency(commercialProfit)}</span>
                        </div>
                        <div className="flex justify-between">
                           <span>Koreksi Fiskal</span>
                           <span className="font-bold text-slate-700">{formatCurrency(fiscalCorrection)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 mt-1 font-bold text-slate-900">
                           <span>Penghasilan Kena Pajak (PKP)</span>
                           <span>{formatCurrency(pkpFinal)}</span>
                        </div>
                     </div>
                  </div>
               )}

            </div>
         )}
      </div>
    </div>
  );
};

export default CalculatorPPHBadan;
