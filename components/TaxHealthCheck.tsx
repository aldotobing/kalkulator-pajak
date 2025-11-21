
import React, { useState, useEffect } from 'react';
import { INDUSTRY_BENCHMARKS } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { TaxType } from '../types';
import { Activity, RefreshCw, Info, Save, Check, Printer, Copy, Check as CheckIcon, ShieldCheck, ShieldAlert, Stethoscope, ChevronDown, TrendingUp } from './Icons';

interface Props {
  onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const TaxHealthCheck: React.FC<Props> = ({ onContextUpdate }) => {
  const [industryId, setIndustryId] = useState(INDUSTRY_BENCHMARKS[0].id);
  const [omzet, setOmzet] = useState(2000000000); // 2M
  const [displayOmzet, setDisplayOmzet] = useState(formatNumberInput(2000000000));
  
  const [netProfit, setNetProfit] = useState(150000000); // 150jt
  const [displayNetProfit, setDisplayNetProfit] = useState(formatNumberInput(150000000));
  
  const [taxPaid, setTaxPaid] = useState(10000000); // 10jt (e.g. Final 0.5%)
  const [displayTaxPaid, setDisplayTaxPaid] = useState(formatNumberInput(10000000));

  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Logic
  const industry = INDUSTRY_BENCHMARKS.find(i => i.id === industryId) || INDUSTRY_BENCHMARKS[0];
  
  // Ratios
  const npm = omzet > 0 ? netProfit / omzet : 0; // Net Profit Margin
  const cttor = omzet > 0 ? taxPaid / omzet : 0; // Corporate Tax to Turnover Ratio (Effective Tax Rate)

  // Scoring Logic (Simplified CRM Risk Model)
  // 1. NPM Check
  let npmScore = 0;
  let npmStatus = '';
  if (npm >= industry.safeMin) {
     npmScore = 100;
     npmStatus = 'SAFE';
  } else if (npm >= industry.safeMin * 0.5) {
     npmScore = 50;
     npmStatus = 'WARNING';
  } else {
     npmScore = 20;
     npmStatus = 'DANGER';
  }

  // 2. Tax Payment Check (CTTOR)
  // Benchmark: Should be at least 0.5% (Final) or approx 1-2% (Normal Regime) depending on margin
  let taxScore = 0;
  const minTaxRate = 0.005; // 0.5% minimum logical floor
  if (cttor >= minTaxRate) {
     taxScore = 100;
  } else {
     taxScore = (cttor / minTaxRate) * 100;
  }

  // Total Health Score
  const healthScore = Math.round((npmScore * 0.6) + (taxScore * 0.4)); // NPM is weighted higher for SP2DK trigger logic often
  
  let riskLevel = '';
  let riskColor = '';
  if (healthScore >= 80) {
     riskLevel = 'Rendah (Aman)';
     riskColor = 'text-emerald-500';
  } else if (healthScore >= 50) {
     riskLevel = 'Sedang (Waspada)';
     riskColor = 'text-amber-500';
  } else {
     riskLevel = 'Tinggi (Berisiko)';
     riskColor = 'text-red-500';
  }

  useEffect(() => {
    onContextUpdate(`
      Cek Kesehatan Pajak (Tax Health Check)
      Industri: ${industry.label}
      Omzet: ${formatCurrency(omzet)}
      Laba Bersih: ${formatCurrency(netProfit)}
      Pajak Dibayar: ${formatCurrency(taxPaid)}
      
      Analisis Rasio:
      NPM (Net Profit Margin): ${(npm * 100).toFixed(2)}% (Benchmark: ${(industry.safeMin * 100)}% - ${(industry.safeMax * 100)}%)
      CTTOR (Tax/Omzet): ${(cttor * 100).toFixed(2)}%
      
      Hasil Diagnosa:
      Skor Kepatuhan: ${healthScore}/100
      Tingkat Risiko SP2DK: ${riskLevel}
      Status Margin: ${npmStatus}
    `);
  }, [omzet, netProfit, taxPaid, industryId, npm, cttor, healthScore, riskLevel, npmStatus, onContextUpdate]);

  useEffect(() => { if (isSaved) setIsSaved(false); }, [omzet, netProfit, taxPaid, industryId]);

  const handleReset = () => {
    setOmzet(0); setDisplayOmzet('');
    setNetProfit(0); setDisplayNetProfit('');
    setTaxPaid(0); setDisplayTaxPaid('');
    setIndustryId(INDUSTRY_BENCHMARKS[0].id);
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
Industri: ${industry.label}
Omzet: ${formatCurrency(omzet)}
Laba: ${formatCurrency(netProfit)}
Pajak: ${formatCurrency(taxPaid)}
--------------------------------
NPM: ${(npm*100).toFixed(2)}%
Risiko: ${riskLevel}
Skor: ${healthScore}
    `.trim();

    saveHistoryItem({
      type: TaxType.TAX_HEALTH,
      title: 'Cek Kesehatan Pajak',
      summary: `Skor ${healthScore} - ${riskLevel}`,
      resultAmount: healthScore, // Storing score as amount for list view
      details: details
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopyResult = () => {
    const text = `
Hasil Cek Kesehatan Pajak
------------------
Industri: ${industry.label}
NPM Anda: ${(npm*100).toFixed(2)}%
Benchmark Aman: ${(industry.safeMin*100)}% - ${(industry.safeMax*100)}%

Skor Kepatuhan: ${healthScore}/100
Tingkat Risiko: ${riskLevel}
    `.trim();
    
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Styles
  const LABEL_STYLE = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1";
  const INPUT_CONTAINER_STYLE = "relative group";
  const INPUT_FIELD_STYLE = "w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl outline-none transition-all font-bold text-base text-slate-900 placeholder:text-slate-300 h-[50px]";
  const INPUT_ICON_STYLE = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm no-print group-focus-within:text-blue-500 transition-colors";

  // Gauge Color Logic
  const getGaugeColor = () => {
     if (healthScore >= 80) return '#10b981'; // Emerald
     if (healthScore >= 50) return '#f59e0b'; // Amber
     return '#ef4444'; // Red
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-900 pb-12">
      
      {/* PRINT HEADER */}
      <div className="print-only mb-8 border-b-2 border-slate-800 pb-4">
         <div className="flex justify-between items-end">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Laporan Kesehatan Pajak (Risk Check)</h1>
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
                   <Activity size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Cek Kesehatan Pajak</h2>
             </div>
             <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                <span>Simulator risiko pemeriksaan (SP2DK) berdasarkan rasio keuangan.</span>
             </div>
          </div>

          <div className="space-y-6">
            
            {/* Industry */}
            <div>
              <label className={LABEL_STYLE}>Jenis Industri / Usaha</label>
              <div className="relative">
                 <select
                  value={industryId}
                  onChange={(e) => setIndustryId(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer text-base h-[50px]"
                >
                  {INDUSTRY_BENCHMARKS.map(i => (
                    <option key={i.id} value={i.id}>{i.label}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 no-print"><ChevronDown size={18} /></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 ml-1 flex items-center gap-1">
                 <Info size={12}/> Benchmark profit berbeda tiap industri.
              </p>
            </div>

            <div className="h-px bg-slate-100 my-4"></div>

            {/* Financials */}
            <div>
              <label className={LABEL_STYLE}>Omzet Bruto (Setahun)</label>
              <div className={INPUT_CONTAINER_STYLE}>
                <span className={INPUT_ICON_STYLE}>Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayOmzet}
                  onChange={(e) => handleNumberChange(setOmzet, setDisplayOmzet, e.target.value)}
                  className={INPUT_FIELD_STYLE}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className={LABEL_STYLE}>Laba Bersih (Net Profit)</label>
              <div className={INPUT_CONTAINER_STYLE}>
                <span className={INPUT_ICON_STYLE}>Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayNetProfit}
                  onChange={(e) => handleNumberChange(setNetProfit, setDisplayNetProfit, e.target.value)}
                  className={INPUT_FIELD_STYLE}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className={LABEL_STYLE}>Total Pajak Dibayar (Setahun)</label>
              <div className={INPUT_CONTAINER_STYLE}>
                <span className={INPUT_ICON_STYLE}>Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayTaxPaid}
                  onChange={(e) => handleNumberChange(setTaxPaid, setDisplayTaxPaid, e.target.value)}
                  className={INPUT_FIELD_STYLE}
                  placeholder="0"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 ml-1">
                 Total PPh Final + PPh 25/29 Badan yang disetor ke negara.
              </p>
            </div>

          </div>
        </div>

        {/* Right Side: Dashboard Visuals */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Subtle Gradient */}
            <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[80px] pointer-events-none transition-colors duration-700 ${healthScore >= 80 ? 'bg-emerald-600/20' : healthScore >= 50 ? 'bg-amber-600/20' : 'bg-red-600/20'}`}></div>

            <div className="relative z-10 flex flex-col items-center text-center mt-4">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Skor Kepatuhan & Risiko</h3>
               
               {/* SVG Gauge Visual */}
               <div className="relative w-56 h-28 mb-2 flex items-end justify-center">
                  <svg viewBox="0 0 200 105" className="w-full h-full">
                    {/* Background Track */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#1e293b" 
                      strokeWidth="20"
                      strokeLinecap="round"
                    />
                    {/* Active Progress */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke={getGaugeColor()}
                      strokeWidth="20"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - ((healthScore / 100) * 251.2)}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  
                  {/* Score Text Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center -mb-2">
                     <span className="text-5xl font-black tracking-tighter text-white drop-shadow-lg" style={{ color: getGaugeColor() }}>
                        {healthScore}
                     </span>
                     <span className="text-xs text-slate-500 font-bold block mt-1">/ 100</span>
                  </div>
               </div>

               <div className="mt-6 bg-slate-800/50 px-6 py-3 rounded-xl border border-white/10 backdrop-blur-sm">
                  <p className="text-xs text-slate-400 uppercase font-bold mb-1">Status Risiko</p>
                  <p className={`text-lg font-bold tracking-tight ${riskColor}`}>{riskLevel}</p>
               </div>
            </div>

            <div className="relative z-10 space-y-4 mt-8">
               
               {/* Comparison Card */}
               <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700 backdrop-blur-sm">
                  <div className="flex items-start gap-2 mb-3">
                     <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
                     <div>
                        <h4 className="text-xs font-bold text-blue-100 uppercase tracking-wider mb-1">Standar Industri {industry.label}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                           Idealnya, bisnis {industry.label} memiliki margin laba bersih di kisaran:
                        </p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-800 mb-4">
                     <span className="text-xs text-slate-500 font-medium">Target Ideal</span>
                     <span className="text-lg font-bold text-white">
                        {(industry.safeMin * 100)}% 
                        <span className="text-slate-600 text-xs font-normal mx-1">s.d.</span> 
                        {(industry.safeMax * 100)}%
                     </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="relative pt-4 pb-2">
                     <div className="h-3 bg-slate-700 rounded-full overflow-hidden relative w-full">
                        {/* Safe Zone Green Area */}
                        <div 
                           className="absolute top-0 bottom-0 bg-emerald-500/30 border-l border-r border-emerald-500/50"
                           style={{ 
                              left: `${(industry.safeMin / (industry.safeMax * 2.5)) * 100}%`, 
                              width: `${((industry.safeMax - industry.safeMin) / (industry.safeMax * 2.5)) * 100}%` 
                           }}
                        ></div>
                        
                        {/* User Marker Dot */}
                        <div 
                           className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-[0_0_10px_currentColor] transition-all duration-1000 ${npmStatus === 'SAFE' ? 'bg-emerald-500' : npmStatus === 'WARNING' ? 'bg-amber-500' : 'bg-red-500'}`}
                           style={{ left: `clamp(0%, ${(npm / (industry.safeMax * 2.5)) * 100}%, 100%)` }}
                        ></div>
                     </div>
                     
                     {/* Legend / Labels under bar */}
                     <div className="flex justify-between text-[9px] text-slate-500 mt-1.5 font-bold uppercase tracking-wider">
                        <span>0%</span>
                        <span className={npmStatus === 'SAFE' ? 'text-emerald-400' : npmStatus === 'WARNING' ? 'text-amber-400' : 'text-red-400'}>
                           Posisi Anda: {(npm * 100).toFixed(1)}%
                        </span>
                        <span>{(industry.safeMax * 2.5 * 100).toFixed(0)}%+</span>
                     </div>
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

      {/* Diagnosis Accordion */}
      <div className="rounded-[2rem] bg-white shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden mt-6">
         <button 
            onClick={() => setShowDetail(!showDetail)}
            className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-slate-50 transition-colors group"
         >
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                  <Stethoscope size={18}/>
               </div>
               <h4 className="text-xl md:text-2xl font-bold text-slate-900">Diagnosa & Rekomendasi</h4>
            </div>
            <div className={`p-2 rounded-full border transition-all duration-300 ${showDetail ? 'rotate-180 bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-400'}`}>
               <ChevronDown size={16} />
            </div>
         </button>
         
         {showDetail && (
            <div className="px-6 md:px-8 pb-8 space-y-6 animate-enter">
               
               {/* Main Analysis */}
               <div className={`p-5 rounded-2xl border flex gap-4 ${healthScore >= 80 ? 'bg-emerald-50 border-emerald-100' : healthScore >= 50 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'}`}>
                  <div className={`shrink-0 mt-1 ${healthScore >= 80 ? 'text-emerald-600' : healthScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                     {healthScore >= 80 ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                  </div>
                  <div>
                     <h5 className="font-bold text-slate-900 text-base mb-1">Analisis Margin Laba (NPM)</h5>
                     <p className="text-sm text-slate-600 leading-relaxed">
                        Margin laba bersih Anda adalah <strong>{(npm*100).toFixed(2)}%</strong>. 
                        {npm < industry.safeMin ? (
                           ` Angka ini DIBAWAH rata-rata industri ${industry.label} (${(industry.safeMin*100)}% - ${(industry.safeMax*100)}%). Hal ini dapat memicu kecurigaan bahwa omzet tidak dilaporkan sepenuhnya atau biaya digelembungkan.`
                        ) : npm > industry.safeMax ? (
                           ` Angka ini DIATAS rata-rata industri. Ini bagus secara bisnis, namun pastikan pajak yang dibayar proporsional agar tidak dianggap kurang bayar.`
                        ) : (
                           ` Angka ini berada dalam rentang WAJAR (Benchmark) untuk industri ${industry.label}. Pertahankan kepatuhan pelaporan.`
                        )}
                     </p>
                  </div>
               </div>

               {/* Recommendations */}
               <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <h5 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
                     Tips Kepatuhan (CRM DJP)
                  </h5>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 font-medium">
                     <li>Pastikan rasio pajak terhadap omzet (CTTOR) minimal setara dengan tarif UMKM (0.5%) atau wajar sesuai PPh Badan.</li>
                     <li>Jika NPM terlalu rendah karena kerugian riil, siapkan bukti pendukung (Faktur, Bon) yang valid jika diperiksa (SP2DK).</li>
                     <li>Pastikan PPN Keluaran dan PPN Masukan seimbang dengan omzet yang dilaporkan di SPT PPh Badan (Ekualisasi).</li>
                  </ul>
               </div>

               <div className="text-center pt-2">
                  <p className="text-[10px] text-slate-400 italic">
                     *Hasil ini adalah simulasi berdasarkan rasio umum (Benchmarking). Risiko pemeriksaan DJP bergantung pada banyak faktor lain.
                  </p>
               </div>

            </div>
         )}
      </div>
    </div>
  );
};

export default TaxHealthCheck;
    