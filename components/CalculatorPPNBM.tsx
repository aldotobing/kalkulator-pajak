
import React, { useState, useEffect } from 'react';
import { PPNBM_RATES, PPN_RATE } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { TaxType } from '../types';
import { Gem, ArrowRight, RefreshCw, Info, Save, Check, Printer } from './Icons';

interface Props {
  onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const CalculatorPPNBM: React.FC<Props> = ({ onContextUpdate }) => {
  const [amount, setAmount] = useState(100000000);
  const [displayAmount, setDisplayAmount] = useState(formatNumberInput(100000000));
  const [subType, setSubType] = useState<string>(PPNBM_RATES[0].id);
  const [includePPN, setIncludePPN] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Calculation
  const rateObj = PPNBM_RATES.find(r => r.id === subType);
  const ppnbmRate = rateObj ? rateObj.rate : 0;
  
  const ppnbmAmount = amount * ppnbmRate;
  let ppnAmount = 0;
  if (includePPN) {
    ppnAmount = amount * PPN_RATE;
  }
  
  const totalAmount = amount + ppnbmAmount + ppnAmount;

  useEffect(() => {
    onContextUpdate(`
      Kalkulator: PPnBM (Pajak Barang Mewah)
      Harga Barang: ${formatCurrency(amount)}
      Kategori: ${rateObj?.label}
      Tarif PPnBM: ${(ppnbmRate * 100).toFixed(0)}%
      Nominal PPnBM: ${formatCurrency(ppnbmAmount)}
      ${includePPN ? `PPN (11%): ${formatCurrency(ppnAmount)}` : ''}
      Total Harga Jual: ${formatCurrency(totalAmount)}
    `);
  }, [amount, subType, includePPN, ppnbmRate, ppnbmAmount, ppnAmount, totalAmount, rateObj, onContextUpdate]);

  useEffect(() => { if (isSaved) setIsSaved(false); }, [amount, subType, includePPN]);

  const handleReset = () => {
    setAmount(0);
    setDisplayAmount('');
    setSubType(PPNBM_RATES[0].id);
    setIncludePPN(true);
    setIsSaved(false);
  };

  const handleAmountChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const numVal = cleanVal ? parseInt(cleanVal) : 0;
    setAmount(numVal);
    setDisplayAmount(cleanVal ? new Intl.NumberFormat('id-ID').format(numVal) : '');
  };

