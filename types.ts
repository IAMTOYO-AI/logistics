export type UserRole = 'customer' | 'rider' | 'dispatcher';

export type VehicleType = 'motorcycle' | 'bicycle' | 'electric_cargo_van' | 'sedan';

export type PackageCategory = 'documents' | 'parcel' | 'fragile' | 'bulk_cargo';

export type OrderStatus =
  | 'pending'
  | 'matching'
  | 'assigned'
  | 'heading_to_pickup'
  | 'package_collected'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type PaymentMethodType = 'card' | 'apple_pay' | 'google_pay' | 'wallet' | 'bank_transfer' | 'cash_on_delivery';

export interface LocationPoint {
  id: string;
  name: string;
  address: string;
  x: number; // relative map coordinate 0 - 1000
  y: number; // relative map coordinate 0 - 600
  contactName?: string;
  contactPhone?: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  vehicleModel: string;
  rating: number;
  totalTrips: number;
  isOnline: boolean;
  isAvailable: boolean;
  currentX: number;
  currentY: number;
  speedKmh: number;
  earningsToday: number;
  completedToday: number;
}

export interface OrderItem {
  id: string;
  trackingCode: string;
  createdAt: string;
  pickupLocation: LocationPoint;
  dropoffLocation: LocationPoint;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  packageCategory: PackageCategory;
  packageWeightKg: number;
  packageDescription: string;
  specialInstructions?: string;
  riderId?: string;
  rider?: Rider;
  status: OrderStatus;
  distanceKm: number;
  baseFare: number;
  distanceFare: number;
  priorityFee: number;
  tipAmount: number;
  totalFare: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'paid' | 'pending' | 'failed';
  securityPin: string;
  estimatedMinutesRemaining: number;
  currentProgressPct: number; // 0 to 100
  ratingGiven?: number;
  reviewText?: string;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    description: string;
  }[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order' | 'dispatch' | 'payment' | 'delivery' | 'system';
  orderId?: string;
  read: boolean;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  customerRole?: string;
  riderName: string;
  rating: number;
  comment: string;
  tags: string[];
  date: string;
  deliveryType: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  walletBalance: number;
  savedAddresses: LocationPoint[];
  riderDetails?: {
    vehicleType: VehicleType;
    vehicleModel: string;
    vehiclePlate: string;
    isOnline: boolean;
    rating: number;
    licenseVerified: boolean;
  };
}
