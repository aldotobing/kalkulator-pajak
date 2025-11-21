
import React, { useState, useEffect } from 'react';
import { INVESTMENT_RATES } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { TaxType } from '../types';
import { Bitcoin, TrendingUp, Coins, Landmark, CreditCard, RefreshCw, Info, Save, Check, Printer, Copy, Check as CheckIcon, ChevronDown } from './Icons';

interface Props {
  onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

type AssetType = 'CRYPTO' | 'STOCK' | 'GOLD' | 'BOND' | 'P2P';

const CalculatorInvestment: React.FC<Props> = ({ onContextUpdate }) => {
  const [amount, setAmount] = useState(10000000);
  const [displayAmount, setDisplayAmount] = useState(formatNumberInput(10000000));
  const [assetType, setAssetType] = useState<AssetType>('CRYPTO');
  
  // Crypto Specific
  const [isRegistered, setIsRegistered] = useState(true); // Bappebti Registered?
  
  // Gold/P2P Specific
  const [hasNPWP, setHasNPWP] = useState(true);

  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Logic
  let taxAmount = 0;
  let rateDescription = '';
  let legalBasis = '';
  let resultDetails = [];

  switch (assetType) {
    case 'CRYPTO':
      const cryptoRates = isRegistered ? INVESTMENT_RATES.CRYPTO.REGISTERED : INVESTMENT_RATES.CRYPTO.UNREGISTERED;
      const pphCrypto = amount * cryptoRates.pph;
      const ppnCrypto = amount * cryptoRates.ppn;
      taxAmount = pphCrypto + ppnCrypto;
      rateDescription = isRegistered 
        ? `Exchange Terdaftar: PPh ${(cryptoRates.pph*100).toFixed(1)}% + PPN ${(cryptoRates.ppn*100).toFixed(2)}%`
        : `Exchange Non-Terdaftar: PPh ${(cryptoRates.pph*100).toFixed(1)}% + PPN ${(cryptoRates.ppn*100).toFixed(2)}%`;
      legalBasis = 'PMK 68/PMK.03/2022';
      resultDetails.push({ label: 'PPh 22 Final', val: pphCrypto });
      resultDetails.push({ label: 'PPN', val: ppnCrypto });
      break;
      
    case 'STOCK':
      // Sell Tax 0.1%
      taxAmount = amount * INVESTMENT_RATES.STOCK.SELL;
      rateDescription = `PPh Final Penjualan Saham: ${(INVESTMENT_RATES.STOCK.SELL*100).toFixed(1)}%`;
      legalBasis = 'UU PPh Pasal 4 Ayat (2)';
      resultDetails.push({ label: 'PPh Final (0.1%)', val: taxAmount });
      break;
      
    case 'GOLD':
      // Buy Tax
      const goldRate = hasNPWP ? INVESTMENT_RATES.GOLD.BUY_NPWP : INVESTMENT_RATES.GOLD.BUY_NON_NPWP;
      taxAmount = amount * goldRate;
      rateDescription = `PPh 22 Pembelian Emas (${hasNPWP ? 'NPWP' : 'Non-NPWP'}): ${(goldRate*100).toFixed(2)}%`;
      legalBasis = 'PMK 48 Tahun 2023';
      resultDetails.push({ label: 'PPh 22', val: taxAmount });
      break;
      
    case 'BOND':
      // Interest/Coupon Tax
      taxAmount = amount * INVESTMENT_RATES.BOND.COUPON;
      rateDescription = `PPh Final Bunga Obligasi: ${(INVESTMENT_RATES.BOND.COUPON*100).toFixed(0)}%`;
      legalBasis = 'PP 91 Tahun 2021';
      resultDetails.push({ label: 'PPh Final', val: taxAmount });
      break;
      
    case 'P2P':
      // Lender Interest Tax
      const p2pRate = hasNPWP ? INVESTMENT_RATES.P2P.LENDER_NPWP : INVESTMENT_RATES.P2P.LENDER_NON_NPWP;
      taxAmount = amount * p2pRate;
      rateDescription = `PPh 23 Bunga P2P (${hasNPWP ? 'NPWP' : 'Non-NPWP'}): ${(p2pRate*100).toFixed(0)}%`;
      legalBasis = 'PMK 69/PMK.03/2022';
      resultDetails.push({ label: 'PPh 23', val: taxAmount });
      break;
  }

  const netReceived = amount - taxAmount; // Only relevant for P2P/Bonds/Stock(Sell) where tax is deducted. Crypto/Gold tax is usually added to buy price or deducted from asset. 
  // For simplification in this general calc: "Total Pajak" is the focus.

  useEffect(() => {
    onContextUpdate(`
      Kalkulator: Pajak Investasi & Aset Digital
      Jenis Aset: ${assetType}
      Nilai Transaksi/Bunga: ${formatCurrency(amount)}
      Status: ${isRegistered ? 'Terdaftar' : 'Non-Terdaftar'} (Crypto only), ${hasNPWP ? 'NPWP' : 'Non-NPWP'}
      Tarif: ${rateDescription}
      Total Pajak: ${formatCurrency(taxAmount)}
      Dasar Hukum: ${legalBasis}
    `);
  }, [amount, assetType, isRegistered, hasNPWP, taxAmount, rateDescription, legalBasis, onContextUpdate]);

  useEffect(() => { if (isSaved) setIsSaved(false); }, [amount, assetType, isRegistered, hasNPWP]);

  const handleReset = () => {
    setAmount(0);
    setDisplayAmount('');
    setAssetType('CRYPTO');
    setIsRegistered(true);
    setHasNPWP(true);
    setIsSaved(false);
  };

  const handleNumberChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const numVal = cleanVal ? parseInt(cleanVal) : 0;
    setAmount(numVal);
    setDisplayAmount(cleanVal ? new Intl.NumberFormat('id-ID').format(numVal) : '');
  };

