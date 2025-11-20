
import React, { useState, useEffect } from 'react';
import { PPh21State, MaritalStatus, TaxType } from '../types';
import { calculatePPh21, formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { Banknote, User, Calculator, RefreshCw, Info, Save, Check, Printer, Copy, ChevronDown, Check as CheckIcon } from './Icons';

interface Props {
  onContextUpdate: (ctx: string) => void;
}

const DEFAULT_FORM_STATE: PPh21State = {
  grossSalary: 15000000,
  allowance: 500000,
  thrBonus: 0,
  maritalStatus: MaritalStatus.TK,
  children: 0,
  hasNPWP: true,
  payPeriod: 'MONTHLY',
  includeBiayaJabatan: true,
};

// Helper for currency input display
const formatNumberInput = (value: number) => {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const parseNumberInput = (value: string) => {
  const cleanValue = value.replace(/\./g, '');
  const num = parseFloat(cleanValue);
  return isNaN(num) ? 0 : num;
};

const CalculatorPPH21: React.FC<Props> = ({ onContextUpdate }) => {
  const [formState, setFormState] = useState<PPh21State>(DEFAULT_FORM_STATE);
  const [result, setResult] = useState<ReturnType<typeof calculatePPh21> | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showDetail, setShowDetail] = useState(false); // Collapsed by default
  const [isCopied, setIsCopied] = useState(false);

  // Local state for input display to handle formatting while typing
  const [displayValues, setDisplayValues] = useState({
    grossSalary: formatNumberInput(DEFAULT_FORM_STATE.grossSalary),
    allowance: formatNumberInput(DEFAULT_FORM_STATE.allowance),
    thrBonus: formatNumberInput(DEFAULT_FORM_STATE.thrBonus),
  });

  useEffect(() => {
    const res = calculatePPh21(formState);
    setResult(res);

    const ctx = `
      Kalkulator PPh 21 (Karyawan)
      Status: ${formState.maritalStatus}/${formState.children}
      NPWP: ${formState.hasNPWP ? 'Ya' : 'Tidak'}
      Gaji Pokok: ${formatCurrency(formState.grossSalary)}
      Tunjangan: ${formatCurrency(formState.allowance)}
      THR/Bonus: ${formatCurrency(formState.thrBonus)}
      
      Hasil Perhitungan:
      Penghasilan Bruto (Thn): ${formatCurrency(res.annualGross)}
      Pengurang (Biaya Jabatan): ${formatCurrency(res.biayaJabatan)}
      Penghasilan Neto (Thn): ${formatCurrency(res.netIncome)}
      PTKP: ${formatCurrency(res.ptkp)}
      PKP: ${formatCurrency(res.pkp)}
      Pajak Terutang (Thn): ${formatCurrency(res.annualTax)}
      Pajak Per Bulan: ${formatCurrency(res.monthlyTax)}
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
      thrBonus: 0
    });
    setDisplayValues({
      grossSalary: '',
      allowance: '',
      thrBonus: ''
    });
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!result) return;
    
    const details = `
Status: ${formState.maritalStatus}/${formState.children}
NPWP: ${formState.hasNPWP ? 'Ya' : 'Tidak'}
Gaji Pokok: ${formatCurrency(formState.grossSalary)}
Tunjangan: ${formatCurrency(formState.allowance)}
THR/Bonus: ${formatCurrency(formState.thrBonus)}
--------------------------------
Bruto Tahunan: ${formatCurrency(result.annualGross)}
Biaya Jabatan: ${formatCurrency(result.biayaJabatan)}
Neto Tahunan: ${formatCurrency(result.netIncome)}
PTKP: ${formatCurrency(result.ptkp)}
PKP: ${formatCurrency(result.pkp)}
Pajak Tahunan: ${formatCurrency(result.annualTax)}
    `.trim();

    saveHistoryItem({
      type: TaxType.PPH21,
      title: 'PPh 21 Karyawan',
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
Perhitungan PPh 21
------------------
Gaji Pokok: ${formatCurrency(formState.grossSalary)}
Status: ${formState.maritalStatus}/${formState.children}
NPWP: ${formState.hasNPWP ? 'Ya' : 'Tidak'}

Pajak Per Bulan: ${formatCurrency(result.monthlyTax)}
Pajak Setahun: ${formatCurrency(result.annualTax)}
Gaji Bersih (THP): ${formatCurrency((result.annualGross - result.annualTax) / 12)}
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
    handleInputChange(key, cleanVal ? parseInt(cleanVal) : 0);
  };

  if (!result) return null;

  const takeHomePayMonthly = (result.annualGross - result.annualTax) / 12;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-900">
      
      {/* PRINT HEADER */}
      <div className="print-only mb-8 border-b-2 border-slate-800 pb-4">
         <div className="flex justify-between items-end">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Laporan Perhitungan PPh 21</h1>
               <p className="text-sm text-slate-500">Dihasilkan oleh PajakKu Pro</p>
            </div>
            <div className="text-right">
               <p className="text-xs font-bold text-slate-400 uppercase">Tanggal Cetak</p>
               <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Inputs */}
        <div className="p-8 md:p-10 md:w-7/12 bg-white relative">
          
          <div className="absolute top-8 right-8 z-10 no-print">
            <button 
               onClick={handleReset} 
               title="Reset Input" 
               className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group"
            >
               <RefreshCw size={20} className="group-hover:-rotate-180 transition-transform duration-500"/>
            </button>
          </div>

          <div className="mb-8 pr-10">
             <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 tracking-tight">PPh Pasal 21</h2>
             
             <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                <span>Perhitungan pajak penghasilan karyawan (Metode Efektif Tahunan).</span>
                
                {/* Tooltip Info TER */}
                <div className="relative group inline-flex items-center no-print">
                   <Info size={16} className="text-blue-500 cursor-help hover:scale-110 transition-transform" />
                   <div className="absolute left-0 top-full mt-3 w-72 p-4 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none origin-top-left transform scale-95 group-hover:scale-100">
                      <p className="leading-relaxed">
                        <strong>Info TER 2024:</strong> Kalkulator ini menggunakan metode setahun penuh untuk estimasi yang lebih akurat di akhir tahun pajak. Potongan bulanan riil mungkin menggunakan Tarif Efektif Rata-rata (TER) sesuai PP 58/2023.
                      </p>
                      <div className="absolute bottom-full left-1.5 border-8 border-transparent border-b-slate-800"></div>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
            {/* Salary Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                Gaji Pokok (Per Bulan)
              </label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-500 transition-colors no-print">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayValues.grossSalary}
                  onChange={(e) => handleNumberChange('grossSalary', e.target.value)}
                  className="w-full pl-14 pr-5 py-3.5 bg-slate-50 border-2 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-lg text-slate-800 placeholder:text-slate-300"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Allowance & Bonus Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    Tunjangan (Per Bulan)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-blue-500 transition-colors no-print">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={displayValues.allowance}
                      onChange={(e) => handleNumberChange('allowance', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                      placeholder="0"
                    />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    THR / Bonus (Tahunan)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm group-focus-within:text-blue-500 transition-colors no-print">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={displayValues.thrBonus}
                      onChange={(e) => handleNumberChange('thrBonus', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                      placeholder="0"
                    />
                  </div>
               </div>
            </div>
            
            <div className="h-px bg-slate-100 my-6"></div>

            {/* Status & Family */}
            <div className="space-y-4">
               <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                       Status Perkawinan
                     </label>
                     <div className="flex bg-slate-50 p-1 rounded-xl h-12 items-center">
                        <button 
                           onClick={() => handleInputChange('maritalStatus', MaritalStatus.TK)}
                           className={`flex-1 h-full rounded-lg text-sm font-bold transition-all ${formState.maritalStatus === MaritalStatus.TK ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                           TK (Lajang)
                        </button>
                        <button 
                           onClick={() => handleInputChange('maritalStatus', MaritalStatus.K)}
                           className={`flex-1 h-full rounded-lg text-sm font-bold transition-all ${formState.maritalStatus === MaritalStatus.K ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                           K (Nikah)
                        </button>
                        <button 
                           onClick={() => handleInputChange('maritalStatus', MaritalStatus.HB)}
                           className={`flex-1 h-full rounded-lg text-sm font-bold transition-all ${formState.maritalStatus === MaritalStatus.HB ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                           HB (Pisah)
                        </button>
                     </div>
                  </div>
                  
                  <div className="flex-1">
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                       Jumlah Tanggungan
                     </label>
                     <div className="flex bg-slate-50 p-1 rounded-xl gap-1 h-12 items-center">
                        {[0, 1, 2, 3].map(num => (
                           <button
                              key={num}
                              onClick={() => handleInputChange('children', num)}
                              className={`flex-1 h-full rounded-lg text-sm font-bold transition-all ${formState.children === num ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
                           >
                              {num}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 no-print">
               <div 
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${formState.hasNPWP ? 'bg-blue-50 border-blue-200 shadow-sm shadow-blue-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  onClick={() => handleInputChange('hasNPWP', !formState.hasNPWP)}
               >
                  <div className="flex items-center gap-3">
                     <div>
                        <p className={`font-bold text-sm transition-colors ${formState.hasNPWP ? 'text-blue-900' : 'text-slate-800'}`}>Ada NPWP?</p>
                        <p className="text-[10px] text-slate-500 font-medium">Sanksi +20% jika tidak ada</p>
                     </div>
                  </div>
               </div>

               <div 
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${formState.includeBiayaJabatan ? 'bg-blue-50 border-blue-200 shadow-sm shadow-blue-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  onClick={() => handleInputChange('includeBiayaJabatan', !formState.includeBiayaJabatan)}
               >
                  <div className="flex items-center gap-3">
                     <div>
                        <p className={`font-bold text-sm transition-colors ${formState.includeBiayaJabatan ? 'text-blue-900' : 'text-slate-800'}`}>Biaya Jabatan</p>
                        <p className="text-[10px] text-slate-500 font-medium">Otomatis 5%</p>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Print only status details */}
            <div className="print-only grid grid-cols-2 gap-4 mt-4 border-t border-slate-100 pt-4">
                <div>
                   <span className="text-xs font-bold uppercase text-slate-400">Status NPWP</span>
                   <p className="font-bold">{formState.hasNPWP ? 'Memiliki NPWP' : 'Tidak Ada NPWP'}</p>
                </div>
                <div>
                   <span className="text-xs font-bold uppercase text-slate-400">Status Tanggungan</span>
                   <p className="font-bold">{formState.maritalStatus} / {formState.children}</p>
                </div>
            </div>

          </div>
        </div>

        {/* Right Side: Result (Dark Theme) */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Gaji Bersih (Take Home Pay)</p>
                   <button 
                      onClick={handleCopyResult} 
                      className="text-slate-500 hover:text-emerald-400 transition-colors no-print p-1 rounded hover:bg-white/5"
                      title="Salin Hasil"
                   >
                      {isCopied ? <CheckIcon size={16} className="text-emerald-400" /> : <Copy size={16} />}
                   </button>
                </div>
                <div className="flex items-baseline gap-2">
                   <div className="text-emerald-400 font-bold text-2xl lg:text-3xl tracking-tight">
                     {formatCurrency(takeHomePayMonthly)}
                   </div>
                   <span className="text-xs text-slate-500 font-bold uppercase">/bln</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm space-y-4">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pajak Per Bulan</p>
                    <span className="text-2xl font-bold text-white">{formatCurrency(result.monthlyTax)}</span>
                 </div>
                 <div className="h-px bg-white/10"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium text-sm">Pajak Setahun</span>
                    <span className="text-lg font-bold text-white">{formatCurrency(result.annualTax)}</span>
                 </div>
              </div>

              <div className="space-y-3 text-sm border-t border-white/10 pt-4">
                 <div className="flex justify-between items-center text-slate-400">
                    <span className="font-medium">Penghasilan Neto</span>
                    <span className="font-bold text-slate-200">{formatCurrency(result.netIncome)}</span>
                 </div>
                 <div className="flex justify-between items-center text-slate-400">
                    <span className="font-medium">PTKP</span>
                    <span className="font-bold text-slate-200">{formatCurrency(result.ptkp)}</span>
                 </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-8 border-t border-white/10 flex items-center gap-4 no-print">
               <button onClick={() => window.print()} className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2 group">
                  Cetak
                  <Printer size={16} className="group-hover:scale-110 transition-transform" />
               </button>
               <button 
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`ml-auto px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${isSaved ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/50'}`}
               >
                  {isSaved ? <CheckIcon size={14}/> : <Save size={14}/>}
                  {isSaved ? 'Tersimpan' : 'Simpan'}
               </button>
            </div>
        </div>
      </div>

      {/* Breakdown Accordion */}
      <div className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
         <button 
            onClick={() => setShowDetail(!showDetail)}
            className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-slate-50 transition-colors group"
         >
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Info size={18}/>
               </div>
               <h4 className="text-lg font-bold text-slate-900">Rincian Perhitungan</h4>
            </div>
            <div className={`p-2 rounded-full border transition-all duration-300 ${showDetail ? 'rotate-180 bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-400'}`}>
               <ChevronDown size={16} />
            </div>
         </button>
         
         {showDetail && (
            <div className="px-6 md:px-8 pb-8 space-y-6 animate-enter">
               
               {/* Step 1: Bruto */}
               <div className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-4 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Penghasilan Bruto Setahun</h5>
                  <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-100">
                     <div className="flex justify-between items-center">
                        <span>Gaji ({formatCurrency(formState.grossSalary)} × 12)</span>
                        <span className="font-bold text-slate-700">{formatCurrency(formState.grossSalary * 12)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span>Tunjangan ({formatCurrency(formState.allowance)} × 12)</span>
                        <span className="font-bold text-slate-700">{formatCurrency(formState.allowance * 12)}</span>
                     </div>
                     <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1">
                        <span>THR / Bonus</span>
                        <span className="font-bold text-slate-700">{formatCurrency(formState.thrBonus)}</span>
                     </div>
                     <div className="flex justify-between font-bold text-slate-900 text-base pt-1">
                        <span>Total Bruto</span>
                        <span>{formatCurrency(result.annualGross)}</span>
                     </div>
                  </div>
               </div>

               {/* Step 2: Pengurang */}
               <div className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-4 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. Pengurang</h5>
                  <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-100">
                     <div className="flex justify-between text-red-500 font-medium">
                        <span>Biaya Jabatan (5% Max 6Jt)</span>
                        <span>- {formatCurrency(result.biayaJabatan)}</span>
                     </div>
                     <div className="flex justify-between font-bold text-slate-900 text-base mt-1 border-t border-slate-200 pt-3">
                        <span>Penghasilan Neto (Bruto - Biaya)</span>
                        <span>{formatCurrency(result.netIncome)}</span>
                     </div>
                  </div>
               </div>

               {/* Step 3: PKP */}
               <div className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-4 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. Penghasilan Kena Pajak (PKP)</h5>
                  <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-100">
                     <div className="flex justify-between items-center">
                        <span>Neto Setahun</span>
                        <span className="font-bold text-slate-700">{formatCurrency(result.netIncome)}</span>
                     </div>
                     <div className="flex justify-between text-green-600 font-medium">
                        <span>PTKP ({formState.maritalStatus}/{formState.children})</span>
                        <span>- {formatCurrency(result.ptkp)}</span>
                     </div>
                     <div className="flex justify-between font-bold text-slate-900 text-base mt-1 border-t border-slate-200 pt-3">
                        <span>PKP (Neto - PTKP)</span>
                        <span>{formatCurrency(result.pkp)}</span>
                     </div>
                     {result.pkp === 0 && (
                        <p className="text-xs text-green-600 mt-1 font-sans font-medium bg-green-50 p-2 rounded-lg">
                           *Karena Neto di bawah PTKP, maka Pajak Nihil (Rp 0).
                        </p>
                     )}
                  </div>
               </div>

               {/* Step 4: Layers */}
               {result.pkp > 0 && (
                  <div className="relative pl-6 border-l-2 border-slate-100">
                     <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white"></div>
                     <h5 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">4. Perhitungan Tarif Progresif</h5>
                     <div className="bg-blue-50 p-5 rounded-xl space-y-3 border border-blue-100">
                        {result.taxLayers.map((layer, idx) => (
                           <div key={idx} className="flex justify-between text-sm font-medium text-blue-900 items-center">
                              <span className="font-medium">Lapisan {idx + 1} ({layer.layer})</span>
                              <span className="font-bold">{formatCurrency(layer.amount)}</span>
                           </div>
                        ))}
                        {!formState.hasNPWP && (
                           <div className="flex justify-between text-sm text-red-600 font-bold border-t border-blue-200 pt-3 mt-2">
                              <span>Sanksi Non-NPWP (+20%)</span>
                              <span>+ {formatCurrency(result.annualTax - (result.annualTax / 1.2))}</span>
                           </div>
                        )}
                        <div className="flex justify-between font-bold text-blue-900 text-base mt-2 border-t border-blue-200 pt-3">
                           <span>Total Pajak Setahun</span>
                           <span>{formatCurrency(result.annualTax)}</span>
                        </div>
                     </div>
                  </div>
               )}

            </div>
         )}
      </div>

       {/* Print Footer */}
       <div className="print-only text-center mt-8 text-xs text-slate-400">
          <p>Dicetak menggunakan aplikasi PajakKu Pro pada {new Date().toLocaleDateString()}</p>
       </div>
    </div>
  );
};

export default CalculatorPPH21;
