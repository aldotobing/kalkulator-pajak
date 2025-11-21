
import React, { useState, useEffect } from 'react';
import { 
  Menu,
  X,
  ChevronRight,
  CalendarDays,
  BookOpen,
  Briefcase,
  Banknote,
  Ship,
  ChevronDown,
  PenTool,
  Siren,
  TrendingUp,
  Percent,
  Building2,
  Gem,
  History,
  Hash
} from './components/Icons';
import CalculatorPPH21 from './components/CalculatorPPH21';
import CalculatorPPH23 from './components/CalculatorPPH23';
import CalculatorFinal from './components/CalculatorFinal';
import CalculatorPPN from './components/CalculatorPPN';
import CalculatorPPNBM from './components/CalculatorPPNBM';
import CalculatorBeaCukai from './components/CalculatorBeaCukai';
import CalculatorNPPN from './components/CalculatorNPPN';
import CalculatorSanksi from './components/CalculatorSanksi';
import SimulatorSalary from './components/SimulatorSalary';
import TaxCodeFinder from './components/TaxCodeFinder';
import FAQPage from './components/FAQPage';
import HistoryPage from './components/HistoryPage';
import TaxCalendar from './components/TaxCalendar';
import { AIWidget } from './components/AIWidget';
import { SplashScreen } from './components/SplashScreen';

