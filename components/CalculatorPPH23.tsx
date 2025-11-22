
import React, { useState, useEffect } from 'react';
import { PPH23_RATES } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { TaxType } from '../types';
import { Building2, ArrowRight, RefreshCw, Info, Save, Check, Printer } from './Icons';
import PPh23ResultModal from './PPh23ResultModal';

interface Props {
  onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const CalculatorPPH23: React.FC<Props> = ({ onContextUpdate }) => {
  const [amount, setAmount] = useState(10000000);
  const [displayAmount, setDisplayAmount] = useState(formatNumberInput(10000000));
  const [subType, setSubType] = useState<string>('SERVICE');
  const [hasNPWP, setHasNPWP] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Calculation
  // @ts-ignore
  let taxRate = PPH23_RATES[subType] || 0;
  if (!hasNPWP) taxRate *= 2; // 100% Higher surcharge

  const taxAmount = amount * taxRate;
  const netReceived = amount - taxAmount;

  useEffect(() => {
    onContextUpdate(`
      Kalkulator: PPh Pasal 23
      Nilai Bruto: ${formatCurrency(amount)}
      Kategori: ${subType}
      Status NPWP: ${hasNPWP ? 'Ada' : 'Tidak Ada (Tarif +100%)'}
      Tarif Efektif: ${(taxRate * 100).toFixed(2)}%
      Potongan Pajak: ${formatCurrency(taxAmount)}
      Diterima Bersih: ${formatCurrency(netReceived)}
    `);
  }, [amount, subType, hasNPWP, taxRate, taxAmount, netReceived, onContextUpdate]);

  useEffect(() => { if (isSaved) setIsSaved(false); }, [amount, subType, hasNPWP]);

  const handleReset = () => {
    setAmount(0);
    setDisplayAmount('');
    setSubType('SERVICE');
    setHasNPWP(true);
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
Kategori: ${subType}
Status NPWP: ${hasNPWP ? 'Ya' : 'Tidak'}
Nilai Bruto: ${formatCurrency(amount)}
Tarif Efektif: ${(taxRate * 100).toFixed(2)}%
--------------------------------
Potongan Pajak: ${formatCurrency(taxAmount)}
Diterima Bersih: ${formatCurrency(netReceived)}
    `.trim();

    saveHistoryItem({
      type: TaxType.PPH23,
      title: 'PPh 23',
      summary: `${subType} - Gross ${formatCurrency(amount)}`,
      resultAmount: taxAmount,
      details: details
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col md:flex-row">
        <div className="p-8 md:p-10 md:w-7/12 bg-white relative">
          <div className="absolute top-8 right-8 z-10 no-print">
            <button onClick={handleReset} title="Reset" className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group">
              <RefreshCw size={20} className="group-hover:-rotate-180 transition-transform duration-500" />
            </button>
          </div>

          <div className="mb-8 pr-10">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 tracking-tight">PPh Pasal 23</h2>
            <p className="text-slate-500">Pajak atas dividen, bunga, royalti, hadiah, dan jasa.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Nilai Bruto (Sebelum Pajak)</label>
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
                  <option value="SERVICE">Jasa Teknik/Manajemen/Lainnya (2%)</option>
                  <option value="RENT">Sewa Harta selain Tanah/Bangunan (2%)</option>
                  <option value="DIVIDEND">Dividen (15%)</option>
                  <option value="ROYALTY">Royalti (15%)</option>
                  <option value="PRIZE">Hadiah/Penghargaan (15%)</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 no-print"><ArrowRight size={16} className="rotate-90" /></div>
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${hasNPWP ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'} no-print`}
              onClick={() => setHasNPWP(!hasNPWP)}
            >
              <div>
                <p className="font-bold text-sm text-slate-800">Punya NPWP?</p>
                {!hasNPWP && <p className="text-xs text-red-500 font-medium mt-1">Tarif 100% lebih tinggi tanpa NPWP</p>}
              </div>
              <div className={`w-12 h-7 rounded-full p-1 flex items-center transition-colors ${hasNPWP ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>

            {/* Print Status */}
            <div className="print-only mt-4">
              <span className="text-xs font-bold uppercase text-slate-400">Status NPWP</span>
              <p className="font-bold">{hasNPWP ? 'Memiliki NPWP' : 'Tidak Ada NPWP'}</p>
            </div>
          </div>
        </div>

        {/* Result (Dark Theme) */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">

          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 space-y-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tarif Efektif</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl lg:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{(taxRate * 100).toLocaleString('id-ID')}</span>
                <span className="text-2xl text-slate-400 font-light">%</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-slate-400 font-medium">Potongan Pajak</span>
                <span className="text-xl font-bold text-white">{formatCurrency(taxAmount)}</span>
              </div>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
              <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Diterima Bersih (Net)</span>
              <span className="block text-3xl font-bold text-white tracking-tight">{formatCurrency(netReceived)}</span>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-8 border-t border-white/10 flex items-center gap-4 no-print">
            <button onClick={() => setIsModalOpen(true)} className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2 group">
              Cetak <Printer size={16} className="group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`ml-auto px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${isSaved ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/50'}`}
            >
              {isSaved ? <Check size={14} /> : <Save size={14} />}
              {isSaved ? 'Tersimpan' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-lg shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg no-print"><Info size={16} /></div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">METODE HITUNG</h4>
        </div>
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p>
            PPh 23 adalah pajak yang dipotong langsung saat pembayaran jasa, dividen, atau sewa. Uang yang diterima sudah "bersih" karena pajaknya langsung disetorkan oleh pihak pembayar ke negara.
          </p>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Langkah Perhitungan:</h5>
            <ol className="list-decimal list-inside space-y-2 marker:font-bold marker:text-blue-500">
              <li>Tentukan jenis penghasilan (Sewa/Jasa = 2%, Dividen/Hadiah = 15%).</li>
              <li>Cek apakah penerima penghasilan punya NPWP. Jika <strong>TIDAK</strong>, tarif naik 100% (jadi 2x lipat).</li>
              <li>Kalikan Nilai Bruto tagihan dengan tarif tersebut.</li>
              <li>Kurangi Nilai Bruto dengan pajak untuk mengetahui uang bersih yang diterima.</li>
            </ol>
          </div>

          <div className="flex flex-col gap-1 pt-2">
            <span className="text-slate-400 text-xs uppercase font-bold">Rumus Matematika</span>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-600">Nilai Bruto × Tarif Pajak</span>
              {!hasNPWP && <span className="text-red-500 text-xs font-bold">(+100% Sanksi Non-NPWP)</span>}
            </div>
            <span className="font-bold text-blue-600 text-right mt-1 block text-lg">
              {formatCurrency(amount)} × {(taxRate * 100).toFixed(2)}% = {formatCurrency(taxAmount)}
            </span>
          </div>
        </div>
      </div>

      <PPh23ResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={{
          amount,
          subType,
          hasNPWP,
          taxRate,
          taxAmount,
          netReceived
        }}
      />
    </div>
  );
};

export default CalculatorPPH23;
