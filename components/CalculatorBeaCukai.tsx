
import React, { useState, useEffect } from 'react';
import { BC_THRESHOLD_USD, BC_PPN_RATE, BC_GOODS_CATEGORY } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { TaxType } from '../types';
import { Ship, ArrowRight, RefreshCw, Info, Save, Check, Printer, Container } from './Icons';
import BeaCukaiResultModal from './BeaCukaiResultModal';

interface Props {
  onContextUpdate: (ctx: string) => void;
}

// Helper for USD/IDR input display
const formatNumberInput = (value: number) => {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const CalculatorBeaCukai: React.FC<Props> = ({ onContextUpdate }) => {
  const [fob, setFob] = useState(50); // Goods Price in USD
  const [insurance, setInsurance] = useState(1); // USD
  const [freight, setFreight] = useState(10); // USD
  const [kurs, setKurs] = useState(16000); // IDR per USD

  const [displayFob, setDisplayFob] = useState(formatNumberInput(50));
  const [displayInsurance, setDisplayInsurance] = useState(formatNumberInput(1));
  const [displayFreight, setDisplayFreight] = useState(formatNumberInput(10));
  const [displayKurs, setDisplayKurs] = useState(formatNumberInput(16000));

  const [goodsType, setGoodsType] = useState<string>('GENERAL');
  const [isSaved, setIsSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Logic based on PMK 199/2019 & PMK 96/2023
  const category = BC_GOODS_CATEGORY.find(c => c.id === goodsType) || BC_GOODS_CATEGORY[0];

  const cifUSD = fob + insurance + freight;
  const cifIDR = cifUSD * kurs;

  // 1. Determine Import Duty (Bea Masuk)
  let beaMasukRate = 0;
  let pphRate = 0;
  const isBelowThreshold = fob <= BC_THRESHOLD_USD;

  if (isBelowThreshold) {
    // De Minimis: Free BM, No PPh, Only PPN
    beaMasukRate = 0;
    pphRate = 0;
  } else {
    // > $3
    beaMasukRate = category.bm;
    pphRate = category.pph;
  }

  // Rounding Rule: Bea Masuk is rounded UP to nearest thousands
  const rawBeaMasuk = cifIDR * beaMasukRate;
  const beaMasuk = Math.ceil(rawBeaMasuk / 1000) * 1000;

  // 2. Import Value (Nilai Impor) for Tax Base
  const nilaiImpor = cifIDR + beaMasuk;

  // 3. PPN & PPh
  // PPN and PPh usually rounded standardly, but often rounded down in tax apps. Keeping standard Math.round or floor for safe estimate.
  const ppn = Math.round(nilaiImpor * BC_PPN_RATE);
  const pph = Math.round(nilaiImpor * pphRate);

  const totalPajak = beaMasuk + ppn + pph;

  useEffect(() => {
    onContextUpdate(`
      Kalkulator: Bea Masuk & Pajak Impor (Bea Cukai)
      Jenis Barang: ${category.label}
      Nilai Barang (FOB): USD ${formatNumberInput(fob)}
      Total CIF (Cost, Ins, Freight): USD ${formatNumberInput(cifUSD)}
      Kurs Pajak: Rp ${formatNumberInput(kurs)}
      Nilai Pabean (CIF IDR): ${formatCurrency(cifIDR)}
      
      Ambang Batas USD 3: ${isBelowThreshold ? 'Dibawah (Bebas BM)' : 'Diatas (Kena BM)'}
      
      Rincian Pajak:
      1. Bea Masuk (${(beaMasukRate * 100).toFixed(1)}%): ${formatCurrency(beaMasuk)}
      2. PPN (${(BC_PPN_RATE * 100).toFixed(0)}%): ${formatCurrency(ppn)}
      3. PPh Impor (${(pphRate * 100).toFixed(1)}%): ${formatCurrency(pph)}
      
      Total Tagihan Pajak: ${formatCurrency(totalPajak)}
    `);
  }, [fob, insurance, freight, kurs, goodsType, cifUSD, cifIDR, beaMasuk, ppn, pph, totalPajak, isBelowThreshold, category, onContextUpdate]);

  useEffect(() => { if (isSaved) setIsSaved(false); }, [fob, insurance, freight, kurs, goodsType]);

  const handleReset = () => {
    setFob(0); setDisplayFob('');
    setInsurance(0); setDisplayInsurance('');
    setFreight(0); setDisplayFreight('');
    setKurs(0); setDisplayKurs('');
    setGoodsType('GENERAL');
    setIsSaved(false);
  };

  const handleInputChange = (setter: (v: number) => void, displaySetter: (v: string) => void, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const numVal = cleanVal ? parseInt(cleanVal) : 0;
    setter(numVal);
    displaySetter(cleanVal ? new Intl.NumberFormat('id-ID').format(numVal) : '');
  };

  const handleSave = () => {
    const details = `
Jenis: ${category.label}
FOB: USD ${displayFob} | CIF: USD ${formatNumberInput(cifUSD)}
Kurs: ${formatCurrency(kurs)}
Status: ${isBelowThreshold ? 'De Minimis (<$3)' : 'Non-De Minimis (>$3)'}
--------------------------------
Bea Masuk: ${formatCurrency(beaMasuk)}
PPN (11%): ${formatCurrency(ppn)}
PPh Impor: ${formatCurrency(pph)}
Total Pajak: ${formatCurrency(totalPajak)}
    `.trim();

    saveHistoryItem({
      type: TaxType.BEA_CUKAI,
      title: 'Bea Masuk & Impor',
      summary: `${category.label} - USD ${displayFob}`,
      resultAmount: totalPajak,
      details: details
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

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
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 tracking-tight">Bea Masuk & Pajak Impor</h2>
            <p className="text-slate-500">Hitung pajak belanja barang kiriman dari luar negeri (Impor).</p>
          </div>

          <div className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Jenis Barang Kiriman</label>
              <div className="relative">
                <select
                  value={goodsType}
                  onChange={(e) => setGoodsType(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all font-semibold text-slate-800 appearance-none cursor-pointer text-sm"
                >
                  {BC_GOODS_CATEGORY.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 no-print"><ArrowRight size={16} className="rotate-90" /></div>
              </div>
              {goodsType !== 'GENERAL' && (
                <p className="text-[10px] text-blue-600 font-bold mt-2 ml-1 flex items-center gap-1">
                  <Info size={12} /> Termasuk barang MFN (Tas/Sepatu/Tekstil) dengan tarif khusus.
                </p>
              )}
            </div>

            {/* Kurs */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Kurs Pajak (IDR per 1 USD)</label>
              <div className="relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-500 transition-colors no-print">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayKurs}
                  onChange={(e) => handleInputChange(setKurs, setDisplayKurs, e.target.value)}
                  className="w-full pl-14 pr-5 py-3.5 bg-slate-50 border-2 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all font-bold text-lg text-slate-800 placeholder:text-slate-300"
                  placeholder="16.000"
                />
              </div>
            </div>

            {/* CIF Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Harga (FOB)</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs group-focus-within:text-blue-500 transition-colors no-print">USD</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={displayFob}
                    onChange={(e) => handleInputChange(setFob, setDisplayFob, e.target.value)}
                    className="w-full pl-12 pr-3 py-3 bg-slate-50 border-2 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Ongkir</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs group-focus-within:text-blue-500 transition-colors no-print">USD</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={displayFreight}
                    onChange={(e) => handleInputChange(setFreight, setDisplayFreight, e.target.value)}
                    className="w-full pl-12 pr-3 py-3 bg-slate-50 border-2 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Asuransi</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs group-focus-within:text-blue-500 transition-colors no-print">USD</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={displayInsurance}
                    onChange={(e) => handleInputChange(setInsurance, setDisplayInsurance, e.target.value)}
                    className="w-full pl-12 pr-3 py-3 bg-slate-50 border-2 border-transparent hover:bg-white hover:border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 uppercase">Total CIF (USD)</span>
              <span className="font-black text-lg text-blue-700">${formatNumberInput(cifUSD)}</span>
            </div>
          </div>
        </div>

        {/* Result (Dark Theme) */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">

          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 space-y-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pajak Impor</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-lg">
                  {formatCurrency(totalPajak)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-slate-400 font-medium">Bea Masuk <span className="text-[10px] opacity-50">{(beaMasukRate * 100).toFixed(1)}%</span></span>
                <span className="text-lg font-bold text-white">{formatCurrency(beaMasuk)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-slate-400 font-medium">PPN <span className="text-[10px] opacity-50">11%</span></span>
                <span className="text-lg font-bold text-white">{formatCurrency(ppn)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-slate-400 font-medium">PPh <span className="text-[10px] opacity-50">{(pphRate * 100).toFixed(1)}%</span></span>
                <span className="text-lg font-bold text-white">{formatCurrency(pph)}</span>
              </div>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
              <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Nilai Pabean (CIF IDR)</span>
              <span className="block text-xl font-bold text-white tracking-tight">{formatCurrency(cifIDR)}</span>
              {isBelowThreshold && <span className="text-[10px] text-emerald-400 font-bold mt-1 block">*FOB &le; USD 3 (Bebas Bea Masuk)</span>}
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
            Perhitungan ini didasarkan pada Peraturan Menteri Keuangan <strong>PMK 199/PMK.010/2019</strong> dan <strong>PMK 96/2023</strong> tentang Ketentuan Kepabeanan, Cukai, dan Pajak atas Impor Barang Kiriman.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Ketentuan Umum (De Minimis)</h5>
              <ul className="space-y-2 list-disc list-inside marker:text-blue-500">
                <li>Jika Harga Barang (FOB) <strong>≤ USD 3.00</strong>: Bebas Bea Masuk, hanya bayar PPN 11%.</li>
                <li>Jika Harga Barang (FOB) <strong>&gt; USD 3.00</strong>: Dikenakan Bea Masuk (7.5%) dan PPN (11%).</li>
                <li>Barang Umum tidak dikenakan PPh (Pajak Penghasilan).</li>
              </ul>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Barang Khusus (MFN)</h5>
              <p className="mb-2">Untuk Tas, Sepatu, dan Tekstil, aturan De Minimis USD 3 tidak berlaku penuh. Tarif Bea Masuk lebih tinggi:</p>
              <ul className="space-y-1 text-xs font-bold text-slate-700">
                <li>Tas: BM 15-20% + PPN 11% + PPh 7.5-10%</li>
                <li>Sepatu: BM 25-30% + PPN 11% + PPh 10%</li>
                <li>Tekstil: BM 15-25% + PPN 11% + PPh 2.5-7.5%</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-2">
            <span className="text-slate-400 text-xs uppercase font-bold">Rumus Nilai Pabean</span>
            <span className="font-bold text-blue-600 text-lg">
              (FOB + Asuransi + Ongkir) × Kurs Pajak
            </span>
            <p className="text-[10px] text-slate-400 italic">
              *Bea Masuk dibulatkan ke atas dalam ribuan Rupiah penuh.
            </p>
          </div>
        </div>
      </div>

      <BeaCukaiResultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={{
          categoryLabel: category.label,
          fob,
          insurance,
          freight,
          cifUSD,
          kurs,
          cifIDR,
          isBelowThreshold,
          beaMasukRate,
          beaMasuk,
          ppn,
          pphRate,
          pph,
          totalPajak
        }}
      />
    </div>
  );
};

export default CalculatorBeaCukai;
