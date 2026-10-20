import React, { useState, useMemo } from 'react';
import { LocationPoint, PackageCategory, VehicleType, Rider, OrderItem } from '../types';
import { INITIAL_HUBS } from '../data/mockData';
import { calculateMapDistanceKm, calculateFare, estimateTravelTimeMinutes, PACKAGE_RATES, VEHICLE_CONFIGS } from '../utils/distance';
import { MapPin, ArrowRight, Package, Shield, Zap, Sparkles, Clock, Check, ChevronRight, User } from 'lucide-react';

interface BookingFormProps {
  riders: Rider[];
  selectedRider: Rider | null;
  onSelectRider: (rider: Rider | null) => void;
  pickupPoint: LocationPoint;
  setPickupPoint: (point: LocationPoint) => void;
  dropoffPoint: LocationPoint;
  setDropoffPoint: (point: LocationPoint) => void;
  onInitiatePayment: (orderDraft: Partial<OrderItem>) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  riders,
  selectedRider,
  onSelectRider,
  pickupPoint,
  setPickupPoint,
  dropoffPoint,
  setDropoffPoint,
  onInitiatePayment,
}) => {
  const [packageCategory, setPackageCategory] = useState<PackageCategory>('parcel');
  const [packageWeight, setPackageWeight] = useState<number>(2.5);
  const [packageDesc, setPackageDesc] = useState<string>('Express business sample package');
  const [recipientName, setRecipientName] = useState<string>('Jordan Miller');
  const [recipientPhone, setRecipientPhone] = useState<string>('+1 (555) 492-3810');
  const [isPriority, setIsPriority] = useState<boolean>(false);
  const [selectedTip, setSelectedTip] = useState<number>(3);
  const [customTip, setCustomTip] = useState<string>('');

  // Calculate delivery distance between selected pickup & dropoff
  const tripDistanceKm = useMemo(() => {
    return calculateMapDistanceKm(pickupPoint, dropoffPoint);
  }, [pickupPoint, dropoffPoint]);

  // Compute distance from pickup point to all online riders and sort by proximity
  const nearbyRiders = useMemo(() => {
    return riders
      .filter((r) => r.isOnline && r.isAvailable)
      .map((r) => {
        const distToPickup = calculateMapDistanceKm({ x: r.currentX, y: r.currentY }, pickupPoint);
        const etaMin = estimateTravelTimeMinutes(distToPickup, r.vehicleType);
        return {
          rider: r,
          distanceToPickupKm: distToPickup,
          etaMinutes: etaMin,
        };
      })
      .sort((a, b) => a.distanceToPickupKm - b.distanceToPickupKm);
  }, [riders, pickupPoint]);

  // If no rider explicitly chosen, default to nearest
  const effectiveRider = selectedRider || (nearbyRiders[0] ? nearbyRiders[0].rider : null);
  const effectiveVehicle: VehicleType = effectiveRider ? effectiveRider.vehicleType : 'motorcycle';

  // Calculate dynamic fare
  const finalTip = customTip ? parseFloat(customTip) || 0 : selectedTip;
  const fare = useMemo(() => {
    return calculateFare(tripDistanceKm, effectiveVehicle, packageCategory, isPriority, finalTip);
  }, [tripDistanceKm, effectiveVehicle, packageCategory, isPriority, finalTip]);

  const handleBookNow = () => {
    const draft: Partial<OrderItem> = {
      pickupLocation: pickupPoint,
      dropoffLocation: dropoffPoint,
      senderName: 'Alexandria Vance',
      senderPhone: '+1 (555) 723-9900',
      recipientName,
      recipientPhone,
      packageCategory,
      packageWeightKg: packageWeight,
      packageDescription: packageDesc,
      riderId: effectiveRider?.id,
      rider: effectiveRider || undefined,
      distanceKm: tripDistanceKm,
      baseFare: fare.baseFare,
      distanceFare: fare.distanceFare,
      priorityFee: fare.priorityFee,
      tipAmount: fare.tipAmount,
      totalFare: fare.totalFare,
      estimatedMinutesRemaining: estimateTravelTimeMinutes(tripDistanceKm, effectiveVehicle) + 4,
    };

    onInitiatePayment(draft);
  };

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-[#222222] p-5 shadow-xl space-y-6">
      <div className="border-b border-[#222222] pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">On-Demand Dispatch</h2>
        <p className="text-xs text-slate-400 mt-1">
          Instant matching with verified local couriers in real-time
        </p>
      </div>

      {/* 1. Pickup & Dropoff Routing */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            1. Pickup Location
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INITIAL_HUBS.slice(0, 4).map((hub) => (
              <button
                key={hub.id}
                type="button"
                onClick={() => setPickupPoint(hub)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  pickupPoint.id === hub.id
                    ? 'bg-blue-950/80 border-blue-500 text-white'
                    : 'bg-[#121212] border-[#222222] text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{hub.name}</span>
                  {pickupPoint.id === hub.id && <span className="text-[10px] text-blue-400 font-bold">ACTIVE</span>}
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{hub.address}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            2. Delivery Destination
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INITIAL_HUBS.slice(2, 6).map((hub) => (
              <button
                key={hub.id}
                type="button"
                onClick={() => setDropoffPoint(hub)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  dropoffPoint.id === hub.id
                    ? 'bg-emerald-950/80 border-emerald-500 text-white'
                    : 'bg-[#121212] border-[#222222] text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{hub.name}</span>
                  {dropoffPoint.id === hub.id && <span className="text-[10px] text-emerald-400 font-bold">DESTINATION</span>}
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{hub.address}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Route Metrics Pill */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#121212] rounded-lg border border-[#242424] text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Transit Distance:</span>
            <span className="font-mono font-bold text-white tabular-nums">{tripDistanceKm} km</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Estimated Travel:</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {estimateTravelTimeMinutes(tripDistanceKm, effectiveVehicle)} mins
            </span>
          </div>
        </div>
      </div>

      {/* 2. Package Details */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          3. Package Category &amp; Handling
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(PACKAGE_RATES) as PackageCategory[]).map((cat) => {
            const info = PACKAGE_RATES[cat];
            const isSelected = packageCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setPackageCategory(cat)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                    : 'bg-[#121212] border-[#222222] text-slate-300 hover:border-slate-500'
                }`}
              >
                <p className="text-xs font-semibold">{info.label.split(' ')[0]}</p>
                <p className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  {info.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Package Description / Contents</label>
            <input
              type="text"
              value={packageDesc}
              onChange={(e) => setPackageDesc(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-[#262626] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Legal documents, electronic goods"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Recipient Name &amp; Contact</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-1/2 px-3 py-2 bg-black border border-[#262626] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="Recipient name"
              />
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-1/2 px-3 py-2 bg-black border border-[#262626] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                placeholder="Phone number"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Nearest Rider Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            4. Nearest Available Couriers ({nearbyRiders.length} in range)
          </label>
          <span className="text-[11px] text-blue-400 font-medium">Auto-sorted by closest distance</span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {nearbyRiders.map(({ rider, distanceToPickupKm, etaMinutes }, idx) => {
            const isSelected = effectiveRider?.id === rider.id;
            const isClosest = idx === 0;

            return (
              <div
                key={rider.id}
                onClick={() => onSelectRider(rider)}
                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-950/70 border-blue-400 shadow-md shadow-blue-500/10'
                    : 'bg-[#121212] border-[#222222] hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={rider.avatarUrl}
                      alt={rider.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-blue-400/40"
                    />
                    {isClosest && (
                      <span className="absolute -top-1 -right-1 px-1 bg-emerald-500 text-[9px] font-bold text-white rounded">
                        FASTEST
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{rider.name}</span>
                      <span className="text-[11px] text-amber-400 font-bold tabular-nums">★ {rider.rating}</span>
                      <span className="text-[10px] text-slate-400">({rider.totalTrips} trips)</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{rider.vehicleModel}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-300">{rider.vehiclePlate}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-blue-400 tabular-nums">
                    {distanceToPickupKm} km away
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium">
                    Pickup in ~{etaMinutes} min
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Priority Option & Tips */}
      <div className="p-3 bg-[#111111] rounded-lg border border-[#242424] flex items-center justify-between gap-4 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPriority}
            onChange={(e) => setIsPriority(e.target.checked)}
            className="rounded border-[#2c2c2c] text-blue-600 focus:ring-0 bg-[#141414]"
          />
          <div>
            <span className="font-semibold text-white">Priority Direct Express (+ $4.00)</span>
            <p className="text-[10px] text-slate-400">Rider bypasses all intermediate batch stops</p>
          </div>
        </label>

        {/* Courier Tip Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-slate-400">Tip Courier:</span>
          {[0, 2, 4, 6].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setSelectedTip(amount);
                setCustomTip('');
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                selectedTip === amount && !customTip
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-[#1e1e1e] text-slate-300 hover:text-white'
              }`}
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Total & Checkout CTA */}
      <div className="pt-2 border-t border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-400">Total Dispatch Fare:</span>
            <span className="text-2xl font-extrabold text-white tabular-nums tracking-tight">
              ${fare.totalFare.toFixed(2)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">
            Includes base fee (${fare.baseFare}), distance (${fare.distanceFare}), and instant courier allocation
          </p>
        </div>

        <button
          type="button"
          onClick={handleBookNow}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-lg shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:gap-3 active:scale-[0.99] whitespace-nowrap"
        >
          <span>Choose Payment &amp; Dispatch</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
