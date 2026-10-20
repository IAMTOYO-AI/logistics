import { LocationPoint, PackageCategory, VehicleType } from '../types';

// Converts 0-1000 map coordinates to realistic urban kilometers (approx 12 km grid width)
export function calculateMapDistanceKm(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = (p1.y - p2.y) * 0.9; // slight perspective factor
  const pixelDist = Math.sqrt(dx * dx + dy * dy);
  // 1000px width represents ~12.5 km in metropolitan grid
  const km = (pixelDist / 1000) * 12.5;
  return Math.max(0.4, Number(km.toFixed(1)));
}

// Vehicle speeds in typical city conditions (km/h)
export const VEHICLE_CONFIGS: Record<VehicleType, { label: string; avgSpeedKmh: number; baseRate: number; maxWeightKg: number; iconName: string }> = {
  bicycle: {
    label: 'Eco Courier Bike',
    avgSpeedKmh: 18,
    baseRate: 4.5,
    maxWeightKg: 5,
    iconName: 'Bike',
  },
  motorcycle: {
    label: 'Express Moto Courier',
    avgSpeedKmh: 35,
    baseRate: 6.0,
    maxWeightKg: 15,
    iconName: 'Zap',
  },
  electric_cargo_van: {
    label: 'Electric Cargo Van',
    avgSpeedKmh: 28,
    baseRate: 14.0,
    maxWeightKg: 350,
    iconName: 'Truck',
  },
  sedan: {
    label: 'Sedan Dispatch',
    avgSpeedKmh: 30,
    baseRate: 9.5,
    maxWeightKg: 45,
    iconName: 'Car',
  },
};

export const PACKAGE_RATES: Record<PackageCategory, { label: string; multiplier: number; description: string }> = {
  documents: { label: 'Documents & Envelopes', multiplier: 1.0, description: 'Secure pouch up to 1 kg' },
  parcel: { label: 'Standard Express Parcel', multiplier: 1.15, description: 'Boxes up to 10 kg' },
  fragile: { label: 'Fragile / Medical Supplies', multiplier: 1.35, description: 'Padded handling & priority transit' },
  bulk_cargo: { label: 'Bulk / Heavy Cargo', multiplier: 1.85, description: 'Large consignments & commercial loads' },
};

export function calculateFare(
  distanceKm: number,
  vehicleType: VehicleType,
  category: PackageCategory,
  priority: boolean = false,
  tip: number = 0
): { baseFare: number; distanceFare: number; priorityFee: number; tipAmount: number; totalFare: number } {
  const vConf = VEHICLE_CONFIGS[vehicleType] || VEHICLE_CONFIGS.motorcycle;
  const pConf = PACKAGE_RATES[category] || PACKAGE_RATES.parcel;

  const baseFare = Number((vConf.baseRate * pConf.multiplier).toFixed(2));
  const perKmRate = 1.45 * pConf.multiplier;
  const distanceFare = Number((distanceKm * perKmRate).toFixed(2));
  const priorityFee = priority ? 4.0 : 0.0;
  const tipAmount = Number(tip.toFixed(2));
  const totalFare = Number((baseFare + distanceFare + priorityFee + tipAmount).toFixed(2));

  return {
    baseFare,
    distanceFare,
    priorityFee,
    tipAmount,
    totalFare,
  };
}

export function estimateTravelTimeMinutes(distanceKm: number, vehicleType: VehicleType): number {
  const vConf = VEHICLE_CONFIGS[vehicleType] || VEHICLE_CONFIGS.motorcycle;
  const hours = distanceKm / vConf.avgSpeedKmh;
  const minutes = Math.round(hours * 60) + 3; // +3 min buffer for urban traffic / pickup
  return Math.max(3, minutes);
}
