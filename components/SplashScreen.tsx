
import React, { useEffect, useState } from 'react';
import { Calculator } from 'lucide-react';

interface Props {
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  // Animation Sequence
  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 200);
    const badgeTimer = setTimeout(() => setShowBadge(true), 400);
    
    // Auto exit after 2.5 seconds
    const exitTimer = setTimeout(() => setIsExiting(true), 2500);
    const finishTimer = setTimeout(onFinish, 3200); // Wait for exit animation

    return () => {
      clearTimeout(textTimer);
      clearTimeout(badgeTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] ${isExiting ? 'opacity-0 -translate-y-12 scale-105 pointer-events-none' : 'opacity-100'
        }`}
    >
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] translate-x-20 translate-y-20"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Icon Composition */}
        <div className="relative mb-8 animate-scale-in">
          <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse"></div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-5 rounded-3xl border border-slate-700 shadow-2xl shadow-blue-900/50 relative overflow-hidden group">
            {/* Shine effect inside box */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-shimmer"></div>
            <Calculator size={48} className="text-white relative z-10" strokeWidth={1.5} />
          </div>
        </div>

        {/* Typography with Mask Reveal */}
        <div className="flex items-center gap-3 overflow-hidden pb-2">
          <div className={`transform transition-all duration-1000 cubic-bezier(0.2, 1, 0.3, 1) ${showText ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              PajakKu
            </h1>
          </div>
          <div className={`transform transition-all duration-1000 delay-100 cubic-bezier(0.2, 1, 0.3, 1) ${showText ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Piro
            </h1>
          </div>
        </div>

        {/* Tagline / Badge */}
        <div className={`mt-4 transition-all duration-700 ${showBadge ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'}`}>
          <div className="flex flex-col items-center gap-3">
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
            <span className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-[0.2em]">
              Smart Tax Calculator
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-[10px] font-medium text-slate-600 uppercase tracking-wider opacity-50">
        Powered by Gemini AI
      </div>
    </div>
  );
};
