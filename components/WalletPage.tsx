
import React, { useState, useEffect, useMemo } from 'react';
import { UserState, AppSettings } from '../types';

interface WalletPageProps {
  state: UserState;
  settings: AppSettings;
  onUpdateAddress: (address: string) => void;
  onWithdraw: (amount: number, address: string) => void;
}

type CongestionLevel = 'Low' | 'Medium' | 'High';

const WalletPage: React.FC<WalletPageProps> = ({ state, settings, onUpdateAddress, onWithdraw }) => {
  const [address, setAddress] = useState(state.withdrawalAddress);
  const [showStatus, setShowStatus] = useState(false);
  const [congestion, setCongestion] = useState<CongestionLevel>('Low');

  // Simulate network congestion changes
  useEffect(() => {
    const levels: CongestionLevel[] = ['Low', 'Medium', 'High'];
    const interval = setInterval(() => {
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      setCongestion(randomLevel);
    }, 15000); // Change every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const networkFee = useMemo(() => {
    switch (congestion) {
      case 'High': return 0.05000000;
      case 'Medium': return 0.02000000;
      case 'Low': 
      default: return 0.01000000;
    }
  }, [congestion]);

  const handleWithdrawRequest = () => {
    if (!address || address.length < 20) {
      alert('يرجى إدخال عنوان محفظة TON صالح');
      return;
    }
    
    const totalRequired = settings.minWithdrawal + networkFee;
    
    if (state.balance < totalRequired) {
      alert(`عذراً، رصيدك غير كافٍ. الحد الأدنى للسحب هو ${settings.minWithdrawal.toFixed(8)} TON + رسوم الشبكة ${networkFee.toFixed(8)} TON`);
      return;
    }
    
    // Withdraw everything minus fee
    const withdrawAmount = state.balance - networkFee;
    onWithdraw(withdrawAmount, address);
    
    setShowStatus(true);
    setTimeout(() => setShowStatus(false), 5000);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getCongestionColor = () => {
    switch (congestion) {
      case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-green-500 bg-green-500/10 border-green-500/20';
    }
  };

  const getCongestionLabel = () => {
    switch (congestion) {
      case 'High': return 'مرتفع جداً';
      case 'Medium': return 'متوسط';
      default: return 'منخفض';
    }
  };

  return (
    <div className="flex flex-col gap-6 py-4 animate-fadeIn">
      {/* Wallet Balance Card */}
      <div className="ton-gradient rounded-3xl p-8 shadow-xl shadow-blue-500/10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <img src="https://cryptologos.cc/logos/toncoin-ton-logo.svg?v=040" className="w-48 h-48" alt="" />
        </div>
        <p className="text-blue-100 text-sm font-medium opacity-80 mb-2 tracking-wider">الرصيد الكلي المتاح</p>
        <div className="text-4xl font-mono font-black tracking-tight drop-shadow-md">
          {state.balance.toFixed(8)} <span className="text-xl opacity-70">TON</span>
        </div>
        <p className="text-blue-200 text-xs mt-4 font-bold">≈ ${(state.balance * 5.25).toFixed(2)} USD</p>
      </div>

      {/* Withdrawal Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-white">سحب يدوي</h3>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors duration-500 flex items-center gap-1.5 ${getCongestionColor()}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            ازدحام الشبكة: {getCongestionLabel()}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 mr-1 font-bold uppercase tracking-widest">عنوان محفظة TON</label>
          <input 
            type="text" 
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              onUpdateAddress(e.target.value);
            }}
            placeholder="UQBY... أو EQBY..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-5 text-blue-400 font-mono text-sm focus:border-blue-500 outline-none transition-all shadow-inner"
          />
        </div>

        <div className="bg-slate-950/50 p-5 rounded-2xl space-y-3 border border-slate-800/50">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold">الحد الأدنى للسحب:</span>
            <span className="font-mono font-bold text-slate-200">{settings.minWithdrawal.toFixed(8)} TON</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold">رسوم الشبكة الحالية:</span>
            <div className="flex flex-col items-end">
              <span className={`font-mono font-bold transition-colors duration-500 ${congestion === 'High' ? 'text-red-400' : 'text-blue-400'}`}>
                {networkFee.toFixed(8)} TON
              </span>
              {congestion === 'High' && <span className="text-[9px] text-red-500/70 font-bold">رسوم مرتفعة بسبب الازدحام</span>}
            </div>
          </div>
          <div className="h-px bg-slate-800/50 my-1"></div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-black">المبلغ الذي ستتلقاه:</span>
            <span className="font-mono font-black text-green-400 text-sm">
              {Math.max(0, state.balance - networkFee).toFixed(8)} TON
            </span>
          </div>
        </div>

        <button 
          onClick={handleWithdrawRequest}
          disabled={state.balance < (settings.minWithdrawal + networkFee)}
          className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${
            state.balance < (settings.minWithdrawal + networkFee)
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
            : 'bg-white text-slate-950 hover:scale-[1.02] active:scale-[0.98] hover:shadow-white/10'
          }`}
        >
          <span>تأكيد طلب السحب</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>

      {/* Transaction History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
          سجل المعاملات
        </h3>
        {state.withdrawalHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-600 text-sm font-bold bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
            لا توجد معاملات سابقة حتى الآن
          </div>
        ) : (
          <div className="space-y-4">
            {state.withdrawalHistory.map(record => (
              <div key={record.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3 group hover:border-blue-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1 uppercase tracking-tight">{formatDate(record.timestamp)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-100">{record.amount.toFixed(4)}</span>
                      <span className="text-xs font-bold text-slate-500">TON</span>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                    record.status === 'Processing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                    record.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {record.status === 'Processing' ? 'قيد المراجعة' : record.status === 'Completed' ? 'مكتمل' : 'مرفوض'}
                  </div>
                </div>
                <div className="text-[9px] font-mono text-slate-600 bg-black/40 px-3 py-2 rounded-lg border border-slate-800/50 truncate">
                  <span className="text-blue-900/40 mr-1 font-sans font-bold">ADR:</span> {record.address}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Notification Popups */}
      {showStatus && (
        <div className="fixed top-20 left-4 right-4 bg-green-500 text-white p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 z-[60] animate-bounce border-2 border-green-400">
          <div className="bg-white/20 p-2 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="font-black text-sm leading-tight">تم استلام طلب السحب بنجاح! سيتم التحقق من المعاملة خلال 24 ساعة.</p>
        </div>
      )}

      {/* Security Warning Card */}
      <div className="flex gap-4 p-5 rounded-3xl bg-yellow-500/5 border border-yellow-500/10 items-start shadow-inner">
        <div className="bg-yellow-500/10 p-2 rounded-xl">
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-black text-yellow-500/90 mb-1 uppercase tracking-wider">تنبيه أمني</h4>
          <p className="text-[10px] text-yellow-500/60 leading-relaxed font-bold">
            تأكد من إدخال عنوان محفظة TON الصحيح. لا يمكن استرداد العملات المرسلة إلى عناوين خاطئة. عمليات السحب تتم يدوياً لضمان الأمان.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
