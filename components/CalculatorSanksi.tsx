
import React, { useState, useEffect } from 'react';
import { SANKSI_TYPES, DEFAULT_KMK_RATE } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { TaxType } from '../types';
import { Siren, RefreshCw, Info, Save, Check, Printer, Copy, Check as CheckIcon, ChevronDown, Calendar, AlertCircle } from './Icons';

interface Props {
  onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const CalculatorSanksi: React.FC<Props> = ({ onContextUpdate }) => {
  const [amount, setAmount] = useState(1000000); // Nominal Kurang Bayar
  const [displayAmount, setDisplayAmount] = useState(formatNumberInput(1000000));
  
  const [sanksiTypeId, setSanksiTypeId] = useState(SANKSI_TYPES[0].id);
  const [kmkRate, setKmkRate] = useState(DEFAULT_KMK_RATE * 100); // Percentage display
  
  // Dates
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [includeAdminFine, setIncludeAdminFine] = useState(false); // Denda Telat Lapor
  const [adminFineAmount, setAdminFineAmount] = useState(100000); // Default 100k (OP)

  const [isSaved, setIsSaved] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Logic
  const sanksiType = SANKSI_TYPES.find(s => s.id === sanksiTypeId) || SANKSI_TYPES[0];
  
  // 1. Calculate Months Late
  const start = new Date(dueDate);
  const end = new Date(payDate);
  
  let monthsLate = 0;
  if (end > start) {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    // UU KUP: Bagian dari bulan dihitung 1 bulan penuh
    // Approximation: We can use date difference logic. 
    // Accurate way: count months crossing. Simplest robust way is diff in months + 1 if days remain.
    
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    
    monthsLate = years * 12 + months;
    if (days > 0) monthsLate += 1;
    
    // If days is negative (e.g. Jan 20 to Feb 10 is < 1 month), the logic handles it? 
    // Wait, strict calculation:
    // Date-to-date.
    // Example: Due Jan 10, Pay Feb 11.
    // Jan 10 to Feb 10 = 1 month. + 1 day = 2 months.
    
    // Let's use a simpler "Ceil of days / 30" approach often used in quick estimations, 
    // OR strictly follow strict month logic. Let's do strict month logic.
    // Logic above (years*12 + months) gives calendar month diff.
    // If end day > start day, we entered a new month fraction.
    // if (end.getDate() > start.getDate()) -> this logic is handled by the diff.
    
    // Correction:
    // Due: 10 Jan. Pay: 12 Feb.
    // Years: 0. Months: 1. Days: 2.
    // Result: 1 + 1 = 2 months. Correct.
    
    // Due: 10 Jan. Pay: 5 Feb.
    // Years: 0. Months: 1. Days: -5.
    // Result: 1 + 0? No. 
    // If days <= 0, it means we haven't crossed the full month boundary of the current month index.
    // But wait, 10 Jan to 5 Feb is < 1 month, so it should be 1 month.
    
    // Robust logic:
    // 1. Total days.
    // 2. Any positive days = at least 1 month.
    // Let's stick to the years*12 + months logic, but handle the day offset carefully.
    // Actually, simpler: 
    // monthDiff = (y2-y1)*12 + (m2-m1).
    // If d2 > d1, monthDiff += 1.
    // But this assumes d2 > d1 means a new month started.
    // Example: 10 Jan to 5 Feb. (0)*12 + (1) = 1. d2(5) > d1(10) is False. Total 1. Correct.
    // Example: 10 Jan to 15 Feb. (0)*12 + (1) = 1. d2(15) > d1(10) is True. Total 2. Correct.
    
    if (monthsLate < 0) monthsLate = 0;
    // Max duration per UU Cipta Kerja for 'Self Correction' is effectively based on actual months, but usually capped at 24 for STP issuance logic in old rules. New rules allow >24 months for certain cases. We will NOT cap it strictly but warn if > 24.
    if (monthsLate === 0 && diffDays > 0) monthsLate = 1;
  }
  
  // 2. Calculate Tariff
  // Tarif Bunga = (Suku Bunga Acuan + Uplift) / 12
  const baseRate = kmkRate / 100; // e.g. 0.06
  const uplift = sanksiType.uplift;
  const effectiveMonthlyRate = (baseRate + uplift) / 12;
  
  // 3. Calculate Fine
  const interestFine = Math.floor(amount * effectiveMonthlyRate * monthsLate);
  
  const adminFine = includeAdminFine ? adminFineAmount : 0;
  const totalFine = interestFine + adminFine;
  const totalBill = amount + totalFine;

  useEffect(() => {
    onContextUpdate(`
      Kalkulator: Sanksi & Denda Pajak (UU HPP)
      Jenis: ${sanksiType.label}
      Pokok Kurang Bayar: ${formatCurrency(amount)}
      Jatuh Tempo: ${dueDate}
      Tanggal Bayar: ${payDate}
      Terlambat: ${monthsLate} Bulan
      
      Parameter:
      KMK (Acuan): ${kmkRate}%
      Uplift Factor: ${(uplift*100)}%
      Tarif Per Bulan: ${(effectiveMonthlyRate*100).toFixed(2)}%
      
      Hasil:
      Sanksi Bunga: ${formatCurrency(interestFine)}
      Denda Admin (Telat Lapor): ${formatCurrency(adminFine)}
      Total Sanksi: ${formatCurrency(totalFine)}
      Total yang Harus Dibayar: ${formatCurrency(totalBill)}
    `);
  }, [amount, dueDate, payDate, sanksiTypeId, kmkRate, includeAdminFine, adminFineAmount, monthsLate, interestFine, totalFine, totalBill, onContextUpdate]);

  useEffect(() => { if (isSaved) setIsSaved(false); }, [amount, dueDate, payDate, sanksiTypeId, kmkRate]);

  const handleReset = () => {
    setAmount(0); setDisplayAmount('');
    setSanksiTypeId(SANKSI_TYPES[0].id);
    setDueDate(new Date().toISOString().slice(0, 10));
    setPayDate(new Date().toISOString().slice(0, 10));
    setIncludeAdminFine(false);
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
Jenis: ${sanksiType.label}
Pokok Pajak: ${formatCurrency(amount)}
Periode: ${dueDate} s.d. ${payDate} (${monthsLate} Bln)
Tarif Bunga: ${(effectiveMonthlyRate*100).toFixed(2)}% /bln
--------------------------------
Sanksi Bunga: ${formatCurrency(interestFine)}
Denda Admin: ${formatCurrency(adminFine)}
Total Sanksi: ${formatCurrency(totalFine)}
    `.trim();

    saveHistoryItem({
      type: TaxType.SANKSI,
      title: 'Sanksi & Denda',
      summary: `Telat ${monthsLate} Bln - Pokok ${formatCurrency(amount)}`,
      resultAmount: totalFine,
      details: details
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopyResult = () => {
    const text = `
Estimasi Sanksi Pajak
------------------
Pokok Kurang Bayar: ${formatCurrency(amount)}
Terlambat: ${monthsLate} Bulan
Tarif Sanksi: ${(effectiveMonthlyRate*100).toFixed(2)}% per bulan

Sanksi Bunga: ${formatCurrency(interestFine)}
Total Tagihan: ${formatCurrency(totalBill)}
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-900 pb-12">
      
      {/* PRINT HEADER */}
      <div className="print-only mb-8 border-b-2 border-slate-800 pb-4">
         <div className="flex justify-between items-end">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Laporan Perhitungan Sanksi Pajak</h1>
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
        
        {/* Inputs */}
        <div className="p-8 md:p-10 md:w-7/12 relative">
          <div className="absolute top-8 right-8 z-10 no-print">
            <button onClick={handleReset} title="Reset Input" className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group">
               <RefreshCw size={18} className="group-hover:-rotate-180 transition-transform duration-500"/>
            </button>
          </div>

          <div className="mb-8 pr-10">
             <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 tracking-tight">Kalkulator Sanksi & Denda</h2>
             <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                <span>Estimasi sanksi bunga (UU HPP) akibat keterlambatan setor/lapor.</span>
             </div>
          </div>

          <div className="space-y-6">
            
            {/* Sanksi Type */}
            <div>
              <label className={LABEL_STYLE}>Jenis Keterlambatan</label>
              <div className="relative">
                 <select
                  value={sanksiTypeId}
                  onChange={(e) => setSanksiTypeId(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer text-base h-[50px]"
                >
                  {SANKSI_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label} (Uplift {(t.uplift*100)}%)</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 no-print"><ChevronDown size={18} /></div>
              </div>
            </div>

            {/* Nominal */}
            <div>
              <label className={LABEL_STYLE}>Pokok Pajak Kurang Bayar</label>
              <div className={INPUT_CONTAINER_STYLE}>
                <span className={INPUT_ICON_STYLE}>Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayAmount}
                  onChange={(e) => handleNumberChange(setAmount, setDisplayAmount, e.target.value)}
                  className={INPUT_FIELD_STYLE}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className={LABEL_STYLE}>Jatuh Tempo</label>
                  <div className={INPUT_CONTAINER_STYLE}>
                    <span className={INPUT_ICON_STYLE}><Calendar size={16}/></span>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className={INPUT_FIELD_STYLE}
                    />
                  </div>
               </div>
               <div>
                  <label className={LABEL_STYLE}>Tanggal Bayar</label>
                  <div className={INPUT_CONTAINER_STYLE}>
                    <span className={INPUT_ICON_STYLE}><Calendar size={16}/></span>
                    <input
                      type="date"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                      className={INPUT_FIELD_STYLE}
                    />
                  </div>
               </div>
            </div>

            <div className="h-px bg-slate-100 my-6"></div>

            {/* Advanced Settings (KMK & Admin Fine) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className={LABEL_STYLE}>Suku Bunga Acuan (KMK)</label>
                  <div className="relative group">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs group-focus-within:text-blue-500 transition-colors no-print">%</span>
                    <input
                      type="number"
                      step="0.01"
                      value={kmkRate}
                      onChange={(e) => setKmkRate(parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all font-bold text-base text-slate-900 h-[50px]"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 ml-1">*Sesuai KMK yang berlaku bulan ini</p>
               </div>

               <div>
                  <label className={LABEL_STYLE}>Denda Telat Lapor (Admin)</label>
                  <div 
                     className={`h-[50px] rounded-xl border cursor-pointer transition-all flex items-center px-4 justify-between ${includeAdminFine ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200 hover:bg-white'}`}
                     onClick={() => setIncludeAdminFine(!includeAdminFine)}
                  >
                     <span className={`text-sm font-bold ${includeAdminFine ? 'text-blue-900' : 'text-slate-500'}`}>
                        {includeAdminFine ? 'Ya (+Rp100rb)' : 'Tidak'}
                     </span>
                     <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includeAdminFine ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                        {includeAdminFine && <CheckIcon size={12} className="text-white"/>}
                     </div>
                  </div>
               </div>
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
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Sanksi (Bunga + Denda)</p>
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
                     {formatCurrency(totalFine)}
                   </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-4">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Yang Harus Dibayar</p>
                    <span className="text-xl font-bold text-white">{formatCurrency(totalBill)}</span>
                 </div>
                 <div className="h-px bg-slate-700"></div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium text-sm">Lama Terlambat</span>
                    <span className="text-lg font-bold text-red-400">{monthsLate} Bulan</span>
                 </div>
              </div>

              <div className="space-y-3 text-sm pt-2">
                 <div className="flex justify-between items-center text-slate-400">
                    <span className="font-medium">Pokok Pajak</span>
                    <span className="font-bold text-slate-200">{formatCurrency(amount)}</span>
                 </div>
                 <div className="flex justify-between items-center text-slate-400">
                    <span className="font-medium">Tarif Sanksi/Bulan</span>
                    <span className="font-bold text-slate-200">{(effectiveMonthlyRate * 100).toFixed(2)}%</span>
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
                     Metode Hitung Sanksi (UU HPP)
                  </h5>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                     Sanksi administrasi bunga dihitung berdasarkan tarif bunga per bulan yang mengacu pada Suku Bunga Acuan (KMK) ditambah Uplift Factor.
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 mb-3">
                     <p className="text-xs font-bold text-slate-500 uppercase mb-1">Rumus Tarif Bunga:</p>
                     <code className="text-sm font-bold text-blue-700">
                        (Suku Bunga Acuan + Uplift Factor) / 12
                     </code>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                     <p className="text-xs font-bold text-slate-500 uppercase mb-1">Rumus Sanksi:</p>
                     <code className="text-sm font-bold text-blue-700">
                        Pokok Pajak x Tarif Bunga x Bulan Terlambat
                     </code>
                  </div>
               </div>

               {/* Step 1: Tarif */}
               <div className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. Penentuan Tarif Sanksi</h5>
                  <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
                     <div className="flex justify-between items-center">
                        <span>Suku Bunga Acuan (KMK)</span>
                        <span className="font-bold text-slate-700">{kmkRate}%</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span>Uplift Factor ({sanksiType.label})</span>
                        <span className="font-bold text-slate-700">+ {(uplift * 100)}%</span>
                     </div>
                     <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-2 mt-1">
                        <span>Tarif Bunga Per Bulan</span>
                        <span>{(effectiveMonthlyRate * 100).toFixed(4)}%</span>
                     </div>
                  </div>
               </div>

               {/* Step 2: Durasi */}
               <div className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. Durasi Keterlambatan</h5>
                  <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
                     <div className="flex justify-between items-center">
                        <span>Tanggal Jatuh Tempo</span>
                        <span className="font-bold text-slate-700">{dueDate}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span>Tanggal Bayar</span>
                        <span className="font-bold text-slate-700">{payDate}</span>
                     </div>
                     <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-200 pt-2 mt-1">
                        <span>Total Bulan (Dibulatkan Keatas)</span>
                        <span className="text-red-500">{monthsLate} Bulan</span>
                     </div>
                  </div>
               </div>

               {/* Step 3: Final */}
               <div className="relative pl-6 border-l-2 border-slate-100 pt-2">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. Total Sanksi</h5>
                  <div className="bg-blue-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-blue-100">
                     <div className="flex justify-between items-center">
                        <span>Sanksi Bunga ({formatCurrency(amount)} x {(effectiveMonthlyRate * 100).toFixed(2)}% x {monthsLate})</span>
                        <span className="font-bold text-slate-700">{formatCurrency(interestFine)}</span>
                     </div>
                     {includeAdminFine && (
                         <div className="flex justify-between items-center text-red-500">
                            <span>+ Denda Telat Lapor (Admin)</span>
                            <span className="font-bold">{formatCurrency(adminFine)}</span>
                         </div>
                     )}
                     <div className="flex justify-between items-center border-t border-blue-200 pt-3 mt-1">
                        <span className="text-blue-800 font-bold">Total Sanksi & Denda</span>
                        <span className="font-black text-blue-700 text-lg">{formatCurrency(totalFine)}</span>
                     </div>
                  </div>
               </div>

            </div>
         )}
      </div>
    </div>
  );
};

export default CalculatorSanksi;
