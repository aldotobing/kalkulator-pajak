
import React, { useState, useEffect } from 'react';
import { MaritalStatus, TaxType } from '../types';
import { calculateReverseSalary, formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { Target, RefreshCw, Info, Save, Check, Printer, Copy, Check as CheckIcon, TrendingUp, ChevronDown, Briefcase } from './Icons';

interface Props {
  onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const SimulatorSalary: React.FC<Props> = ({ onContextUpdate }) => {
  const [targetNet, setTargetNet] = useState(10000000);
  const [displayTarget, setDisplayTarget] = useState(formatNumberInput(10000000));
  const [maritalStatus, setMaritalStatus] = useState(MaritalStatus.TK);
  const [children, setChildren] = useState(0);
  const [hasNPWP, setHasNPWP] = useState(true);
  
  const [result, setResult] = useState<any>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Calculate on change
  useEffect(() => {
    const res = calculateReverseSalary(targetNet, maritalStatus, children, hasNPWP);
    setResult(res);
    
    onContextUpdate(`
      Simulasi Gaji (Reverse Calculator)
      Target Gaji Bersih (Net): ${formatCurrency(targetNet)}
      Status: ${maritalStatus}/${children}
      NPWP: ${hasNPWP ? 'Ya' : 'Tidak'}
      
      Hasil Simulasi:
      Gaji Kotor (Gross) yang harus diminta: ${formatCurrency(res.gross)}
      Estimasi Potongan Pajak: ${formatCurrency(res.tax)}
      Estimasi Potongan BPJS (Karyawan): ${formatCurrency(res.bpjs)}
    `);
  }, [targetNet, maritalStatus, children, hasNPWP, onContextUpdate]);
  
  useEffect(() => { if (isSaved) setIsSaved(false); }, [targetNet, maritalStatus, children, hasNPWP]);

  const handleReset = () => {
    setTargetNet(0);
    setDisplayTarget('');
    setMaritalStatus(MaritalStatus.TK);
    setChildren(0);
    setIsSaved(false);
  };

  const handleNumberChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const numVal = cleanVal ? parseInt(cleanVal) : 0;
    setTargetNet(numVal);
    setDisplayTarget(cleanVal ? new Intl.NumberFormat('id-ID').format(numVal) : '');
  };

  const handleSave = () => {
    if (!result) return;
    const details = `
Target Net: ${formatCurrency(targetNet)}
Status: ${maritalStatus}/${children}
--------------------------------
Rekomendasi Gross: ${formatCurrency(result.gross)}
Potongan Pajak (Est): ${formatCurrency(result.tax)}
Potongan BPJS (Est): ${formatCurrency(result.bpjs)}
    `.trim();

    saveHistoryItem({
      type: TaxType.SIMULATION,
      title: 'Simulasi Gaji',
      summary: `Net ${formatCurrency(targetNet)} -> Gross ${formatCurrency(result.gross)}`,
      resultAmount: result.gross, // Store Gross as the result amount for sorting
      details: details
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopyResult = () => {
    if (!result) return;
    const text = `
Simulasi Negosiasi Gaji
------------------
Target Bersih: ${formatCurrency(targetNet)}
Status: ${maritalStatus}/${children}

Rekomendasi Gaji Kotor (Gross): ${formatCurrency(result.gross)}
(Termasuk estimasi potongan PPh 21 & BPJS)
    `.trim();
    
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Consistent Styles
  const LABEL_STYLE = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";
  const INPUT_CONTAINER_STYLE = "relative group";
  const INPUT_FIELD_STYLE = "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all font-bold text-base text-slate-900 placeholder:text-slate-300 h-[50px]";
  const INPUT_ICON_STYLE = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm no-print group-focus-within:text-blue-500 transition-colors";
  const SELECTOR_CONTAINER_STYLE = "flex bg-slate-50 border border-slate-200 p-1 rounded-xl h-[50px]";
  const SELECTOR_BTN_STYLE = (isActive: boolean) => `flex-1 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 flex items-center justify-center ${isActive ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`;

  if (!result) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      
      {/* PRINT HEADER */}
      <div className="print-only mb-8 border-b-2 border-slate-800 pb-4">
         <div className="flex justify-between items-end">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Laporan Simulasi Gaji</h1>
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
                   <TrendingUp size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Simulasi Gaji</h2>
             </div>
             <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                <span>Hitung gaji kotor (Gross) yang harus diminta agar mendapatkan gaji bersih (Net) yang diinginkan.</span>
             </div>
          </div>

          <div className="space-y-6">
            {/* Target Input */}
            <div>
              <label className={LABEL_STYLE}>Target Gaji Bersih (Net)</label>
              <div className={INPUT_CONTAINER_STYLE}>
                <span className={INPUT_ICON_STYLE}><Target size={18}/></span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayTarget}
                  onChange={(e) => handleNumberChange(e.target.value)}
                  className={INPUT_FIELD_STYLE}
                  placeholder="0"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 ml-1 flex items-center gap-1">
                 <Info size={12}/> Masukkan angka "Take Home Pay" yang Anda inginkan masuk rekening.
              </p>
            </div>

            <div className="h-px bg-slate-100 my-6"></div>

            {/* Status & Family */}
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

            {/* NPWP Toggle */}
             <div className="grid grid-cols-1 gap-6 mt-2 no-print">
               <button
                  className={`px-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-center gap-1 h-[50px] ${hasNPWP ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                  onClick={() => setHasNPWP(!hasNPWP)}
               >
                  <div className="w-full flex justify-between items-center">
                     <span className={`font-bold text-sm block ${hasNPWP ? 'text-blue-800' : 'text-slate-600'}`}>Ada NPWP</span>
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasNPWP ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        {hasNPWP ? 'Tarif Normal' : 'Tarif +20%'}
                     </span>
                  </div>
               </button>
             </div>

          </div>
        </div>

        {/* Right Side: Result (Clean Dark Theme) */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Subtle Gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rekomendasi Nego (Gross)</p>
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
                     {formatCurrency(result.gross)}
                   </div>
                   <span className="text-xs text-slate-500 font-bold uppercase">/bln</span>
                </div>
                <p className="text-xs text-emerald-400 mt-2 font-medium">
                   *Mintalah angka ini ke HRD agar Net anda {formatCurrency(targetNet)}
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-4">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Estimasi Potongan</p>
                    <div className="space-y-2 text-sm">
                       <div className="flex justify-between text-slate-300">
                          <span>PPh 21 (Pajak)</span>
                          <span className="font-bold text-red-400">- {formatCurrency(result.tax)}</span>
                       </div>
                       <div className="flex justify-between text-slate-300">
                          <span>BPJS (4%)</span>
                          <span className="font-bold text-red-400">- {formatCurrency(result.bpjs)}</span>
                       </div>
                    </div>
                 </div>
                 <div className="h-px bg-slate-700"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium text-sm">Total Potongan</span>
                    <span className="text-lg font-bold text-white">{formatCurrency(result.tax + result.bpjs)}</span>
                 </div>
              </div>

              <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
                 <div className="mt-0.5 text-blue-400"><Info size={16}/></div>
                 <div>
                    <p className="text-xs text-blue-100 leading-relaxed">
                       Perhitungan ini mencakup PPh 21 (TER) dan iuran BPJS (JHT 2%, JP 1%, Kesehatan 1%) yang biasanya dipotong dari gaji karyawan.
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
                  {isSaved ? <CheckIcon size={14}/> : <Save size={14}/>}
                  {isSaved ? 'Tersimpan' : 'Simpan'}
               </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorSalary;
