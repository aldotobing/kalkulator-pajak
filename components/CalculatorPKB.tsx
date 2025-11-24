
import React, { useState, useEffect } from 'react';
import { PKB_PROGRESSIVE_RATES, PKB_COSTS, PKB_PROVINCES } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { TaxType } from '../types';
import { Car, Bike, RefreshCw, Info, Save, Check, Printer, Copy, Check as CheckIcon, ChevronDown, MapPin } from './Icons';
import PKBResultModal from './PKBResultModal';

interface Props {
   onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
   if (value === 0) return '';
   return new Intl.NumberFormat('id-ID').format(value);
};

const CalculatorPKB: React.FC<Props> = ({ onContextUpdate }) => {
   const [njkb, setNjkb] = useState(200000000);
   const [displayNjkb, setDisplayNjkb] = useState(formatNumberInput(200000000));
   const [vehicleType, setVehicleType] = useState<'MOTOR' | 'MOBIL'>('MOBIL');
   const [progressiveIdx, setProgressiveIdx] = useState(1); // 1st Vehicle
   const [provinceId, setProvinceId] = useState('DKI');

   const [isSaved, setIsSaved] = useState(false);
   const [isCopied, setIsCopied] = useState(false);
   const [showDetail, setShowDetail] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);

   // Logic
   const province = PKB_PROVINCES.find(p => p.id === provinceId) || PKB_PROVINCES[0];
   const progressiveRate = province.rates[Math.min(progressiveIdx - 1, 4)];
   const costs = vehicleType === 'MOBIL' ? PKB_COSTS.MOBIL : PKB_COSTS.MOTOR;

   const pkbPokok = njkb * progressiveRate;
   const swdkllj = costs.swdkllj;
   const adminStnk = costs.admin_stnk; // Tahunan

   const totalEstimate = pkbPokok + swdkllj + adminStnk;

   useEffect(() => {
      onContextUpdate(`
      Kalkulator: Pajak Kendaraan Bermotor (PKB)
      Wilayah: ${province.label}
      Jenis Kendaraan: ${vehicleType}
      Urutan Kepemilikan: Ke-${progressiveIdx}
      Tarif Efektif: ${parseFloat((progressiveRate * 100).toFixed(2))}% (${province.legal})
      Nilai Jual (NJKB): ${formatCurrency(njkb)}
      
      Rincian Biaya:
      1. PKB Pokok: ${formatCurrency(pkbPokok)}
      2. SWDKLLJ (Asuransi): ${formatCurrency(swdkllj)}
      3. Admin STNK (Tahunan): ${formatCurrency(adminStnk)}
      
      Total Estimasi Pajak Tahunan: ${formatCurrency(totalEstimate)}
    `);
   }, [njkb, vehicleType, progressiveIdx, provinceId, pkbPokok, swdkllj, adminStnk, totalEstimate, progressiveRate, province, onContextUpdate]);

   useEffect(() => { if (isSaved) setIsSaved(false); }, [njkb, vehicleType, progressiveIdx, provinceId]);

   const handleReset = () => {
      setNjkb(0);
      setDisplayNjkb('');
      setVehicleType('MOBIL');
      setProgressiveIdx(1);
      setProvinceId('DKI');
      setIsSaved(false);
   };

   const handleNumberChange = (val: string) => {
      const cleanVal = val.replace(/[^0-9]/g, '');
      const numVal = cleanVal ? parseInt(cleanVal) : 0;
      setNjkb(numVal);
      setDisplayNjkb(cleanVal ? new Intl.NumberFormat('id-ID').format(numVal) : '');
   };

   const handleSave = () => {
      const details = `
Provinsi: ${province.label}
Kendaraan: ${vehicleType} - Kepemilikan Ke-${progressiveIdx}
NJKB: ${formatCurrency(njkb)}
Tarif Progresif: ${parseFloat((progressiveRate * 100).toFixed(2))}%
Dasar Hukum: ${province.legal}
--------------------------------
PKB Pokok: ${formatCurrency(pkbPokok)}
SWDKLLJ: ${formatCurrency(swdkllj)}
Admin STNK: ${formatCurrency(adminStnk)}
Total: ${formatCurrency(totalEstimate)}
    `.trim();

      saveHistoryItem({
         type: TaxType.PKB,
         title: 'Pajak Kendaraan (PKB)',
         summary: `${vehicleType} Ke-${progressiveIdx} (${province.label})`,
         resultAmount: totalEstimate,
         details: details
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
   };

   const handleCopyResult = () => {
      const text = `
Estimasi Pajak Kendaraan (STNK Tahunan)
------------------
Wilayah: ${province.label}
Jenis: ${vehicleType} (Ke-${progressiveIdx})
NJKB: ${formatCurrency(njkb)}

PKB Pokok: ${formatCurrency(pkbPokok)}
SWDKLLJ: ${formatCurrency(swdkllj)}
Admin STNK: ${formatCurrency(adminStnk)}

Total: ${formatCurrency(totalEstimate)}
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
                     <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Pajak Kendaraan</h2>
                  </div>
                  <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                     <span>Estimasi biaya perpanjangan STNK Tahunan (PKB + SWDKLLJ).</span>
                  </div>
               </div>

               <div className="space-y-6">

                  {/* Province Selector */}
                  <div>
                     <label className={LABEL_STYLE}>Wilayah / Provinsi</label>
                     <div className="relative">
                        <select
                           value={provinceId}
                           onChange={(e) => setProvinceId(e.target.value)}
                           className="w-full px-5 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer text-base h-[50px]"
                        >
                           {PKB_PROVINCES.map(p => (
                              <option key={p.id} value={p.id}>{p.label}</option>
                           ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 no-print"><ChevronDown size={18} /></div>
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none hidden"><MapPin size={18} /></div>
                     </div>
                     <p className="text-[10px] text-slate-400 mt-2 ml-1 flex items-center gap-1">
                        <Info size={12} /> Tarif mengacu pada {province.legal}.
                     </p>
                  </div>

                  {/* Vehicle Type Selector */}
                  <div>
                     <label className={LABEL_STYLE}>Jenis Kendaraan</label>
                     <div className="grid grid-cols-2 gap-4">
                        <button
                           onClick={() => setVehicleType('MOTOR')}
                           className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${vehicleType === 'MOTOR' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500/20' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                           <Bike size={24} />
                           <span className="text-sm font-bold">Motor</span>
                        </button>
                        <button
                           onClick={() => setVehicleType('MOBIL')}
                           className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${vehicleType === 'MOBIL' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500/20' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}
                        >
                           <Car size={24} />
                           <span className="text-sm font-bold">Mobil</span>
                        </button>
                     </div>
                  </div>

                  {/* NJKB */}
                  <div>
                     <label className={LABEL_STYLE}>Nilai Jual Kendaraan (NJKB)</label>
                     <div className={INPUT_CONTAINER_STYLE}>
                        <span className={INPUT_ICON_STYLE}>Rp</span>
                        <input
                           type="text"
                           inputMode="numeric"
                           value={displayNjkb}
                           onChange={(e) => handleNumberChange(e.target.value)}
                           className={INPUT_FIELD_STYLE}
                           placeholder="0"
                        />
                     </div>
                     <p className="text-[10px] text-slate-400 mt-2 ml-1 flex items-center gap-1">
                        <Info size={12} /> NJKB bukan harga pasar, tapi nilai penetapan pemerintah (cek di STNK lama/Web Samsat).
                     </p>
                  </div>

                  <div className="h-px bg-slate-100 my-6"></div>

                  {/* Progressive */}
                  <div>
                     <div className="flex items-center justify-between mb-2 ml-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Urutan Kepemilikan</label>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Tarif Progresif</span>
                     </div>

                     <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl h-[50px] overflow-hidden">
                        {PKB_PROGRESSIVE_RATES.map((rate) => (
                           <button
                              key={rate.id}
                              onClick={() => setProgressiveIdx(rate.id)}
                              className={`flex-1 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 flex flex-col items-center justify-center leading-none ${progressiveIdx === rate.id ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                           >
                              <span>{rate.label}</span>
                              {progressiveIdx === rate.id && <span className="text-[9px] font-medium mt-0.5">{parseFloat((province.rates[Math.min(rate.id - 1, 4)] * 100).toFixed(2))}%</span>}
                           </button>
                        ))}
                     </div>

                     <div className="text-[10px] text-slate-400 mt-3 ml-1 flex items-start gap-1.5 leading-relaxed">
                        <Info size={12} className="shrink-0 mt-0.5" />
                        <div>
                           <span className="font-bold text-slate-500">Tarif {province.label}:</span> Ke-1 <strong>{parseFloat((province.rates[0] * 100).toFixed(2))}%</strong>, Ke-2 <strong>{parseFloat((province.rates[1] * 100).toFixed(2))}%</strong>, Ke-3 <strong>{parseFloat((province.rates[2] * 100).toFixed(2))}%</strong>.
                           <br />
                           <span className="opacity-80 font-medium">*Naik progresif jika dalam satu Kartu Keluarga (KK). Sesuai {province.legal}.</span>
                        </div>
                     </div>
                  </div>

               </div>
            </div>

            {/* Right Side: Result (Clean Dark Theme) */}
            <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">

               {/* Subtle Gradient */}
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>

               <div className="relative z-10 space-y-8">
                  <div>
                     <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimasi Total Bayar</p>
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
                           {formatCurrency(totalEstimate)}
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-4">
                     <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                        <span className="text-slate-400 text-sm">PKB Pokok</span>
                        <span className="text-lg font-bold text-white">{formatCurrency(pkbPokok)}</span>
                     </div>
                     <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                        <span className="text-slate-400 text-sm">SWDKLLJ</span>
                        <span className="text-lg font-bold text-white">{formatCurrency(swdkllj)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Admin STNK</span>
                        <span className="text-lg font-bold text-white">{formatCurrency(adminStnk)}</span>
                     </div>
                  </div>

                  <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
                     <div className="mt-0.5 text-blue-400"><Info size={16} /></div>
                     <div>
                        <p className="text-xs text-blue-100 leading-relaxed">
                           Perhitungan ini adalah estimasi untuk <strong>Pengesahan STNK Tahunan</strong>. Untuk pajak 5 Tahunan (Ganti Plat), akan ada biaya tambahan TNKB & Cetak STNK.
                        </p>
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
                        Metode Perhitungan PKB ({province.label})
                     </h5>
                     <p className="text-sm text-slate-600 leading-relaxed mb-3">
                        Pajak Kendaraan Bermotor dihitung berdasarkan Peraturan Daerah masing-masing provinsi.
                     </p>
                     <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1 font-medium">
                        <li><strong>NJKB</strong> x Tarif Progresif ({vehicleType} Ke-{progressiveIdx}: <strong>{parseFloat((progressiveRate * 100).toFixed(2))}%</strong>).</li>
                        <li>Ditambah <strong>SWDKLLJ</strong> (Jasa Raharja).</li>
                        <li>Ditambah <strong>Biaya Admin STNK</strong> tahunan.</li>
                     </ol>
                     <div className="mt-3 text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200 italic">
                        Acuan Hukum: {province.legal}
                     </div>
                  </div>

                  {/* Step 1: PKB Pokok */}
                  <div className="relative pl-6 border-l-2 border-slate-100">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Hitung PKB Pokok</h5>
                     <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
                        <div className="flex justify-between items-center">
                           <span>Nilai Jual (NJKB)</span>
                           <span className="font-bold text-slate-700">{formatCurrency(njkb)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span>Tarif Progresif ({province.label} - Ke {progressiveIdx})</span>
                           <span className="font-bold text-slate-700">x {parseFloat((progressiveRate * 100).toFixed(2))}%</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-2 mt-1">
                           <span>PKB Pokok</span>
                           <span>{formatCurrency(pkbPokok)}</span>
                        </div>
                     </div>
                  </div>

                  {/* Step 2: SWDKLLJ & Admin */}
                  <div className="relative pl-6 border-l-2 border-slate-100">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. Biaya Tambahan</h5>
                     <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
                        <div className="flex justify-between items-center">
                           <span>SWDKLLJ ({vehicleType})</span>
                           <span className="font-bold text-slate-700">{formatCurrency(swdkllj)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span>Biaya Admin STNK (Tahunan)</span>
                           <span className="font-bold text-slate-700">{formatCurrency(adminStnk)}</span>
                        </div>
                     </div>
                  </div>

                  {/* Step 3: Total */}
                  <div className="relative pl-6 border-l-2 border-slate-100 pt-2">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. Total Pembayaran</h5>
                     <div className="bg-indigo-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-indigo-100">
                        <div className="flex justify-between items-center">
                           <span>PKB Pokok</span>
                           <span className="font-bold text-slate-700">{formatCurrency(pkbPokok)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span>Total Biaya Tambahan</span>
                           <span className="font-bold text-slate-700">+ {formatCurrency(swdkllj + adminStnk)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-indigo-200 pt-3 mt-1">
                           <span className="text-indigo-800 font-bold">Total Estimasi Pajak</span>
                           <span className="font-black text-indigo-700 text-lg">{formatCurrency(totalEstimate)}</span>
                        </div>
                     </div>
                  </div>

               </div>
            )}
         </div>
         <PKBResultModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            data={{
               njkb,
               vehicleType,
               progressiveIdx,
               provinceLabel: province.label,
               provinceLegal: province.legal,
               progressiveRate,
               pkbPokok,
               swdkllj,
               adminStnk,
               totalEstimate
            }}
         />
      </div>
   );
};

export default CalculatorPKB;