  const handleSave = () => {
    const details = `
Jenis Aset: ${assetType}
Nilai Dasar: ${formatCurrency(amount)}
Kondisi: ${assetType === 'CRYPTO' ? (isRegistered ? 'Exchange Terdaftar' : 'Illegal/Foreign Exch') : (hasNPWP ? 'Ada NPWP' : 'Non NPWP')}
Tarif: ${rateDescription}
--------------------------------
Total Pajak: ${formatCurrency(taxAmount)}
    `.trim();

    saveHistoryItem({
      type: TaxType.INVESTMENT,
      title: `Pajak Investasi (${assetType})`,
      summary: `${formatCurrency(amount)}`,
      resultAmount: taxAmount,
      details: details
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopyResult = () => {
    const text = `
Estimasi Pajak Investasi (${assetType})
------------------
Nilai: ${formatCurrency(amount)}
Kategori: ${rateDescription}

Total Pajak: ${formatCurrency(taxAmount)}
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

  const tabs = [
    { id: 'CRYPTO', label: 'Kripto', icon: <Bitcoin size={18}/> },
    { id: 'STOCK', label: 'Saham', icon: <TrendingUp size={18}/> },
    { id: 'GOLD', label: 'Emas', icon: <Coins size={18}/> },
    { id: 'BOND', label: 'Obligasi', icon: <Landmark size={18}/> },
    { id: 'P2P', label: 'P2P', icon: <CreditCard size={18}/> },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-900 pb-12">
      
      {/* PRINT HEADER */}
      <div className="print-only mb-8 border-b-2 border-slate-800 pb-4">
         <div className="flex justify-between items-end">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Laporan Pajak Investasi</h1>
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
                   <Bitcoin size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Pajak Investasi</h2>
             </div>
             <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                <span>Hitung pajak Aset Kripto, Saham, Emas, dan P2P Lending.</span>
             </div>
          </div>

          <div className="space-y-6">
            
            {/* Asset Type Tabs */}
            <div>
               <label className={LABEL_STYLE}>Jenis Aset Investasi</label>
               <div className="flex bg-slate-50 border border-slate-200 p-1 rounded-xl overflow-x-auto slim-scrollbar">
                  {tabs.map((tab) => (
                     <button
                        key={tab.id}
                        onClick={() => setAssetType(tab.id as AssetType)}
                        className={`flex-1 min-w-[80px] py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${assetType === tab.id ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                     >
                        {tab.icon}
                        {tab.label}
                     </button>
                  ))}
               </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className={LABEL_STYLE}>
                 {assetType === 'CRYPTO' && 'Nilai Transaksi (Beli/Jual)'}
                 {assetType === 'STOCK' && 'Nilai Transaksi Penjualan'}
                 {assetType === 'GOLD' && 'Harga Pembelian Emas'}
                 {assetType === 'BOND' && 'Nilai Kupon/Bunga Diterima'}
                 {assetType === 'P2P' && 'Total Bunga Diterima'}
              </label>
              <div className={INPUT_CONTAINER_STYLE}>
                <span className={INPUT_ICON_STYLE}>Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayAmount}
                  onChange={(e) => handleNumberChange(e.target.value)}
                  className={INPUT_FIELD_STYLE}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Specific Toggles */}
            <div className="h-px bg-slate-100 my-4"></div>
            
