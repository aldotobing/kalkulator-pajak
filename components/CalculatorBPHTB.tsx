
import React, { useState, useEffect } from 'react';
import { PROPERTY_TAX_CONFIG } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { TaxType } from '../types';
import { Home, MapPin, RefreshCw, Info, Save, Check, Printer, Copy, Check as CheckIcon, ChevronDown, ArrowRight, FileText } from './Icons';

interface Props {
  onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const CalculatorBPHTB: React.FC<Props> = ({ onContextUpdate }) => {
  const [price, setPrice] = useState(1000000000); // 1M
  const [displayPrice, setDisplayPrice] = useState(formatNumberInput(1000000000));
  const [region, setRegion] = useState<'DKI' | 'BODETABEK' | 'MANUAL'>('DKI');
  const [customNPOPTKP, setCustomNPOPTKP] = useState(0);
  const [displayCustomNPOPTKP, setDisplayCustomNPOPTKP] = useState('');
  
  // Legal Fee Simulation State
  const [includeLegalFees, setIncludeLegalFees] = useState(false);
  const [notaryRate, setNotaryRate] = useState(0.01); // 1% Default

  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Logic
  let npoptkp = PROPERTY_TAX_CONFIG.NPOPTKP.REGIONAL;
  if (region === 'DKI') npoptkp = PROPERTY_TAX_CONFIG.NPOPTKP.DKI;
  if (region === 'BODETABEK') npoptkp = PROPERTY_TAX_CONFIG.NPOPTKP.BODETABEK;
  if (region === 'MANUAL') npoptkp = customNPOPTKP;

  // Seller Logic (PPh Final 2.5%)
  const pphAmount = price * PROPERTY_TAX_CONFIG.PPH_RATE;
  const sellerReceived = price - pphAmount;

  // Buyer Logic (BPHTB 5%)
  const npopKenaPajak = Math.max(0, price - npoptkp);
  const bphtbAmount = npopKenaPajak * PROPERTY_TAX_CONFIG.BPHTB_RATE;
  
  // Legal Fees Logic (PP 24/2016 & PP 128/2015)
  const notaryFee = includeLegalFees ? price * notaryRate : 0;
  const pnbpFee = includeLegalFees ? (price / 1000) + 50000 : 0; // (Nilai / 1000) + 50k
  const totalLegalFees = notaryFee + pnbpFee;

  const buyerCost = price + bphtbAmount + totalLegalFees;

  useEffect(() => {
    onContextUpdate(`
      Kalkulator: Pajak Jual Beli Rumah (BPHTB & PPh)
      Harga Transaksi: ${formatCurrency(price)}
      Wilayah NPOPTKP: ${region} (${formatCurrency(npoptkp)})
      
      Pihak Penjual (Seller):
      - PPh Final (2.5%): ${formatCurrency(pphAmount)}
      - Uang Bersih Diterima: ${formatCurrency(sellerReceived)}
      
      Pihak Pembeli (Buyer):
      - BPHTB (5%): ${formatCurrency(bphtbAmount)}
      ${includeLegalFees ? `- Biaya Notaris/PPAT (${(notaryRate*100)}%): ${formatCurrency(notaryFee)}` : ''}
      ${includeLegalFees ? `- PNBP Balik Nama (BPN): ${formatCurrency(pnbpFee)}` : ''}
      - Total Biaya Pembelian: ${formatCurrency(buyerCost)}
    `);
  }, [price, region, customNPOPTKP, npoptkp, pphAmount, sellerReceived, npopKenaPajak, bphtbAmount, buyerCost, includeLegalFees, notaryRate, notaryFee, pnbpFee, onContextUpdate]);

  useEffect(() => { if (isSaved) setIsSaved(false); }, [price, region, customNPOPTKP, includeLegalFees, notaryRate]);

  const handleReset = () => {
    setPrice(0);
    setDisplayPrice('');
    setRegion('DKI');
    setCustomNPOPTKP(0);
    setDisplayCustomNPOPTKP('');
    setIncludeLegalFees(false);
    setNotaryRate(0.01);
    setIsSaved(false);
  };

  const handlePriceChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const numVal = cleanVal ? parseInt(cleanVal) : 0;
    setPrice(numVal);
    setDisplayPrice(cleanVal ? new Intl.NumberFormat('id-ID').format(numVal) : '');
  };

  const handleCustomNPOPTKPChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const numVal = cleanVal ? parseInt(cleanVal) : 0;
    setCustomNPOPTKP(numVal);
    setDisplayCustomNPOPTKP(cleanVal ? new Intl.NumberFormat('id-ID').format(numVal) : '');
  };

  const handleSave = () => {
    const details = `
Harga Transaksi: ${formatCurrency(price)}
NPOPTKP: ${formatCurrency(npoptkp)} (${region})
--------------------------------
Biaya Penjual (PPh 2.5%): ${formatCurrency(pphAmount)}
Biaya Pembeli (BPHTB 5%): ${formatCurrency(bphtbAmount)}
Biaya Legal (Est): ${formatCurrency(totalLegalFees)}
Total Pengeluaran Pembeli: ${formatCurrency(buyerCost)}
    `.trim();

    saveHistoryItem({
      type: TaxType.BPHTB,
      title: 'Pajak Jual Beli Rumah',
      summary: `Harga ${formatCurrency(price)}`,
      resultAmount: bphtbAmount + pphAmount, // Saving combined tax for reference
      details: details
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopyResult = () => {
    const text = `
Estimasi Biaya Jual Beli Properti
------------------
Harga: ${formatCurrency(price)}

[PENJUAL]
PPh Final (2.5%): ${formatCurrency(pphAmount)}
Diterima Bersih: ${formatCurrency(sellerReceived)}

[PEMBELI]
BPHTB (5%): ${formatCurrency(bphtbAmount)}
${includeLegalFees ? `Legal & Admin: ${formatCurrency(totalLegalFees)}\n` : ''}Total Cash Needed: ${formatCurrency(buyerCost)}
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
               <h1 className="text-2xl font-bold text-slate-900">Laporan Pajak Jual Beli Rumah</h1>
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
                   <Home size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Pajak Rumah (BPHTB)</h2>
             </div>
             <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                <span>Estimasi BPHTB (Pembeli) dan PPh Final (Penjual).</span>
             </div>
          </div>

          <div className="space-y-6">
            
            {/* Price */}
            <div>
              <label className={LABEL_STYLE}>Harga Transaksi / NJOP</label>
              <div className={INPUT_CONTAINER_STYLE}>
                <span className={INPUT_ICON_STYLE}>Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className={INPUT_FIELD_STYLE}
                  placeholder="0"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 ml-1 flex items-center gap-1">
                 <Info size={12}/> Gunakan nilai tertinggi antara Harga Pasar atau NJOP PBB.
              </p>
            </div>

            {/* Region */}
            <div>
              <label className={LABEL_STYLE}>Wilayah Lokasi Properti</label>
              <div className="relative">
                 <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as any)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer text-base h-[50px]"
                >
                  <option value="DKI">DKI Jakarta (NPOPTKP Rp80 Juta)</option>
                  <option value="BODETABEK">Bodetabek (NPOPTKP Rp60 Juta)</option>
                  <option value="MANUAL">Lainnya (Input Manual)</option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 no-print"><ChevronDown size={18} /></div>
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none hidden"><MapPin size={18} /></div>
              </div>
            </div>

            {region === 'MANUAL' && (
               <div className="animate-fade-up">
                  <label className={LABEL_STYLE}>Nilai NPOPTKP Daerah</label>
                  <div className={INPUT_CONTAINER_STYLE}>
                     <span className={INPUT_ICON_STYLE}>Rp</span>
                     <input
                        type="text"
                        inputMode="numeric"
                        value={displayCustomNPOPTKP}
                        onChange={(e) => handleCustomNPOPTKPChange(e.target.value)}
                        className={INPUT_FIELD_STYLE}
                        placeholder="Contoh: 60.000.000"
                     />
                  </div>
               </div>
            )}

            <div className="h-px bg-slate-100 my-4"></div>

            {/* Legal Fee Simulator */}
            <div className={`border border-slate-200 rounded-xl transition-all duration-300 overflow-hidden ${includeLegalFees ? 'bg-white ring-1 ring-blue-100 border-blue-200' : 'bg-slate-50 hover:bg-white'}`}>
               <div 
                  onClick={() => setIncludeLegalFees(!includeLegalFees)}
                  className={`p-4 flex items-center justify-between cursor-pointer group ${includeLegalFees ? 'border-b border-slate-100 bg-blue-50/30' : ''}`}
               >
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg transition-colors ${includeLegalFees ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                        <FileText size={18} />
                     </div>
                     <div>
                        <span className={`block text-sm font-bold transition-colors ${includeLegalFees ? 'text-blue-800' : 'text-slate-700 group-hover:text-slate-900'}`}>Simulasi Biaya Tambahan</span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Notaris/PPAT & PNBP</span>
                     </div>
                  </div>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${includeLegalFees ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                     {includeLegalFees && <CheckIcon size={12} className="text-white" />}
                  </div>
               </div>

               {includeLegalFees && (
                  <div className="p-5 animate-fade-up">
                     <label className={LABEL_STYLE}>Tarif Jasa Notaris/PPAT</label>
                     <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(notaryRate / 0.01) * 100}%` }}></div>
                        </div>
                        <span className="text-sm font-bold text-blue-700 w-12 text-right">{(notaryRate * 100).toFixed(1)}%</span>
                     </div>
                     <div className="flex justify-between mt-2 gap-2">
                        <button onClick={() => setNotaryRate(0.005)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-colors ${notaryRate === 0.005 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>0.5%</button>
                        <button onClick={() => setNotaryRate(0.0075)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-colors ${notaryRate === 0.0075 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>0.75%</button>
                        <button onClick={() => setNotaryRate(0.01)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-colors ${notaryRate === 0.01 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'}`}>1.0%</button>
                     </div>
                     <p className="text-[10px] text-slate-400 mt-3 italic">
                        *Maksimal tarif PPAT adalah 1% (PP No. 24/2016). PNBP dihitung otomatis sesuai rumus BPN.
                     </p>
                  </div>
               )}
            </div>

          </div>
        </div>

        {/* Right Side: Result (Clean Dark Theme) */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Subtle Gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimasi Total Pembeli</p>
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
                     {formatCurrency(buyerCost)}
                   </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                   *Total uang yang harus disiapkan pembeli (Harga + Pajak + Biaya Legal).
                </p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-4">
                 <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                    <span className="text-slate-400 text-sm">Pajak BPHTB</span>
                    <span className="text-lg font-bold text-white">{formatCurrency(bphtbAmount)}</span>
                 </div>
                 {includeLegalFees && (
                    <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                        <span className="text-slate-400 text-sm">Biaya Legal & Admin</span>
                        <span className="text-lg font-bold text-orange-400">{formatCurrency(totalLegalFees)}</span>
                    </div>
                 )}
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Pajak Penjual (PPh)</span>
                    <span className="text-lg font-bold text-emerald-400">{formatCurrency(pphAmount)}</span>
                 </div>
              </div>

              <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
                 <div className="mt-0.5 text-blue-400"><Info size={16}/></div>
                 <div>
                    <p className="text-xs text-blue-100 leading-relaxed">
                       <strong>Penjual</strong> menerima bersih <strong>{formatCurrency(sellerReceived)}</strong> setelah dipotong PPh Final 2.5%.
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
                     Metode Perhitungan (UU HKPD)
                  </h5>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                     Transaksi properti dikenakan dua jenis pajak yang ditanggung masing-masing pihak.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Untuk Penjual (PPh):</p>
                        <code className="text-sm font-bold text-emerald-600">
                           Harga x 2.5% (Final)
                        </code>
                     </div>
                     <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Untuk Pembeli (BPHTB):</p>
                        <code className="text-sm font-bold text-blue-600">
                           (Harga - NPOPTKP) x 5%
                        </code>
                     </div>
                  </div>
               </div>

               {/* Step 1: PPh Penjual */}
               <div className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">1. PPh Final (Tanggungan Penjual)</h5>
                  <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
                     <div className="flex justify-between items-center">
                        <span>Harga Transaksi</span>
                        <span className="font-bold text-slate-700">{formatCurrency(price)}</span>
                     </div>
                     <div className="flex justify-between items-center border-t border-slate-200 pt-2 mt-1">
                        <span className="text-emerald-600 font-bold">PPh Final (2.5%)</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(pphAmount)}</span>
                     </div>
                  </div>
               </div>

               {/* Step 2: BPHTB Pembeli */}
               <div className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">2. BPHTB (Tanggungan Pembeli)</h5>
                  <div className="bg-slate-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-slate-200">
                     <div className="flex justify-between items-center">
                        <span>Harga Transaksi</span>
                        <span className="font-bold text-slate-700">{formatCurrency(price)}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span>NPOPTKP ({region})</span>
                        <span className="font-bold text-red-500">- {formatCurrency(npoptkp)}</span>
                     </div>
                     <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                        <span>NPOP Kena Pajak</span>
                        <span className="font-bold text-slate-900">{formatCurrency(npopKenaPajak)}</span>
                     </div>
                     <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 mt-1">
                        <span className="text-blue-600 font-bold">BPHTB Terutang (5%)</span>
                        <span className="font-bold text-blue-600">{formatCurrency(bphtbAmount)}</span>
                     </div>
                  </div>
               </div>

               {/* Step 3: Biaya Legal (Optional) */}
               {includeLegalFees && (
                  <div className="relative pl-6 border-l-2 border-slate-100">
                     <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></div>
                     <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">3. Biaya Legal & Administrasi</h5>
                     <div className="bg-orange-50 p-5 rounded-xl text-sm font-medium text-slate-600 flex flex-col gap-2 border border-orange-100">
                        <div className="flex justify-between items-center">
                           <span>Jasa Notaris/PPAT ({(notaryRate*100)}%)</span>
                           <span className="font-bold text-slate-700">{formatCurrency(notaryFee)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span>PNBP Balik Nama (Rumus BPN)</span>
                           <span className="font-bold text-slate-700">{formatCurrency(pnbpFee)}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 italic">
                           *PNBP = ({formatCurrency(price)} / 1000) + Rp 50.000
                        </p>
                        <div className="flex justify-between items-center border-t border-orange-200 pt-2 mt-1">
                           <span className="text-orange-600 font-bold">Total Biaya Legal</span>
                           <span className="font-bold text-orange-600">{formatCurrency(totalLegalFees)}</span>
                        </div>
                     </div>
                  </div>
               )}

            </div>
         )}
      </div>
    </div>
  );
};

export default CalculatorBPHTB;
