import React, { useState } from 'react';
import { OrderItem, OrderStatus } from '../types';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  Phone,
  Shield,
  Copy,
  Check,
  Share2,
  AlertCircle,
  Truck,
  Zap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

interface OrderTrackingPanelProps {
  order: OrderItem;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onOpenReviewModal: (order: OrderItem) => void;
}

export const OrderTrackingPanel: React.FC<OrderTrackingPanelProps> = ({
  order,
  onUpdateOrderStatus,
  onOpenReviewModal,
}) => {
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyToClipboard = (text: string, type: 'pin' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'pin') {
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return <span className="text-xs font-semibold text-emerald-400">Delivered</span>;
      case 'in_transit':
        return <span className="text-xs font-semibold text-blue-400">In Transit</span>;
      case 'package_collected':
        return <span className="text-xs font-semibold text-sky-400">Package Collected</span>;
      case 'heading_to_pickup':
        return <span className="text-xs font-semibold text-amber-400">Heading to Pickup</span>;
      case 'assigned':
        return <span className="text-xs font-semibold text-indigo-400">Courier Assigned</span>;
      default:
        return <span className="text-xs font-semibold text-slate-400">Processing</span>;
    }
  };

  // Simulation step forward for demo testing
  const advanceStep = () => {
    if (order.status === 'heading_to_pickup') {
      soundEffects.playPickupChime();
      onUpdateOrderStatus(order.id, 'package_collected');
    } else if (order.status === 'package_collected') {
      soundEffects.playDispatchAlert();
      onUpdateOrderStatus(order.id, 'in_transit');
    } else if (order.status === 'in_transit') {
      soundEffects.playDeliverySuccess();
      onUpdateOrderStatus(order.id, 'delivered');
      onOpenReviewModal(order);
    }
  };

  const progressSteps: { label: string; key: OrderStatus }[] = [
    { label: 'Assigned', key: 'assigned' },
    { label: 'To Pickup', key: 'heading_to_pickup' },
    { label: 'Collected', key: 'package_collected' },
    { label: 'In Transit', key: 'in_transit' },
    { label: 'Delivered', key: 'delivered' },
  ];

  const getStepIndex = (s: OrderStatus) => {
    switch (s) {
      case 'pending':
        return 0;
      case 'assigned':
        return 0;
      case 'heading_to_pickup':
        return 1;
      case 'package_collected':
        return 2;
      case 'in_transit':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-[#222222] p-5 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Waybill Tracking Code:</span>
            <span className="text-sm font-mono font-bold text-white tracking-wide">{order.trackingCode}</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{order.packageDescription} · {order.packageWeightKg} kg</p>
        </div>

        <div className="flex items-center gap-2">
          {getStatusBadge(order.status)}
          <span className="text-slate-600">·</span>
          <button
            onClick={() => copyToClipboard(`https://pulselogistics.internal/track/${order.trackingCode}`, 'link')}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied' : 'Share Tracking'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Status Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Delivery Progress</span>
          <span className="font-mono text-white tabular-nums">{order.currentProgressPct}%</span>
        </div>

        <div className="w-full h-2 bg-[#141414] rounded-full overflow-hidden border border-[#222222]">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-500 rounded-full"
            style={{ width: `${order.currentProgressPct}%` }}
          />
        </div>

        {/* Step checkpoints */}
        <div className="grid grid-cols-5 gap-1 pt-1 text-center">
          {progressSteps.map((step, idx) => {
            const isDone = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;

            return (
              <div key={step.key} className="space-y-1">
                <div
                  className={`w-2.5 h-2.5 mx-auto rounded-full transition-all ${
                    isCurrent
                      ? 'bg-blue-400 ring-4 ring-blue-500/20'
                      : isDone
                      ? 'bg-blue-600'
                      : 'bg-[#242424]'
                  }`}
                />
                <span
                  className={`block text-[10px] font-medium leading-tight ${
                    isDone ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Courier Card & Security PIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Courier Details */}
        {order.rider && (
          <div className="p-4 bg-[#111111] rounded-xl border border-[#222222] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Assigned Courier
              </span>
              <span className="text-xs text-amber-400 font-bold tabular-nums">★ {order.rider.rating}</span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={order.rider.avatarUrl}
                alt={order.rider.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-400/40"
              />
              <div>
                <h4 className="text-sm font-bold text-white">{order.rider.name}</h4>
                <p className="text-xs text-slate-400">{order.rider.vehicleModel}</p>
                <p className="text-xs font-mono text-blue-300 mt-0.5">{order.rider.vehiclePlate}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1f1f1f] text-xs">
              <div className="text-slate-300">
                <span>Speed: </span>
                <span className="font-mono text-white font-semibold tabular-nums">{order.rider.speedKmh} km/h</span>
              </div>
              <a
                href={`tel:${order.rider.phone}`}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Rider</span>
              </a>
            </div>
          </div>
        )}

        {/* Security Handover PIN */}
        <div className="p-4 bg-[#111111] rounded-xl border border-[#222222] space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Recipient Handover PIN</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Provide this 4-digit code to the courier upon delivery for secure verification.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 bg-black rounded-lg border border-[#262626]">
            <span className="text-2xl font-mono font-extrabold text-blue-400 tracking-widest tabular-nums">
              {order.securityPin}
            </span>
            <button
              onClick={() => copyToClipboard(order.securityPin, 'pin')}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-[#1e1e1e] rounded-md transition-colors"
            >
              {copiedPin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPin ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Automated SMS sent to recipient</span>
            <span className="text-emerald-400 font-medium">Delivered</span>
          </div>
        </div>
      </div>

      {/* Route Addresses */}
      <div className="p-4 bg-[#111111] rounded-xl border border-[#222222] space-y-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mt-1 shrink-0" />
          <div>
            <span className="font-semibold text-white">Pickup: {order.pickupLocation.name}</span>
            <p className="text-slate-400">{order.pickupLocation.address}</p>
            <p className="text-slate-500 text-[11px]">Sender: {order.senderName} · {order.senderPhone}</p>
          </div>
        </div>

        <div className="ml-1 border-l-2 border-dashed border-[#262626] h-4" />

        <div className="flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0" />
          <div>
            <span className="font-semibold text-white">Dropoff: {order.dropoffLocation.name}</span>
            <p className="text-slate-400">{order.dropoffLocation.address}</p>
            <p className="text-slate-500 text-[11px]">Recipient: {order.recipientName} · {order.recipientPhone}</p>
          </div>
        </div>
      </div>

      {/* Simulation Controls for testing live states */}
      <div className="p-3 bg-[#111111] rounded-xl border border-[#222222] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-slate-300 font-medium">Live Simulation Controls:</span>
        </div>

        {order.status !== 'delivered' ? (
          <button
            onClick={advanceStep}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Advance Step: {order.status === 'heading_to_pickup' ? 'Collect Package' : order.status === 'package_collected' ? 'Begin Transit' : 'Complete Delivery'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => onOpenReviewModal(order)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors"
          >
            Rate &amp; Review Delivery
          </button>
        )}
      </div>
    </div>
  );
};
