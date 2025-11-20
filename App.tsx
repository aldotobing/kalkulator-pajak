
import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Building2, 
  Percent, 
  Menu,
  X,
  Gem,
  ChevronRight,
  History,
  CalendarDays,
  BookOpen,
  Briefcase,
  Banknote,
  Ship,
  ChevronDown,
  PenTool,
  Siren,
  TrendingUp
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
import FAQPage from './components/FAQPage';
import HistoryPage from './components/HistoryPage';
import TaxCalendar from './components/TaxCalendar';
import { AIWidget } from './components/AIWidget';
import { SplashScreen } from './components/SplashScreen';

// Type for Active Tab
type Tab = 'PPH21' | 'PPH23' | 'FINAL' | 'PPN' | 'PPNBM' | 'BEACUKAI' | 'NPPN' | 'SANKSI' | 'SIMULATION' | 'CALENDAR' | 'FAQ' | 'HISTORY';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true); // Splash Screen State
  const [activeTab, setActiveTab] = useState<Tab>('PPH21');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [contextData, setContextData] = useState<string>('');
  const [showNav, setShowNav] = useState(true);

  // Handle Scroll to Hide/Show Nav
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
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
  }, []);

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
        }}
        style={{ transitionDelay: `${delayIndex * 30}ms` }}
        className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-all duration-500 transform ${
          mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
        } ${
          isActive
            ? 'bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-100'
            : 'text-slate-600 hover:bg-slate-50'
        } group relative overflow-hidden`}
      >
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
        
        <div className={`p-2.5 rounded-lg shrink-0 transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-500 group-hover:shadow-sm'}`}>
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
      
      {/* Ambient Background - Updated to Blue/Cyan */}
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
                  className={`relative h-10 px-4 rounded-full text-xs md:text-sm font-bold transition-all duration-500 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? 'text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] shadow-[0_4px_12px_rgba(59,130,246,0.4)]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 border-t border-transparent'
                  }`}
                >
                  {/* Active Tab Liquid Background */}
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full -z-10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"></div>
                  )}
                  
                  <span className="shrink-0 relative z-10 drop-shadow-sm">{tab.icon}</span>
                  <span className="relative z-10 drop-shadow-sm leading-none pt-0.5">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-3 ml-auto pr-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50/80 backdrop-blur px-3 py-1.5 rounded-full border border-blue-100 shadow-sm truncate max-w-[120px]">
              {tabs.find(t => t.id === activeTab)?.label || (activeTab === 'PPN' ? 'Kalkulator PPN' : activeTab === 'HISTORY' ? 'Riwayat' : activeTab === 'CALENDAR' ? 'Kalender' : activeTab === 'SIMULATION' ? 'Simulasi Gaji' : activeTab === 'NPPN' ? 'Freelancer' : activeTab === 'SANKSI' ? 'Sanksi' : 'Info')}
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
                 moreMenuOpen || ['PPN', 'CALENDAR', 'HISTORY', 'FAQ', 'SIMULATION'].includes(activeTab) 
                 ? 'bg-slate-900 text-white border-slate-700 shadow-lg shadow-slate-900/30' 
                 : 'bg-white/60 text-slate-600 border-white/60 hover:bg-white hover:scale-105 shadow-sm'
               }`}
             >
                <ChevronDown size={20} className={`transition-transform duration-300 ${moreMenuOpen ? 'rotate-180' : ''}`} />
             </button>

             {/* Dropdown - Glassmorphism */}
             {moreMenuOpen && (
               <div className="absolute top-full right-0 mt-4 w-64 bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-blue-900/20 border border-white/60 p-3 flex flex-col gap-2 animate-enter origin-top-right z-50 ring-1 ring-white/50">
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
                       <div className={`text-[10px] ${activeTab === 'HISTORY' ? 'text-blue-100' : 'text-slate-400'}`}>Log Perhitungan</div>
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
                       <div className={`text-[10px] ${activeTab === 'FAQ' ? 'text-blue-100' : 'text-slate-400'}`}>Pusat Informasi</div>
                    </div>
                  </button>
               </div>
             )}
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay - Liquid Glass */}
      <div className={`fixed inset-x-4 top-28 bottom-6 z-40 md:hidden transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) origin-top no-print flex flex-col pointer-events-none ${mobileMenuOpen ? 'pointer-events-auto' : ''}`}>
        <div 
          className={`bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-blue-900/20 border border-white/60 p-3 overflow-y-auto max-h-full transition-all duration-500 ring-1 ring-white/50 ${
            mobileMenuOpen && showNav ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95 pointer-events-none'
          }`}
        >
          <div className="p-4 pb-0">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-1">Kalkulator Pajak</h3>
            <div className="space-y-2">
              {tabs.map((tab, idx) => 
                renderMobileMenuItem(tab.id as Tab, tab.label, tab.fullLabel, tab.icon, idx)
              )}
            </div>
          </div>

          <div className="p-4 pt-2">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6"></div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 pl-1">Menu Lainnya</h3>
            <div className="space-y-2">
              {renderMobileMenuItem('PPN', 'Kalkulator PPN', 'Pajak Pertambahan Nilai', <Percent size={18} />, 6)}
              {renderMobileMenuItem('SIMULATION', 'Simulasi Gaji', 'Nego Net ke Gross', <TrendingUp size={18} />, 7)}
              {renderMobileMenuItem('CALENDAR', 'Kalender Pajak', 'Agenda & Deadline', <CalendarDays size={18} />, 8)}
              {renderMobileMenuItem('HISTORY', 'Riwayat', 'Log Perhitungan', <History size={18} />, 9)}
              {renderMobileMenuItem('FAQ', 'Panduan & FAQ', 'Pusat Informasi', <BookOpen size={18} />, 10)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20">
        
        {/* Hero Section */}
        <div key={`hero-${activeTab}`} className="text-center mb-12 animate-enter no-print">
           <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3 drop-shadow-sm">
             {activeTab === 'PPH21' && 'Kalkulator PPh 21'}
             {activeTab === 'NPPN' && 'Kalkulator PPh Freelancer'}
             {activeTab === 'SANKSI' && 'Kalkulator Sanksi Pajak'}
             {activeTab === 'PPH23' && 'Kalkulator PPh 23'}
             {activeTab === 'FINAL' && 'Kalkulator PPh Final'}
             {activeTab === 'PPN' && 'Kalkulator PPN'}
             {activeTab === 'PPNBM' && 'Kalkulator PPNBM'}
             {activeTab === 'BEACUKAI' && 'Bea Masuk & Pajak Impor'}
             {activeTab === 'SIMULATION' && 'Simulasi Gaji (Reverse Calculator)'}
             {activeTab === 'CALENDAR' && 'Kalender Pajak Indonesia'}
             {activeTab === 'FAQ' && 'Pusat Bantuan & Informasi'}
             {activeTab === 'HISTORY' && 'Riwayat Perhitungan'}
           </h2>
           <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
             {activeTab === 'PPH21' && 'Hitung estimasi pajak penghasilan bersih karyawan dengan presisi tinggi.'}
             {activeTab === 'NPPN' && 'Hitung pajak penghasilan Pekerja Bebas & Freelancer menggunakan Norma (NPPN).'}
             {activeTab === 'SANKSI' && 'Hitung denda telat bayar atau lapor pajak sesuai tarif bunga acuan KMK.'}
             {activeTab === 'PPH23' && 'Perhitungan cepat untuk pajak dividen, royalti, bunga, hadiah, dan jasa.'}
             {activeTab === 'FINAL' && 'Alat bantu hitung pajak bersifat final seperti sewa tanah & UMKM.'}
             {activeTab === 'PPN' && 'Kalkulasi Pajak Pertambahan Nilai 11% untuk transaksi bisnis.'}
             {activeTab === 'PPNBM' && 'Estimasi pajak barang mewah untuk kendaraan dan properti.'}
             {activeTab === 'BEACUKAI' && 'Estimasi pajak barang kiriman (impor) sesuai PMK 199/2019 & PMK 96/2023.'}
             {activeTab === 'SIMULATION' && 'Hitung berapa Gaji Kotor (Gross) yang harus Anda minta untuk mendapatkan Gaji Bersih (Net) idaman.'}
             {activeTab === 'CALENDAR' && 'Pantau tanggal jatuh tempo pelaporan dan pembayaran pajak agar bebas denda.'}
             {activeTab === 'FAQ' && 'Pelajari jenis-jenis pajak di Indonesia dan cara menggunakan aplikasi.'}
             {activeTab === 'HISTORY' && 'Akses kembali perhitungan pajak yang telah Anda simpan sebelumnya.'}
           </p>
        </div>

        {/* Main Content */}
        <div key={`content-${activeTab}`} className="animate-enter">
          {activeTab === 'PPH21' && <CalculatorPPH21 onContextUpdate={setContextData} />}
          {activeTab === 'NPPN' && <CalculatorNPPN onContextUpdate={setContextData} />}
          {activeTab === 'SANKSI' && <CalculatorSanksi onContextUpdate={setContextData} />}
          {activeTab === 'PPH23' && <CalculatorPPH23 onContextUpdate={setContextData} />}
          {activeTab === 'FINAL' && <CalculatorFinal onContextUpdate={setContextData} />}
          {activeTab === 'PPN' && <CalculatorPPN onContextUpdate={setContextData} />}
          {activeTab === 'PPNBM' && <CalculatorPPNBM onContextUpdate={setContextData} />}
          {activeTab === 'BEACUKAI' && <CalculatorBeaCukai onContextUpdate={setContextData} />}
          {activeTab === 'SIMULATION' && <SimulatorSalary onContextUpdate={setContextData} />}
          {activeTab === 'CALENDAR' && <TaxCalendar />}
          {activeTab === 'FAQ' && <FAQPage />}
          {activeTab === 'HISTORY' && <HistoryPage />}
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 mt-auto py-8 text-center border-t border-slate-200/50 bg-white/30 backdrop-blur-sm no-print">
        <p className="text-sm font-medium text-slate-400">
          © 2025 PajakKu Piro. Hak Cipta Dilindungi.
        </p>
      </footer>

      <AIWidget contextData={contextData} />
    </div>
    </>
  );
};

export default App;
