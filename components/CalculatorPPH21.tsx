
import React, { useState, useEffect } from 'react';
import { PPh21State, MaritalStatus, TaxType, PPh21Method } from '../types';
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
  method: PPh21Method.GROSS
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
      Metode: ${formState.method === PPh21Method.GROSS ? 'Gross (Potong Gaji)' : 'Gross Up (Ditanggung Kantor)'}
      Status: ${formState.maritalStatus}/${formState.children}
      NPWP: ${formState.hasNPWP ? 'Ya' : 'Tidak'}
      Gaji Pokok: ${formatCurrency(formState.grossSalary)}
      Tunjangan: ${formatCurrency(formState.allowance)}
      THR/Bonus: ${formatCurrency(formState.thrBonus)}
      
      Hasil Perhitungan:
      ${formState.method === PPh21Method.GROSS_UP ? `Tunjangan Pajak (Gross Up): ${formatCurrency(res.taxAllowance)}` : ''}
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
Metode: ${formState.method === PPh21Method.GROSS ? 'Gross' : 'Gross Up'}
Status: ${formState.maritalStatus}/${formState.children}
NPWP: ${formState.hasNPWP ? 'Ya' : 'Tidak'}
Gaji Pokok: ${formatCurrency(formState.grossSalary)}
Tunjangan: ${formatCurrency(formState.allowance)}
THR/Bonus: ${formatCurrency(formState.thrBonus)}
--------------------------------
${formState.method === PPh21Method.GROSS_UP ? `Tunjangan Pajak: ${formatCurrency(result.taxAllowance)}\n` : ''}Bruto Tahunan: ${formatCurrency(result.annualGross)}
Biaya Jabatan: ${formatCurrency(result.biayaJabatan)}
Neto Tahunan: ${formatCurrency(result.netIncome)}
PTKP: ${formatCurrency(result.ptkp)}
PKP: ${formatCurrency(result.pkp)}
Pajak Tahunan: ${formatCurrency(result.annualTax)}
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
    const thp = formState.method === PPh21Method.GROSS 
       ? (result.annualGross - result.annualTax) / 12 
       : (result.annualGross - result.annualTax - result.taxAllowance) / 12 + result.taxAllowance / 12; // Simplifies to just Base Gross / 12 roughly
       
    const text = `
Perhitungan PPh 21 ${formState.method === PPh21Method.GROSS ? '(Gross)' : '(Gross Up)'}
------------------
Gaji Pokok: ${formatCurrency(formState.grossSalary)}
Status: ${formState.maritalStatus}/${formState.children}
NPWP: ${formState.hasNPWP ? 'Ya' : 'Tidak'}

${formState.method === PPh21Method.GROSS_UP ? `Tunjangan Pajak: ${formatCurrency(result.taxAllowance)}\n` : ''}Pajak Per Bulan: ${formatCurrency(result.monthlyTax)}
Pajak Setahun: ${formatCurrency(result.annualTax)}
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

  // Logic for Take Home Pay Display
  // Gross: Bruto - Tax
  // Gross Up: (Base + TaxAllowance) - Tax. Since TaxAllowance ~= Tax, THP ~= Base.
  const baseAnnualIncome = (formState.grossSalary + formState.allowance) * 12 + formState.thrBonus;
  const takeHomePayAnnual = formState.method === PPh21Method.GROSS 
    ? baseAnnualIncome - result.annualTax
    : baseAnnualIncome; // In Gross Up, tax is covered, so you get full base salary
  
  const takeHomePayMonthly = takeHomePayAnnual / 12;

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
               <h1 className="text-2xl font-bold text-slate-900">Laporan Perhitungan PPh 21</h1>
               <p className="text-sm text-slate-500">Dihasilkan oleh PajakKu Pro</p>
            </div>
            <div className="text-right">
               <p className="text-xs font-bold text-slate-400 uppercase">Tanggal Cetak</p>
               <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
            </div>
         </div>
      </div>

      {/* MAIN CARD - CLEAN CORPORATE STYLE */}
      <div className="rounded-[2rem] bg-white shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Left Side: Inputs */}
        <div className="p-8 md:p-10 md:w-7/12 relative">
          
          <div className="absolute top-8 right-8 z-10 no-print">
            <button 
               onClick={handleReset} 
               title="Reset Input" 
               className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group"
            >
               <RefreshCw size={18} className="group-hover:-rotate-180 transition-transform duration-500"/>
            </button>
          </div>

          <div className="mb-8 pr-10">
             <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 tracking-tight">PPh Pasal 21</h2>
             
             <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                <span>Perhitungan pajak penghasilan karyawan.</span>
                
                {/* Tooltip Info TER */}
                <div className="relative group inline-flex items-center no-print">
                   <Info size={16} className="text-blue-600 cursor-help hover:scale-110 transition-transform" />
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
            
            {/* Method Selector */}
            <div>
               <label className={LABEL_STYLE}>Metode Perhitungan</label>
               <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 relative">
                  <button 
                     onClick={() => handleInputChange('method', PPh21Method.GROSS)}
                     className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 relative z-10 ${formState.method === PPh21Method.GROSS ? 'text-blue-700 bg-white shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     Metode Gross
                     <span className="block text-[9px] font-medium opacity-70">Gaji Dipotong Pajak</span>
                  </button>
                  <button 
                     onClick={() => handleInputChange('method', PPh21Method.GROSS_UP)}
                     className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 relative z-10 ${formState.method === PPh21Method.GROSS_UP ? 'text-blue-700 bg-white shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     Metode Gross Up
                     <span className="block text-[9px] font-medium opacity-70">Pajak Ditanggung Kantor</span>
                  </button>
               </div>
            </div>

            <div className="h-px bg-slate-100 my-2"></div>

            {/* Salary Input */}
            <div>
              <label className={LABEL_STYLE}>Gaji Pokok (Per Bulan)</label>
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
                  <label className={LABEL_STYLE}>Tunjangan (Per Bulan)</label>
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
                  <label className={LABEL_STYLE}>THR / Bonus (Tahunan)</label>
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
            
            <div className="h-px bg-slate-100 my-6"></div>

            {/* Status & Family - Segmented Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={LABEL_STYLE}>Status Perkawinan</label>
                    <div className={SELECTOR_CONTAINER_STYLE}>
                    <button 
                        onClick={() => handleInputChange('maritalStatus', MaritalStatus.TK)}
                        className={SELECTOR_BTN_STYLE(formState.maritalStatus === MaritalStatus.TK)}
                    >
                        TK (Lajang)
                    </button>
                    <button 
                        onClick={() => handleInputChange('maritalStatus', MaritalStatus.K)}
                        className={SELECTOR_BTN_STYLE(formState.maritalStatus === MaritalStatus.K)}
                    >
                        K (Nikah)
                    </button>
                    <button 
                        onClick={() => handleInputChange('maritalStatus', MaritalStatus.HB)}
                        className={SELECTOR_BTN_STYLE(formState.maritalStatus === MaritalStatus.HB)}
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
                            onClick={() => handleInputChange('children', num)}
                            className={SELECTOR_BTN_STYLE(formState.children === num)}
                        >
                            {num}
                        </button>
                    ))}
                    </div>
                </div>
            </div>
            
            {/* Toggles - Clean Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 no-print">
               {/* NPWP Toggle */}
               <button
                  className={TOGGLE_STYLE(formState.hasNPWP)}
                  onClick={() => handleInputChange('hasNPWP', !formState.hasNPWP)}
               >
                  <div className="w-full">
                     <span className={`font-bold text-sm block ${formState.hasNPWP ? 'text-blue-800' : 'text-slate-600'}`}>Ada NPWP</span>
                  </div>
                  <span className={`text-[10px] font-medium ${formState.hasNPWP ? 'text-blue-600' : 'text-slate-400'}`}>
                     {formState.hasNPWP ? 'Tarif Normal' : 'Sanksi +20%'}
                  </span>
               </button>

               {/* Biaya Jabatan Toggle */}
               <button
                  className={TOGGLE_STYLE(formState.includeBiayaJabatan)}
                  onClick={() => handleInputChange('includeBiayaJabatan', !formState.includeBiayaJabatan)}
               >
                  <div className="w-full">
                     <span className={`font-bold text-sm block ${formState.includeBiayaJabatan ? 'text-blue-800' : 'text-slate-600'}`}>Biaya Jabatan</span>
                  </div>
                  <span className={`text-[10px] font-medium ${formState.includeBiayaJabatan ? 'text-blue-600' : 'text-slate-400'}`}>
                     Otomatis 5%
                  </span>
               </button>
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

        {/* Right Side: Result (Clean Dark Theme) */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Subtle Gradient - Not distracting */}
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
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-4">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pajak Per Bulan</p>
                    <span className="text-2xl font-bold text-white">{formatCurrency(result.monthlyTax)}</span>
                 </div>
                 <div className="h-px bg-slate-700"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium text-sm">Pajak Setahun</span>
                    <span className="text-lg font-bold text-white">{formatCurrency(result.annualTax)}</span>
                 </div>
              </div>

              <div className="space-y-3 text-sm pt-2">
                 {formState.method === PPh21Method.GROSS_UP && (
                   <div className="flex justify-between items-center text-emerald-400 font-bold pb-2 border-b border-slate-800">
                      <span className="font-medium">Tunjangan Pajak</span>
                      <span>+ {formatCurrency(result.taxAllowance)}</span>
                   </div>
                 )}
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
               
               {/* Logic Explanation Block */}
               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
                  <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                     <Info size={16} className="text-blue-600"/>
                     Metode Perhitungan ({formState.method === PPh21Method.GROSS ? 'Gross' : 'Gross Up'})
                  </h5>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                     {formState.method === PPh21Method.GROSS 
                       ? 'Pajak dipotong langsung dari gaji karyawan (Net Salary lebih kecil dari Gross).' 
                       : 'Perusahaan memberikan Tunjangan Pajak sebesar nilai pajak, sehingga karyawan menerima gaji utuh (Take Home Pay = Basic Salary).'}
                  </p>
                  <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1 font-medium">
                     {formState.method === PPh21Method.GROSS_UP && (
                       <li>Hitung Tunjangan Pajak secara iteratif hingga nilai Tunjangan = Nilai Pajak.</li>
                     )}
                     <li>Penghasilan Bruto = Gaji + Tunjangan {formState.method === PPh21Method.GROSS_UP && '+ Tunjangan Pajak'}.</li>
                     <li>Dikurangi <strong>Biaya Jabatan</strong> & PTKP untuk mendapatkan PKP.</li>
                     <li>PKP dikalikan tarif progresif.</li>
                  </ol>
               </div>

               {/* Step 1: Bruto */}
               <div className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Penghasilan Bruto Setahun</h5>
                  <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
                     <div className="flex justify-between items-center">
                        <span>Gaji ({formatCurrency(formState.grossSalary)} × 12)</span>
                        <span className="font-bold text-slate-700">{formatCurrency(formState.grossSalary * 12)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span>Tunjangan ({formatCurrency(formState.allowance)} × 12)</span>
                        <span className="font-bold text-slate-700">{formatCurrency(formState.allowance * 12)}</span>
                     </div>
                     <div className="flex justify-between items-center mb-1">
                        <span>THR / Bonus</span>
                        <span className="font-bold text-slate-700">{formatCurrency(formState.thrBonus)}</span>
                     </div>
                     {formState.method === PPh21Method.GROSS_UP && (
                       <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-1 text-blue-600">
                          <span>+ Tunjangan Pajak (Gross Up)</span>
                          <span className="font-bold">{formatCurrency(result.taxAllowance)}</span>
                       </div>
                     )}
                     <div className="flex justify-between font-bold text-slate-900 text-base pt-1">
                        <span>Total Bruto</span>
                        <span>{formatCurrency(result.annualGross)}</span>
                     </div>
                  </div>
               </div>

               {/* Step 2: Pengurang */}
               <div className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. Pengurang</h5>
                  <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
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
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. Penghasilan Kena Pajak (PKP)</h5>
                  <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
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
                  </div>
               </div>

               {/* Step 4: Layers */}
               <div className="relative pl-6 border-l-2 border-slate-100 pb-2">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">4. Perhitungan Pajak Bertingkat</h5>
                  <div className="space-y-2">
                    {result.taxLayers.map((layer, idx) => (
                       <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center text-sm">
                          <div className="flex flex-col">
                             <span className="font-bold text-blue-600">Lapisan {idx + 1} ({layer.layer})</span>
                             <span className="text-xs text-slate-500">Tarif {layer.layer} dari PKP parsial</span>
                          </div>
                          <span className="font-bold text-slate-800">{formatCurrency(layer.amount)}</span>
                       </div>
                    ))}
                  </div>
                  
                  {!formState.hasNPWP && (
                    <div className="mt-4 bg-red-50 border border-red-100 p-4 rounded-lg flex items-start gap-3">
                       <div className="text-red-500 mt-0.5"><Info size={16} /></div>
                       <div>
                          <p className="text-sm font-bold text-red-700">Sanksi Tidak Memiliki NPWP (+20%)</p>
                          <p className="text-xs text-red-600 mt-1">Karena tidak memiliki NPWP, pajak terutang ditambah 20% dari total perhitungan normal.</p>
                       </div>
                    </div>
                  )}
               </div>

               {/* Step 5: Take Home Pay (New) */}
               <div className="relative pl-6 border-l-2 border-slate-100 pt-2">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">5. Gaji Bersih (Take Home Pay)</h5>
                  <div className="bg-emerald-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-emerald-100">
                     <div className="flex justify-between items-center">
                        <span>Total Bruto (Setahun)</span>
                        <span className="font-bold text-slate-700">{formatCurrency(result.annualGross)}</span>
                     </div>
                     <div className="flex justify-between text-red-500 font-medium">
                        <span>Pajak Terutang (Setahun)</span>
                        <span>- {formatCurrency(result.annualTax)}</span>
                     </div>
                     {formState.method === PPh21Method.GROSS && (
                       <div className="flex justify-between text-slate-400 text-xs italic">
                          <span>*Metode Gross: Pajak mengurangi gaji</span>
                       </div>
                     )}
                     {formState.method === PPh21Method.GROSS_UP && (
                        <div className="flex justify-between text-slate-500 text-xs italic border-t border-emerald-100 pt-2 mt-1">
                           <span>*Metode Gross Up: Tunjangan Pajak ({formatCurrency(result.taxAllowance)}) membayar Pajak ({formatCurrency(result.annualTax)})</span>
                        </div>
                     )}
                     <div className="flex justify-between font-bold text-emerald-700 text-base mt-1 border-t border-emerald-200 pt-3">
                        <span>Gaji Bersih Setahun</span>
                        <span>{formatCurrency(takeHomePayAnnual)}</span>
                     </div>
                     <div className="flex justify-between font-bold text-emerald-600 text-sm">
                        <span>Gaji Bersih Per Bulan</span>
                        <span>{formatCurrency(takeHomePayMonthly)}</span>
                     </div>
                  </div>
               </div>

            </div>
         )}
      </div>
    </div>
  );
};

export default CalculatorPPH21;
