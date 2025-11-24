
import React, { useState, useEffect } from 'react';
import { PESANGON_BRACKETS, PENSIUN_BRACKETS } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { TaxType } from '../types';
import { UserMinus, Wallet, RefreshCw, Info, Save, Check, Printer, Copy, Check as CheckIcon, ChevronDown } from './Icons';

interface Props {
   onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
   if (value === 0) return '';
   return new Intl.NumberFormat('id-ID').format(value);
};

const CalculatorPesangon: React.FC<Props> = ({ onContextUpdate }) => {
   const [pesangon, setPesangon] = useState(120000000); // 120jt
   const [displayPesangon, setDisplayPesangon] = useState(formatNumberInput(120000000));

   const [pensiun, setPensiun] = useState(60000000); // 60jt
   const [displayPensiun, setDisplayPensiun] = useState(formatNumberInput(60000000));

   const [isSaved, setIsSaved] = useState(false);
   const [isCopied, setIsCopied] = useState(false);
   const [showDetail, setShowDetail] = useState(false);

   // --- Calculation Logic ---

   // Helper to calculate layered tax
   const calculateLayeredTax = (amount: number, brackets: { limit: number, rate: number }[]) => {
      let remaining = amount;
      let tax = 0;
      let prevLimit = 0;
      const layers = [];

      for (const b of brackets) {
         if (remaining <= 0) break;
         const range = b.limit - prevLimit;
         const taxable = Math.min(remaining, range);
         const taxAmount = taxable * b.rate;

         if (taxable > 0) {
            layers.push({
               layer: `${(b.rate * 100)}%`,
               taxable: taxable,
               amount: taxAmount
            });
         }

         tax += taxAmount;
         remaining -= taxable;
         prevLimit = b.limit;
      }
      return { total: tax, layers };
   };

   const taxPesangon = calculateLayeredTax(pesangon, PESANGON_BRACKETS);
   const taxPensiun = calculateLayeredTax(pensiun, PENSIUN_BRACKETS);

   const totalTax = taxPesangon.total + taxPensiun.total;
   const totalGross = pesangon + pensiun;
   const netReceived = totalGross - totalTax;

   useEffect(() => {
      onContextUpdate(`
      Kalkulator: Pajak Pesangon & Manfaat Pensiun (PPh 21 Final)
      Uang Pesangon Bruto: ${formatCurrency(pesangon)}
      Uang Pensiun/JHT Bruto: ${formatCurrency(pensiun)}
      
      Hasil Perhitungan:
      Pajak atas Pesangon: ${formatCurrency(taxPesangon.total)}
      Pajak atas Pensiun: ${formatCurrency(taxPensiun.total)}
      Total Pajak Final: ${formatCurrency(totalTax)}
      Uang Bersih Diterima: ${formatCurrency(netReceived)}
    `);
   }, [pesangon, pensiun, taxPesangon, taxPensiun, totalTax, netReceived, onContextUpdate]);

   useEffect(() => { if (isSaved) setIsSaved(false); }, [pesangon, pensiun]);

   const handleReset = () => {
      setPesangon(0); setDisplayPesangon('');
      setPensiun(0); setDisplayPensiun('');
      setIsSaved(false);
   };

   const handleNumberChange = (setter: (v: number) => void, displaySetter: (v: string) => void, val: string) => {
      const cleanVal = val.replace(/[^0-9]/g, '');
      const numVal = cleanVal ? parseInt(cleanVal) : 0;
      setter(numVal);
      displaySetter(cleanVal ? new Intl.NumberFormat('id-ID').format(numVal) : '');
   };

   const handleSave = () => {
      const details = `
Pesangon: ${formatCurrency(pesangon)}
Pensiun/JHT: ${formatCurrency(pensiun)}
--------------------------------
Pajak Pesangon: ${formatCurrency(taxPesangon.total)}
Pajak Pensiun: ${formatCurrency(taxPensiun.total)}
Total Pajak Final: ${formatCurrency(totalTax)}
Net Diterima: ${formatCurrency(netReceived)}
    `.trim();

      saveHistoryItem({
         type: TaxType.PESANGON,
         title: 'Pajak Pesangon & Pensiun',
         summary: `Total ${formatCurrency(totalGross)}`,
         resultAmount: totalTax,
         details: details
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
   };

   const handleCopyResult = () => {
      const text = `
Estimasi Pajak Pesangon (Final)
------------------
Pesangon: ${formatCurrency(pesangon)}
Pensiun/JHT: ${formatCurrency(pensiun)}

Pajak Terutang: ${formatCurrency(totalTax)}
Bersih Diterima: ${formatCurrency(netReceived)}
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
                  <h1 className="text-2xl font-bold text-slate-900">Laporan Pajak Pesangon & Pensiun</h1>
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
                     <RefreshCw size={18} className="group-hover:-rotate-180 transition-transform duration-500" />
                  </button>
               </div>

               <div className="mb-8 pr-10">
                  <div className="flex items-center gap-2 mb-2">
                     <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Pajak Pesangon & Pensiun</h2>
                  </div>
                  <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                     <span>Hitung PPh Final atas PHK, Pensiun Dini, atau Pencairan JHT Sekaligus.</span>
                  </div>
               </div>

               <div className="space-y-6">

                  {/* Pesangon Input */}
                  <div>
                     <label className={LABEL_STYLE}>Uang Pesangon (Bruto)</label>
                     <div className={INPUT_CONTAINER_STYLE}>
                        <span className={INPUT_ICON_STYLE}>Rp</span>
                        <input
                           type="text"
                           inputMode="numeric"
                           value={displayPesangon}
                           onChange={(e) => handleNumberChange(setPesangon, setDisplayPesangon, e.target.value)}
                           className={INPUT_FIELD_STYLE}
                           placeholder="0"
                        />
                     </div>
                     <p className="text-[10px] text-slate-400 mt-2 ml-1">
                        Termasuk Uang Penghargaan Masa Kerja (UPMK) dan Penggantian Hak (UPH).
                     </p>
                  </div>

                  {/* Pensiun Input */}
                  <div>
                     <label className={LABEL_STYLE}>Manfaat Pensiun / JHT / THT</label>
                     <div className={INPUT_CONTAINER_STYLE}>
                        <span className={INPUT_ICON_STYLE}><Wallet size={18} /></span>
                        <input
                           type="text"
                           inputMode="numeric"
                           value={displayPensiun}
                           onChange={(e) => handleNumberChange(setPensiun, setDisplayPensiun, e.target.value)}
                           className={INPUT_FIELD_STYLE}
                           placeholder="0"
                        />
                     </div>
                     <p className="text-[10px] text-slate-400 mt-2 ml-1">
                        Uang Manfaat Pensiun, Tunjangan Hari Tua, atau Jaminan Hari Tua yang dibayar sekaligus.
                     </p>
                  </div>

               </div>
            </div>

            {/* Right Side: Result (Clean Dark Theme) */}
            <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">

               {/* Subtle Gradient */}
               <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[80px] pointer-events-none"></div>

               <div className="relative z-10 space-y-8">
                  <div>
                     <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimasi Diterima Bersih</p>
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
                           {formatCurrency(netReceived)}
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-4">
                     <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                        <span className="text-slate-400 text-sm">Pajak Pesangon</span>
                        <span className="text-lg font-bold text-white">{formatCurrency(taxPesangon.total)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Pajak Pensiun</span>
                        <span className="text-lg font-bold text-white">{formatCurrency(taxPensiun.total)}</span>
                     </div>
                  </div>

                  <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
                     <div className="mt-0.5 text-blue-400"><Info size={16} /></div>
                     <div>
                        <p className="text-xs text-blue-100 leading-relaxed">
                           Pajak ini bersifat <strong>Final</strong>. Artinya, Anda tidak perlu menghitung ulang dalam SPT Tahunan, cukup laporkan penghasilan dan pajaknya.
                        </p>
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
                  <h4 className="text-xl md:text-2xl font-bold text-slate-900">Rincian Perhitungan (Lapisan)</h4>
               </div>
               <div className={`p-2 rounded-full border transition-all duration-300 ${showDetail ? 'rotate-180 bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-400'}`}>
                  <ChevronDown size={16} />
               </div>
            </button>

            {showDetail && (
               <div className="px-6 md:px-8 pb-8 space-y-6 animate-enter">

                  {/* Pesangon Layers */}
                  {pesangon > 0 && (
                     <div className="relative pl-6 border-l-2 border-slate-100">
                        <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pajak Pesangon (Progresif Final)</h5>
                        <div className="space-y-2">
                           {taxPesangon.layers.map((layer, idx) => (
                              <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center text-sm">
                                 <div className="flex flex-col">
                                    <span className="font-bold text-blue-600">Lapisan {idx + 1} ({layer.layer})</span>
                                    <span className="text-xs text-slate-500">Dari nilai: {formatCurrency(layer.taxable)}</span>
                                 </div>
                                 <span className="font-bold text-slate-800">{formatCurrency(layer.amount)}</span>
                              </div>
                           ))}
                           <div className="text-xs text-slate-400 pt-1 italic">*0% untuk 50 Juta pertama.</div>
                        </div>
                     </div>
                  )}

                  {/* Pensiun Layers */}
                  {pensiun > 0 && (
                     <div className="relative pl-6 border-l-2 border-slate-100 pt-2">
                        <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pajak Pensiun / JHT (Final)</h5>
                        <div className="space-y-2">
                           {taxPensiun.layers.map((layer, idx) => (
                              <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center text-sm">
                                 <div className="flex flex-col">
                                    <span className="font-bold text-blue-600">Lapisan {idx + 1} ({layer.layer})</span>
                                    <span className="text-xs text-slate-500">Dari nilai: {formatCurrency(layer.taxable)}</span>
                                 </div>
                                 <span className="font-bold text-slate-800">{formatCurrency(layer.amount)}</span>
                              </div>
                           ))}
                           <div className="text-xs text-slate-400 pt-1 italic">*0% untuk 50 Juta pertama. 5% untuk sisanya.</div>
                        </div>
                     </div>
                  )}

               </div>
            )}
         </div>
      </div>
   );
};

export default CalculatorPesangon;
