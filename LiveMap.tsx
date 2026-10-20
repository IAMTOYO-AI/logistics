import React, { useState } from 'react';
import { Rider, LocationPoint, OrderItem } from '../types';
import { MapPin, Navigation, Bike, Zap, Truck, Car, Compass, Crosshair } from 'lucide-react';

interface LiveMapProps {
  riders: Rider[];
  selectedRider?: Rider | null;
  onSelectRider?: (rider: Rider) => void;
  pickupPoint?: LocationPoint | null;
  dropoffPoint?: LocationPoint | null;
  activeOrder?: OrderItem | null;
  hubs?: LocationPoint[];
  onSelectHub?: (hub: LocationPoint, type: 'pickup' | 'dropoff') => void;
  className?: string;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  riders,
  selectedRider,
  onSelectRider,
  pickupPoint,
  dropoffPoint,
  activeOrder,
  hubs = [],
  onSelectHub,
  className = '',
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredRider, setHoveredRider] = useState<Rider | null>(null);

  // If there's an active order with tracking, determine animated rider position
  let movingRiderPos: { x: number; y: number } | null = null;
  if (activeOrder && activeOrder.pickupLocation && activeOrder.dropoffLocation) {
    const pX = activeOrder.pickupLocation.x;
    const pY = activeOrder.pickupLocation.y;
    const dX = activeOrder.dropoffLocation.x;
    const dY = activeOrder.dropoffLocation.y;
    const pct = (activeOrder.currentProgressPct || 0) / 100;
    movingRiderPos = {
      x: pX + (dX - pX) * pct,
      y: pY + (dY - pY) * pct,
    };
  }

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'bicycle':
        return <Bike className="w-3.5 h-3.5 text-emerald-400" />;
      case 'electric_cargo_van':
        return <Truck className="w-3.5 h-3.5 text-sky-300" />;
      case 'sedan':
        return <Car className="w-3.5 h-3.5 text-amber-300" />;
      case 'motorcycle':
      default:
        return <Zap className="w-3.5 h-3.5 text-blue-300" />;
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[420px] bg-black rounded-xl overflow-hidden border border-[#222222] shadow-inner select-none ${className}`}>
      {/* SVG Canvas Map */}
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full object-cover transition-transform duration-300 ease-out"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <defs>
          {/* Radial Water / Coastline Gradient */}
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d0d0d" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          {/* Radar Beam Gradient */}
          <linearGradient id="radarBeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>

          {/* Pulse Glow filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Map Background Base */}
        <rect width="1000" height="600" fill="#050505" />

        {/* River / Bay Geography */}
        <path
          d="M 600,0 C 620,150 720,240 760,350 C 800,460 920,530 1000,560 L 1000,0 Z"
          fill="url(#waterGrad)"
          stroke="#1f1f1f"
          strokeWidth="1.5"
        />

        {/* City Blocks Grid */}
        <g stroke="#181818" strokeWidth="0.8" opacity="0.7">
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="600" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line key={`h-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} />
          ))}
        </g>

        {/* Secondary Avenues & Arteries */}
        <g stroke="#262626" strokeWidth="2" strokeLinecap="round">
          <line x1="80" y1="200" x2="880" y2="200" />
          <line x1="50" y1="360" x2="750" y2="360" />
          <line x1="280" y1="40" x2="280" y2="560" />
          <line x1="520" y1="50" x2="520" y2="550" />
        </g>

        {/* Major Expressways with Neon Blue Glow */}
        <path
          d="M 50,520 Q 300,480 480,340 T 950,180"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M 50,520 Q 300,480 480,340 T 950,180"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="1.5"
          strokeDasharray="8 6"
          opacity="0.8"
        />

        <path
          d="M 120,60 Q 380,180 620,240 T 890,520"
          fill="none"
          stroke="#1e3a8a"
          strokeWidth="3.5"
          opacity="0.4"
        />

        {/* Radar concentric sweep around pickup or center */}
        {pickupPoint && (
          <g>
            <circle
              cx={pickupPoint.x}
              cy={pickupPoint.y}
              r="70"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.3"
            />
            <circle
              cx={pickupPoint.x}
              cy={pickupPoint.y}
              r="140"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="0.8"
              strokeDasharray="6 6"
              opacity="0.2"
            />
          </g>
        )}

        {/* Active Route Polyline between Pickup and Dropoff */}
        {pickupPoint && dropoffPoint && (
          <g>
            {/* Soft background glow trace */}
            <path
              d={`M ${pickupPoint.x},${pickupPoint.y} Q ${(pickupPoint.x + dropoffPoint.x) / 2 + 30},${
                (pickupPoint.y + dropoffPoint.y) / 2 - 40
              } ${dropoffPoint.x},${dropoffPoint.y}`}
              fill="none"
              stroke="#2563eb"
              strokeWidth="5"
              opacity="0.35"
              filter="url(#glow)"
            />
            {/* Animated dashed active route */}
            <path
              d={`M ${pickupPoint.x},${pickupPoint.y} Q ${(pickupPoint.x + dropoffPoint.x) / 2 + 30},${
                (pickupPoint.y + dropoffPoint.y) / 2 - 40
              } ${dropoffPoint.x},${dropoffPoint.y}`}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              className="animate-pulse"
            />
          </g>
        )}

        {/* Hubs / Preset Landmarks */}
        {hubs.map((hub) => {
          const isPickup = pickupPoint?.id === hub.id;
          const isDropoff = dropoffPoint?.id === hub.id;

          return (
            <g
              key={hub.id}
              className="cursor-pointer transition-transform hover:scale-110"
              onClick={() => onSelectHub && onSelectHub(hub, 'pickup')}
            >
              <circle
                cx={hub.x}
                cy={hub.y}
                r={isPickup || isDropoff ? '7' : '4.5'}
                fill={isPickup ? '#38bdf8' : isDropoff ? '#10b981' : '#1e3a6a'}
                stroke="#ffffff"
                strokeWidth={isPickup || isDropoff ? '2' : '1'}
                opacity={isPickup || isDropoff ? 1 : 0.75}
              />
              <text
                x={hub.x}
                y={hub.y - 9}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight="500"
                textAnchor="middle"
                className="pointer-events-none drop-shadow"
              >
                {hub.name.split(' ')[0]}
              </text>
            </g>
          );
        })}

        {/* Pickup Pin */}
        {pickupPoint && (
          <g transform={`translate(${pickupPoint.x}, ${pickupPoint.y})`}>
            <circle r="14" fill="#38bdf8" opacity="0.25" className="animate-ping" />
            <circle r="8" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
            <circle r="3" fill="#ffffff" />
            <text y="-14" fill="#38bdf8" fontSize="11" fontWeight="700" textAnchor="middle" className="drop-shadow">
              PICKUP
            </text>
          </g>
        )}

        {/* Dropoff Pin */}
        {dropoffPoint && (
          <g transform={`translate(${dropoffPoint.x}, ${dropoffPoint.y})`}>
            <circle r="14" fill="#10b981" opacity="0.25" className="animate-ping" />
            <circle r="8" fill="#059669" stroke="#ffffff" strokeWidth="2" />
            <circle r="3" fill="#ffffff" />
            <text y="-14" fill="#34d399" fontSize="11" fontWeight="700" textAnchor="middle" className="drop-shadow">
              DROPOFF
            </text>
          </g>
        )}

        {/* Live Dispatched Courier (In-Transit Animation) */}
        {movingRiderPos && activeOrder && (
          <g transform={`translate(${movingRiderPos.x}, ${movingRiderPos.y})`}>
            <circle r="18" fill="#3b82f6" opacity="0.3" className="animate-ping" />
            <circle r="12" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
            <circle r="5" fill="#60a5fa" />
            <text y="-16" fill="#93c5fd" fontSize="11" fontWeight="bold" textAnchor="middle" className="drop-shadow">
              {activeOrder.rider?.name.split(' ')[0] || 'Courier'} (Live)
            </text>
          </g>
        )}

        {/* Available Riders Markers */}
        {riders.map((rider) => {
          if (!rider.isOnline) return null;
          const isSelected = selectedRider?.id === rider.id;
          const isMovingRider = activeOrder?.riderId === rider.id && movingRiderPos;

          // If this rider is currently animating on route, don't double render at static coords
          if (isMovingRider) return null;

          return (
            <g
              key={rider.id}
              className="cursor-pointer transition-transform duration-200"
              transform={`translate(${rider.currentX}, ${rider.currentY})`}
              onClick={() => onSelectRider && onSelectRider(rider)}
              onMouseEnter={() => setHoveredRider(rider)}
              onMouseLeave={() => setHoveredRider(null)}
            >
              {isSelected && (
                <circle r="18" fill="#38bdf8" opacity="0.35" className="animate-pulse" />
              )}
              <circle
                r={isSelected ? '11' : '8.5'}
                fill={isSelected ? '#2563eb' : '#142a4a'}
                stroke={isSelected ? '#38bdf8' : '#3b82f6'}
                strokeWidth={isSelected ? '2.5' : '1.5'}
              />
              <circle r="3.5" fill={isSelected ? '#ffffff' : '#60a5fa'} />

              {/* Rider Name pill tag */}
              <text
                y="18"
                fill={isSelected ? '#38bdf8' : '#cbd5e1'}
                fontSize="9.5"
                fontWeight={isSelected ? '700' : '500'}
                textAnchor="middle"
                className="pointer-events-none drop-shadow"
              >
                {rider.name.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Map Controls & Overlays */}
      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e0e0e]/90 border border-[#262626] text-xs text-slate-300 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="font-medium text-white">{riders.filter((r) => r.isOnline).length} Couriers Online</span>
        <span className="text-slate-500">·</span>
        <span>Avg Match: 1.8m</span>
      </div>

      {/* Map Zoom / Orientation controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <button
          onClick={() => setZoomLevel((prev) => Math.min(prev + 0.2, 1.8))}
          className="w-8 h-8 rounded-lg bg-[#141414]/90 border border-[#2a2a2a] text-white flex items-center justify-center hover:bg-[#222222] transition-colors shadow"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setZoomLevel((prev) => Math.max(prev - 0.2, 0.9))}
          className="w-8 h-8 rounded-lg bg-[#141414]/90 border border-[#2a2a2a] text-white flex items-center justify-center hover:bg-[#222222] transition-colors shadow"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="w-8 h-8 rounded-lg bg-[#141414]/90 border border-[#2a2a2a] text-slate-300 flex items-center justify-center hover:text-white hover:bg-[#222222] transition-colors shadow"
          title="Reset View"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hovered / Selected Rider Tooltip card */}
      {(hoveredRider || selectedRider) && (
        <div className="absolute top-3 right-3 max-w-xs p-3 rounded-lg bg-[#0f0f0f]/95 border border-[#292929] text-xs shadow-xl backdrop-blur-md">
          {(() => {
            const target = hoveredRider || selectedRider!;
            return (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-[#1e1e1e]">
                      {getVehicleIcon(target.vehicleType)}
                    </div>
                    <span className="font-semibold text-white">{target.name}</span>
                  </div>
                  <span className="text-amber-400 font-bold tabular-nums">★ {target.rating}</span>
                </div>
                <div className="text-slate-400">
                  <span>{target.vehicleModel}</span>
                  <span className="mx-1.5 text-slate-600">·</span>
                  <span className="font-mono text-slate-300">{target.vehiclePlate}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-[#262626]">
                  <span>{target.completedToday} deliveries today</span>
                  <span className="text-blue-400 font-medium">{target.speedKmh} km/h avg</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
