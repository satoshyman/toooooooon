
import React, { useState, useEffect, useRef } from 'react';
import { AppState, AppConfig, Task, WithdrawalStatus } from '../types.ts';
import { 
  ShieldAlert, RefreshCcw, Save, Zap, HandCoins, CheckCircle2, 
  Ban, Trash2, Plus, Users, TrendingUp, ChevronDown, ChevronUp, Cpu, Droplets, Gift
} from 'lucide-react';

interface Props {
  state: AppState;
  onUpdateConfig: (c: AppConfig) => void;
  onUpdateMonetization: (m: any) => void;
  onUpdateTasks: (t: Task[]) => void;
  onUpdateWithdrawalStatus: (id: string, status: WithdrawalStatus) => void;
  onReset: () => void;
  onAddBalance: (amt: number) => void;
}

const AdminView: React.FC<Props> = ({ state, onUpdateConfig, onUpdateMonetization, onUpdateTasks, onUpdateWithdrawalStatus, onReset, onAddBalance }) => {
  const [localConfig, setLocalConfig] = useState<any>(() => ({
    miningRate: state.config.miningRate.toString(),
    faucetReward: state.config.faucetReward.toString(),
    dailyGiftReward: state.config.dailyGiftReward.toString(),
    sessionDuration: state.config.sessionDuration.toString(),
    faucetCooldown: state.config.faucetCooldown.toString()
  }));
  
  const [localTasks, setLocalTasks] = useState<Task[]>(() => [...state.tasks]);
  const [balanceAmt, setBalanceAmt] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>("cards");

  const saveAll = () => {
    const finalConfig: AppConfig = {
      ...state.config,
      miningRate: parseFloat(localConfig.miningRate) || 0,
      faucetReward: parseFloat(localConfig.faucetReward) || 0,
      dailyGiftReward: parseFloat(localConfig.dailyGiftReward) || 0,
      sessionDuration: parseInt(localConfig.sessionDuration) || 0,
      faucetCooldown: parseInt(localConfig.faucetCooldown) || 0
    };
    
    onUpdateConfig(finalConfig);
    onUpdateTasks(localTasks);
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      window.Telegram.WebApp.showAlert('✅ Changes Saved Successfully!');
    }
  };

  const handleTaskUpdate = (idx: number, field: keyof Task, value: any) => {
    const updated = [...localTasks];
    updated[idx] = { ...updated[idx], [field]: value };
    setLocalTasks(updated);
  };

  const Section = ({ id, title, subtitle, icon: Icon, children, count, colorClass }: any) => (
    <div className={`glass-card rounded-[2.5rem] overflow-hidden transition-all duration-500 mb-4 border ${expandedSection === id ? 'border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'border-white/5'}`}>
      <button 
        type="button"
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${colorClass || 'bg-blue-500/10 text-blue-400'}`}>
            <Icon size={22} />
          </div>
          <div>
            <h3 className="font-black uppercase text-[12px] tracking-widest text-white">{title}</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {count !== undefined && <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black">{count}</span>}
          {expandedSection === id ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
        </div>
      </button>
      {expandedSection === id && (
        <div className="px-6 pb-8 pt-2 space-y-6 animate-in slide-in-from-top-4 duration-500">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 pb-32 animate-in fade-in duration-700">
      
      <div className="glass-card bg-gradient-to-br from-red-600/10 to-transparent border border-red-500/20 rounded-[3rem] p-8 flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-[2rem] flex items-center justify-center text-red-500 animate-icon-pulse">
          <ShieldAlert size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Admin Console</h1>
          <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] mt-1">Live configuration & management</p>
        </div>
      </div>

      <div className="flex gap-2 sticky top-2 z-50 mb-6 bg-black/40 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/10">
         <button onClick={saveAll} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
           <Save size={18} /> SAVE ALL CHANGES
         </button>
         <button onClick={onReset} className="bg-red-950/40 border border-red-900/40 text-red-500 px-6 rounded-2xl active:scale-95 transition-all">
           <RefreshCcw size={20} />
         </button>
      </div>

      <Section 
        id="cards" 
        title="Engine Settings" 
        subtitle="Mining values & rates" 
        icon={Cpu}
        colorClass="bg-blue-500/10 text-blue-400"
      >
        <div className="space-y-8">
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-1">
               <Zap size={14} className="text-yellow-500" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Engine</span>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Mining Rate (TON/hr)</label>
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={localConfig.miningRate} 
                    onChange={e => setLocalConfig({...localConfig, miningRate: e.target.value})} 
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-white outline-none focus:border-blue-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Session Dur (ms)</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    value={localConfig.sessionDuration} 
                    onChange={e => setLocalConfig({...localConfig, sessionDuration: e.target.value})} 
                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-white outline-none focus:border-blue-500" 
                  />
                </div>
             </div>
          </div>
        </div>
      </Section>

      <Section 
        id="tasks" 
        title="Tasks & Ads" 
        subtitle="Manage reward links" 
        icon={Zap}
        count={localTasks.length}
        colorClass="bg-purple-500/10 text-purple-400"
      >
        <div className="space-y-4">
          {localTasks.map((task, idx) => (
            <div key={task.id} className="bg-black/40 border border-white/5 rounded-[2rem] p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Task #{idx + 1}</span>
                <button 
                  type="button"
                  onClick={() => setLocalTasks(localTasks.filter(t => t.id !== task.id))} 
                  className="text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-600 uppercase ml-2">Task Title</label>
                <input 
                  type="text"
                  value={task.title} 
                  onChange={e => handleTaskUpdate(idx, 'title', e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-xs text-white outline-none focus:border-purple-500" 
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="h-20" />
    </div>
  );
};

export default AdminView;
