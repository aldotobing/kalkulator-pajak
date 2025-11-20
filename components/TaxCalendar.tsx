
import React, { useState, useEffect } from 'react';
import { CalendarDays, Bell, CheckCircle2, AlertCircle, Clock, CalendarCheck, Banknote, FileText } from './Icons';

interface Deadline {
  day: number;
  title: string;
  description: string;
  type: 'PAYMENT' | 'REPORTING' | 'ANNUAL';
}

const DEADLINES: Deadline[] = [
  { day: 10, title: 'Bayar PPh 21/23/26/4(2)', description: 'Batas setor pajak masa bulan sebelumnya.', type: 'PAYMENT' },
  { day: 15, title: 'Bayar PPh 25', description: 'Angsuran pajak penghasilan bulanan.', type: 'PAYMENT' },
  { day: 20, title: 'Lapor SPT Masa PPh', description: 'Pelaporan PPh Pasal 21/26, 23/26, 4(2), 15.', type: 'REPORTING' },
  { day: 30, title: 'Lapor SPT Masa PPN', description: 'Batas akhir lapor PPN bulan sebelumnya (Akhir Bulan).', type: 'REPORTING' },
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
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Hero Card: Annual Deadline Countdown (Dark Theme) - COMPACT VERSION */}
      <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-slate-900/20 border border-slate-800">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
             <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                <AlertCircle size={12} />
                Prioritas Utama
             </div>
             <div>
               <h2 className="text-xl md:text-2xl font-bold mb-1 tracking-tight text-white">SPT Tahunan Pribadi</h2>
               <p className="text-slate-400 text-xs md:text-sm max-w-md leading-relaxed">
                 Batas akhir pelaporan pajak penghasilan orang pribadi tahun {currentYear - 1}.
               </p>
             </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6 self-end md:self-auto">
             <div className="text-center p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 min-w-[90px] shadow-lg">
                <span className="block text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-lg">
                  {daysToSptOp > 0 ? daysToSptOp : 0}
                </span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mt-0.5 block">Hari Lagi</span>
             </div>
             <div className="hidden md:block h-12 w-px bg-white/10"></div>
             <div className="hidden md:block space-y-0.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jatuh Tempo</p>
                <p className="text-sm md:text-base font-bold text-white">31 Maret {currentYear}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Monthly Timeline */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 border-b border-slate-100 pb-6">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <CalendarDays size={24} />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">Kalender Pajak</h3>
                <p className="text-slate-500 text-sm font-medium">Jadwal Kewajiban <span className="text-blue-600 font-bold">{monthName} {currentYear}</span></p>
              </div>
           </div>
           
           <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 px-4 py-2 rounded-full text-slate-600 border border-slate-200">
              <Clock size={14} className="text-blue-500" />
              Hari ini: {todayDay} {monthName}
           </div>
        </div>

        <div className="relative pl-4 md:pl-0">
           {/* Vertical Line */}
           <div className="absolute left-0 md:left-8 top-4 bottom-4 w-0.5 bg-slate-100 hidden md:block"></div>

           <div className="space-y-6">
              {DEADLINES.map((item, idx) => {
                const status = getStatus(item.day);
                let statusColor = '';
                let statusText = '';
                let cardBorder = 'border-slate-100';
                let cardBg = 'bg-white';

                if (status === 'PASSED') {
                   statusColor = 'bg-slate-100 text-slate-500 border-slate-200';
                   statusText = 'Sudah Lewat';
                   cardBg = 'bg-slate-50/50 grayscale opacity-75';
                } else if (status === 'TODAY') {
                   statusColor = 'bg-red-100 text-red-600 border-red-200 animate-pulse';
                   statusText = 'HARI INI';
                   cardBorder = 'border-red-200 ring-4 ring-red-50';
                   cardBg = 'bg-white';
                } else if (status === 'SOON') {
                   statusColor = 'bg-amber-100 text-amber-600 border-amber-200';
                   statusText = 'Segera';
                   cardBorder = 'border-amber-200';
                   cardBg = 'bg-amber-50/30';
                } else {
                   statusColor = 'bg-blue-50 text-blue-600 border-blue-100';
                   statusText = 'Akan Datang';
                }

                return (
                  <div key={idx} className={`relative md:pl-24 transition-all duration-300 group`}>
                     {/* Date Bubble (Desktop) */}
                     <div className={`hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl items-center justify-center flex-col border-4 border-white shadow-lg z-10 transition-transform group-hover:scale-110 ${status === 'TODAY' ? 'bg-red-500 text-white' : status === 'PASSED' ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white'}`}>
                        <span className="text-xl font-black leading-none">{item.day}</span>
                        <span className="text-[9px] font-bold uppercase opacity-80 mt-0.5">{monthName.substring(0,3)}</span>
                     </div>

                     {/* Content Card */}
                     <div className={`p-6 rounded-3xl border ${cardBorder} ${cardBg} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow`}>
                        <div className="flex items-start gap-4">
                           {/* Date Bubble (Mobile) */}
                           <div className={`md:hidden w-12 h-12 rounded-xl flex items-center justify-center flex-col shrink-0 font-bold text-white shadow-md ${status === 'TODAY' ? 'bg-red-500' : 'bg-blue-600'}`}>
                             <span className="text-lg">{item.day}</span>
                             <span className="text-[8px] uppercase opacity-80">{monthName.substring(0,3)}</span>
                           </div>

                           <div>
                             <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1.5">
                               <h4 className={`font-bold text-base md:text-lg ${status === 'PASSED' ? 'text-slate-500' : 'text-slate-900'}`}>{item.title}</h4>
                               <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${statusColor}`}>
                                 {statusText}
                               </span>
                             </div>
                             <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.description}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 pl-16 md:pl-0">
                           {item.type === 'PAYMENT' ? (
                             <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                               <Banknote size={14}/>
                               <span>Setor</span>
                             </div>
                           ) : (
                             <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 flex items-center gap-1.5 shadow-sm">
                               <FileText size={14}/>
                               <span>Lapor</span>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
                );
              })}
           </div>
        </div>
      </div>

      {/* Legend / Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="p-6 md:p-8 bg-white rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30">
            <div className="flex items-center gap-3 mb-4 text-slate-900 font-bold">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Bell size={18} />
               </div>
               <span className="text-sm uppercase tracking-wider">Pengingat Penting</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
               Jika tanggal jatuh tempo bertepatan dengan hari libur, batas waktu mundur ke hari kerja berikutnya.
               Pastikan membuat ID Billing sebelum melakukan penyetoran di bank atau pos persepsi.
            </p>
         </div>
         <div className="p-6 md:p-8 bg-white rounded-[2rem] border border-slate-100 shadow-lg shadow-slate-200/30">
            <div className="flex items-center gap-3 mb-4 text-slate-900 font-bold">
               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CheckCircle2 size={18} />
               </div>
               <span className="text-sm uppercase tracking-wider">Tips Kepatuhan</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
               Lapor SPT tepat waktu lebih baik daripada telat bayar. Denda telat lapor (Rp100rb untuk OP, Rp1jt untuk Badan) seringkali lebih merugikan secara administrasi.
            </p>
         </div>
      </div>

      {/* Print Footer */}
      <div className="print-only text-center mt-8 text-xs text-slate-400">
          <p>Dicetak menggunakan aplikasi PajakKu Pro pada {new Date().toLocaleDateString()}</p>
       </div>
    </div>
  );
};

export default TaxCalendar;