// Type for Active Tab
type Tab = 'PPH21' | 'PPH23' | 'FINAL' | 'PPN' | 'PPNBM' | 'BEACUKAI' | 'NPPN' | 'SANKSI' | 'SIMULATION' | 'TAX_CODES' | 'CALENDAR' | 'FAQ' | 'HISTORY';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true); // Splash Screen State
  const [activeTab, setActiveTab] = useState<Tab>('PPH21');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [contextData, setContextData] = useState<string>('');
  const [showNav, setShowNav] = useState(true);

  // Lock Body Scroll when Mobile Menu is Open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      setShowNav(true); // Force nav to show when menu opens
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  // Handle Scroll to Hide/Show Nav
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      // CRITICAL FIX: If mobile menu is open, strictly ignore scroll events
      // This prevents the navbar from hiding while the user scrolls the menu content
      if (mobileMenuOpen) {
        setShowNav(true);
        return;
      }

      const currentScrollY = window.scrollY;
      
      // Always show at the very top
      if (currentScrollY < 20) {
        setShowNav(true);
      } 
      // Hide when scrolling down and past threshold
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNav(false);
      } 
      // Show when scrolling up
      else if (currentScrollY < lastScrollY) {
        setShowNav(true);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  const tabs = [
    { id: 'PPH21', label: 'PPh 21', fullLabel: 'Karyawan & Pribadi', icon: <Briefcase size={18} /> },
    { id: 'NPPN', label: 'Freelancer', fullLabel: 'Pekerja Bebas (Norma)', icon: <PenTool size={18} /> },
    { id: 'SANKSI', label: 'Sanksi', fullLabel: 'Hitung Denda Telat', icon: <Siren size={18} /> },
    { id: 'PPH23', label: 'PPh 23', fullLabel: 'Jasa, Dividen, Royalti', icon: <Building2 size={18} /> },
    { id: 'FINAL', label: 'PPh Final', fullLabel: 'Sewa Tanah & UMKM', icon: <Banknote size={18} /> },
    { id: 'PPNBM', label: 'PPNBM', fullLabel: 'Pajak Barang Mewah', icon: <Gem size={18} /> },
    { id: 'BEACUKAI', label: 'Bea Cukai', fullLabel: 'Impor & Barang Kiriman', icon: <Ship size={18} /> },
  ];

  const renderMobileMenuItem = (id: Tab, label: string, subLabel: string, icon: React.ReactNode, delayIndex: number) => {
    const isActive = activeTab === id;
    return (
      <button
        key={id}
        onClick={() => {
          setActiveTab(id);
          setMobileMenuOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        style={{ transitionDelay: `${delayIndex * 30}ms` }}
        className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all duration-500 transform ${
          mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        } ${
          isActive
            ? 'bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-100'
            : 'text-slate-600 hover:bg-slate-50'
        } group relative overflow-hidden`}
      >
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
        
        <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-500 group-hover:shadow-sm'}`}>
           {icon}
        </div>
        
        <div className="flex flex-col">
           <span className={`font-bold text-sm ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>{label}</span>
           <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{subLabel}</span>
        </div>

        {isActive && <ChevronRight size={16} className="ml-auto text-blue-500" />}
      </button>
    );
  };

  return (
    <>
    {isLoading && <SplashScreen onFinish={() => setIsLoading(false)} />}
    
    <div className={`min-h-screen font-sans text-slate-900 relative overflow-x-hidden selection:bg-blue-500 selection:text-white ${isLoading ? 'hidden' : 'block animate-enter'}`}>
      
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden no-print">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-slate-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Navigation (Liquid Glass Design) */}
      <div className={`fixed top-6 left-0 right-0 z-50 flex justify-center px-4 no-print transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${showNav ? 'translate-y-0' : '-translate-y-32'}`}>
        
        {/* The Crystal Bar */}
        <nav className="relative flex items-center justify-between p-1.5 gap-3 md:gap-6 max-w-6xl w-full rounded-[2rem] border border-white/40 bg-white/30 backdrop-blur-3xl backdrop-saturate-150 shadow-2xl shadow-blue-900/10 ring-1 ring-white/40 ring-inset">
          
          {/* Brand - Left */}
          <div className="flex-shrink-0 cursor-pointer select-none group pl-4 relative z-10" onClick={() => setActiveTab('PPH21')}>
             <div className="flex items-center gap-2">
               <span className="text-base md:text-lg font-black tracking-tight text-slate-800 group-hover:opacity-80 transition-opacity">
                 PajakKu Piro
               </span>
             </div>
          </div>

          {/* Desktop Tabs - The Liquid Channel */}
          <div className="hidden md:flex flex-1 justify-center min-w-0 px-2 relative z-10">
            <div className="flex items-center bg-slate-400/10 rounded-full p-1.5 border border-white/10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] overflow-x-auto slim-scrollbar max-w-full gap-1 backdrop-blur-md">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`relative h-10 px-4 rounded-full text-xs md:text-sm font-bold transition-all duration-500 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 leading-none ${
                    activeTab === tab.id
                      ? 'text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] shadow-[0_4px_12px_rgba(59,130,246,0.4)]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 shadow-[inset_0_1px_0_0_transparent]'
                  }`}
                >
                  {/* Active Tab Liquid Background */}
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full -z-10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"></div>
                  )}
                  
                  <span className="shrink-0 relative z-10 drop-shadow-sm">{tab.icon}</span>
                  <span className="relative z-10 drop-shadow-sm pt-0.5">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-3 ml-auto pr-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50/80 backdrop-blur px-3 py-1.5 rounded-full border border-blue-100 shadow-sm truncate max-w-[120px]">
              {tabs.find(t => t.id === activeTab)?.label || (activeTab === 'PPN' ? 'Kalkulator PPN' : activeTab === 'HISTORY' ? 'Riwayat' : activeTab === 'CALENDAR' ? 'Kalender' : activeTab === 'SIMULATION' ? 'Simulasi Gaji' : activeTab === 'TAX_CODES' ? 'Kode Pajak' : activeTab === 'NPPN' ? 'Freelancer' : activeTab === 'SANKSI' ? 'Sanksi' : 'Info')}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-3 rounded-full transition-all duration-300 shadow-lg border border-white/20 ${mobileMenuOpen ? 'bg-slate-100 text-slate-900 rotate-90' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Right Action (Menu Lain) - Glass Button */}
          <div className="hidden md:flex items-center shrink-0 ml-auto md:ml-0 relative pr-1">
             <button 
               onClick={() => setMoreMenuOpen(!moreMenuOpen)}
               className={`w-11 h-11 rounded-full transition-all duration-300 flex items-center justify-center border backdrop-blur-sm ${
                 moreMenuOpen || ['PPN', 'CALENDAR', 'HISTORY', 'FAQ', 'SIMULATION', 'TAX_CODES'].includes(activeTab) 
                 ? 'bg-slate-900 text-white border-slate-700 shadow-lg shadow-slate-900/30' 
                 : 'bg-white/60 text-slate-600 border-white/60 hover:bg-white hover:scale-105 shadow-sm'
               }`}
             >
                <ChevronDown size={20} className={`transition-transform duration-300 ${moreMenuOpen ? 'rotate-180' : ''}`} />
             </button>

             {/* Dropdown - Glassmorphism */}
             {moreMenuOpen && (
               <div className="absolute top-full right-0 mt-4 w-64 bg-white/95 backdrop-blur-3xl rounded-[2rem] shadow-2xl shadow-blue-900/20 border border-white/60 p-3 flex flex-col gap-2 animate-enter origin-top-right z-50 ring-1 ring-white/50">
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menu Lainnya</div>
                  
                  <button 
                    onClick={() => { setActiveTab('PPN'); setMoreMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-2xl text-left transition-all ${activeTab === 'PPN' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-white hover:shadow-sm text-slate-700'}`}
                  >
                    <div className={`p-2 rounded-xl ${activeTab === 'PPN' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        <Percent size={18} />
                    </div>
                    <div>
                       <div className="font-bold text-sm">Kalkulator PPN</div>
                       <div className={`text-[10px] ${activeTab === 'PPN' ? 'text-blue-100' : 'text-slate-400'}`}>Pajak Pertambahan Nilai</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('SIMULATION'); setMoreMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-2xl text-left transition-all ${activeTab === 'SIMULATION' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-white hover:shadow-sm text-slate-700'}`}
                  >
                    <div className={`p-2 rounded-xl ${activeTab === 'SIMULATION' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        <TrendingUp size={18} />
                    </div>
                    <div>
                       <div className="font-bold text-sm">Simulasi Gaji</div>
                       <div className={`text-[10px] ${activeTab === 'SIMULATION' ? 'text-blue-100' : 'text-slate-400'}`}>Negosiasi Net ke Gross</div>
                    </div>
                  </button>

                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-1"></div>

                  <button 
                    onClick={() => { setActiveTab('TAX_CODES'); setMoreMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-2xl text-left transition-all ${activeTab === 'TAX_CODES' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-white hover:shadow-sm text-slate-700'}`}
                  >
                    <div className={`p-2 rounded-xl ${activeTab === 'TAX_CODES' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        <Hash size={18} />
                    </div>
                    <div>
                       <div className="font-bold text-sm">Kode Pajak</div>
                       <div className={`text-[10px] ${activeTab === 'TAX_CODES' ? 'text-blue-100' : 'text-slate-400'}`}>Direktori KAP & KJS</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('CALENDAR'); setMoreMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-2xl text-left transition-all ${activeTab === 'CALENDAR' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-white hover:shadow-sm text-slate-700'}`}
                  >
                    <div className={`p-2 rounded-xl ${activeTab === 'CALENDAR' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        <CalendarDays size={18} />
                    </div>
                    <div>
                       <div className="font-bold text-sm">Kalender Pajak</div>
                       <div className={`text-[10px] ${activeTab === 'CALENDAR' ? 'text-blue-100' : 'text-slate-400'}`}>Deadline & Agenda</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('HISTORY'); setMoreMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-2xl text-left transition-all ${activeTab === 'HISTORY' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-white hover:shadow-sm text-slate-700'}`}
                  >
                    <div className={`p-2 rounded-xl ${activeTab === 'HISTORY' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        <History size={18} />
                    </div>
                    <div>
                       <div className="font-bold text-sm">Riwayat</div>
                       <div className={`text-[10px] ${activeTab === 'HISTORY' ? 'text-blue-100' : 'text-slate-400'}`}>Daftar Perhitungan</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('FAQ'); setMoreMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-2xl text-left transition-all ${activeTab === 'FAQ' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-white hover:shadow-sm text-slate-700'}`}
                  >
                    <div className={`p-2 rounded-xl ${activeTab === 'FAQ' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        <BookOpen size={18} />
                    </div>
                    <div>
                       <div className="font-bold text-sm">Panduan</div>
                       <div className={`text-[10px] ${activeTab === 'FAQ' ? 'text-blue-100' : 'text-slate-400'}`}>Pusat Edukasi</div>
                    </div>
                  </button>
               </div>
             )}
          </div>
        </nav>
      </div>

      {/* MOBILE FULLSCREEN MENU OVERLAY */}
      <div className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-3xl transition-all duration-500 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Inner scroll container - Pt-32 ensures content starts below floating nav */}
        <div className="h-[100dvh] overflow-y-auto pt-32 pb-40 px-6 overscroll-contain">
            <div className="max-w-md mx-auto space-y-6">
               <div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Kalkulator Utama</h3>
                 <div className="space-y-2">
                   {tabs.map((tab, idx) => renderMobileMenuItem(tab.id as Tab, tab.label, tab.fullLabel, tab.icon, idx))}
                 </div>
               </div>
               
               <div>
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Alat Bantu</h3>
                 <div className="space-y-2">
                   {renderMobileMenuItem('PPN', 'Kalkulator PPN', 'Pajak Pertambahan Nilai', <Percent size={18} />, 5)}
                   {renderMobileMenuItem('SIMULATION', 'Simulasi Gaji', 'Negosiasi Net ke Gross', <TrendingUp size={18} />, 6)}
                   {renderMobileMenuItem('TAX_CODES', 'Direktori Kode Pajak', 'Cari KAP & KJS', <Hash size={18} />, 7)}
                   {renderMobileMenuItem('CALENDAR', 'Kalender Pajak', 'Deadline & Agenda', <CalendarDays size={18} />, 8)}
                   {renderMobileMenuItem('HISTORY', 'Riwayat', 'Daftar Perhitungan', <History size={18} />, 9)}
                   {renderMobileMenuItem('FAQ', 'Panduan & Edukasi', 'Pusat Informasi', <BookOpen size={18} />, 10)}
                 </div>
               </div>
               
               <div className="pt-6 text-center">
                 <p className="text-xs text-slate-400 font-medium">Versi 3.1.0 &bull; PajakKu Pro</p>
               </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-32 px-4 pb-32 relative z-10">
         <div key={activeTab} className="max-w-6xl mx-auto animate-apple-enter will-change-transform">
            
            {/* Hero Header (Dynamic based on active tab) */}
            <div className="text-center mb-8 md:mb-12 no-print">
               <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                  {activeTab === 'PPH21' && 'Kalkulator PPh 21 Karyawan'}
                  {activeTab === 'PPH23' && 'Kalkulator PPh 23'}
                  {activeTab === 'FINAL' && 'Kalkulator PPh Final'}
                  {activeTab === 'PPN' && 'Kalkulator PPN'}
                  {activeTab === 'PPNBM' && 'Kalkulator PPnBM'}
                  {activeTab === 'BEACUKAI' && 'Kalkulator Bea Cukai & Impor'}
                  {activeTab === 'NPPN' && 'Kalkulator Pajak Freelancer'}
                  {activeTab === 'SANKSI' && 'Kalkulator Sanksi Pajak'}
                  {activeTab === 'SIMULATION' && 'Simulasi Gaji Net ke Gross'}
                  {activeTab === 'TAX_CODES' && 'Direktori Kode Pajak (KAP/KJS)'}
                  {activeTab === 'CALENDAR' && 'Kalender Pajak Indonesia'}
                  {activeTab === 'FAQ' && 'Pusat Bantuan & Informasi'}
                  {activeTab === 'HISTORY' && 'Riwayat Perhitungan'}
               </h1>
               <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  {activeTab === 'PPH21' && 'Hitung estimasi pajak penghasilan (PPh 21) karyawan tetap dengan metode terbaru TER 2024 dan tarif progresif UU HPP.'}
                  {activeTab === 'PPH23' && 'Hitung potongan pajak atas jasa, sewa harta, dividen, royalti, dan hadiah sesuai tarif Pasal 23.'}
                  {activeTab === 'FINAL' && 'Hitung pajak bersifat final untuk sewa tanah/bangunan, jasa konstruksi, dan UMKM (PP 23).'}
                  {activeTab === 'PPN' && 'Hitung Pajak Pertambahan Nilai (PPN) 11% dari Dasar Pengenaan Pajak (DPP).'}
                  {activeTab === 'PPNBM' && 'Hitung Pajak Penjualan atas Barang Mewah untuk kendaraan, hunian, dan barang eksklusif lainnya.'}
                  {activeTab === 'BEACUKAI' && 'Estimasi Bea Masuk, PPN, dan PPh Impor untuk barang kiriman luar negeri sesuai PMK 199/2019.'}
                  {activeTab === 'NPPN' && 'Hitung pajak untuk Dokter, Notaris, Freelancer dan Pekerjaan Bebas menggunakan Norma Penghitungan (NPPN).'}
                  {activeTab === 'SANKSI' && 'Cek estimasi denda bunga dan sanksi administrasi akibat keterlambatan setor atau lapor pajak.'}
                  {activeTab === 'SIMULATION' && 'Bingung nego gaji? Hitung berapa Gaji Kotor (Gross) yang harus diminta untuk mendapatkan Gaji Bersih (Net) idaman.'}
                  {activeTab === 'TAX_CODES' && 'Cari Kode Akun Pajak (KAP) dan Kode Jenis Setoran (KJS) yang tepat untuk pembuatan ID Billing.'}
                  {activeTab === 'CALENDAR' && 'Jangan sampai telat lapor! Cek jadwal jatuh tempo penyetoran dan pelaporan pajak bulan ini.'}
                  {activeTab === 'FAQ' && 'Pelajari istilah perpajakan, cara perhitungan, dan dasar hukum dengan bahasa yang mudah dimengerti.'}
                  {activeTab === 'HISTORY' && 'Akses kembali hasil perhitungan yang telah Anda simpan sebelumnya.'}
               </p>
            </div>

            {/* Content Renderer */}
            {activeTab === 'PPH21' && <CalculatorPPH21 onContextUpdate={setContextData} />}
            {activeTab === 'PPH23' && <CalculatorPPH23 onContextUpdate={setContextData} />}
            {activeTab === 'FINAL' && <CalculatorFinal onContextUpdate={setContextData} />}
            {activeTab === 'PPN' && <CalculatorPPN onContextUpdate={setContextData} />}
            {activeTab === 'PPNBM' && <CalculatorPPNBM onContextUpdate={setContextData} />}
            {activeTab === 'BEACUKAI' && <CalculatorBeaCukai onContextUpdate={setContextData} />}
            {activeTab === 'NPPN' && <CalculatorNPPN onContextUpdate={setContextData} />}
            {activeTab === 'SANKSI' && <CalculatorSanksi onContextUpdate={setContextData} />}
            {activeTab === 'SIMULATION' && <SimulatorSalary onContextUpdate={setContextData} />}
            {activeTab === 'TAX_CODES' && <TaxCodeFinder />}
            {activeTab === 'CALENDAR' && <TaxCalendar />}
            {activeTab === 'FAQ' && <FAQPage />}
            {activeTab === 'HISTORY' && <HistoryPage />}
         </div>
      </main>
      
      {/* AI Widget */}
      <AIWidget contextData={contextData} />

    </div>
    </>
  );
};

export default App;
