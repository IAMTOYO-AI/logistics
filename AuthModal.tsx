import React, { useState } from 'react';
import { UserRole, VehicleType, Rider, UserProfile } from '../types';
import { User, Truck, Bike, ShieldCheck, Check, X, Building, Mail, Phone, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterCustomer: (profile: Partial<UserProfile>) => void;
  onRegisterRider: (riderData: Partial<Rider>) => void;
  initialMode?: 'customer' | 'rider';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onRegisterCustomer,
  onRegisterRider,
  initialMode = 'customer',
}) => {
  const [tab, setTab] = useState<'customer' | 'rider'>(initialMode);

  // Customer form fields
  const [custName, setCustName] = useState('Sarah Vance');
  const [custEmail, setCustEmail] = useState('sarah.vance@metrolabs.io');
  const [custPhone, setCustPhone] = useState('+1 (555) 390-1284');
  const [custType, setCustType] = useState<'individual' | 'business'>('business');
  const [custCompany, setCustCompany] = useState('MetroLabs BioEngineering');

  // Rider form fields
  const [riderName, setRiderName] = useState('Darius Campbell');
  const [riderPhone, setRiderPhone] = useState('+1 (555) 819-2045');
  const [vehicleType, setVehicleType] = useState<VehicleType>('motorcycle');
  const [vehicleModel, setVehicleModel] = useState('Honda Forza 350');
  const [vehiclePlate, setVehiclePlate] = useState('MC-592-PULSE');
  const [licenseNumber, setLicenseNumber] = useState('DL-90821-X');
  const [operatingZone, setOperatingZone] = useState('Downtown Metro & Financial Bay');
  const [payoutBank, setPayoutBank] = useState('Chase Bank · Direct Wire');

  if (!isOpen) return null;

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegisterCustomer({
      name: custName,
      email: custEmail,
      phone: custPhone,
      role: 'customer',
    });
    onClose();
  };

  const handleRiderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegisterRider({
      name: riderName,
      phone: riderPhone,
      vehicleType,
      vehicleModel,
      vehiclePlate,
      rating: 5.0,
      totalTrips: 1,
      isOnline: true,
      isAvailable: true,
      currentX: 420,
      currentY: 310,
      speedKmh: 32,
      earningsToday: 0,
      completedToday: 0,
      avatarUrl: '/src/assets/images/avatar_rider_courier_1792501812779.jpg',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header with Dual Tabs */}
        <div className="px-6 py-4 bg-[#121212] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-black rounded-lg border border-[#262626] text-xs">
            <button
              type="button"
              onClick={() => setTab('customer')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                tab === 'customer'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Customer Sign Up
            </button>
            <button
              type="button"
              onClick={() => setTab('rider')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                tab === 'rider'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Become a Rider
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#1f1f1f] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Registration Tab */}
        {tab === 'customer' && (
          <form onSubmit={handleCustomerSubmit} className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Create Customer Account</h3>
              <p className="text-xs text-slate-400">
                Book immediate urban couriers, track live on radar, and manage automated notifications.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-[#141414] rounded-lg border border-[#242424] text-xs">
              <button
                type="button"
                onClick={() => setCustType('individual')}
                className={`py-1.5 rounded font-medium transition-colors ${
                  custType === 'individual' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Personal Deliveries
              </button>
              <button
                type="button"
                onClick={() => setCustType('business')}
                className={`py-1.5 rounded font-medium transition-colors ${
                  custType === 'business' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                Enterprise / Business
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-black border border-[#262626] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {custType === 'business' && (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Company / Organization Name</label>
                  <input
                    type="text"
                    value={custCompany}
                    onChange={(e) => setCustCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-[#262626] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-[#262626] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-[#262626] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              Complete Customer Registration
            </button>
          </form>
        )}

        {/* Rider Registration Tab */}
        {tab === 'rider' && (
          <form onSubmit={handleRiderSubmit} className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Join the Urban Courier Fleet</h3>
              <p className="text-xs text-slate-400">
                Earn on your schedule with instant payouts, automated nearest-customer dispatches, and turn-by-turn routing.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={riderName}
                  onChange={(e) => setRiderName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black border border-[#262626] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={riderPhone}
                  onChange={(e) => setRiderPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black border border-[#262626] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Vehicle Selection */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1.5">Vehicle Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'motorcycle', label: 'Motorcycle / Scooter' },
                  { key: 'bicycle', label: 'Eco Courier Bike' },
                  { key: 'electric_cargo_van', label: 'Cargo Van' },
                  { key: 'sedan', label: 'Sedan Dispatch' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setVehicleType(item.key as VehicleType)}
                    className={`p-2 rounded-lg border text-left text-xs transition-all ${
                      vehicleType === item.key
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-[#141414] border-[#242424] text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Vehicle Model &amp; Make</label>
                <input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black border border-[#262626] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Yamaha XMAX"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Registration / Plate No.</label>
                <input
                  type="text"
                  required
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black border border-[#262626] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">License / Verification ID</label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black border border-[#262626] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-blue-500 uppercase"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Direct Payout Account</label>
                <input
                  type="text"
                  required
                  value={payoutBank}
                  onChange={(e) => setPayoutBank(e.target.value)}
                  className="w-full px-3 py-1.5 bg-black border border-[#262626] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              Register &amp; Activate Rider Profile
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
