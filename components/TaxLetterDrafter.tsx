
import React, { useState, useEffect } from 'react';
import { generateTaxLetter } from '../services/geminiService';
import { FileSignature, Feather, Printer, Copy, Check, RefreshCw, Mail, AlertCircle, User, Building2, PenTool, Trash2, FileText, Download } from './Icons';

interface Props {
  onContextUpdate?: (ctx: string) => void;
}

const LETTER_TYPES = [
  { id: 'SP2DK', label: 'Tanggapan SP2DK (Klarifikasi Data)', desc: 'Balasan atas Surat Permintaan Penjelasan Data/Keterangan.' },
  { id: 'ANGSURAN', label: 'Permohonan Angsuran Pajak', desc: 'Mengajukan cicilan pembayaran utang pajak (Pasal 9).' },
  { id: 'SANKSI', label: 'Permohonan Pengurangan Sanksi', desc: 'Meminta keringanan denda administrasi (Pasal 36).' },
  { id: 'PERNYATAAN', label: 'Surat Pernyataan Harta/Penghasilan', desc: 'Deklarasi kepemilikan aset atau sumber income.' },
  { id: 'NON_EFEKTIF', label: 'Permohonan Non-Efektif (NE)', desc: ' Menonaktifkan NPWP sementara karena tidak ada kegiatan.' },
  { id: 'UMUM', label: 'Surat Umum Lainnya', desc: 'Kebutuhan korespondensi pajak lainnya.' },
];

const REASON_TEMPLATES = [
  { label: 'Lupa Lapor', text: 'Saya lupa melaporkan SPT Tahunan tepat waktu dikarenakan kesibukan pekerjaan yang mendesak, namun saya berkomitmen untuk segera menyelesaikannya.' },
  { label: 'Sakit / Musibah', text: 'Saya mengalami sakit (rawat inap) selama 2 minggu pada saat batas waktu pelaporan, sehingga terlewat untuk melakukan pelaporan pajak tepat waktu.' },
  { label: 'Beda Data Omzet', text: 'Terdapat perbedaan data omzet antara SPT dan data DJP dikarenakan adanya retur penjualan yang belum tercatat dalam sistem perpajakan.' },
  { label: 'Keuangan Menurun', text: 'Kondisi arus kas (cashflow) perusahaan sedang menurun drastis akibat penurunan order klien, sehingga kami memohon perpanjangan waktu pembayaran.' },
  { label: 'Kesalahan Admin', text: 'Terjadi kesalahan input administratif oleh staf keuangan kami yang baru, dan kami bermaksud melakukan pembetulan SPT.' },
  { label: 'Harta Warisan', text: 'Aset berupa tanah/bangunan tersebut adalah harta warisan yang baru saja selesai proses balik nama tahun ini, bukan pembelian baru.' },
];

