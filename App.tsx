
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
  ChevronDown
} from './components/Icons';
import CalculatorPPH21 from './components/CalculatorPPH21';
import CalculatorPPH23 from './components/CalculatorPPH23';
import CalculatorFinal from './components/CalculatorFinal';
import CalculatorPPN from './components/CalculatorPPN';
import CalculatorPPNBM from './components/CalculatorPPNBM';
import CalculatorBeaCukai from './components/CalculatorBeaCukai';
import FAQPage from './components/FAQPage';
import HistoryPage from './components/HistoryPage';
import TaxCalendar from './components/TaxCalendar';
import { AIWidget } from './components/AIWidget';

// Type for Active Tab
type Tab = 'PPH21' | 'PPH23' | 'FINAL' | 'PPN' | 'PPNBM' | 'BEACUKAI' | 'CALENDAR' | 'FAQ' | 'HISTORY';

const App: React.FC = () => {
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
    { id: 'PPH23', label: 'PPh 23', fullLabel: 'Jasa, Dividen, Royalti', icon: <Building2 size={18} /> },
    { id: 'FINAL', label: 'PPh Final', fullLabel: 'Sewa Tanah & UMKM', icon: <Banknote size={18} /> },
    { id: 'PPN', label: 'PPN', fullLabel: 'Pajak Pertambahan Nilai', icon: <Percent size={18} /> },
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
    <div className="min-h-screen font-sans text-slate-900 relative overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Ambient Background - Updated to Blue/Cyan */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden no-print">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-slate-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Navigation */}
      <div className={`fixed top-6 left-0 right-0 z-50 flex justify-center px-4 no-print transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${showNav ? 'translate-y-0' : '-translate-y-32'}`}>
        <nav className="glass shadow-2xl shadow-blue-900/5 rounded-full p-2 pl-4 md:pl-6 pr-2 flex items-center gap-2 md:gap-4 max-w-6xl w-full justify-between border border-white/40">
          
          {/* Brand */}
          <div className="flex-shrink-0 cursor-pointer select-none group" onClick={() => setActiveTab('PPH21')}>
            <span className="text-base md:text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              PajakKu Pro
            </span>
          </div>

          {/* Desktop Tabs (Visible on Medium screens and up) */}
          {/* Outer wrapper centers the pill and handles layout flexibility */}
          <div className="hidden md:flex flex-1 justify-center min-w-0 px-2 lg:px-4">
            {/* Inner pill handles the visual background, fits content, and scrolls if needed */}
            <div className="flex items-center bg-slate-100/50 rounded-full p-2 border border-slate-200/50 backdrop-blur-sm overflow-x-auto no-scrollbar max-w-full gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`px-3 md:px-3 lg:px-4 py-2 rounded-full text-xs md:text-xs lg:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 lg:gap-2 whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm shadow-blue-100 ring-1 ring-slate-200/60'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  <span className="shrink-0">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Toggle (Visible only on Small screens) */}
          <div className="md:hidden flex items-center gap-3 ml-auto">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm truncate max-w-[120px]">
              {tabs.find(t => t.id === activeTab)?.label || (activeTab === 'HISTORY' ? 'Riwayat' : activeTab === 'CALENDAR' ? 'Kalender' : 'Info')}
            </span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-3 rounded-full transition-all duration-300 shadow-lg ${mobileMenuOpen ? 'bg-slate-100 text-slate-900 rotate-90' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* User Action Buttons (Dropdown) */}
          <div className="hidden md:flex items-center shrink-0 ml-auto md:ml-0 relative">
             <button 
               onClick={() => setMoreMenuOpen(!moreMenuOpen)}
               className={`p-3 rounded-full transition-all shadow-lg border flex items-center justify-center ${
                 moreMenuOpen || ['CALENDAR', 'HISTORY', 'FAQ'].includes(activeTab) 
                 ? 'bg-slate-900 text-white border-slate-800 shadow-slate-900/20' 
                 : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
               }`}
               title="Menu Lain"
             >
                <ChevronDown size={20} className={`transition-transform duration-300 ${moreMenuOpen ? 'rotate-180' : ''}`} />
             </button>

             {/* Dropdown Menu */}
             {moreMenuOpen && (
               <div className="absolute top-full right-0 mt-3 w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-2 flex flex-col gap-1 animate-enter origin-top-right z-50 ring-1 ring-slate-900/5">
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alat Bantu</div>
                  
                  <button 
                    onClick={() => { setActiveTab('CALENDAR'); setMoreMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all ${activeTab === 'CALENDAR' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className={`p-2 rounded-lg ${activeTab === 'CALENDAR' ? 'bg-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                        <CalendarDays size={16} />
                    </div>
                    <div>
                       <div className="font-bold text-sm">Kalender Pajak</div>
                       <div className="text-[10px] opacity-70">Deadline & Agenda</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setActiveTab('HISTORY'); setMoreMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all ${activeTab === 'HISTORY' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className={`p-2 rounded-lg ${activeTab === 'HISTORY' ? 'bg-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                        <History size={16} />
                    </div>
                    <div>
                       <div className="font-bold text-sm">Riwayat</div>
                       <div className="text-[10px] opacity-70">Log Perhitungan</div>
                    </div>
                  </button>

                  <div className="h-px bg-slate-100 my-1"></div>

                  <button 
                    onClick={() => { setActiveTab('FAQ'); setMoreMenuOpen(false); }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all ${activeTab === 'FAQ' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    <div className={`p-2 rounded-lg ${activeTab === 'FAQ' ? 'bg-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                        <BookOpen size={16} />
                    </div>
                    <div>
                       <div className="font-bold text-sm">Panduan</div>
                       <div className="text-[10px] opacity-70">Pusat Bantuan</div>
                    </div>
                  </button>
               </div>
             )}
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-x-4 top-24 bottom-4 z-40 md:hidden transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) origin-top no-print flex flex-col pointer-events-none ${mobileMenuOpen ? 'pointer-events-auto' : ''}`}>
        <div 
          className={`bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-900/20 border border-white/50 p-2 overflow-y-auto max-h-full transition-all duration-500 ${
            mobileMenuOpen && showNav ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-8 scale-95 pointer-events-none'
          }`}
        >
          <div className="p-4 pb-0">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Kalkulator Pajak</h3>
            <div className="space-y-1">
              {tabs.map((tab, idx) => 
                renderMobileMenuItem(tab.id as Tab, tab.label, tab.fullLabel, tab.icon, idx)
              )}
            </div>
          </div>

          <div className="p-4 pt-2">
            <div className="h-px bg-slate-100 mb-4"></div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Alat Bantu</h3>
            <div className="space-y-1">
              {renderMobileMenuItem('CALENDAR', 'Kalender Pajak', 'Agenda & Deadline', <CalendarDays size={18} />, 6)}
              {renderMobileMenuItem('HISTORY', 'Riwayat', 'Log Perhitungan', <History size={18} />, 7)}
              {renderMobileMenuItem('FAQ', 'Panduan & FAQ', 'Pusat Informasi', <BookOpen size={18} />, 8)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        
        {/* Hero Section */}
        <div key={`hero-${activeTab}`} className="text-center mb-12 animate-enter no-print">
           <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">
             {activeTab === 'PPH21' && 'Kalkulator PPh 21'}
             {activeTab === 'PPH23' && 'Kalkulator PPh 23'}
             {activeTab === 'FINAL' && 'Kalkulator PPh Final'}
             {activeTab === 'PPN' && 'Kalkulator PPN'}
             {activeTab === 'PPNBM' && 'Kalkulator PPNBM'}
             {activeTab === 'BEACUKAI' && 'Bea Masuk & Pajak Impor'}
             {activeTab === 'CALENDAR' && 'Kalender Pajak Indonesia'}
             {activeTab === 'FAQ' && 'Pusat Bantuan & Informasi'}
             {activeTab === 'HISTORY' && 'Riwayat Perhitungan'}
           </h2>
           <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
             {activeTab === 'PPH21' && 'Hitung estimasi pajak penghasilan bersih karyawan dengan presisi tinggi.'}
             {activeTab === 'PPH23' && 'Perhitungan cepat untuk pajak dividen, royalti, bunga, hadiah, dan jasa.'}
             {activeTab === 'FINAL' && 'Alat bantu hitung pajak bersifat final seperti sewa tanah & UMKM.'}
             {activeTab === 'PPN' && 'Kalkulasi Pajak Pertambahan Nilai 11% untuk transaksi bisnis.'}
             {activeTab === 'PPNBM' && 'Estimasi pajak barang mewah untuk kendaraan dan properti.'}
             {activeTab === 'BEACUKAI' && 'Estimasi pajak barang kiriman (impor) sesuai PMK 199/2019 & PMK 96/2023.'}
             {activeTab === 'CALENDAR' && 'Pantau tanggal jatuh tempo pelaporan dan pembayaran pajak agar bebas denda.'}
             {activeTab === 'FAQ' && 'Pelajari jenis-jenis pajak di Indonesia dan cara menggunakan aplikasi.'}
             {activeTab === 'HISTORY' && 'Akses kembali perhitungan pajak yang telah Anda simpan sebelumnya.'}
           </p>
        </div>

        {/* Main Content */}
        <div key={`content-${activeTab}`} className="animate-enter">
          {activeTab === 'PPH21' && <CalculatorPPH21 onContextUpdate={setContextData} />}
          {activeTab === 'PPH23' && <CalculatorPPH23 onContextUpdate={setContextData} />}
          {activeTab === 'FINAL' && <CalculatorFinal onContextUpdate={setContextData} />}
          {activeTab === 'PPN' && <CalculatorPPN onContextUpdate={setContextData} />}
          {activeTab === 'PPNBM' && <CalculatorPPNBM onContextUpdate={setContextData} />}
          {activeTab === 'BEACUKAI' && <CalculatorBeaCukai onContextUpdate={setContextData} />}
          {activeTab === 'CALENDAR' && <TaxCalendar />}
          {activeTab === 'FAQ' && <FAQPage />}
          {activeTab === 'HISTORY' && <HistoryPage />}
        </div>

      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 mt-auto py-8 text-center border-t border-slate-200/50 bg-white/30 backdrop-blur-sm no-print">
        <p className="text-sm font-medium text-slate-400">
          © 2025 PajakKu Pro. Hak Cipta Dilindungi.
        </p>
      </footer>

      <AIWidget contextData={contextData} />
    </div>
  );
};

export default App;
