
import React, { useState, useEffect } from 'react';
import { PTKP_BASE, PTKP_MARRIED, PTKP_PER_CHILD, PPH21_BRACKETS, MAX_BIAYA_JABATAN_ANNUAL } from '../constants';
import { formatCurrency } from '../services/taxLogic';
import { saveHistoryItem } from '../services/historyService';
import { MaritalStatus, TaxType } from '../types';
import { Scale, RefreshCw, Info, Save, Check, Printer, Copy, Check as CheckIcon, Award, Crown, Briefcase, PenTool, Factory } from './Icons';

interface Props {
  onContextUpdate: (ctx: string) => void;
}

// Helper for currency input display
const formatNumberInput = (value: number) => {
  if (value === 0) return '';
  return new Intl.NumberFormat('id-ID').format(value);
};

const CalculatorComparison: React.FC<Props> = ({ onContextUpdate }) => {
  const [annualIncome, setAnnualIncome] = useState(250000000); // 250jt
  const [displayAnnualIncome, setDisplayAnnualIncome] = useState(formatNumberInput(250000000));
  const [maritalStatus, setMaritalStatus] = useState(MaritalStatus.TK);
  const [children, setChildren] = useState(0);
  
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // --- Calculation Logic ---

  // Common PTKP
  let ptkp = PTKP_BASE;
  if (maritalStatus === MaritalStatus.K) ptkp += PTKP_MARRIED;
  ptkp += Math.min(children, 3) * PTKP_PER_CHILD;

  // Helper to calc Progressive Tax
  const calculateProgressive = (pkp: number) => {
    if (pkp <= 0) return 0;
    let remaining = pkp;
    let tax = 0;
    let prevLimit = 0;
    for (const b of PPH21_BRACKETS) {
      if (remaining <= 0) break;
      const range = b.limit - prevLimit;
      const taxable = Math.min(remaining, range);
      tax += taxable * b.rate;
      remaining -= taxable;
      prevLimit = b.limit;
    }
    return tax;
  };

  // 1. Karyawan (Employee)
  // Bruto - Biaya Jabatan (5% max 6jt) - PTKP
  const biayaJabatan = Math.min(annualIncome * 0.05, MAX_BIAYA_JABATAN_ANNUAL);
  const netKaryawan = annualIncome - biayaJabatan;
  const pkpKaryawan = Math.floor(Math.max(0, netKaryawan - ptkp) / 1000) * 1000;
  const taxKaryawan = calculateProgressive(pkpKaryawan);

  // 2. Freelancer (Norma 50% assumption for general pro)
  // Bruto * 50% - PTKP
  const netFreelancer = annualIncome * 0.50;
  const pkpFreelancer = Math.floor(Math.max(0, netFreelancer - ptkp) / 1000) * 1000;
  const taxFreelancer = calculateProgressive(pkpFreelancer);

  // 3. UMKM (Final 0.5%)
  // Bruto * 0.5%
  // Note: UMKM has 500jt threshold for OP exempt, but let's assume simple rate first or handle exemption?
  // Current Rule (UU HPP): OP UMKM < 500jt exempt.
  let taxUMKM = 0;
  if (annualIncome > 500000000) {
     taxUMKM = (annualIncome - 500000000) * 0.005;
  } else {
     taxUMKM = 0; // Bebas Pajak
  }

  // Find Winner (Lowest Tax)
  const taxes = [
    { id: 'KARYAWAN', label: 'Karyawan', val: taxKaryawan },
    { id: 'FREELANCER', label: 'Freelancer', val: taxFreelancer },
    { id: 'UMKM', label: 'Pemilik UMKM', val: taxUMKM }
  ];
  const minTax = Math.min(...taxes.map(t => t.val));
  const winner = taxes.find(t => t.val === minTax);

  useEffect(() => {
    onContextUpdate(`
      Komparasi Skema Pajak (Tax Planning)
      Penghasilan Setahun: ${formatCurrency(annualIncome)}
      Status: ${maritalStatus}/${children}
      
      Hasil Perbandingan:
      1. Karyawan (PPh 21): ${formatCurrency(taxKaryawan)}
      2. Freelancer (Norma 50%): ${formatCurrency(taxFreelancer)}
      3. UMKM (Final 0.5%): ${formatCurrency(taxUMKM)}
      
      Skema Paling Hemat: ${winner?.label} (Hemat ${formatCurrency(Math.max(taxKaryawan, taxFreelancer, taxUMKM) - minTax)})
    `);
  }, [annualIncome, maritalStatus, children, taxKaryawan, taxFreelancer, taxUMKM, winner, onContextUpdate]);

  useEffect(() => { if (isSaved) setIsSaved(false); }, [annualIncome, maritalStatus, children]);

  const handleReset = () => {
    setAnnualIncome(0);
    setDisplayAnnualIncome('');
    setMaritalStatus(MaritalStatus.TK);
    setChildren(0);
    setIsSaved(false);
  };

  const handleNumberChange = (val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const numVal = cleanVal ? parseInt(cleanVal) : 0;
    setAnnualIncome(numVal);
    setDisplayAnnualIncome(cleanVal ? new Intl.NumberFormat('id-ID').format(numVal) : '');
  };

  const handleSave = () => {
    const details = `
Penghasilan: ${formatCurrency(annualIncome)}
Status: ${maritalStatus}/${children}
--------------------------------
Karyawan: ${formatCurrency(taxKaryawan)}
Freelancer: ${formatCurrency(taxFreelancer)}
UMKM: ${formatCurrency(taxUMKM)}
Pemenang: ${winner?.label}
    `.trim();

    saveHistoryItem({
      type: TaxType.COMPARISON,
      title: 'Komparasi Pajak',
      summary: `Income ${formatCurrency(annualIncome)}`,
      resultAmount: minTax,
      details: details
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopyResult = () => {
    const text = `
Komparasi Beban Pajak Setahun
Income: ${formatCurrency(annualIncome)}
------------------
🏢 Karyawan: ${formatCurrency(taxKaryawan)}
🎨 Freelancer: ${formatCurrency(taxFreelancer)}
🏪 UMKM: ${formatCurrency(taxUMKM)}

✅ Paling Hemat: ${winner?.label}
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
  const SELECTOR_CONTAINER_STYLE = "flex bg-slate-50 border border-slate-200 p-1 rounded-xl h-[50px]";
  const SELECTOR_BTN_STYLE = (isActive: boolean) => `flex-1 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 flex items-center justify-center ${isActive ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`;

  const maxVal = Math.max(taxKaryawan, taxFreelancer, taxUMKM, 1); // Avoid div 0

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans text-slate-900 pb-12">
      
      {/* PRINT HEADER */}
      <div className="print-only mb-8 border-b-2 border-slate-800 pb-4">
         <div className="flex justify-between items-end">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Laporan Komparasi Pajak</h1>
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
                   <Scale size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Komparasi Skema Pajak</h2>
             </div>
             <div className="text-slate-500 text-sm flex items-center gap-1.5 flex-wrap leading-relaxed">
                <span>Bandingkan beban pajak antara Karyawan, Freelancer, dan UMKM.</span>
             </div>
          </div>

          <div className="space-y-6">
            {/* Income */}
            <div>
              <label className={LABEL_STYLE}>Penghasilan Bruto (Setahun)</label>
              <div className={INPUT_CONTAINER_STYLE}>
                <span className={INPUT_ICON_STYLE}>Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayAnnualIncome}
                  onChange={(e) => handleNumberChange(e.target.value)}
                  className={INPUT_FIELD_STYLE}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="h-px bg-slate-100 my-6"></div>

            {/* Status & Family */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={LABEL_STYLE}>Status Perkawinan</label>
                    <div className={SELECTOR_CONTAINER_STYLE}>
                    <button 
                        onClick={() => setMaritalStatus(MaritalStatus.TK)}
                        className={SELECTOR_BTN_STYLE(maritalStatus === MaritalStatus.TK)}
                    >
                        TK (Lajang)
                    </button>
                    <button 
                        onClick={() => setMaritalStatus(MaritalStatus.K)}
                        className={SELECTOR_BTN_STYLE(maritalStatus === MaritalStatus.K)}
                    >
                        K (Nikah)
                    </button>
                    <button 
                        onClick={() => setMaritalStatus(MaritalStatus.HB)}
                        className={SELECTOR_BTN_STYLE(maritalStatus === MaritalStatus.HB)}
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
                            onClick={() => setChildren(num)}
                            className={SELECTOR_BTN_STYLE(children === num)}
                        >
                            {num}
                        </button>
                    ))}
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Right Side: Result (Clean Dark Theme) */}
        <div className="md:w-5/12 bg-slate-900 text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Subtle Gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Skema Paling Hemat</p>
                   <button 
                      onClick={handleCopyResult} 
                      className="text-slate-500 hover:text-emerald-400 transition-colors no-print p-1.5 rounded-lg hover:bg-white/10"
                      title="Salin Hasil"
                   >
                      {isCopied ? <CheckIcon size={16} className="text-emerald-400" /> : <Copy size={16} />}
                   </button>
                </div>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
                      <Award size={24} />
                   </div>
                   <div>
                      <div className="text-white font-bold text-2xl tracking-tight">
                        {winner?.label}
                      </div>
                      <div className="text-emerald-400 text-xs font-bold">
                         Pajak Hanya {formatCurrency(winner?.val || 0)}
                      </div>
                   </div>
                </div>
              </div>

              {/* Comparison Bars */}
              <div className="space-y-5">
                 {taxes.map((t) => {
                    const isWinner = t.id === winner?.id;
                    const percentage = Math.max(5, (t.val / maxVal) * 100);
                    
                    return (
                       <div key={t.id} className="relative">
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                             <div className="flex items-center gap-1.5">
                                {t.id === 'KARYAWAN' && <Briefcase size={12} className="text-slate-400" />}
                                {t.id === 'FREELANCER' && <PenTool size={12} className="text-slate-400" />}
                                {t.id === 'UMKM' && <Factory size={12} className="text-slate-400" />}
                                <span className={isWinner ? 'text-white' : 'text-slate-400'}>{t.label}</span>
                             </div>
                             <span className={isWinner ? 'text-emerald-400' : 'text-slate-300'}>{formatCurrency(t.val)}</span>
                          </div>
                          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden w-full">
                             <div 
                                className={`h-full rounded-full transition-all duration-1000 ${isWinner ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                style={{ width: `${percentage}%` }}
                             ></div>
                          </div>
                       </div>
                    );
                 })}
              </div>

              <div className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-xl flex items-start gap-3">
                 <div className="mt-0.5 text-blue-400"><Info size={16}/></div>
                 <div>
                    <p className="text-xs text-blue-100 leading-relaxed">
                       <strong>UMKM (0.5%)</strong> biasanya paling hemat untuk omzet tinggi, namun ada batas waktu (3-7 tahun) sebelum wajib pakai pembukuan. 
                       <br/><span className="opacity-70">Freelancer menggunakan asumsi Norma 50%.</span>
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
    </div>
  );
};

export default CalculatorComparison;