const TaxLetterDrafter: React.FC<Props> = ({ onContextUpdate }) => {
  // Form State
  const [letterType, setLetterType] = useState(LETTER_TYPES[0].id);
  const [name, setName] = useState('');
  const [npwp, setNpwp] = useState('');
  const [address, setAddress] = useState('');
  const [recipient, setRecipient] = useState('Kepala KPP Pratama ...');
  const [keyFacts, setKeyFacts] = useState('');
  
  // Result State
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Update AI Context
  useEffect(() => {
    if (onContextUpdate) {
      onContextUpdate(`
        User sedang menggunakan: AI Tax Letter Drafter (Pembuat Surat Resmi)
        Jenis Surat: ${LETTER_TYPES.find(t => t.id === letterType)?.label}
        Identitas Pengirim: ${name} (${npwp || 'Tanpa NPWP'})
        Tujuan: ${recipient}
        Alasan Utama: ${keyFacts || '(Belum diisi)'}
        
        Status: ${generatedLetter ? 'Draft sudah dibuat' : 'Sedang mengisi form'}
      `);
    }
  }, [letterType, name, npwp, recipient, keyFacts, generatedLetter, onContextUpdate]);

  const handleGenerate = async () => {
    if (!name || !keyFacts) return;
    
    setIsGenerating(true);
    setGeneratedLetter(''); // Clear previous
    
    try {
      const stream = generateTaxLetter(
        LETTER_TYPES.find(t => t.id === letterType)?.label || 'Surat Pajak',
        { name, npwp, address },
        recipient,
        keyFacts
      );

      for await (const chunk of stream) {
        setGeneratedLetter(prev => prev + chunk);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleResetLetter = () => {
    if (window.confirm('Hapus draft surat ini?')) {
      setGeneratedLetter('');
    }
  };

  const applyTemplate = (text: string) => {
    setKeyFacts(text);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 font-sans text-slate-900">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         
         {/* LEFT: INPUT FORM */}
         <div className="lg:col-span-5 space-y-6 no-print">
            
            {/* Type Selector */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Jenis Surat</label>
               <div className="space-y-2">
                  {LETTER_TYPES.map(type => (
                     <button
                        key={type.id}
                        onClick={() => setLetterType(type.id)}
                        className={`w-full p-3 rounded-xl text-left transition-all border ${letterType === type.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                     >
                        <div className="flex items-center gap-3">
                           <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${letterType === type.id ? 'border-blue-600' : 'border-slate-300'}`}>
                              {letterType === type.id && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                           </div>
                           <div>
                              <span className={`block text-sm font-bold ${letterType === type.id ? 'text-blue-900' : 'text-slate-700'}`}>{type.label}</span>
                              <span className="block text-[10px] text-slate-400 leading-tight mt-0.5">{type.desc}</span>
                           </div>
                        </div>
                     </button>
                  ))}
               </div>
            </div>

            {/* Sender Info */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><User size={16}/></div>
                  <div>
                     <h3 className="text-sm font-bold text-slate-900">Data Pengirim</h3>
                     <p className="text-[10px] text-slate-400">Info Wajib Pajak (Anda)</p>
                  </div>
               </div>
               
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Nama Lengkap / Badan Usaha</label>
                  <input 
                     type="text" 
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 transition-all"
                     placeholder="Cth: Budi Santoso / PT Maju Jaya"
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">NPWP (Opsional)</label>
                  <input 
                     type="text" 
                     value={npwp}
                     onChange={(e) => setNpwp(e.target.value)}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 transition-all"
                     placeholder="00.000.000.0-000.000"
                  />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Alamat Surat (Kota)</label>
                  <input 
                     type="text" 
                     value={address}
                     onChange={(e) => setAddress(e.target.value)}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 transition-all"
                     placeholder="Cth: Jakarta Selatan"
                  />
               </div>
            </div>

            {/* Recipient Info */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
               <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg"><Building2 size={16}/></div>
                  <div>
                     <h3 className="text-sm font-bold text-slate-900">Tujuan Surat</h3>
                     <p className="text-[10px] text-slate-400">Kepada siapa surat ini ditujukan?</p>
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Nama Jabatan / KPP</label>
                  <input 
                     type="text" 
                     value={recipient}
                     onChange={(e) => setRecipient(e.target.value)}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm font-semibold text-slate-800 placeholder:text-slate-400 transition-all"
                     placeholder="Kepala KPP Pratama..."
                  />
               </div>
            </div>

            {/* Context Input */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><PenTool size={16}/></div>
                  <h3 className="text-sm font-bold text-slate-900">Alasan / Fakta Utama</h3>
               </div>
               
               <textarea 
                  value={keyFacts}
                  onChange={(e) => setKeyFacts(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-800 placeholder:text-slate-400 transition-all min-h-[150px] resize-none"
                  placeholder="Ceritakan kronologi atau alasan pengajuan surat..."
               />
               
               {/* Quick Templates */}
               <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Template Alasan Cepat:</p>
                  <div className="flex flex-wrap gap-2">
                     {REASON_TEMPLATES.map((tpl, idx) => (
                        <button
                           key={idx}
                           onClick={() => applyTemplate(tpl.text)}
                           className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-bold transition-colors"
                        >
                           {tpl.label}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Generate Button */}
            <button
               onClick={handleGenerate}
               disabled={isGenerating || !name || !keyFacts}
               className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg ${isGenerating || !name || !keyFacts ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-blue-500/30 hover:scale-[1.02]'}`}
            >
               {isGenerating ? (
                  <>
                     <RefreshCw size={20} className="animate-spin"/>
                     Sedang Menyusun Draft...
                  </>
               ) : (
                  <>
                     <Feather size={20} />
                     Buat Draft Surat
                  </>
               )}
            </button>

         </div>

         {/* RIGHT: WORD EDITOR PREVIEW */}
         <div className="lg:col-span-7 w-full h-full flex flex-col">
            
            {/* Editor Toolbar */}
            <div className="bg-white border border-slate-200 border-b-0 rounded-t-2xl p-3 flex items-center justify-between shadow-sm relative z-10 no-print">
               <div className="flex items-center gap-3 px-2">
                  <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg">
                     <FileText size={18} />
                  </div>
                  <div>
                     <h3 className="text-sm font-bold text-slate-900">Editor Surat</h3>
                     <p className="text-[10px] text-slate-400">Edit teks langsung sebelum dicetak</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-2">
                  <button 
                     onClick={handleResetLetter}
                     disabled={!generatedLetter}
                     className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                     title="Hapus Draft"
                  >
                     <Trash2 size={18} />
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <button 
                     onClick={handleCopy}
                     disabled={!generatedLetter}
                     className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-bold disabled:opacity-50"
                  >
                     {isCopied ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} />}
                     Salin
                  </button>
                  <button 
                     onClick={() => window.print()}
                     disabled={!generatedLetter}
                     className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors text-xs font-bold shadow-md shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                  >
                     <Printer size={16} />
                     Cetak / PDF
                  </button>
               </div>
            </div>

            {/* Editor Area */}
            <div className="bg-white rounded-b-2xl border border-slate-200 shadow-xl overflow-hidden flex-1 min-h-[700px] relative">
               
               {generatedLetter ? (
                  <>
                     {/* Interactive Textarea for Editing */}
                     <textarea 
                        value={generatedLetter}
                        onChange={(e) => setGeneratedLetter(e.target.value)}
                        className="w-full h-full p-8 md:p-12 outline-none text-slate-900 font-serif text-sm leading-relaxed resize-none block no-print bg-transparent relative z-10"
                        spellCheck={false}
                     />
                     
                     {/* Print Version (Hidden normally, visible on print) */}
                     {/* Use div for print to ensure auto-height and no scrollbars */}
                     <div className="print-only absolute inset-0 p-0 m-0 whitespace-pre-wrap font-serif text-sm leading-relaxed text-black bg-white z-50">
                        {generatedLetter}
                     </div>
                  </>
               ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-50/30">
                     <div className="p-6 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 mb-4">
                        <Mail size={48} className="opacity-30" />
                     </div>
                     <p className="text-sm font-sans font-medium text-slate-400">Draft surat akan muncul di sini</p>
                     <p className="text-xs text-slate-400 mt-1">Silakan isi formulir di samping</p>
                  </div>
               )}

               {/* Watermark Draft (Visual Only) */}
               {!generatedLetter && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 text-[10rem] font-black text-slate-100 pointer-events-none select-none z-0">
                     DRAFT
                  </div>
               )}
            </div>

         </div>

      </div>
    </div>
  );
};

export default TaxLetterDrafter;
