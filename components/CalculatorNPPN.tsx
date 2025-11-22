
import React, { useState, useEffect } from 'react';
import { NPPN_PROFESSIONS, PTKP_BASE, PTKP_MARRIED, PTKP_PER_CHILD, PPH21_BRACKETS } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { MaritalStatus, TaxType } from '../types';
import { PenTool, ArrowRight, RefreshCw, Info, Save, Check, Printer, Copy, ChevronDown, Check as CheckIcon } from './Icons';
import FreelancerResultModal from './FreelancerResultModal';

interface Props {
   onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
   if (value === 0) return '';
   return new Intl.NumberFormat('id-ID').format(value);
};

const CalculatorNPPN: React.FC<Props> = ({ onContextUpdate }) => {
   const [grossIncome, setGrossIncome] = useState(500000000); // 500jt annual
   const [displayGross, setDisplayGross] = useState(formatNumberInput(500000000));
   const [professionId, setProfessionId] = useState(NPPN_PROFESSIONS[0].id);
   const [maritalStatus, setMaritalStatus] = useState(MaritalStatus.TK);
   const [children, setChildren] = useState(0);

   const [isSaved, setIsSaved] = useState(false);
   const [showDetail, setShowDetail] = useState(false);
   const [isCopied, setIsCopied] = useState(false);

   // Calculation Logic
   const profession = NPPN_PROFESSIONS.find(p => p.id === professionId) || NPPN_PROFESSIONS[0];
   const normaRate = profession.rate;

   // 1. Net Income (Penghasilan Neto) using Norma
   const netIncome = grossIncome * normaRate;

   // 2. PTKP
   let ptkp = PTKP_BASE;
   if (maritalStatus === MaritalStatus.K) ptkp += PTKP_MARRIED;
   ptkp += Math.min(children, 3) * PTKP_PER_CHILD;

   // 3. PKP
   let pkp = Math.floor((netIncome - ptkp) / 1000) * 1000;
   if (pkp < 0) pkp = 0;

   // 4. Progressive Tax (PPh 21 Brackets)
   let remainingPkp = pkp;
   let annualTax = 0;
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

      annualTax += taxForLayer;
      remainingPkp -= taxableAmount;
      previousLimit = bracket.limit;
   }

   useEffect(() => {
      onContextUpdate(`
      Kalkulator: PPh Freelancer (Pekerjaan Bebas / NPPN)
      Profesi: ${profession.label}
      Omzet Bruto (Tahun): ${formatCurrency(grossIncome)}
      Norma Penghitungan: ${(normaRate * 100).toFixed(0)}%
      Penghasilan Neto: ${formatCurrency(netIncome)}
      Status: ${maritalStatus}/${children}
      PTKP: ${formatCurrency(ptkp)}
      PKP: ${formatCurrency(pkp)}
      Pajak Terutang (Tahun): ${formatCurrency(annualTax)}
    `);
   }, [grossIncome, professionId, maritalStatus, children, netIncome, ptkp, pkp, annualTax, normaRate, profession, onContextUpdate]);

   useEffect(() => { if (isSaved) setIsSaved(false); }, [grossIncome, professionId, maritalStatus, children]);

   const handleReset = () => {
      setGrossIncome(0);
      setDisplayGross('');
      setProfessionId(NPPN_PROFESSIONS[0].id);
      setMaritalStatus(MaritalStatus.TK);
      setChildren(0);
      setIsSaved(false);
   };

   const handleNumberChange = (val: string) => {
      const cleanVal = val.replace(/[^0-9]/g, '');
      const numVal = cleanVal ? parseInt(cleanVal) : 0;
      setGrossIncome(numVal);
      setDisplayGross(cleanVal ? new Intl.NumberFormat('id-ID').format(numVal) : '');
   };

   const handleSave = () => {
      const details = `
Profesi: ${profession.label}
Norma: ${(normaRate * 100).toFixed(0)}%
Omzet Bruto: ${formatCurrency(grossIncome)}
Status: ${maritalStatus}/${children}
--------------------------------
Neto (Bruto x Norma): ${formatCurrency(netIncome)}
PTKP: ${formatCurrency(ptkp)}
PKP: ${formatCurrency(pkp)}
Pajak Terutang: ${formatCurrency(annualTax)}
    `.trim();

      saveHistoryItem({
         type: TaxType.NPPN,
         title: 'PPh Freelancer',
         summary: `${profession.label} - ${formatCurrency(grossIncome)}`,
         resultAmount: annualTax,
         details: details
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
   };

   const handleCopyResult = () => {
      const text = `
Estimasi Pajak Freelancer (NPPN)
------------------
Profesi: ${profession.label} (${(normaRate * 100)}%)
Omzet: ${formatCurrency(grossIncome)}
Neto: ${formatCurrency(netIncome)}
Status: ${maritalStatus}/${children}

Pajak Terutang: ${formatCurrency(annualTax)}
    `.trim();

      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
   };

   const [isModalOpen, setIsModalOpen] = useState(false);

   // Consistent Styles
   const LABEL_STYLE = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";
   const INPUT_CONTAINER_STYLE = "relative group";
   const INPUT_FIELD_STYLE = "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all font-bold text-base text-slate-900 placeholder:text-slate-300 h-[50px]";
   const INPUT_ICON_STYLE = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm no-print group-focus-within:text-blue-500 transition-colors";
   const SELECTOR_CONTAINER_STYLE = "flex bg-slate-50 border border-slate-200 p-1 rounded-xl h-[50px]";
   const SELECTOR_BTN_STYLE = (isActive: boolean) => `flex-1 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 flex items-center justify-center ${isActive ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`;

   return (
      <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-900 pb-12">

         {/* MAIN CARD */}
         <div className="rounded-[2rem] bg-white shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row relative">

            {/* Inputs */}
            <div className="p-8 md:p-10 md:w-7/12 relative">
               <div className="absolute top-8 right-8 z-10 no-print">
                  <button onClick={handleReset} title="Reset Input" className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group">
                     <RefreshCw size={18} className="group-hover:-rotate-180 transition-transform duration-500" />
                  </button>
               </div>

               <div className="mb-8 pr-10">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 tracking-tight">PPh Freelancer (NPPN)</h2>
                  <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                     <span>Untuk Pekerja Bebas dengan omzet {"<"} 4.8 Miliar/Tahun.</span>
                  </div>
               </div>

               <div className="space-y-6">
                  {/* Annual Income */}
                  <div>
                     <label className={LABEL_STYLE}>Peredaran Bruto (Setahun)</label>
                     <div className={INPUT_CONTAINER_STYLE}>
                        <span className={INPUT_ICON_STYLE}>Rp</span>
                        <input
                           type="text"
                           inputMode="numeric"
                           value={displayGross}
                           onChange={(e) => handleNumberChange(e.target.value)}
                           className={INPUT_FIELD_STYLE}
                           placeholder="0"
                        />
                     </div>
                     {grossIncome > 4800000000 && (
                        <p className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1">
                           <Info size={12} /> Omzet diatas 4.8M wajib pembukuan (tidak bisa pakai Norma).
                        </p>
                     )}
                  </div>

                  {/* Profession Selector */}
                  <div>
                     <label className={LABEL_STYLE}>Jenis Pekerjaan / Profesi</label>
                     <div className="relative">
                        <select
                           value={professionId}
                           onChange={(e) => setProfessionId(e.target.value)}
                           className="w-full px-5 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer text-base h-[50px]"
                        >
                           {NPPN_PROFESSIONS.map(p => (
                              <option key={p.id} value={p.id}>{p.label} (Norma {(p.rate * 100)}%)</option>
                           ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 no-print"><ChevronDown size={18} /></div>
                     </div>
                  </div>

                  <div className="h-px bg-slate-100 my-6"></div>

                  {/* Status & Family - Segmented Controls (Reusing PPh21 Style) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                        <label className={LABEL_STYLE}>Status Perkawinan</label>
                        <div className={SELECTOR_CONTAINER_STYLE}>
                           <button
                              onClick={() => setMaritalStatus(MaritalStatus.TK)}
                              className={SELECTOR_BTN_STYLE(maritalStatus === MaritalStatus.TK)}
                           >
                              TK (Lajang)
                           </button>
                           <button
                              onClick={() => setMaritalStatus(MaritalStatus.K)}
                              className={SELECTOR_BTN_STYLE(maritalStatus === MaritalStatus.K)}
                           >
                              K (Nikah)
                           </button>
                           <button
                              onClick={() => setMaritalStatus(MaritalStatus.HB)}
                              className={SELECTOR_BTN_STYLE(maritalStatus === MaritalStatus.HB)}
                           >
                              HB (Pisah)
                           </button>
                        </div>
                     </div>

                     <div>
                        <label className={LABEL_STYLE}>Jumlah Tanggungan</label>
                        <div className={SELECTOR_CONTAINER_STYLE}>
                           {[0, 1, 2, 3].map(num => (
                              <button
                                 key={num}
                                 onClick={() => setChildren(num)}
                                 className={SELECTOR_BTN_STYLE(children === num)}
                              >
                                 {num}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Side: Result (Clean Dark Theme) */}
            <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">

               {/* Subtle Gradient */}
               <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none"></div>

               <div className="relative z-10 space-y-8">
                  <div>
                     <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pajak Terutang (Setahun)</p>
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
                           {formatCurrency(annualTax)}
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-4">
                     <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Penghasilan Neto (Diakui)</p>
                        <span className="text-xl font-bold text-emerald-400">{formatCurrency(netIncome)}</span>
                     </div>
                     <div className="h-px bg-slate-700"></div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium text-sm">Tarif Norma</span>
                        <span className="text-lg font-bold text-white">{(normaRate * 100)}%</span>
                     </div>
                  </div>

                  <div className="space-y-3 text-sm pt-2">
                     <div className="flex justify-between items-center text-slate-400">
                        <span className="font-medium">Penghasilan Bruto</span>
                        <span className="font-bold text-slate-200">{formatCurrency(grossIncome)}</span>
                     </div>
                     <div className="flex justify-between items-center text-slate-400">
                        <span className="font-medium">PTKP ({maritalStatus}/{children})</span>
                        <span className="font-bold text-slate-200">{formatCurrency(ptkp)}</span>
                     </div>
                     <div className="flex justify-between items-center text-slate-400">
                        <span className="font-medium">PKP</span>
                        <span className="font-bold text-slate-200">{formatCurrency(pkp)}</span>
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
                  <h4 className="text-xl md:text-2xl font-bold text-slate-900">Rincian Perhitungan</h4>
               </div>
               <div className={`p-2 rounded-full border transition-all duration-300 ${showDetail ? 'rotate-180 bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-400'}`}>
                  <ChevronDown size={16} />
               </div>
            </button>

            {showDetail && (
               <div className="px-6 md:px-8 pb-8 space-y-6 animate-enter">

                  {/* Logic Explanation Block */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
                     <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Info size={16} className="text-blue-600" />
                        Metode Perhitungan (Alur Logika)
                     </h5>
                     <p className="text-sm text-slate-600 leading-relaxed mb-3">
                        Penggunaan Norma Penghitungan Penghasilan Neto (NPPN) menyederhanakan proses tanpa perlu pembukuan biaya detail.
                     </p>
                     <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1 font-medium">
                        <li><strong>Omzet Bruto</strong> setahun dikalikan <strong>Tarif Norma</strong> (misal 50%) untuk dapat <strong>Neto</strong>.</li>
                        <li>Neto dikurangi <strong>PTKP</strong> sesuai status pernikahan.</li>
                        <li>Hasilnya (PKP) dikalikan tarif pajak progresif umum (Pasal 17).</li>
                     </ol>
                  </div>

                  {/* Step 1: Norma */}
                  <div className="relative pl-6 border-l-2 border-slate-100">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Hitung Penghasilan Neto</h5>
                     <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
                        <div className="flex justify-between items-center">
                           <span>Omzet Bruto</span>
                           <span className="font-bold text-slate-700">{formatCurrency(grossIncome)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span>Tarif Norma ({profession.label})</span>
                           <span className="font-bold text-slate-700">x {(normaRate * 100)}%</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-2 mt-1">
                           <span>Penghasilan Neto</span>
                           <span>{formatCurrency(netIncome)}</span>
                        </div>
                     </div>
                  </div>

                  {/* Step 2: PKP */}
                  <div className="relative pl-6 border-l-2 border-slate-100">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. Penghasilan Kena Pajak (PKP)</h5>
                     <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
                        <div className="flex justify-between items-center">
                           <span>Penghasilan Neto</span>
                           <span className="font-bold text-slate-700">{formatCurrency(netIncome)}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-medium">
                           <span>PTKP ({maritalStatus}/{children})</span>
                           <span>- {formatCurrency(ptkp)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 text-base mt-1 border-t border-slate-200 pt-3">
                           <span>PKP (Neto - PTKP)</span>
                           <span>{formatCurrency(pkp)}</span>
                        </div>
                     </div>
                  </div>

                  {/* Step 3: Layers */}
                  <div className="relative pl-6 border-l-2 border-slate-100 pb-2">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. Perhitungan Pajak Progresif</h5>
                     <div className="space-y-2">
                        {taxLayers.length > 0 ? taxLayers.map((layer, idx) => (
                           <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center text-sm">
                              <div className="flex flex-col">
                                 <span className="font-bold text-blue-600">Lapisan {idx + 1} ({layer.layer})</span>
                              </div>
                              <span className="font-bold text-slate-800">{formatCurrency(layer.amount)}</span>
                           </div>
                        )) : (
                           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-500 italic">
                              Tidak ada pajak terutang (PKP Nol).
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Step 4: Summary (New) */}
                  <div className="relative pl-6 border-l-2 border-slate-100 pt-2">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">4. Ringkasan Akhir</h5>
                     <div className="bg-blue-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-blue-100">
                        <div className="flex justify-between items-center">
                           <span>Penghasilan Bruto (Omzet)</span>
                           <span className="font-bold text-slate-700">{formatCurrency(grossIncome)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-blue-200 pt-3 mt-1">
                           <span className="text-blue-800 font-bold">Total Pajak Terutang</span>
                           <span className="font-black text-blue-700 text-lg">{formatCurrency(annualTax)}</span>
                        </div>
                     </div>
                  </div>

               </div>
            )}
         </div>

         <FreelancerResultModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            data={{
               grossIncome,
               professionLabel: profession.label,
               normaRate,
               netIncome,
               maritalStatus,
               children,
               ptkp,
               pkp,
               annualTax,
               taxLayers
            }}
         />
      </div>
   );
};

export default CalculatorNPPN;
