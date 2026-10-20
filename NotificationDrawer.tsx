import React from 'react';
import { AppNotification } from '../types';
import { Bell, Volume2, VolumeX, CheckCheck, X, Truck, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onSimulateNotification: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  soundEnabled,
  setSoundEnabled,
  onSimulateNotification,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'dispatch':
      case 'order':
        return <Truck className="w-4 h-4 text-blue-400" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'delivery':
        return <ShieldCheck className="w-4 h-4 text-sky-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0a0a0a] border-l border-[#222222] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-[#121212] border-b border-[#222222] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Automated Dispatch Alerts</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  soundEffects.setSoundEnabled(next);
                }}
                title={soundEnabled ? 'Mute alert sounds' : 'Unmute alert sounds'}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e1e1e] transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1e1e1e] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick simulation bar */}
          <div className="p-3 bg-[#111111] border-b border-[#222222] flex items-center justify-between text-xs">
            <span className="text-slate-400">Real-Time Event Feed</span>
            <div className="flex items-center gap-2">
              <button
                onClick={onSimulateNotification}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Test Alert Ping</span>
              </button>
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-slate-400 hover:text-white text-[11px] font-medium transition-colors"
                >
                  Mark Read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1c1c1c] p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No dispatch notifications yet. Book a delivery or trigger an alert to preview.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg transition-colors flex items-start gap-3 ${
                    notif.read ? 'bg-transparent text-slate-400' : 'bg-[#141414] text-slate-200'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-[#1e1e1e] shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
