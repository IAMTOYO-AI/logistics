import React, { useState } from 'react';
import { Rider, OrderItem } from '../types';
import { VEHICLE_CONFIGS } from '../utils/distance';
import { Radio, Truck, Zap, Bike, Car, Shield, Activity, Search, Phone } from 'lucide-react';

interface FleetRadarViewProps {
  riders: Rider[];
  orders: OrderItem[];
  onSelectRider: (rider: Rider) => void;
}

export const FleetRadarView: React.FC<FleetRadarViewProps> = ({
  riders,
  orders,
  onSelectRider,
}) => {
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');

  const filteredRiders = riders.filter((r) => {
    const matchesVehicle = filterVehicle === 'all' || r.vehicleType === filterVehicle;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVehicle && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#111111] rounded-xl border border-[#222222]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Total Fleet Active</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white block mt-1 tabular-nums">
            {riders.filter((r) => r.isOnline).length} / {riders.length}
          </span>
          <span className="text-[10px] text-slate-400">All GPS signals synchronized</span>
        </div>

        <div className="p-4 bg-[#111111] rounded-xl border border-[#222222]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Active Deliveries</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-white block mt-1 tabular-nums">{activeOrders.length}</span>
          <span className="text-[10px] text-emerald-400">Zero SLA breaches</span>
        </div>

        <div className="p-4 bg-[#111111] rounded-xl border border-[#222222]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Avg Dispatch Latency</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-white block mt-1 tabular-nums">1.4 min</span>
          <span className="text-[10px] text-slate-400">Automated nearest-courier matching</span>
        </div>

        <div className="p-4 bg-[#111111] rounded-xl border border-[#222222]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Fleet CSAT</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-bold text-amber-400 block mt-1 tabular-nums">4.94 ★</span>
          <span className="text-[10px] text-slate-400">98.8% 5-star rating share</span>
        </div>
      </div>

      {/* Courier Fleet Roster */}
      <div className="bg-[#0a0a0a] rounded-xl border border-[#222222] p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222222] pb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Metropolitan Courier Fleet</h3>
            <p className="text-xs text-slate-400">Live telemetry and dispatch status across zones</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search courier, plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-black border border-[#262626] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-400" />
            </div>

            {/* Vehicle filters */}
            <div className="flex items-center p-1 bg-[#141414] rounded-lg border border-[#242424] text-xs">
              <button
                onClick={() => setFilterVehicle('all')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  filterVehicle === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterVehicle('motorcycle')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  filterVehicle === 'motorcycle' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Motos
              </button>
              <button
                onClick={() => setFilterVehicle('bicycle')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  filterVehicle === 'bicycle' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bikes
              </button>
              <button
                onClick={() => setFilterVehicle('electric_cargo_van')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  filterVehicle === 'electric_cargo_van' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Vans
              </button>
            </div>
          </div>
        </div>

        {/* Courier List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#222222] text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Courier</th>
                <th className="pb-3">Vehicle &amp; Plate</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Today's Trips</th>
                <th className="pb-3 text-right">Rating</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {filteredRiders.map((rider) => (
                <tr
                  key={rider.id}
                  onClick={() => onSelectRider(rider)}
                  className="hover:bg-[#141414] transition-colors cursor-pointer group"
                >
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rider.avatarUrl}
                        alt={rider.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-blue-400/40"
                      />
                      <div>
                        <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                          {rider.name}
                        </span>
                        <p className="text-[11px] text-slate-400">{rider.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="text-slate-200">{rider.vehicleModel}</span>
                    <span className="block font-mono text-[11px] text-slate-400">{rider.vehiclePlate}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        rider.isOnline
                          ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${rider.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`}
                      />
                      {rider.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                    {rider.completedToday} trips
                  </td>
                  <td className="py-3 text-right font-bold text-amber-400 tabular-nums">★ {rider.rating}</td>
                  <td className="py-3 text-right pr-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRider(rider);
                      }}
                      className="px-2.5 py-1 bg-[#1e1e1e] hover:bg-blue-600 text-slate-200 hover:text-white rounded text-[11px] font-medium transition-colors"
                    >
                      Locate on Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