  const handleSave = () => {
    const details = `
Kategori: ${rateObj?.label}
Harga Barang: ${formatCurrency(amount)}
Tarif PPnBM: ${(ppnbmRate * 100).toFixed(0)}%
--------------------------------
Nominal PPnBM: ${formatCurrency(ppnbmAmount)}
${includePPN ? `PPN (11%): ${formatCurrency(ppnAmount)}` : ''}
Total Harga Jual: ${formatCurrency(totalAmount)}
    `.trim();

    saveHistoryItem({
      type: TaxType.PPNBM,
      title: 'PPnBM',
      summary: `Harga ${formatCurrency(amount)}`,
      resultAmount: ppnbmAmount + ppnAmount,
      details: details
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* PRINT HEADER */}
      <div className="print-only mb-8 border-b-2 border-slate-800 pb-4">
         <div className="flex justify-between items-end">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Laporan Perhitungan PPnBM</h1>
               <p className="text-sm text-slate-500">Dihasilkan oleh PajakKu Pro</p>
            </div>
            <div className="text-right">
               <p className="text-xs font-bold text-slate-400 uppercase">Tanggal Cetak</p>
               <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        <div className="p-8 md:p-10 md:w-7/12 bg-white relative">
          <div className="absolute top-8 right-8 z-10 no-print">
            <button onClick={handleReset} title="Reset" className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group">
               <RefreshCw size={20} className="group-hover:-rotate-180 transition-transform duration-500"/>
            </button>
          </div>

          <div className="mb-8 pr-10">
             <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 tracking-tight">PPnBM</h2>
             <p className="text-slate-500">Pajak Penjualan atas Barang Mewah.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Harga Barang</label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-500 transition-colors no-print">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-xl text-slate-800 placeholder:text-slate-300"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Kategori Barang</label>
              <div className="relative">
                 <select
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all font-semibold text-slate-800 appearance-none cursor-pointer text-sm"
                >
                   {PPNBM_RATES.map(rate => (
                      <option key={rate.id} value={rate.id}>{rate.label}</option>
                    ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 no-print"><ArrowRight size={16} className="rotate-90"/></div>
              </div>
            </div>

            <div 
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${includePPN ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'} no-print`}
                onClick={() => setIncludePPN(!includePPN)}
              >
                 <span className="font-bold text-sm text-slate-800">Hitung dengan PPN (11%)</span>
                 <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${includePPN ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                    {includePPN && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                 </div>
              </div>
          </div>
        </div>

        {/* Result (Dark Theme) */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 space-y-8">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tarif PPnBM</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl lg:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{(ppnbmRate * 100).toLocaleString('id-ID')}</span>
                  <span className="text-2xl text-slate-400 font-light">%</span>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-slate-400 font-medium">Nominal PPnBM</span>
                    <span className="text-xl font-bold text-white">{formatCurrency(ppnbmAmount)}</span>
                 </div>
                 {includePPN && (
                   <div className="flex justify-between items-center pb-4 border-b border-white/10">
                      <span className="text-slate-400 font-medium">PPN (11%)</span>
                      <span className="text-xl font-bold text-white">{formatCurrency(ppnAmount)}</span>
                   </div>
                 )}
              </div>
              
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                 <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Harga Jual</span>
                 <span className="block text-3xl font-bold text-white tracking-tight">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-8 border-t border-white/10 flex items-center gap-4 no-print">
               <button onClick={() => window.print()} className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2 group">
                  Cetak <Printer size={16} className="group-hover:scale-110 transition-transform" />
               </button>
               <button 
                  onClick={handleSave}
                  disabled={isSaved}
                  className={`ml-auto px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${isSaved ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/50'}`}
               >
                  {isSaved ? <Check size={14}/> : <Save size={14}/>}
                  {isSaved ? 'Tersimpan' : 'Simpan'}
               </button>
            </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg no-print"><Info size={16}/></div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">METODE HITUNG</h4>
        </div>
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
           <p>
             PPnBM adalah pajak tambahan khusus untuk barang mewah (mobil sport, apartemen, dll) agar tercipta keadilan. Pajak ini dikenakan bersamaan dengan PPN.
           </p>

           <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
             <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Langkah Perhitungan:</h5>
             <ol className="list-decimal list-inside space-y-2 marker:font-bold marker:text-blue-500">
               <li>Hitung <strong>PPnBM</strong>: Kalikan Harga Barang dengan Tarif Barang Mewah (misal 20% atau 50%).</li>
               <li>Hitung <strong>PPN</strong>: Kalikan Harga Barang dengan 11%. (Ingat: PPN dihitung dari harga asli, bukan harga + PPnBM).</li>
               <li>Jumlahkan Harga Barang + PPnBM + PPN untuk mendapatkan harga jual final.</li>
             </ol>
           </div>

           <div className="flex flex-col gap-2 pt-2">
             <span className="text-slate-400 text-xs uppercase font-bold">Rumus Matematika</span>
             <div className="flex flex-col gap-1 font-bold text-blue-600 text-right border-t border-slate-100 pt-2 text-lg">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans font-normal text-xs">PPnBM:</span>
                  <span>{formatCurrency(amount)} × {(ppnbmRate * 100).toFixed(0)}% = {formatCurrency(ppnbmAmount)}</span>
                </div>
                {includePPN && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans font-normal text-xs">PPN:</span>
                    <span>{formatCurrency(amount)} × 11% = {formatCurrency(ppnAmount)}</span>
                  </div>
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPPNBM;
