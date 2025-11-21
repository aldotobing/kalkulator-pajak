
import React, { useEffect, useState, useRef } from 'react';
import { Calculator } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: any;
  }
}

interface Props {
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  // Turnstile State
  const [isVerified, setIsVerified] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // 1. Animation Sequence
  useEffect(() => {
    const textTimer = setTimeout(() => setShowText(true), 200);
    const badgeTimer = setTimeout(() => setShowBadge(true), 400);
    const minWaitTimer = setTimeout(() => setAnimationDone(true), 1000); // Minimum logo view time

    // Failsafe: If Turnstile fails to load (adblocker/network/error), let user in after 5s
    const failsafeTimer = setTimeout(() => {
      if (!isVerified) {
        console.warn("[Turnstile] Failsafe triggered (Timeout after 5s)");
        setIsVerified(true);
      }
    }, 5000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(badgeTimer);
      clearTimeout(minWaitTimer);
      clearTimeout(failsafeTimer);
    };
  }, [isVerified]);

  // 2. Render Turnstile with Robust Error Handling
  useEffect(() => {
    console.log('[Turnstile] Starting render attempt...');
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      console.log(`[Turnstile] Check attempt ${attempts}, window.turnstile:`, !!window.turnstile, 'containerRef:', !!containerRef.current);

      if (window.turnstile && containerRef.current) {
        clearInterval(checkInterval);
        console.log('[Turnstile] Script loaded, attempting to render widget...');

        // Prevent double rendering (React Strict Mode fix)
        if (widgetIdRef.current) {
          console.log('[Turnstile] Widget already exists, skipping render');
          return;
        }
        if (containerRef.current.innerHTML !== '') {
          console.log('[Turnstile] Container not empty, skipping render');
          return;
        }

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: '0x4AAAAAABe3cRiTdtHdktvC', // Verified Site Key
            theme: 'dark',
            callback: function (token: string) {
              console.log('[Turnstile] Verification successful!', token.substring(0, 20) + '...');
              setIsVerified(true);
            },
            'error-callback': function (err: any) {
              console.warn("[Turnstile] Error callback triggered:", err);
              setIsVerified(true);
            }
          });
          widgetIdRef.current = id;
          console.log('[Turnstile] Widget rendered successfully with ID:', id);
        } catch (e: any) {
          const msg = e?.message || String(e);
          console.error("[Turnstile] Render exception:", msg, e);
          // Even if it crashes due to frame blocking, we let the user in
          setIsVerified(true);
        }
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
      if (widgetIdRef.current && window.turnstile) {
        try {
          console.log('[Turnstile] Cleaning up widget:', widgetIdRef.current);
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {
          console.warn('[Turnstile] Cleanup error:', e);
        }
      }
    };
  }, []);

  // 3. Exit Logic: Must be both Animation Done AND Verified
  useEffect(() => {
    if (animationDone && isVerified && !isExiting) {
      const exitTimer = setTimeout(() => setIsExiting(true), 200); // Slight delay after verify
      const finishTimer = setTimeout(onFinish, 800); // Wait for exit animation

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [animationDone, isVerified, isExiting, onFinish]);

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

        {/* Turnstile Widget Container */}
        <div className={`mt-12 transition-all duration-1000 ${showBadge ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Keep Turnstile visible until verified */}
          <div
            ref={containerRef}
            className={`min-h-[65px] min-w-[300px] flex justify-center transition-opacity duration-300 ${isVerified ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}
          ></div>

          {/* Status Messages */}
          {!isVerified && (
            <p className="text-[10px] text-slate-500 mt-2 text-center animate-pulse">Verifying Security...</p>
          )}
          {isVerified && (
            <div className="flex items-center justify-center gap-2 mt-2 animate-scale-in">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-green-400">Verified</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-[10px] font-medium text-slate-600 uppercase tracking-wider opacity-50">
        Powered by Gemini AI
      </div>
    </div>
  );
};