            {assetType === 'CRYPTO' && (
               <div className="animate-fade-up">
                  <label className={LABEL_STYLE}>Platform Exchange</label>
                  <button
                     className={`w-full px-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-center gap-1 h-[60px] ${isRegistered ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                     onClick={() => setIsRegistered(!isRegistered)}
                  >
                     <div className="w-full flex justify-between items-center">
                        <span className={`font-bold text-sm block ${isRegistered ? 'text-blue-800' : 'text-slate-600'}`}>
                           {isRegistered ? 'Terdaftar Bappebti (Indodax, Tokocrypto, dll)' : 'Tidak Terdaftar / Luar Negeri (Binance, etc)'}
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isRegistered ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                           {isRegistered && <CheckIcon size={12} className="text-white"/>}
                        </div>
                     </div>
                     <span className={`text-[10px] font-medium ${isRegistered ? 'text-blue-600' : 'text-red-500'}`}>
                        {isRegistered ? 'Tarif Murah (0.21% Total)' : 'Tarif Ganda (0.42% Total)'}
                     </span>
                  </button>
               </div>
            )}

            {(assetType === 'GOLD' || assetType === 'P2P') && (
               <div className="animate-fade-up">
                  <label className={LABEL_STYLE}>Status NPWP Investor</label>
                  <button
                     className={`w-full px-4 rounded-xl border text-left transition-all duration-200 flex flex-col justify-center gap-1 h-[60px] ${hasNPWP ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                     onClick={() => setHasNPWP(!hasNPWP)}
                  >
                     <div className="w-full flex justify-between items-center">
                        <span className={`font-bold text-sm block ${hasNPWP ? 'text-blue-800' : 'text-slate-600'}`}>
                           {hasNPWP ? 'Memiliki NPWP' : 'Tidak Punya NPWP'}
                        </span>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${hasNPWP ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                           {hasNPWP && <CheckIcon size={12} className="text-white"/>}
                        </div>
                     </div>
                     <span className={`text-[10px] font-medium ${hasNPWP ? 'text-blue-600' : 'text-red-500'}`}>
                        {hasNPWP ? 'Tarif Normal' : 'Tarif Lebih Tinggi (Sanksi)'}
                     </span>
                  </button>
               </div>
            )}

          </div>
        </div>

        {/* Right Side: Result (Clean Dark Theme) */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Subtle Gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Pajak {assetType}</p>
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
                     {formatCurrency(taxAmount)}
                   </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 space-y-4">
                 {resultDetails.map((detail, idx) => (
                    <div key={idx} className={`flex justify-between items-center pb-2 ${idx < resultDetails.length - 1 ? 'border-b border-slate-700' : ''}`}>
                       <span className="text-slate-400 text-sm">{detail.label}</span>
                       <span className="text-lg font-bold text-white">{formatCurrency(detail.val)}</span>
                    </div>
                 ))}
              </div>

              <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
                 <div className="mt-0.5 text-blue-400"><Info size={16}/></div>
                 <div>
                    <p className="text-xs text-blue-100 leading-relaxed font-medium">
                       Dasar Hukum: {legalBasis}
                    </p>
                    <p className="text-[10px] text-blue-200/70 mt-1">
                       {rateDescription}
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
               <h4 className="text-xl md:text-2xl font-bold text-slate-900">Info Detail Aturan</h4>
            </div>
            <div className={`p-2 rounded-full border transition-all duration-300 ${showDetail ? 'rotate-180 bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-400'}`}>
               <ChevronDown size={16} />
            </div>
         </button>
         
         {showDetail && (
            <div className="px-6 md:px-8 pb-8 space-y-6 animate-enter">
               
               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
                  <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                     <Info size={16} className="text-blue-600"/>
                     Cara Kerja Pajak Investasi
                  </h5>
                  
                  {assetType === 'CRYPTO' && (
                     <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 font-medium">
                        <li>Pajak Kripto terdiri dari PPh Pasal 22 Final dan PPN.</li>
                        <li>Dipungut otomatis oleh Exchanger saat transaksi beli/jual/swap.</li>
                        <li>Jika exchange terdaftar di Bappebti, tarifnya setengah (0.21%) dibanding exchange ilegal/luar negeri (0.42%).</li>
                     </ul>
                  )}
                  
                  {assetType === 'STOCK' && (
                     <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 font-medium">
                        <li>Pajak Saham hanya dikenakan saat <strong>PENJUALAN</strong> (Selling).</li>
                        <li>Bersifat Final 0.1% dari nilai bruto transaksi.</li>
                        <li>Sudah dipotong otomatis oleh sekuritas/broker.</li>
                     </ul>
                  )}

                  {assetType === 'GOLD' && (
                     <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 font-medium">
                        <li>Dikenakan PPh 22 saat pembelian emas batangan (Antam dsb).</li>
                        <li>Jika punya NPWP tarif 0.25%, jika tidak 0.5%.</li>
                        <li>Saat penjualan kembali (Buyback) ke badan usaha, kena PPh 22 sebesar 1.5% (jika nilai > 10jt).</li>
                     </ul>
                  )}

                  {assetType === 'BOND' && (
                     <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 font-medium">
                        <li>Pajak atas Bunga Obligasi (SBN, ORI, Sukuk Ritel) kini lebih rendah: 10% Final.</li>
                        <li>Sebelumnya tarifnya 15%, turun sejak PP 91 Tahun 2021.</li>
                        <li>Dipotong saat bunga cair ke rekening.</li>
                     </ul>
                  )}

                  {assetType === 'P2P' && (
                     <ul className="list-disc list-inside text-sm text-slate-600 space-y-1 font-medium">
                        <li>Sebagai Lender, bunga yang diterima adalah objek PPh Pasal 23.</li>
                        <li>Tarif 15% untuk pemilik NPWP, 30% untuk non-NPWP.</li>
                        <li>Platform P2P legal wajib memotong pajak ini dan memberikan bukti potong.</li>
                     </ul>
                  )}
               </div>

            </div>
         )}
      </div>
    </div>
  );
};

export default CalculatorInvestment;
