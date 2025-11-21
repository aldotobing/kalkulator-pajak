
import React, { useState } from 'react';
import { TAX_CODES, TaxCodeItem } from '../constants';
import { Search, Copy, Check, Hash, Info, Link } from './Icons';

const TaxCodeFinder: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'PPH' | 'PPN' | 'FINAL' | 'SANKSI'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'ALL', label: 'Semua' },
    { id: 'PPH', label: 'PPh (Umum)' },
    { id: 'FINAL', label: 'PPh Final' },
    { id: 'PPN', label: 'PPN' },
    { id: 'SANKSI', label: 'Denda/STP' },
  ];

  const filteredCodes = TAX_CODES.filter(item => {
    const matchesSearch = 
      item.kap.includes(searchTerm) || 
      item.kjs.includes(searchTerm) || 
      item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'PPH': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PPN': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'FINAL': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'SANKSI': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans text-slate-900">
      
      {/* Header Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="p-3.5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                  <Hash size={24} />
               </div>
               <div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-1">Direktori Kode Pajak</h2>
                  <p className="text-slate-500 text-sm">Cari kode KAP & KJS untuk pengisian e-Billing.</p>
               </div>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-72 relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Search size={18} />
               </div>
               <input 
                  type="text" 
                  placeholder="Cari 'Sewa', 'Gaji', atau '411121'..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-bold text-sm text-slate-800 placeholder:text-slate-400"
               />
            </div>
         </div>

         {/* Category Filter Pills */}
         <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 slim-scrollbar">
            {categories.map(cat => (
               <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                     activeCategory === cat.id 
                     ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                     : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
               >
                  {cat.label}
               </button>
            ))}
         </div>
      </div>

      {/* Info Alert with Official Link */}
      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col md:flex-row gap-4 md:items-center justify-between">
         <div className="flex items-start gap-3">
            <div className="text-blue-500 mt-0.5"><Info size={18} /></div>
            <div className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Apa itu KAP & KJS?</strong>
                <p className="mt-1">
                    KAP (Kode Akun Pajak) dan KJS (Kode Jenis Setoran) adalah kode unik yang wajib dipilih saat membuat ID Billing agar pembayaran terekam dengan benar.
                </p>
            </div>
         </div>
         
         <a 
            href="https://pajak.go.id/kode-jenis-pajak-dan-kode-jenis-setoran" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm shrink-0 w-fit"
         >
            <Link size={14} />
            Referensi Resmi DJP
         </a>
      </div>

      {/* Results Grid */}
      {filteredCodes.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCodes.map((code, idx) => (
               <div 
                  key={`${code.kap}-${code.kjs}-${idx}`} 
                  className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group relative overflow-hidden"
               >
                  <div className="flex justify-between items-start mb-3">
                     <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wide ${getCategoryColor(code.category)}`}>
                        {code.category}
                     </span>
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                           onClick={() => handleCopy(`${code.kap} ${code.kjs}`, `both-${idx}`)}
                           className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                           title="Copy Both"
                        >
                           {copiedId === `both-${idx}` ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                        </button>
                     </div>
                  </div>
                  
                  <h3 className="font-bold text-slate-900 text-base mb-4 pr-6 leading-snug">
                     {code.desc}
                  </h3>

                  <div className="flex items-center gap-3">
                     {/* KAP BOX */}
                     <div 
                        className="flex-1 bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col relative group/kap cursor-pointer overflow-hidden" 
                        onClick={() => handleCopy(code.kap, `kap-${idx}`)}
                     >
                        <span className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">KAP</span>
                        <span className="font-mono font-bold text-slate-800 text-lg tracking-tight">{code.kap}</span>
                        
                        {/* Overlay */}
                        <div className={`absolute inset-0 transition-all duration-200 rounded-xl flex items-center justify-center gap-1 ${copiedId === `kap-${idx}` ? 'opacity-100 bg-emerald-50 border border-emerald-100' : 'opacity-0 group-hover/kap:opacity-100 bg-blue-50/90 backdrop-blur-[1px]'}`}>
                           {copiedId === `kap-${idx}` ? (
                              <>
                                 <Check size={12} className="text-emerald-600" />
                                 <span className="text-[10px] font-bold text-emerald-600">Tersalin</span>
                              </>
                           ) : (
                              <span className="text-[10px] font-bold text-blue-600">Salin KAP</span>
                           )}
                        </div>
                     </div>

                     <div className="w-px h-8 bg-slate-200"></div>

                     {/* KJS BOX */}
                     <div 
                        className="w-24 bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col relative group/kjs cursor-pointer overflow-hidden" 
                        onClick={() => handleCopy(code.kjs, `kjs-${idx}`)}
                     >
                        <span className="text-[9px] text-slate-400 uppercase font-bold mb-0.5">KJS</span>
                        <span className="font-mono font-bold text-slate-800 text-lg tracking-tight">{code.kjs}</span>
                        
                        {/* Overlay */}
                        <div className={`absolute inset-0 transition-all duration-200 rounded-xl flex items-center justify-center gap-1 ${copiedId === `kjs-${idx}` ? 'opacity-100 bg-emerald-50 border border-emerald-100' : 'opacity-0 group-hover/kjs:opacity-100 bg-blue-50/90 backdrop-blur-[1px]'}`}>
                           {copiedId === `kjs-${idx}` ? (
                              <>
                                 <Check size={12} className="text-emerald-600" />
                                 <span className="text-[10px] font-bold text-emerald-600">Tersalin</span>
                              </>
                           ) : (
                              <span className="text-[10px] font-bold text-blue-600">Salin</span>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      ) : (
         <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <Search size={24} />
            </div>
            <p className="text-slate-500 font-medium">Kode tidak ditemukan.</p>
         </div>
      )}

    </div>
  );
};

export default TaxCodeFinder;
