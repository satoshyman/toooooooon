
import React, { useState, useEffect, useCallback } from 'react';
import MiningPage from './components/MiningPage';
import TasksPage from './components/TasksPage';
import WalletPage from './components/WalletPage';
import ReferralPage from './components/ReferralPage';
import AdminDashboard from './components/AdminDashboard';
import { Page, UserState, WithdrawalRecord, AppSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';

declare global {
  interface Window {
    Telegram: any;
  }
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Mining);
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  // تحميل الإعدادات من التخزين المحلي أو استخدام الافتراضية
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('ton_app_settings');
    const parsed = saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...parsed };
  });

  // حالة المستخدم
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('ton_miner_state');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      balance: 0.00000000,
      miningStartTime: null,
      isMining: false,
      completedTasks: [],
      withdrawalAddress: '',
      referralsCount: 0,
      referralEarnings: 0,
      userId: Math.random().toString(36).substring(2, 9).toUpperCase(),
      username: 'مستخدم جديد',
      withdrawalHistory: [],
      lastGiftClaimedTime: null,
      referredBy: null
    };
  });

  // تليجرام وإعدادات الهوية
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        const name = tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '');
        setUserState(prev => ({ ...prev, username: name }));
      }

      // كود الإحالة من الرابط t.me/bot?start=REF_ID
      const startParam = tg.initDataUnsafe?.start_param;
      if (startParam && !userState.referredBy && startParam !== userState.userId) {
        setUserState(prev => ({
          ...prev,
          referredBy: startParam
        }));
      }
    }
  }, []);

  // حفظ الإعدادات وحالة المستخدم تلقائياً
  useEffect(() => {
    localStorage.setItem('ton_app_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  useEffect(() => {
    localStorage.setItem('ton_miner_state', JSON.stringify(userState));
  }, [userState]);

  const handleStartMining = () => {
    setUserState(prev => ({
      ...prev,
      isMining: true,
      miningStartTime: Date.now()
    }));
  };

  const handleEndMining = useCallback(() => {
    setUserState(prev => {
      if (!prev.isMining) return prev;
      return {
        ...prev,
        isMining: false,
        miningStartTime: null,
        balance: prev.balance + appSettings.miningRatePerSession
      };
    });
  }, [appSettings.miningRatePerSession]);

  const handleCompleteTask = (taskId: string, reward: number) => {
    if (!userState.completedTasks.includes(taskId)) {
      setUserState(prev => ({
        ...prev,
        balance: prev.balance + reward,
        completedTasks: [...prev.completedTasks, taskId]
      }));
    }
  };

  const handleClaimDailyGift = () => {
    setUserState(prev => ({
      ...prev,
      balance: prev.balance + appSettings.dailyGiftAmount,
      lastGiftClaimedTime: Date.now()
    }));
  };

  const sendTelegramNotification = async (amount: number, address: string) => {
    const { adminBotToken, adminChatId } = appSettings;
    if (!adminBotToken || !adminChatId) return;

    const message = `💰 *طلب سحب جديد*
👤 الاسم: ${userState.username}
🆔 المعرف: ${userState.userId}
💵 المبلغ: ${amount.toFixed(8)} TON
🏦 المحفظة: \`${address}\``;

    try {
      await fetch(`https://api.telegram.org/bot${adminBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: adminChatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
    } catch (e) {
      console.error("إشعار تليجرام فشل", e);
    }
  };

  const handleWithdraw = (amount: number, address: string) => {
    const newRecord: WithdrawalRecord = {
      id: Math.random().toString(36).substring(2, 10).toUpperCase(),
      amount,
      address,
      status: 'Processing',
      timestamp: Date.now()
    };
    
    setUserState(prev => ({
      ...prev,
      balance: prev.balance - amount,
      withdrawalHistory: [newRecord, ...prev.withdrawalHistory]
    }));

    sendTelegramNotification(amount, address);
  };

  const updateWithdrawalStatus = (id: string, status: WithdrawalRecord['status']) => {
    setUserState(prev => ({
      ...prev,
      withdrawalHistory: prev.withdrawalHistory.map(w => w.id === id ? { ...w, status } : w)
    }));
  };

  const handleLogoClick = () => {
    setAdminClickCount(prev => {
      const next = prev + 1;
      if (next === 8) {
        setShowAdminAuth(true);
        return 0;
      }
      return next;
    });
  };

  const submitAuth = () => {
    if (authPassword === appSettings.adminPassword) {
      setCurrentPage(Page.Admin);
      setShowAdminAuth(false);
      setAuthPassword('');
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 500);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white pb-20 overflow-hidden font-['Cairo']" dir="rtl">
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogoClick}>
          <img src="https://cryptologos.cc/logos/toncoin-ton-logo.svg?v=040" className="w-8 h-8" alt="TON" />
          <span className="font-bold text-lg text-blue-400">TON MINER</span>
        </div>
        <div className="bg-slate-800 px-4 py-1.5 rounded-full text-blue-400 text-sm font-black border border-blue-500/20">
          {userState.balance.toFixed(8)} <span className="text-[10px]">TON</span>
        </div>
      </header>

      {showAdminAuth && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md">
          <div className={`bg-slate-900 border-2 ${authError ? 'border-red-500 animate-shake' : 'border-slate-800'} p-8 rounded-[2rem] w-full max-w-sm shadow-2xl`}>
            <h3 className="text-xl font-black text-center mb-6">لوحة التحكم</h3>
            <input 
              type="password"
              placeholder="الرمز السري"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 px-4 text-center text-xl text-blue-500 outline-none mb-4"
            />
            <button onClick={submitAuth} className="w-full py-4 bg-blue-600 rounded-xl font-black">دخول</button>
            <button onClick={() => setShowAdminAuth(false)} className="w-full py-2 text-slate-500 text-sm mt-2">إلغاء</button>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 overflow-y-auto">
        {currentPage === Page.Mining && (
          <MiningPage state={userState} settings={appSettings} onStart={handleStartMining} onEnd={handleEndMining} onClaimGift={handleClaimDailyGift} />
        )}
        {currentPage === Page.Tasks && (
          <TasksPage state={userState} settings={appSettings} onComplete={handleCompleteTask} />
        )}
        {currentPage === Page.Referrals && (
          <ReferralPage state={userState} settings={appSettings} />
        )}
        {currentPage === Page.Wallet && (
          <WalletPage state={userState} settings={appSettings} onUpdateAddress={(addr) => setUserState(p => ({...p, withdrawalAddress: addr}))} onWithdraw={handleWithdraw} />
        )}
        {currentPage === Page.Admin && (
          <AdminDashboard settings={appSettings} onSaveSettings={setAppSettings} withdrawals={userState.withdrawalHistory} onUpdateWithdrawal={updateWithdrawalStatus} onClose={() => setCurrentPage(Page.Mining)} />
        )}
      </main>

      {currentPage !== Page.Admin && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex justify-around p-3 z-50">
          <NavBtn active={currentPage === Page.Mining} label="تعدين" icon="⛏️" onClick={() => setCurrentPage(Page.Mining)} />
          <NavBtn active={currentPage === Page.Tasks} label="مهام" icon="📋" onClick={() => setCurrentPage(Page.Tasks)} />
          <NavBtn active={currentPage === Page.Referrals} label="إحالة" icon="👥" onClick={() => setCurrentPage(Page.Referrals)} />
          <NavBtn active={currentPage === Page.Wallet} label="محفظة" icon="💰" onClick={() => setCurrentPage(Page.Wallet)} />
        </nav>
      )}
    </div>
  );
};

const NavBtn = ({ active, label, icon, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 flex-1 ${active ? 'text-blue-400' : 'text-slate-500'}`}>
    <span className="text-xl">{icon}</span>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default App;
