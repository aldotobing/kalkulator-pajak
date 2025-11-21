
import React, { useState, useEffect } from 'react';
import { PPH_FINAL_RATES } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { TaxType } from '../types';
import { Percent, ArrowRight, RefreshCw, Info, Save, Check, Printer } from './Icons';

interface Props {
  onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const CalculatorFinal: React.FC<Props> = ({ onContextUpdate }) => {
  const [amount, setAmount] = useState(10000000);
  const [displayAmount, setDisplayAmount] = useState(formatNumberInput(10000000));
  const [subType, setSubType] = useState<string>(PPH_FINAL_RATES[0].id);
  const [isSaved, setIsSaved] = useState(false);

  // Calculation
  const rateObj = PPH_FINAL_RATES.find(r => r.id === subType);
  const taxRate = rateObj ? rateObj.rate : 0;
  const taxAmount = amount * taxRate;
  const netReceived = amount - taxAmount;

  useEffect(() => {
    onContextUpdate(`
      Kalkulator: PPh Final (4 Ayat 2)
      Nilai Transaksi/Omzet: ${formatCurrency(amount)}
      Kategori: ${rateObj?.label}
      Tarif: ${(taxRate * 100).toFixed(2)}%
      Pajak Terutang: ${formatCurrency(taxAmount)}
    `);
  }, [amount, subType, taxRate, taxAmount, rateObj, onContextUpdate]);

  useEffect(() => { if (isSaved) setIsSaved(false); }, [amount, subType]);

  const handleReset = () => {
    setAmount(0);
    setDisplayAmount('');
    setSubType(PPH_FINAL_RATES[0].id);
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
Nilai Transaksi: ${formatCurrency(amount)}
Tarif: ${(taxRate * 100).toFixed(2)}%
--------------------------------
Pajak Terutang: ${formatCurrency(taxAmount)}
Sisa Setelah Pajak: ${formatCurrency(netReceived)}
    `.trim();

    saveHistoryItem({
      type: TaxType.PPH_FINAL,
      title: 'PPh Final',
      summary: `${rateObj?.label.substring(0, 20)}... - ${formatCurrency(amount)}`,
      resultAmount: taxAmount,
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
               <h1 className="text-2xl font-bold text-slate-900">Laporan Perhitungan PPh Final</h1>
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
             <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 tracking-tight">PPh Final</h2>
             <p className="text-slate-500">Pajak Sewa Tanah/Bangunan, Konstruksi, dan UMKM.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nilai Transaksi / Omzet</label>
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
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Jenis Objek Pajak</label>
              <div className="relative">
                 <select
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all font-semibold text-slate-800 appearance-none cursor-pointer text-sm"
                >
                  {PPH_FINAL_RATES.map(rate => (
                      <option key={rate.id} value={rate.id}>{rate.label} ({parseFloat((rate.rate * 100).toFixed(2))}%)</option>
                    ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 no-print"><ArrowRight size={16} className="rotate-90"/></div>
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
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tarif Final</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl lg:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                    {parseFloat((taxRate * 100).toFixed(2)).toLocaleString('id-ID')}
                  </span>
                  <span className="text-2xl text-slate-400 font-light">%</span>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-slate-400 font-medium">Pajak Terutang</span>
                    <span className="text-xl font-bold text-white">{formatCurrency(taxAmount)}</span>
                 </div>
              </div>
              
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                 <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Sisa Setelah Pajak</span>
                 <span className="block text-3xl font-bold text-white tracking-tight">{formatCurrency(netReceived)}</span>
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
            Sesuai namanya, PPh Final berarti kewajiban pajaknya sudah "selesai" saat itu juga. Anda tidak perlu menghitung ulang pajak ini dalam SPT Tahunan nanti (tidak bisa dikreditkan), cukup dilaporkan saja kalau sudah bayar.
          </p>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
             <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Langkah Perhitungan:</h5>
             <ol className="list-decimal list-inside space-y-2 marker:font-bold marker:text-blue-500">
               <li>Ambil <strong>Nilai Transaksi</strong> (seperti nilai sewa bulanan/tahunan) atau <strong>Omzet Bruto</strong> (untuk UMKM).</li>
               <li>Kalikan langsung dengan tarif yang berlaku (Misal: 0.5% untuk UMKM, 10% untuk Sewa Gedung).</li>
               <li>Hasilnya adalah pajak yang harus disetor.</li>
             </ol>
          </div>

          <div className="flex flex-col gap-1 pt-2">
             <span className="text-slate-400 text-xs uppercase font-bold">Rumus Matematika</span>
             <div className="flex justify-between items-baseline">
               <span className="text-slate-600">Nilai Transaksi × Tarif Tertentu</span>
             </div>
             <span className="font-bold text-blue-600 text-right mt-1 block text-lg">
               {formatCurrency(amount)} × {(taxRate * 100).toFixed(2)}% = {formatCurrency(taxAmount)}
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorFinal;
