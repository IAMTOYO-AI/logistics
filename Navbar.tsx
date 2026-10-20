import React from 'react';
import { Truck, Bell, Volume2, VolumeX, Shield, User, Bike } from 'lucide-react';
import { UserRole, AppNotification } from '../types';
import { soundEffects } from '../utils/audio';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  notifications: AppNotification[];
  setIsNotificationDrawerOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  activeOrdersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeRole,
  setActiveRole,
  notifications,
  setIsNotificationDrawerOpen,
  setIsAuthModalOpen,
  soundEnabled,
  setSoundEnabled,
  activeOrdersCount,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEffects.setSoundEnabled(next);
    if (next) {
      soundEffects.playDispatchAlert();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-black/95 backdrop-blur-md border-b border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand title wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('book')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-500 transition-colors">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              Pulse<span className="text-blue-400">Logistics</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentTab('book')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'book' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Book Delivery
          </button>
          <button
            onClick={() => setCurrentTab('tracking')}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'tracking' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Live Tracking
            {activeOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-blue-600 text-white tabular-nums">
                {activeOrdersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveRole('rider');
              setCurrentTab('rider');
            }}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'rider' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Rider Portal
          </button>
          <button
            onClick={() => setCurrentTab('radar')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'radar' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Fleet Radar
          </button>
          <button
            onClick={() => setCurrentTab('reviews')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentTab === 'reviews' ? 'text-blue-400 font-semibold' : ''
            }`}
          >
            Reviews &amp; Trust
          </button>
        </nav>

        {/* Zone 3: Interactive Controls & Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sound toggle button */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Disable order chime sounds' : 'Enable order chime sounds'}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Notifications button */}
          <button
            onClick={() => setIsNotificationDrawerOpen(true)}
            title="Automated Order Notifications"
            className="relative p-2 text-slate-300 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-black" />
            )}
          </button>

          {/* Role Mode Quick Toggle */}
          <div className="hidden lg:flex items-center p-1 bg-[#121212] rounded-lg border border-[#262626] text-xs">
            <button
              onClick={() => {
                setActiveRole('customer');
                if (currentTab === 'rider') setCurrentTab('book');
              }}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                activeRole === 'customer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => {
                setActiveRole('rider');
                setCurrentTab('rider');
              }}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                activeRole === 'rider'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rider
            </button>
            <button
              onClick={() => {
                setActiveRole('dispatcher');
                setCurrentTab('radar');
              }}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                activeRole === 'dispatcher'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dispatcher
            </button>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-500/20 whitespace-nowrap shrink-0"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In / Join</span>
          </button>
        </div>
      </div>
    </header>
  );
};
