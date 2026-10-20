import React, { useState, useEffect } from 'react';
import { Rider, OrderItem, OrderStatus } from '../types';
import { soundEffects } from '../utils/audio';
import {
  Zap,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  MapPin,
  Shield,
  ArrowRight,
  Phone,
  Power,
  AlertCircle,
  Truck,
  Bike,
} from 'lucide-react';

interface RiderDashboardProps {
  currentRider: Rider;
  onToggleOnline: (isOnline: boolean) => void;
  activeOrders: OrderItem[];
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onOpenReviewModal: (order: OrderItem) => void;
}

export const RiderDashboard: React.FC<RiderDashboardProps> = ({
  currentRider,
  onToggleOnline,
  activeOrders,
  onUpdateOrderStatus,
  onOpenReviewModal,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  // Filter orders assigned to this rider
  const riderActiveOrder = activeOrders.find(
    (o) => o.riderId === currentRider.id && o.status !== 'delivered' && o.status !== 'cancelled'
  );

  const handleVerifyPinAndDeliver = () => {
    if (!riderActiveOrder) return;
    if (pinInput.trim() === riderActiveOrder.securityPin) {
      setPinError('');
      soundEffects.playDeliverySuccess();
      onUpdateOrderStatus(riderActiveOrder.id, 'delivered');
      onOpenReviewModal(riderActiveOrder);
      setPinInput('');
    } else {
      setPinError('Incorrect recipient verification PIN. Please re-check with recipient.');
    }
  };

  const handleCollect = () => {
    if (!riderActiveOrder) return;
    soundEffects.playPickupChime();
    onUpdateOrderStatus(riderActiveOrder.id, 'package_collected');
  };

  const handleStartTransit = () => {
    if (!riderActiveOrder) return;
    soundEffects.playDispatchAlert();
    onUpdateOrderStatus(riderActiveOrder.id, 'in_transit');
  };

  const handleRequestPayout = () => {
    setPayoutSuccess(true);
    setTimeout(() => setPayoutSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Rider Status Banner */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#222222] p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentRider.avatarUrl}
            alt={currentRider.name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover border-2 border-blue-400/50"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{currentRider.name}</h2>
              <span className="text-xs font-bold text-amber-400 tabular-nums">★ {currentRider.rating}</span>
            </div>
            <p className="text-xs text-slate-400">
              {currentRider.vehicleModel} · <span className="font-mono text-slate-300">{currentRider.vehiclePlate}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleOnline(!currentRider.isOnline)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              currentRider.isOnline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                : 'bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{currentRider.isOnline ? 'Online · Accepting Dispatches' : 'Offline · On Break'}</span>
          </button>
        </div>
      </div>

      {/* Rider Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#111111] rounded-xl border border-[#222222]">
          <span className="text-[11px] text-slate-400 block">Today's Earnings</span>
          <span className="text-xl font-bold text-white tabular-nums">${currentRider.earningsToday.toFixed(2)}</span>
          <span className="text-[10px] text-emerald-400 block mt-1">+18% vs yesterday</span>
        </div>

        <div className="p-4 bg-[#111111] rounded-xl border border-[#222222]">
          <span className="text-[11px] text-slate-400 block">Trips Completed</span>
          <span className="text-xl font-bold text-white tabular-nums">{currentRider.completedToday} Trips</span>
          <span className="text-[10px] text-blue-400 block mt-1">100% On-Time</span>
        </div>

        <div className="p-4 bg-[#111111] rounded-xl border border-[#222222]">
          <span className="text-[11px] text-slate-400 block">Average Speed</span>
          <span className="text-xl font-bold text-white tabular-nums">{currentRider.speedKmh} km/h</span>
          <span className="text-[10px] text-slate-400 block mt-1">Optimal urban pacing</span>
        </div>

        <div className="p-4 bg-[#111111] rounded-xl border border-[#222222]">
          <span className="text-[11px] text-slate-400 block">Customer Rating</span>
          <span className="text-xl font-bold text-amber-400 tabular-nums">★ {currentRider.rating}</span>
          <span className="text-[10px] text-slate-400 block mt-1">{currentRider.totalTrips} Lifetime Deliveries</span>
        </div>
      </div>

      {/* Active Job Terminal */}
      {riderActiveOrder ? (
        <div className="bg-[#0a0a0a] rounded-xl border border-blue-500/50 p-5 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#222222] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              <h3 className="text-base font-bold text-white">Active Delivery Assignment</h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400">{riderActiveOrder.trackingCode}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-[#121212] rounded-lg border border-[#242424] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-400 font-semibold">
                <MapPin className="w-4 h-4" />
                <span>Pickup: {riderActiveOrder.pickupLocation.name}</span>
              </div>
              <p className="text-slate-300">{riderActiveOrder.pickupLocation.address}</p>
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span>Sender: {riderActiveOrder.senderName}</span>
                <a href={`tel:${riderActiveOrder.senderPhone}`} className="text-blue-400 hover:underline">
                  Call Sender
                </a>
              </div>
            </div>

            <div className="p-3.5 bg-[#121212] rounded-lg border border-[#242424] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <MapPin className="w-4 h-4" />
                <span>Dropoff: {riderActiveOrder.dropoffLocation.name}</span>
              </div>
              <p className="text-slate-300">{riderActiveOrder.dropoffLocation.address}</p>
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span>Recipient: {riderActiveOrder.recipientName}</span>
                <a href={`tel:${riderActiveOrder.recipientPhone}`} className="text-blue-400 hover:underline">
                  Call Recipient
                </a>
              </div>
            </div>
          </div>

          {/* Action Step Transitions */}
          <div className="p-4 bg-[#141414] rounded-xl border border-[#242424] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Current Task Status:</span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {riderActiveOrder.status.replace(/_/g, ' ')}
              </span>
            </div>

            {riderActiveOrder.status === 'heading_to_pickup' && (
              <button
                onClick={handleCollect}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Arrived at Pickup &amp; Parcel Collected</span>
              </button>
            )}

            {riderActiveOrder.status === 'package_collected' && (
              <button
                onClick={handleStartTransit}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Start Transit to Destination</span>
              </button>
            )}

            {riderActiveOrder.status === 'in_transit' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-300">
                  Ask the recipient for their 4-digit verification PIN to confirm secure handover:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN (e.g. 4829)"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black border border-[#262626] rounded-lg text-sm font-mono text-white tracking-widest text-center focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleVerifyPinAndDeliver}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Confirm Delivery
                  </button>
                </div>
                {pinError && <p className="text-xs text-rose-400">{pinError}</p>}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] rounded-xl border border-[#222222] p-8 text-center space-y-3">
          <Truck className="w-10 h-10 text-blue-400 mx-auto opacity-70" />
          <h3 className="text-base font-bold text-white">Ready for Urban Dispatches</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You are online and positioned on the central grid. Incoming dispatch requests from nearby customers will ring here automatically.
          </p>
        </div>
      )}

      {/* Earnings & Instant Payout Drawer */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#222222] p-5 shadow-xl flex items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400">Withdrawable Balance</span>
          <span className="text-2xl font-bold text-white block tabular-nums">${currentRider.earningsToday.toFixed(2)}</span>
          <span className="text-[11px] text-slate-500">Connected to Chase Bank (•••• 4910)</span>
        </div>

        <button
          onClick={handleRequestPayout}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-blue-600/20"
        >
          {payoutSuccess ? 'Payout Initiated!' : 'Request Instant Payout'}
        </button>
      </div>
    </div>
  );
};
