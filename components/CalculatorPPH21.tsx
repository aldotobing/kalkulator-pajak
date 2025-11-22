
import React, { useState, useEffect } from 'react';
import { PPh21State, MaritalStatus, TaxType, PPh21Method } from '../types';
import { calculatePPh21, formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { Banknote, User, Calculator, RefreshCw, Info, Save, Check, Printer, Copy, ChevronDown, Check as CheckIcon, CalendarDays, ShieldCheck, Wallet, Heart } from './Icons';
import TaxResultModal from './TaxResultModal';

interface Props {
   onContextUpdate: (ctx: string) => void;
}

const DEFAULT_FORM_STATE: PPh21State = {
   grossSalary: 15000000,
   allowance: 0,
   thrBonus: 0,
   maritalStatus: MaritalStatus.TK,
   children: 0,
   hasNPWP: true,
   payPeriod: 'MONTHLY',
   includeBiayaJabatan: true,
   includeJKK_JKM: false,
   method: PPh21Method.GROSS,
   zakat: 0,
   manualPensionFee: 0
};

// Helper for currency input display
const formatNumberInput = (value: number) => {
   if (value === 0) return '';
   return new Intl.NumberFormat('id-ID').format(value);
};

const CalculatorPPH21: React.FC<Props> = ({ onContextUpdate }) => {
   const [formState, setFormState] = useState<PPh21State>(DEFAULT_FORM_STATE);
   const [result, setResult] = useState<ReturnType<typeof calculatePPh21> | null>(null);
   const [isSaved, setIsSaved] = useState(false);
   const [showDetail, setShowDetail] = useState(false); // Collapsed by default
   const [isCopied, setIsCopied] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);

   // Local state for input display to handle formatting while typing
   const [displayValues, setDisplayValues] = useState({
      grossSalary: formatNumberInput(DEFAULT_FORM_STATE.grossSalary),
      allowance: formatNumberInput(DEFAULT_FORM_STATE.allowance),
      thrBonus: formatNumberInput(DEFAULT_FORM_STATE.thrBonus),
      zakat: formatNumberInput(DEFAULT_FORM_STATE.zakat),
      manualPensionFee: formatNumberInput(DEFAULT_FORM_STATE.manualPensionFee),
   });

   useEffect(() => {
      const res = calculatePPh21(formState);
      setResult(res);

      const ctx = `
      Kalkulator PPh 21 (Karyawan - PP 58/2023)
      Metode: ${formState.method === PPh21Method.GROSS ? 'Gross (Potong Gaji)' : 'Gross Up (Ditanggung Kantor)'}
      Status: ${formState.maritalStatus}/${formState.children} (TER ${res.terCategory})
      NPWP: ${formState.hasNPWP ? 'Ya' : 'Tidak'}
      Gaji Pokok: ${formatCurrency(formState.grossSalary)}
      Tunjangan: ${formatCurrency(formState.allowance)}
      THR/Bonus: ${formatCurrency(formState.thrBonus)}
      
      Pengurang Tahunan:
      Biaya Jabatan: ${formatCurrency(res.biayaJabatan)}
      Iuran Pensiun: ${formatCurrency(res.pensionDeduction * 12)}
      Zakat/Sumbangan: ${formatCurrency(formState.zakat * 12)}
      
      Hasil Perhitungan (Bulanan TER):
      Tarif TER: ${(res.terRate! * 100).toFixed(2)}%
      ${formState.method === PPh21Method.GROSS_UP ? `Tunjangan Pajak: ${formatCurrency(res.taxAllowance)}` : ''}
      Pajak Bulan Ini (Jan-Nov): ${formatCurrency(res.monthlyTax)}
      
      Estimasi Akhir Tahun (Pasal 17):
      Pajak Terutang (Thn): ${formatCurrency(res.annualTax)}
      Tagihan Desember (Kurang Bayar): ${formatCurrency(res.taxDecember)}
    `;
      onContextUpdate(ctx);
   }, [formState, onContextUpdate]);

   useEffect(() => {
      if (isSaved) setIsSaved(false);
   }, [formState]);

   const handleReset = () => {
      setFormState({
         ...DEFAULT_FORM_STATE,
         grossSalary: 0,
         allowance: 0,
         thrBonus: 0,
         zakat: 0,
         manualPensionFee: 0
      });
      setDisplayValues({
         grossSalary: '',
         allowance: '',
         thrBonus: '',
         zakat: '',
         manualPensionFee: ''
      });
      setIsSaved(false);
   };

   const handleSave = () => {
      if (!result) return;

      const details = `
Metode: ${formState.method === PPh21Method.GROSS ? 'Gross' : 'Gross Up'}
Status: ${formState.maritalStatus}/${formState.children} (TER ${result.terCategory})
Gaji Pokok: ${formatCurrency(formState.grossSalary)}
Tunjangan: ${formatCurrency(formState.allowance)}
Zakat: ${formatCurrency(formState.zakat)}
THR/Bonus: ${formatCurrency(formState.thrBonus)}
--------------------------------
${formState.method === PPh21Method.GROSS_UP ? `Tunjangan Pajak (Bulanan): ${formatCurrency(result.taxAllowance)}\n` : ''}Pajak TER (${(result.terRate! * 100).toFixed(2)}%): ${formatCurrency(result.monthlyTax)}
Est. Pajak Tahunan: ${formatCurrency(result.annualTax)}
Pajak Desember (Sisa): ${formatCurrency(result.taxDecember)}
    `.trim();

      saveHistoryItem({
         type: TaxType.PPH21,
         title: `PPh 21 ${formState.method === PPh21Method.GROSS ? '(Gross)' : '(Gross Up)'}`,
         summary: `Gaji ${formatCurrency(formState.grossSalary)}, ${formState.maritalStatus}/${formState.children}`,
         resultAmount: result.monthlyTax,
         details: details
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
   };

   const handleCopyResult = () => {
      if (!result) return;
      const text = `
Perhitungan PPh 21 (TER 2024)
------------------
Gaji + Tunjangan: ${formatCurrency(formState.grossSalary + formState.allowance)}
Status: ${formState.maritalStatus}/${formState.children}
${formState.method === PPh21Method.GROSS_UP ? `Tunjangan Pajak: ${formatCurrency(result.taxAllowance)}\n` : ''}
Pajak Bulan Ini (TER ${(result.terRate! * 100).toFixed(2)}%): ${formatCurrency(result.monthlyTax)}
Estimasi Setahun: ${formatCurrency(result.annualTax)}
    `.trim();

      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
   };

   const handleInputChange = (key: keyof PPh21State, value: any) => {
      setFormState(prev => ({ ...prev, [key]: value }));
   };

   const handleNumberChange = (key: keyof typeof displayValues, value: string) => {
      const cleanVal = value.replace(/[^0-9]/g, '');
      const formatted = cleanVal ? new Intl.NumberFormat('id-ID').format(parseInt(cleanVal)) : '';
      setDisplayValues(prev => ({ ...prev, [key]: formatted }));
      handleInputChange(key as keyof PPh21State, cleanVal ? parseInt(cleanVal) : 0);
   };

   if (!result) return null;

   // Logic for Take Home Pay Display
   const monthlyBase = formState.grossSalary + formState.allowance;
   const bpjsDeduction = result.pensionDeduction + (Math.min(formState.grossSalary, 12000000) * 0.01);

   const takeHomePayMonthly = formState.method === PPh21Method.GROSS
      ? monthlyBase - result.monthlyTax - bpjsDeduction - formState.zakat
      : monthlyBase - bpjsDeduction - formState.zakat;

   // Consistent Styles
   const LABEL_STYLE = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";
   const INPUT_CONTAINER_STYLE = "relative group";
   const INPUT_FIELD_STYLE = "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all font-bold text-base text-slate-900 placeholder:text-slate-300 h-[50px]";
   const INPUT_ICON_STYLE = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm no-print group-focus-within:text-blue-500 transition-colors";

   const SELECTOR_CONTAINER_STYLE = "flex bg-slate-50 border border-slate-200 p-1 rounded-xl h-[50px]";
   const SELECTOR_BTN_STYLE = (isActive: boolean) => `flex-1 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 flex items-center justify-center ${isActive ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`;

   const TOGGLE_STYLE = (isActive: boolean) => `p-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-center gap-1 h-[50px] ${isActive ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`;

   return (
      <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-900 pb-12">

         {/* PRINT HEADER */}
         <div className="print-only mb-8 border-b-2 border-slate-800 pb-4">
            <div className="flex justify-between items-end">
               <div>
                  <h1 className="text-2xl font-bold text-slate-900">Laporan PPh 21 (TER 2024)</h1>
                  <p className="text-sm text-slate-500">Dihasilkan oleh PajakKu Pro</p>
               </div>
               <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Tanggal Cetak</p>
                  <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
               </div>
            </div>
         </div>

         {/* MAIN CARD */}
         <div className="rounded-[2rem] bg-white shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row relative">

            {/* Left Side: Inputs */}
            <div className="p-8 md:p-10 md:w-7/12 relative">

               <div className="absolute top-8 right-8 z-10 no-print">
                  <button
                     onClick={handleReset}
                     title="Reset Input"
                     className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group"
                  >
                     <RefreshCw size={18} className="group-hover:-rotate-180 transition-transform duration-500" />
                  </button>
               </div>

               <div className="mb-8 pr-10">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 tracking-tight">PPh Pasal 21</h2>

                  <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                     <span>Skema Terbaru: Tarif Efektif Rata-Rata (TER).</span>

                     {/* Tooltip Info TER */}
                     <div className="relative group inline-flex items-center no-print">
                        <Info size={16} className="text-blue-600 cursor-help hover:scale-110 transition-transform" />
                        <div className="absolute left-0 top-full mt-3 w-72 p-4 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none origin-top-left transform scale-95 group-hover:scale-100">
                           <p className="leading-relaxed">
                              <strong>Info TER (PP 58/2023):</strong> Untuk periode Januari s.d. November, pajak dihitung menggunakan Tarif Efektif berdasarkan penghasilan bruto bulanan. Bulan Desember dihitung ulang menggunakan Tarif Pasal 17 (Setahun).
                           </p>
                           <div className="absolute bottom-full left-1.5 border-8 border-transparent border-b-slate-800"></div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">

                  {/* Method Selector */}
                  <div>
                     <label className={LABEL_STYLE}>METODE PEMBAYARAN</label>
                     <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 relative">
                        <button
                           onClick={() => handleInputChange('method', PPh21Method.GROSS)}
                           className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 relative z-10 ${formState.method === PPh21Method.GROSS ? 'text-blue-700 bg-white shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                           Gross (Potong Gaji)
                        </button>
                        <button
                           onClick={() => handleInputChange('method', PPh21Method.GROSS_UP)}
                           className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 relative z-10 ${formState.method === PPh21Method.GROSS_UP ? 'text-blue-700 bg-white shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                           Gross Up (Tunjangan)
                        </button>
                     </div>
                  </div>

                  <div className="h-px bg-slate-100 my-2"></div>

                  {/* Salary Input */}
                  <div>
                     <label className={LABEL_STYLE}>GAJI POKOK (PER BULAN)</label>
                     <div className={INPUT_CONTAINER_STYLE}>
                        <span className={INPUT_ICON_STYLE}>Rp</span>
                        <input
                           type="text"
                           inputMode="numeric"
                           value={displayValues.grossSalary}
                           onChange={(e) => handleNumberChange('grossSalary', e.target.value)}
                           className={INPUT_FIELD_STYLE}
                           placeholder="0"
                        />
                     </div>
                  </div>

                  {/* Allowance & Bonus Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={LABEL_STYLE}>TUNJANGAN (PER BULAN)</label>
                        <div className={INPUT_CONTAINER_STYLE}>
                           <span className={INPUT_ICON_STYLE}>Rp</span>
                           <input
                              type="text"
                              inputMode="numeric"
                              value={displayValues.allowance}
                              onChange={(e) => handleNumberChange('allowance', e.target.value)}
                              className={INPUT_FIELD_STYLE}
                              placeholder="0"
                           />
                        </div>
                     </div>
                     <div>
                        <label className={LABEL_STYLE}>THR / BONUS (TAHUNAN)</label>
                        <div className={INPUT_CONTAINER_STYLE}>
                           <span className={INPUT_ICON_STYLE}>Rp</span>
                           <input
                              type="text"
                              inputMode="numeric"
                              value={displayValues.thrBonus}
                              onChange={(e) => handleNumberChange('thrBonus', e.target.value)}
                              className={INPUT_FIELD_STYLE}
                              placeholder="0"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="h-px bg-slate-100 my-2"></div>

                  {/* Deductions Grid (Manual Inputs) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={LABEL_STYLE}>IURAN PENSIUN (DIBAYAR SENDIRI)</label>
                        <div className={INPUT_CONTAINER_STYLE}>
                           <span className={INPUT_ICON_STYLE}><Wallet size={14} /></span>
                           <input
                              type="text"
                              inputMode="numeric"
                              value={displayValues.manualPensionFee}
                              onChange={(e) => handleNumberChange('manualPensionFee', e.target.value)}
                              className={INPUT_FIELD_STYLE}
                              placeholder="Auto (BPJS 3%)"
                           />
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 ml-1">*Kosongkan untuk hitung otomatis.</p>
                     </div>
                     <div>
                        <label className={LABEL_STYLE}>ZAKAT / SUMBANGAN WAJIB (BULAN)</label>
                        <div className={INPUT_CONTAINER_STYLE}>
                           <span className={INPUT_ICON_STYLE}><Heart size={14} /></span>
                           <input
                              type="text"
                              inputMode="numeric"
                              value={displayValues.zakat}
                              onChange={(e) => handleNumberChange('zakat', e.target.value)}
                              className={INPUT_FIELD_STYLE}
                              placeholder="0"
                           />
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 ml-1">*Pengurang pajak setahun (Desember).</p>
                     </div>
                  </div>

                  <div className="h-px bg-slate-100 my-4"></div>

                  {/* Status & Family */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={LABEL_STYLE}>STATUS PERKAWINAN</label>
                        <div className={SELECTOR_CONTAINER_STYLE}>
                           <button
                              onClick={() => handleInputChange('maritalStatus', MaritalStatus.TK)}
                              className={SELECTOR_BTN_STYLE(formState.maritalStatus === MaritalStatus.TK)}
                           >
                              TK
                           </button>
                           <button
                              onClick={() => handleInputChange('maritalStatus', MaritalStatus.K)}
                              className={SELECTOR_BTN_STYLE(formState.maritalStatus === MaritalStatus.K)}
                           >
                              K
                           </button>
                           <button
                              onClick={() => handleInputChange('maritalStatus', MaritalStatus.HB)}
                              className={SELECTOR_BTN_STYLE(formState.maritalStatus === MaritalStatus.HB)}
                           >
                              HB
                           </button>
                        </div>
                     </div>

                     <div>
                        <label className={LABEL_STYLE}>JUMLAH TANGGUNGAN</label>
                        <div className={SELECTOR_CONTAINER_STYLE}>
                           {[0, 1, 2, 3].map(num => (
                              <button
                                 key={num}
                                 onClick={() => handleInputChange('children', num)}
                                 className={SELECTOR_BTN_STYLE(formState.children === num)}
                              >
                                 {num}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* NPWP Toggle */}
                  <div className="grid grid-cols-1 mt-4 no-print">
                     <button
                        className={TOGGLE_STYLE(formState.hasNPWP)}
                        onClick={() => handleInputChange('hasNPWP', !formState.hasNPWP)}
                     >
                        <div className="w-full flex justify-between items-center">
                           <span className={`font-bold text-sm block ${formState.hasNPWP ? 'text-blue-800' : 'text-slate-600'}`}>Ada NPWP</span>
                           <span className={`text-[10px] font-medium ${formState.hasNPWP ? 'text-blue-600' : 'text-slate-400'}`}>
                              {formState.hasNPWP ? 'Tarif Normal' : 'Tarif +20%'}
                           </span>
                        </div>
                     </button>
                  </div>

               </div>
            </div>

            {/* Right Side: Result (Clean Dark Theme) */}
            <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">

               {/* Subtle Gradient */}
               <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

               <div className="relative z-10 space-y-8">
                  <div>
                     <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gaji Bersih (Take Home Pay)</p>
                        <button
                           onClick={handleCopyResult}
                           className="text-slate-500 hover:text-emerald-400 transition-colors no-print p-1.5 rounded-lg hover:bg-white/10"
                           title="Salin Hasil"
                        >
                           {isCopied ? <CheckIcon size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </button>
                     </div>
                     <div className="flex items-baseline gap-2">
                        <div className="text-white font-bold text-2xl lg:text-3xl tracking-tight">
                           {formatCurrency(takeHomePayMonthly)}
                        </div>
                        <span className="text-xs text-slate-500 font-bold uppercase">/bln</span>
                     </div>
                     <p className="text-[10px] text-slate-500 mt-2">*Net = Gaji - Pajak (TER) - BPJS Karyawan - Zakat</p>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-4">

                     {formState.method === PPh21Method.GROSS_UP && (
                        <div className="flex justify-between items-center pb-3 border-b border-slate-700 mb-3">
                           <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Tunjangan Pajak (Gross Up)</span>
                           <span className="text-base font-bold text-emerald-400">+ {formatCurrency(result.taxAllowance)}</span>
                        </div>
                     )}

                     <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Potongan Bulan Ini (TER)</p>
                        <span className="text-2xl font-bold text-white">{formatCurrency(result.monthlyTax)}</span>
                     </div>
                     <div className="h-px bg-slate-700"></div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium text-sm">Kategori TER {result.terCategory}</span>
                        <span className="text-lg font-bold text-white">{(result.terRate! * 100).toFixed(2)}%</span>
                     </div>
                  </div>

                  <div className="space-y-3 text-sm pt-2">
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estimasi Akhir Tahun (Pasal 17)</p>
                     <div className="flex justify-between items-center text-slate-400">
                        <span className="font-medium">Total Pajak Setahun</span>
                        <span className="font-bold text-slate-200">{formatCurrency(result.annualTax)}</span>
                     </div>
                  </div>
               </div>

               <div className="relative z-10 mt-8 pt-8 border-t border-slate-800 flex items-center gap-4 no-print">
                  <button onClick={() => setIsModalOpen(true)} className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2 group">
                     Cetak
                     <Printer size={16} className="group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                     onClick={handleSave}
                     disabled={isSaved}
                     className={`ml-auto px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all duration-200 ${isSaved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}`}
                  >
                     {isSaved ? <CheckIcon size={14} /> : <Save size={14} />}
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
                     <Info size={18} />
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold text-slate-900">Rincian Perhitungan (PP 58/2023)</h4>
               </div>
               <div className={`p-2 rounded-full border transition-all duration-300 ${showDetail ? 'rotate-180 bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-400'}`}>
                  <ChevronDown size={16} />
               </div>
            </button>

            {showDetail && (
               <div className="px-6 md:px-8 pb-8 space-y-6 animate-enter">

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
                     <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Info size={16} className="text-blue-600" />
                        Skema Pemotongan
                     </h5>
                     <ul className="text-sm text-slate-600 leading-relaxed mb-3 list-disc list-inside space-y-1">
                        <li><strong>Januari - November:</strong> Menggunakan Tarif Efektif Rata-Rata (TER) Bulanan. Cukup dikalikan Penghasilan Bruto sebulan.</li>
                        <li><strong>Desember:</strong> Menggunakan Tarif Pasal 17 Setahun (Dihitung ulang). Pajak Desember = Pajak Setahun dikurangi yang sudah dibayar Jan-Nov.</li>
                     </ul>
                  </div>

                  {/* Step 1: Bruto */}
                  <div className="relative pl-6 border-l-2 border-slate-100">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Penghasilan Bruto Sebulan</h5>
                     <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
                        <div className="flex justify-between items-center">
                           <span>Gaji Pokok</span>
                           <span className="font-bold text-slate-700">{formatCurrency(formState.grossSalary)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span>Tunjangan</span>
                           <span className="font-bold text-slate-700">{formatCurrency(formState.allowance)}</span>
                        </div>

                        {result.insuranceAmount > 0 && (
                           <div className="flex justify-between items-center">
                              <span>Premi JKK/JKM (Perusahaan)</span>
                              <span className="font-bold text-slate-700">{formatCurrency(result.insuranceAmount)}</span>
                           </div>
                        )}

                        {formState.method === PPh21Method.GROSS_UP && (
                           <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1 text-emerald-600">
                              <span>+ Tunjangan PPh (Gross Up)</span>
                              <span className="font-bold">{formatCurrency(result.taxAllowance)}</span>
                           </div>
                        )}

                        <div className="flex justify-between font-bold text-slate-900 text-base pt-1">
                           <span>Bruto Pajak (Basis TER)</span>
                           <span>{formatCurrency(result.grossForTax)}</span>
                        </div>
                     </div>
                  </div>

                  {/* Step 2: Tarif TER */}
                  <div className="relative pl-6 border-l-2 border-slate-100">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. Penentuan Tarif (Kategori {result.terCategory})</h5>
                     <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
                        <div className="flex justify-between items-center">
                           <span>Status PTKP</span>
                           <span className="font-bold text-slate-700">{formState.maritalStatus}/{formState.children}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span>Masuk Kategori</span>
                           <span className="font-bold text-blue-600">TER {result.terCategory}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-3 mt-1">
                           <span>Tarif Efektif (Jan-Nov)</span>
                           <span>{(result.terRate! * 100).toFixed(2)}%</span>
                        </div>
                     </div>
                  </div>

                  {/* Step 3: Monthly Tax */}
                  <div className="relative pl-6 border-l-2 border-slate-100 pt-2">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. Pajak Bulan Ini (Bruto x TER)</h5>
                     <div className="bg-blue-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-blue-100">
                        <div className="flex justify-between items-center border-t border-blue-200 pt-3 mt-1">
                           <span className="text-blue-800 font-bold">PPh 21 Bulan Ini</span>
                           <span className="font-black text-blue-700 text-lg">{formatCurrency(result.monthlyTax)}</span>
                        </div>
                     </div>
                  </div>

                  {/* Step 4: Annual Calculation */}
                  <div className="relative pl-6 border-l-2 border-slate-100 pt-2">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-amber-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CalendarDays size={12} />
                        4. Simulasi Akhir Tahun (Desember) - Pasal 17
                     </h5>
                     <div className="bg-amber-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-amber-100">
                        <p className="text-[10px] text-slate-500 italic mb-2">
                           Di bulan Desember, pajak dihitung ulang setahun penuh dikurangi yang sudah disetor Jan-Nov.
                        </p>

                        <div className="flex justify-between items-center border-b border-amber-200 pb-2 mb-1">
                           <span>Penghasilan Bruto Setahun</span>
                           <span className="font-bold text-slate-800">{formatCurrency(result.annualGross)}</span>
                        </div>

                        {/* Deductions Detail */}
                        <div className="pl-2 text-xs space-y-1 mb-2">
                           <div className="flex justify-between text-red-500">
                              <span>- Biaya Jabatan (5% Max 6jt)</span>
                              <span>{formatCurrency(result.biayaJabatan)}</span>
                           </div>
                           <div className="flex justify-between text-red-500">
                              <span>- Iuran Pensiun Setahun</span>
                              <span>{formatCurrency(result.pensionDeduction * 12)}</span>
                           </div>
                           {formState.zakat > 0 && (
                              <div className="flex justify-between text-red-500">
                                 <span>- Zakat/Sumbangan Setahun</span>
                                 <span>{formatCurrency(formState.zakat * 12)}</span>
                              </div>
                           )}
                        </div>

                        <div className="flex justify-between items-center">
                           <span>Penghasilan Neto</span>
                           <span className="font-bold text-slate-800">{formatCurrency(result.netIncome)}</span>
                        </div>
                        <div className="flex justify-between items-center text-green-600">
                           <span>PTKP ({formState.maritalStatus}/{formState.children})</span>
                           <span>- {formatCurrency(result.ptkp)}</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-slate-900">
                           <span>PKP (Penghasilan Kena Pajak)</span>
                           <span>{formatCurrency(result.pkp)}</span>
                        </div>

                        <div className="h-px bg-amber-200 my-2"></div>

                        <div className="flex justify-between items-center">
                           <span>Total Pajak Setahun (Pasal 17)</span>
                           <span className="font-bold text-slate-800">{formatCurrency(result.annualTax)}</span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-600">
                           <span>Sudah Bayar (Jan-Nov)</span>
                           <span>- {formatCurrency(result.taxJanToNov)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-amber-200 pt-3 mt-1">
                           <span className="text-amber-800 font-bold">Pajak Desember (Sisa)</span>
                           <span className="font-black text-amber-700 text-lg">{formatCurrency(result.taxDecember)}</span>
                        </div>
                     </div>
                  </div>

               </div>
            )}
         </div>

         <TaxResultModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            result={result}
            formState={formState}
         />
      </div >
   );
};

export default CalculatorPPH21;
