
import React, { useState, useEffect } from 'react';
import { CalendarDays, Bell, CheckCircle2, AlertCircle, Clock, CalendarCheck, Banknote, FileText, ArrowRight, ChevronRight } from './Icons';

interface Deadline {
  day: number;
  title: string;
  description: string;
  type: 'PAYMENT' | 'REPORTING' | 'ANNUAL';
}

const DEADLINES: Deadline[] = [
  { day: 10, title: 'Penyetoran PPh Masa', description: 'Batas setor PPh 21/26, 23/26, 4(2), 15 bulan sebelumnya.', type: 'PAYMENT' },
  { day: 15, title: 'Penyetoran PPh 25', description: 'Angsuran PPh Pasal 25 orang pribadi/badan.', type: 'PAYMENT' },
  { day: 20, title: 'Pelaporan SPT Masa PPh', description: 'Lapor SPT Masa PPh Pasal 21/26, 23/26, 4(2), 15.', type: 'REPORTING' },
  { day: 30, title: 'Pelaporan SPT Masa PPN', description: 'Batas akhir lapor PPN masa bulan sebelumnya.', type: 'REPORTING' },
];

const TaxCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Annual SPT Logic
  const currentYear = currentDate.getFullYear();
  const sptOpDeadline = new Date(currentYear, 2, 31); // March 31
  
  const getDaysRemaining = (target: Date) => {
    const diff = target.getTime() - currentDate.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const daysToSptOp = getDaysRemaining(sptOpDeadline);

  // Formatting
  const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(currentDate);
  const todayDay = currentDate.getDate();

  // Determine status of monthly deadlines
  const getStatus = (deadlineDay: number) => {
    if (todayDay > deadlineDay) return 'PASSED';
    if (todayDay === deadlineDay) return 'TODAY';
    if (todayDay >= deadlineDay - 3) return 'SOON';
    return 'UPCOMING';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      
      {/* PRINT HEADER */}
      <div className="print-only mb-8 border-b-2 border-slate-800 pb-4">
         <div className="flex justify-between items-end">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Kalender Pajak Indonesia</h1>
               <p className="text-sm text-slate-500">Jadwal Kepatuhan {monthName} {currentYear}</p>
            </div>
            <div className="text-right">
               <p className="text-xs font-bold text-slate-400 uppercase">Tanggal Cetak</p>
               <p className="text-sm font-medium text-slate-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
            </div>
         </div>
      </div>

      {/* HERO SECTION: Annual SPT Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SPT Countdown Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-blue-950 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20 border border-slate-800 group">
          {/* Ambient Effects */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl group-hover:bg-blue-500/20 transition-colors duration-700"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider shadow-sm mb-3">
                    <AlertCircle size={12} />
                    Prioritas Utama
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">SPT Tahunan Pribadi</h2>
                  <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                    Kewajiban pelaporan pajak penghasilan Orang Pribadi untuk tahun pajak {currentYear - 1}.
                  </p>
               </div>
               
               {/* Circular Counter Visual */}
               <div className="relative hidden md:flex items-center justify-center w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                    <path className="text-blue-500" strokeDasharray={`${Math.max(0, Math.min(100, (daysToSptOp / 90) * 100))}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                     <span className="text-xs font-bold text-blue-400">Sisa</span>
                  </div>
               </div>
            </div>

            <div className="mt-8 flex items-end gap-5">
               <div>
                  <span className="block text-5xl font-black text-white tracking-tighter leading-none">
                    {daysToSptOp > 0 ? daysToSptOp : 0}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2 block">Hari Lagi</span>
               </div>
               <div className="h-12 w-px bg-white/10 mx-2"></div>
               <div className="pb-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Jatuh Tempo</p>
                  <p className="text-base font-bold text-white">31 Maret {currentYear}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Today's Date Card */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute -right-6 -top-6 text-slate-50 opacity-50 rotate-12 pointer-events-none">
              <CalendarCheck size={140} />
           </div>
           
           <div className="relative z-10">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hari Ini</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{todayDay} {monthName}</h3>
              <p className="text-sm text-blue-600 font-bold mt-1">{currentYear}</p>
           </div>

           <div className="relative z-10 mt-6">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-blue-500" />
                    <span className="text-xs font-bold text-slate-700 uppercase">Status</span>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed">
                    Pastikan Anda memeriksa jadwal di samping untuk menghindari denda keterlambatan.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* MONTHLY AGENDA SECTION */}
      <div>
        <div className="flex items-center justify-between mb-6 px-2">
           <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays size={20} className="text-blue-600" />
              Agenda {monthName}
           </h3>
           <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4 Agenda
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {DEADLINES.map((item, idx) => {
             const status = getStatus(item.day);
             const isPassed = status === 'PASSED';
             const isToday = status === 'TODAY';
             
             return (
               <div 
                  key={idx} 
                  className={`relative p-6 rounded-[1.5rem] border transition-all duration-300 group flex gap-5 items-start ${
                     isPassed 
                        ? 'bg-slate-50 border-slate-100 opacity-70 hover:opacity-100' 
                        : isToday 
                           ? 'bg-white border-blue-200 ring-2 ring-blue-500/20 shadow-lg shadow-blue-500/10' 
                           : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
                  }`}
               >
                  {/* Date Visual */}
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-colors ${
                     isPassed 
                        ? 'bg-slate-100 border-slate-200 text-slate-400' 
                        : isToday 
                           ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30' 
                           : 'bg-blue-50 border-blue-100 text-blue-600 group-hover:bg-blue-100'
                  }`}>
                     <span className="text-xl font-black leading-none">{item.day}</span>
                     <span className="text-[9px] font-bold uppercase mt-0.5 opacity-80">{monthName.substring(0,3)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-1">
                        {item.type === 'PAYMENT' ? (
                           <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border flex items-center gap-1 ${isPassed ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                              <Banknote size={10} /> Setor
                           </span>
                        ) : (
                           <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border flex items-center gap-1 ${isPassed ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                              <FileText size={10} /> Lapor
                           </span>
                        )}
                        
                        {isToday && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 uppercase animate-pulse">Hari Ini</span>}
                     </div>
                     
                     <h4 className={`font-bold text-base mb-1 truncate ${isPassed ? 'text-slate-500' : 'text-slate-900'}`}>
                        {item.title}
                     </h4>
                     <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                        {item.description}
                     </p>
                  </div>

                  {/* Action Arrow (Visual only) */}
                  {!isPassed && (
                     <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
                        <ChevronRight size={18} />
                     </div>
                  )}
               </div>
             );
           })}
        </div>
      </div>

      {/* INFO FOOTER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4">
            <div className="p-2.5 bg-white rounded-xl shadow-sm text-amber-500 border border-slate-100 h-fit">
               <Bell size={20} />
            </div>
            <div>
               <h4 className="text-sm font-bold text-slate-900 mb-1">Aturan Hari Libur</h4>
               <p className="text-xs text-slate-500 leading-relaxed">
                  Jika tanggal jatuh tempo bertepatan dengan hari libur (Sabtu, Minggu, atau Libur Nasional), maka batas waktu mundur ke <strong>hari kerja berikutnya</strong>.
               </p>
            </div>
         </div>
         
         <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4">
            <div className="p-2.5 bg-white rounded-xl shadow-sm text-emerald-500 border border-slate-100 h-fit">
               <CheckCircle2 size={20} />
            </div>
            <div>
               <h4 className="text-sm font-bold text-slate-900 mb-1">Tips Kepatuhan</h4>
               <p className="text-xs text-slate-500 leading-relaxed">
                  Selalu buat ID Billing dan lakukan penyetoran sebelum lapor SPT. Denda telat lapor jauh lebih merugikan daripada melapor nihil tepat waktu.
               </p>
            </div>
         </div>
      </div>

      {/* PRINTABLE TABLE VIEW (Only visible when printing) */}
      <div className="print-only hidden mt-8">
          <h2 className="text-xl font-bold mb-4 border-b-2 border-black pb-2">Jadwal Lengkap</h2>
          <table className="w-full text-left border-collapse text-xs">
             <thead>
                <tr className="border-b border-black">
                   <th className="py-2 w-16">Tanggal</th>
                   <th className="py-2 w-20">Jenis</th>
                   <th className="py-2">Kegiatan</th>
                   <th className="py-2">Keterangan</th>
                </tr>
             </thead>
             <tbody>
                {DEADLINES.map((item, idx) => (
                   <tr key={idx} className="border-b border-slate-300">
                      <td className="py-2 font-bold">{item.day} {monthName}</td>
                      <td className="py-2 font-bold uppercase">{item.type === 'PAYMENT' ? 'Setor' : 'Lapor'}</td>
                      <td className="py-2 font-bold">{item.title}</td>
                      <td className="py-2">{item.description}</td>
                   </tr>
                ))}
             </tbody>
          </table>
          <div className="mt-8 text-center italic">
             *Dokumen ini dicetak otomatis dari PajakKu Pro.
          </div>
       </div>

    </div>
  );
};

export default TaxCalendar;
