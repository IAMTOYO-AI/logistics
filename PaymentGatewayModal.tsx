import React, { useState } from 'react';
import { PaymentMethodType, OrderItem } from '../types';
import { soundEffects } from '../utils/audio';
import { CreditCard, Wallet, Smartphone, Landmark, Banknote, ShieldCheck, CheckCircle2, X, Lock } from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDraft: Partial<OrderItem> | null;
  onPaymentSuccess: (method: PaymentMethodType, finalOrder: OrderItem) => void;
  userWalletBalance: number;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  orderDraft,
  onPaymentSuccess,
  userWalletBalance,
}) => {
  const [method, setMethod] = useState<PaymentMethodType>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 9012');
  const [expiry, setExpiry] = useState('11/28');
  const [cvv, setCvv] = useState('834');
  const [cardHolder, setCardHolder] = useState('Alexandria Vance');
  const [saveCard, setSaveCard] = useState(true);

  // Promo code support
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !orderDraft) return null;

  const baseTotal = orderDraft.totalFare || 18.5;
  const finalTotal = Math.max(1, baseTotal - promoDiscount);

  const applyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'PULSE5' || promoCode.trim().toUpperCase() === 'FIRSTSHIP') {
      setPromoDiscount(5.0);
      setPromoMessage('Promo applied: $5.00 discount activated!');
    } else if (promoCode.trim().length > 0) {
      setPromoMessage('Invalid voucher. Try "PULSE5"');
    }
  };

  const handlePayNow = () => {
    setIsProcessing(true);

    setTimeout(() => {
      soundEffects.playPaymentSuccess();
      setIsProcessing(false);

      // Generate random 4-digit security PIN for parcel handover
      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
      const trackingCode = `PLS-${Math.floor(1000 + Math.random() * 9000)}-${['A', 'B', 'C', 'X'][Math.floor(Math.random() * 4)]}`;

      const completedOrder: OrderItem = {
        id: `ord_${Date.now()}`,
        trackingCode,
        createdAt: 'Just now',
        pickupLocation: orderDraft.pickupLocation!,
        dropoffLocation: orderDraft.dropoffLocation!,
        senderName: orderDraft.senderName || 'Alexandria Vance',
        senderPhone: orderDraft.senderPhone || '+1 (555) 723-9900',
        recipientName: orderDraft.recipientName || 'Jordan Miller',
        recipientPhone: orderDraft.recipientPhone || '+1 (555) 492-3810',
        packageCategory: orderDraft.packageCategory || 'parcel',
        packageWeightKg: orderDraft.packageWeightKg || 2.5,
        packageDescription: orderDraft.packageDescription || 'Standard Express Parcel',
        specialInstructions: 'Secure delivery required. Customer has PIN.',
        riderId: orderDraft.riderId,
        rider: orderDraft.rider,
        status: 'heading_to_pickup',
        distanceKm: orderDraft.distanceKm || 3.5,
        baseFare: orderDraft.baseFare || 6.0,
        distanceFare: orderDraft.distanceFare || 5.0,
        priorityFee: orderDraft.priorityFee || 0,
        tipAmount: orderDraft.tipAmount || 0,
        totalFare: finalTotal,
        paymentMethod: method,
        paymentStatus: 'paid',
        securityPin: randomPin,
        estimatedMinutesRemaining: orderDraft.estimatedMinutesRemaining || 12,
        currentProgressPct: 15,
        timeline: [
          { status: 'pending', timestamp: 'Just now', description: 'Order created and payment authorized via ' + method },
          { status: 'assigned', timestamp: 'Just now', description: `Assigned to ${orderDraft.rider?.name || 'Nearest Courier'}` },
          { status: 'heading_to_pickup', timestamp: 'Just now', description: 'Courier navigating to pickup location' },
        ],
      };

      onPaymentSuccess(method, completedOrder);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#121212] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Secure Payment Gateway</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#1f1f1f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Amount Badge */}
          <div className="flex items-center justify-between p-3.5 bg-[#111111] rounded-xl border border-[#222222]">
            <div>
              <span className="text-xs text-slate-400 block">Total Due (incl. Dispatch &amp; Tax)</span>
              <span className="text-2xl font-extrabold text-white tabular-nums tracking-tight">
                ${finalTotal.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Select Gateway Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                  method === 'card'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                    : 'bg-[#141414] border-[#242424] text-slate-300 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[11px] font-semibold">Credit/Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('apple_pay')}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                  method === 'apple_pay'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                    : 'bg-[#141414] border-[#242424] text-slate-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[11px] font-semibold">Apple / Google Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('wallet')}
                className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                  method === 'wallet'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                    : 'bg-[#141414] border-[#242424] text-slate-300 hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span className="text-[11px] font-semibold">Logistics Wallet</span>
              </button>
            </div>
          </div>

          {/* Method Details Form */}
          {method === 'card' && (
            <div className="p-4 bg-[#111111] rounded-xl border border-[#222222] space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 bg-black border border-[#262626] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                  <CreditCard className="w-4 h-4 absolute right-3 top-2.5 text-blue-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-[#262626] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">CVV / CVC</label>
                  <input
                    type="password"
                    value={cvv}
                    maxLength={4}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-[#262626] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  className="rounded border-[#262626] text-blue-600 bg-black"
                />
                <span className="text-[11px] text-slate-300">Save securely for future instant bookings</span>
              </label>
            </div>
          )}

          {method === 'apple_pay' && (
            <div className="p-4 bg-[#111111] rounded-xl border border-[#222222] text-center space-y-2">
              <Smartphone className="w-8 h-8 text-blue-400 mx-auto" />
              <p className="text-xs font-semibold text-white">Biometric Quick Checkout Ready</p>
              <p className="text-[11px] text-slate-400">
                Confirm payment with Face ID, Touch ID, or Google Wallet key upon dispatch authorization.
              </p>
            </div>
          )}

          {method === 'wallet' && (
            <div className="p-4 bg-[#111111] rounded-xl border border-[#222222] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Available Wallet Balance:</span>
                <span className="text-sm font-bold text-white tabular-nums">${userWalletBalance.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1f1f1f]">
                <span className="text-slate-400">Balance after payment:</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  ${Math.max(0, userWalletBalance - finalTotal).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Promo Code Voucher */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Promo voucher (e.g. PULSE5)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-black border border-[#262626] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase"
            />
            <button
              type="button"
              onClick={applyPromo}
              className="px-3 py-1.5 bg-[#1c1c1c] hover:bg-[#262626] text-xs font-medium text-blue-300 rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
          {promoMessage && (
            <p className={`text-[11px] ${promoDiscount > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {promoMessage}
            </p>
          )}

          {/* Action CTA */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePayNow}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authorizing Gateway Transaction...</span>
              </div>
            ) : (
              <span>Authorize &amp; Dispatch Courier (${finalTotal.toFixed(2)})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
