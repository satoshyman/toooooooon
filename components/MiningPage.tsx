
import React, { useState, useEffect, useMemo } from 'react';
import { UserState, AppSettings } from '../types';
import { DAY_IN_MS } from '../constants';

interface MiningPageProps {
  state: UserState;
  settings: AppSettings;
  onStart: () => void;
  onEnd: () => void;
  onClaimGift: () => void;
}

declare global {
  interface Window {
    Adsgram: any;
  }
}

const MiningPage: React.FC<MiningPageProps> = ({ state, settings, onStart, onEnd, onClaimGift }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showEndNotification, setShowEndNotification] = useState(false);
  const [showGiftNotification, setShowGiftNotification] = useState(false);
  const [currentSessionEarnings, setCurrentSessionEarnings] = useState<number>(0);
  const [giftCountdown, setGiftCountdown] = useState<number>(0);
  const [adLoading, setAdLoading] = useState(false);

  const tonLogoUrl = "https://cryptologos.cc/logos/toncoin-ton-logo.svg?v=040";

  // Mining session logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (state.isMining && state.miningStartTime) {
      const updateTimer = () => {
        const elapsed = Date.now() - (state.miningStartTime as number);
        const remaining = settings.sessionDurationMs - elapsed;
        
        if (remaining <= 0) {
          onEnd();
          setTimeLeft(0);
          setCurrentSessionEarnings(settings.miningRatePerSession);
          setShowEndNotification(true);
          setTimeout(() => setShowEndNotification(false), 4000);
        } else {
          setTimeLeft(remaining);
          const progressRatio = elapsed / settings.sessionDurationMs;
          setCurrentSessionEarnings(progressRatio * settings.miningRatePerSession);
        }
      };

      updateTimer();
      interval = setInterval(updateTimer, 100);
    } else {
      setCurrentSessionEarnings(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isMining, state.miningStartTime, onEnd, settings.sessionDurationMs, settings.miningRatePerSession]);

  // Gift countdown logic
  useEffect(() => {
    const updateGiftTimer = () => {
      if (!state.lastGiftClaimedTime) {
        setGiftCountdown(0);
        return;
      }
      const elapsed = Date.now() - state.lastGiftClaimedTime;
      const remaining = DAY_IN_MS - elapsed;
      setGiftCountdown(remaining > 0 ? remaining : 0);
    };

    updateGiftTimer();
    const interval = setInterval(updateGiftTimer, 1000);
    return () => clearInterval(interval);
  }, [state.lastGiftClaimedTime]);

  const showAd = async (): Promise<boolean> => {
    if (!window.Adsgram) {
      console.error("Adsgram SDK not loaded");
      return true; // Fallback for testing if SDK fails
    }
    
    setAdLoading(true);
    try {
      const AdController = window.Adsgram.init({ blockId: settings.adsgramBlockId });
      const result = await AdController.show();
      setAdLoading(false);
      return result.done === true;
    } catch (e: any) {
      setAdLoading(false);
      console.error("Ad failed to show:", e);
      if (e?.error === 'no_fill') {
        alert("عذراً، لا توجد إعلانات متوفرة حالياً. جرب لاحقاً.");
      } else {
        alert("حدث خطأ في تحميل الإعلان. يرجى المحاولة مرة أخرى.");
      }
      return false;
    }
  };

  const handleOpenGift = async () => {
    if (giftCountdown > 0 || adLoading) return;
    const adWatched = await showAd();
    if (adWatched) {
      onClaimGift();
      setShowGiftNotification(true);
      setTimeout(() => setShowGiftNotification(false), 4000);
    }
  };

  const handleStartMining = async () => {
    if (state.isMining || adLoading) return;
    const adWatched = await showAd();
    if (adWatched) {
      onStart();
    }
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = state.isMining ? ((settings.sessionDurationMs - timeLeft) / settings.sessionDurationMs) * 100 : 0;

  const particles = useMemo(() => {
    const colors = ['#00aaff', '#00eeff', '#ffffff', '#3b82f6', '#0088cc'];
    return Array.from({ length: 30 }).map((_, i) => {
      const size = 2 + Math.random() * 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      return {
        id: i,
        left: `${5 + Math.random() * 90}%`,
        delay: `${Math.random() * 3}s`,
        duration: `${1.2 + Math.random() * 2.5}s`,
        size: `${size}px`,
        color: color,
        blur: `${Math.random() * 2}px`,
        glow: `0 0 ${size * 3}px ${color}`
      };
    });
  }, []);

  const isGiftAvailable = giftCountdown <= 0;

  return (
    <div className="flex flex-col items-center gap-8 py-4 animate-fadeIn relative overflow-hidden">
      {adLoading && (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-blue-400">جاري تحميل الإعلان...</p>
        </div>
      )}

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      {showEndNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xs animate-bounce">
          <div className="bg-green-500 text-white px-4 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-green-400">
            <div className="bg-white/20 p-2 rounded-full shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-sm font-black">اكتمل التعدين!</p>
              <p className="text-[10px] font-bold opacity-90">تم إضافة الرصيد لحسابك بنجاح.</p>
            </div>
          </div>
        </div>
      )}

      {showGiftNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xs animate-bounce">
          <div className="bg-blue-600 text-white px-4 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border border-blue-400">
            <div className="bg-white/20 p-2 rounded-full shadow-inner">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36 2.38 3.24L16.92 10.83 14.92 8H20v6z"/></svg>
            </div>
            <div>
              <p className="text-sm font-black">هدية اليوم!</p>
              <p className="text-[10px] font-bold opacity-90">تم إضافة {settings.dailyGiftAmount.toFixed(8)} TON لرصيدك.</p>
            </div>
          </div>
        </div>
      )}

      {/* Daily Gift Box */}
      <div className="absolute top-20 left-6 z-30">
        <button 
          onClick={handleOpenGift}
          disabled={!isGiftAvailable || adLoading}
          className={`flex flex-col items-center gap-1 group transition-all duration-300 ${(!isGiftAvailable || adLoading) ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110 active:scale-95 animate-bounce'}`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border-2 transition-all ${isGiftAvailable ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-200' : 'bg-slate-800 border-slate-700 grayscale'}`}>
            <svg className={`w-8 h-8 ${isGiftAvailable ? 'text-white' : 'text-slate-500'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36 2.38 3.24L16.92 10.83 14.92 8H20v6z"/>
            </svg>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 px-2 py-0.5 rounded-lg">
            <p className="text-[9px] font-black text-white whitespace-nowrap">
              {isGiftAvailable ? 'إعلان للهدايا' : formatTime(giftCountdown)}
            </p>
          </div>
        </button>
      </div>

      <div className="text-center relative z-10">
        <h1 className="text-4xl font-black text-white glow-text mb-2 tracking-tighter uppercase">Ton Cloud</h1>
        <div className="h-1.5 w-16 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full shadow-[0_0_15px_#3b82f6]"></div>
      </div>

      <div className="relative flex items-center justify-center w-80 h-80 z-10">
        {state.isMining && particles.map(p => (
          <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, backgroundColor: p.color, boxShadow: p.glow, filter: `blur(${p.blur})`, animation: `floatUpEnhanced ${p.duration} infinite ease-in-out`, animationDelay: p.delay }} />
        ))}
        
        <div className="absolute inset-0 rounded-full border-[8px] border-slate-900/50 shadow-[0_0_50px_rgba(0,170,255,0.1)]"></div>
        <div className="absolute inset-4 rounded-full border-[1px] border-white/5"></div>
        
        <svg className="absolute inset-0 transform -rotate-90 w-full h-full drop-shadow-[0_0_10px_rgba(0,170,255,0.3)]">
          <circle cx="50%" cy="50%" r="45%" fill="transparent" stroke="#0f172a" strokeWidth="16" />
          <circle 
            cx="50%" 
            cy="50%" 
            r="45%" 
            fill="transparent" 
            stroke="url(#blue_gradient_heavy)" 
            strokeWidth="16" 
            strokeDasharray="565" 
            strokeDashoffset={565 - (565 * progress) / 100} 
            strokeLinecap="round" 
            className="transition-all duration-1000 ease-out" 
          />
          <defs>
            <linearGradient id="blue_gradient_heavy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" /><stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>

        <div className={`z-10 bg-slate-900 rounded-full w-56 h-56 flex flex-col items-center justify-center border-4 shadow-2xl relative overflow-hidden transition-all duration-700 ${state.isMining ? 'mining-pulse border-blue-400/50' : 'border-slate-800'}`}>
          <img 
            src={tonLogoUrl} 
            className={`w-36 h-36 transition-all duration-1000 ${state.isMining ? 'scale-110 drop-shadow-[0_0_30px_rgba(0,170,255,1)] opacity-100 rotate-[360deg]' : 'opacity-40 grayscale'}`} 
            style={{ transitionProperty: 'all', transitionDuration: '2000ms' }}
            alt="TON" 
          />
          {state.isMining && (
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-cyan-400/10 animate-pulse pointer-events-none"></div>
          )}
        </div>
      </div>

      <div className={`w-full max-w-sm px-4 z-10 transition-all duration-700 ${state.isMining ? 'scale-105' : 'scale-100'}`}>
        <div className={`rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border-2 transition-all duration-500 ${
          state.isMining 
          ? 'bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 border-white/40 shadow-blue-500/50' 
          : 'bg-slate-900 border-slate-800 shadow-black'
        }`}>
          <div className="flex flex-col items-center z-10 text-center">
            <span className={`text-[10px] font-black uppercase tracking-[0.4em] mb-3 px-3 py-1 rounded-full ${state.isMining ? 'bg-black/20 text-white' : 'text-slate-600 bg-slate-950'}`}>
              {state.isMining ? 'الأرباح المباشرة للجلسة' : 'في انتظار البدء'}
            </span>
            
            <div className="flex items-center gap-3 mb-4">
               <span className={`text-5xl font-mono font-black tracking-tighter ${state.isMining ? 'text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]' : 'text-slate-700'}`}>
                {currentSessionEarnings.toFixed(8)}
              </span>
              <span className={`text-xl font-black ${state.isMining ? 'text-white/80' : 'text-slate-800'}`}>TON</span>
            </div>

            <div className={`px-10 py-3 rounded-2xl font-mono font-black text-3xl shadow-xl border-2 transition-all ${
              state.isMining 
              ? 'bg-slate-950 text-cyan-400 border-cyan-400/30 scale-110' 
              : 'bg-slate-950 text-slate-800 border-slate-900'
            }`}>
              {state.isMining ? formatTime(timeLeft) : formatTime(settings.sessionDurationMs)}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm grid grid-cols-2 gap-4 px-4 z-10">
        <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800/50 backdrop-blur-xl flex flex-col items-center">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Hash Power</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white">4.2 TH/s</span>
            {state.isMining && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shadow-[0_0_10px_#22d3ee]"></div>}
          </div>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800/50 backdrop-blur-xl flex flex-col items-center">
          <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Daily Yield</p>
          <p className="text-xl font-black text-green-400">{(settings.miningRatePerSession * 8).toFixed(4)} TON</p>
        </div>
      </div>

      <div className="w-full max-w-sm px-4 mt-2 z-10 mb-8">
        {!state.isMining ? (
          <button 
            onClick={handleStartMining} 
            disabled={adLoading}
            className="w-full py-6 rounded-3xl ton-gradient text-white font-black text-2xl shadow-[0_10px_30px_rgba(14,165,233,0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
          >
            <span className="drop-shadow-lg text-white">شاهد إعلان وابدأ التعدين</span>
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
               <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>
            </div>
          </button>
        ) : (
          <div className="text-center bg-blue-500/10 border-2 border-blue-500/20 text-blue-300 p-6 rounded-3xl w-full font-black animate-pulse backdrop-blur-md shadow-inner">
            <div className="flex items-center justify-center gap-3 mb-1 text-blue-300">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
              <span>خوادم السحابة متصلة</span>
            </div>
            <p className="text-[10px] text-blue-400/60 uppercase tracking-widest">Mining algorithm active</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiningPage;
