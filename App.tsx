import React, { useState, useEffect } from 'react';
import {
  Rider,
  OrderItem,
  LocationPoint,
  UserRole,
  UserProfile,
  AppNotification,
  CustomerReview,
  PaymentMethodType,
  OrderStatus,
} from './types';
import { INITIAL_HUBS, INITIAL_RIDERS, INITIAL_ORDERS, INITIAL_REVIEWS, DEFAULT_CURRENT_USER } from './data/mockData';
import { Navbar } from './components/Navbar';
import { LiveMap } from './components/LiveMap';
import { BookingForm } from './components/BookingForm';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { OrderTrackingPanel } from './components/OrderTrackingPanel';
import { RiderDashboard } from './components/RiderDashboard';
import { FleetRadarView } from './components/FleetRadarView';
import { ReviewsView } from './components/ReviewsView';
import { ReviewModal } from './components/ReviewModal';
import { AuthModal } from './components/AuthModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { soundEffects } from './utils/audio';
import {
  MapPin,
  Clock,
  Shield,
  Zap,
  Truck,
  ArrowRight,
  Package,
  CheckCircle2,
  Bell,
  Star,
  Compass,
} from 'lucide-react';

export default function App() {
  // Navigation & Role states
  const [currentTab, setCurrentTab] = useState<string>('book'); // 'book' | 'tracking' | 'rider' | 'radar' | 'reviews'
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pulse_user');
    return saved ? JSON.parse(saved) : DEFAULT_CURRENT_USER;
  });

  // Fleet & Order states
  const [riders, setRiders] = useState<Rider[]>(() => {
    const saved = localStorage.getItem('pulse_riders');
    return saved ? JSON.parse(saved) : INITIAL_RIDERS;
  });
  const [orders, setOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('pulse_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });
  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => {
    const active = INITIAL_ORDERS.find((o) => o.status !== 'delivered');
    return active ? active.id : INITIAL_ORDERS[0].id;
  });

  // Active Map routing selections
  const [pickupPoint, setPickupPoint] = useState<LocationPoint>(INITIAL_HUBS[0]);
  const [dropoffPoint, setDropoffPoint] = useState<LocationPoint>(INITIAL_HUBS[1]);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  // Reviews & Notifications
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem('pulse_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_1',
      title: 'Courier Assigned',
      message: 'Marcus Vance (Yamaha XMAX) was assigned to Order PLS-9821-4A.',
      timestamp: '10m ago',
      type: 'dispatch',
      read: false,
    },
    {
      id: 'notif_2',
      title: 'Package Collected',
      message: 'Marcus collected documents from Metro Financial Tower.',
      timestamp: '5m ago',
      type: 'order',
      read: false,
    },
  ]);

  // Audio & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentDraftOrder, setPaymentDraftOrder] = useState<Partial<OrderItem> | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewTargetOrder, setReviewTargetOrder] = useState<OrderItem | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);

  // Active tracking order
  const activeTrackingOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Save changes to localStorage for resilience
  useEffect(() => {
    localStorage.setItem('pulse_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pulse_riders', JSON.stringify(riders));
  }, [riders]);

  useEffect(() => {
    localStorage.setItem('pulse_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('pulse_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Real-Time Delivery GPS Simulation Engine
  // Periodically moves the active courier along the path and triggers automatic notifications!
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prevOrders) => {
        let hasChanges = false;
        const updated = prevOrders.map((ord) => {
          if (ord.status === 'in_transit' && ord.currentProgressPct < 100) {
            hasChanges = true;
            const nextPct = Math.min(100, ord.currentProgressPct + 4);
            const remainingMins = Math.max(0, Math.ceil((100 - nextPct) / 10));

            // If it reaches 100%, mark as delivered
            if (nextPct >= 100) {
              soundEffects.playDeliverySuccess();
              addNotification({
                title: 'Package Delivered!',
                message: `Order ${ord.trackingCode} was securely delivered to ${ord.recipientName}. Handover verified.`,
                type: 'delivery',
              });
              return {
                ...ord,
                currentProgressPct: 100,
                status: 'delivered' as OrderStatus,
                estimatedMinutesRemaining: 0,
                timeline: [
                  ...ord.timeline,
                  {
                    status: 'delivered' as OrderStatus,
                    timestamp: 'Just now',
                    description: `Package delivered to ${ord.recipientName}. Handover complete.`,
                  },
                ],
              };
            }

            return {
              ...ord,
              currentProgressPct: nextPct,
              estimatedMinutesRemaining: remainingMins,
            };
          }
          return ord;
        });

        return hasChanges ? updated : prevOrders;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Helper to add automated notification and sound
  const addNotification = (notif: { title: string; message: string; type: AppNotification['type'] }) => {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: notif.title,
      message: notif.message,
      timestamp: 'Just now',
      type: notif.type,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Handler for booking -> payment flow
  const handleInitiatePayment = (draft: Partial<OrderItem>) => {
    setPaymentDraftOrder(draft);
    setIsPaymentModalOpen(true);
  };

  // Handler for payment success
  const handlePaymentSuccess = (method: PaymentMethodType, finalOrder: OrderItem) => {
    setIsPaymentModalOpen(false);

    // Deduct from wallet if wallet was used
    if (method === 'wallet') {
      setCurrentUser((prev) => ({
        ...prev,
        walletBalance: Math.max(0, prev.walletBalance - finalOrder.totalFare),
      }));
    }

    // Add order to orders list and select it for tracking
    setOrders((prev) => [finalOrder, ...prev]);
    setSelectedOrderId(finalOrder.id);
    setCurrentTab('tracking');

    // Add automated dispatch notification
    addNotification({
      title: 'Order Dispatched & Paid',
      message: `Courier ${finalOrder.rider?.name || 'Nearest Rider'} is en route to ${finalOrder.pickupLocation.name}. PIN: ${finalOrder.securityPin}`,
      type: 'dispatch',
    });
  };

  // Handler for status transitions
  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const progress =
          nextStatus === 'package_collected'
            ? 35
            : nextStatus === 'in_transit'
            ? 60
            : nextStatus === 'delivered'
            ? 100
            : o.currentProgressPct;

        return {
          ...o,
          status: nextStatus,
          currentProgressPct: progress,
          timeline: [
            ...o.timeline,
            {
              status: nextStatus,
              timestamp: 'Just now',
              description: `Status advanced to ${nextStatus.replace(/_/g, ' ')}`,
            },
          ],
        };
      })
    );

    const target = orders.find((o) => o.id === orderId);
    if (target) {
      addNotification({
        title: `Status: ${nextStatus.replace(/_/g, ' ').toUpperCase()}`,
        message: `Order ${target.trackingCode} is now ${nextStatus.replace(/_/g, ' ')}.`,
        type: nextStatus === 'delivered' ? 'delivery' : 'order',
      });
    }
  };

  // Handler for reviews
  const handleOpenReviewModal = (order: OrderItem) => {
    setReviewTargetOrder(order);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (newReview: CustomerReview) => {
    setReviews((prev) => [newReview, ...prev]);
    addNotification({
      title: 'Review Published',
      message: `Your ${newReview.rating}-star review for courier ${newReview.riderName} was published!`,
      type: 'system',
    });
  };

  // Handler for rider online toggle
  const handleToggleRiderOnline = (isOnline: boolean) => {
    setRiders((prev) =>
      prev.map((r) => (r.id === INITIAL_RIDERS[0].id ? { ...r, isOnline } : r))
    );
  };

  // Register Customer
  const handleRegisterCustomer = (profile: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...profile,
      role: 'customer',
    }));
    setActiveRole('customer');
    setCurrentTab('book');
    addNotification({
      title: 'Customer Profile Ready',
      message: `Welcome, ${profile.name}! You can now request nearest couriers with 1-click.`,
      type: 'system',
    });
  };

  // Register Rider
  const handleRegisterRider = (riderData: Partial<Rider>) => {
    const newRider: Rider = {
      id: `rider_${Date.now()}`,
      name: riderData.name || 'Courier Partner',
      phone: riderData.phone || '+1 (555) 000-0000',
      avatarUrl: riderData.avatarUrl || '/src/assets/images/avatar_rider_courier_1792501812779.jpg',
      vehicleType: riderData.vehicleType || 'motorcycle',
      vehiclePlate: riderData.vehiclePlate || 'MC-NEW-01',
      vehicleModel: riderData.vehicleModel || 'Express Courier Vehicle',
      rating: 5.0,
      totalTrips: 0,
      isOnline: true,
      isAvailable: true,
      currentX: 450,
      currentY: 300,
      speedKmh: 30,
      earningsToday: 0,
      completedToday: 0,
    };

    setRiders((prev) => [newRider, ...prev]);
    setActiveRole('rider');
    setCurrentTab('rider');
    addNotification({
      title: 'Rider Activated!',
      message: `Courier license verified. You are now live on the dispatch radar.`,
      type: 'dispatch',
    });
  };

  // Active orders count for badge
  const activeOrdersCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* 1. Universal Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        notifications={notifications}
        setIsNotificationDrawerOpen={setIsNotificationDrawerOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        activeOrdersCount={activeOrdersCount}
      />

      {/* 2. Hero Presentation Banner (Domain-specific logistics imagery) */}
      <div className="relative border-b border-[#222222] overflow-hidden bg-gradient-to-b from-[#0e0e0e] via-[#070707] to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>Real-Time Autonomous Urban Courier Mesh</span>
                <span className="text-slate-600">·</span>
                <span>Sub-2 Minute Dispatch</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight text-balance leading-[1.15]">
                Fast, reliable couriers connected to your location in real time.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Seamlessly dispatch nearest electric bikes, motorcycles, and cargo vans. Instant payment gateways, live telemetry tracking, automated recipient SMS with secure PIN verification.
              </p>

              {/* Quick Actions Strip */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentTab('book')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                  <Truck className="w-4 h-4" />
                  <span>Instant Dispatch</span>
                </button>
                <button
                  onClick={() => setCurrentTab('tracking')}
                  className="px-4 py-2.5 bg-[#141414] hover:bg-[#1f1f1f] border border-[#2e2e2e] text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all"
                >
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Monitor Active Deliveries</span>
                  {activeOrdersCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-600 text-white font-mono">
                      {activeOrdersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveRole('rider');
                    setCurrentTab('rider');
                  }}
                  className="px-4 py-2.5 bg-transparent hover:bg-[#141414] border border-[#2a2a2a] text-blue-300 text-xs font-medium rounded-lg transition-colors"
                >
                  Drive / Ride With Us
                </button>
              </div>
            </div>

            {/* Right Media Card (High-Impact Logistics Fleet visual) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#272727] shadow-2xl group">
                <img
                  src="/src/assets/images/hero_logistics_fleet_1792501813502.jpg"
                  alt="PulseLogistics Urban Fleet"
                  referrerPolicy="no-referrer"
                  className="w-full h-56 sm:h-64 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs p-2.5 bg-[#0d0d0d]/90 backdrop-blur-md rounded-xl border border-[#262626]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-semibold text-white">Central Grid Operational</span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-300">
                    {riders.filter((r) => r.isOnline).length} Couriers Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-3">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'book', label: 'Book Delivery', icon: Truck },
              { id: 'tracking', label: 'Live Tracking', icon: MapPin },
              { id: 'rider', label: 'Rider Portal', icon: Zap },
              { id: 'radar', label: 'Fleet Radar', icon: Compass },
              { id: 'reviews', label: 'Customer Reviews', icon: Star },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-[#141414]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.id === 'tracking' && activeOrdersCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-900 text-blue-200 text-[10px] tabular-nums font-mono">
                      {activeOrdersCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>Signed in as:</span>
            <span className="font-bold text-white">{currentUser.name}</span>
            <span className="text-slate-600">·</span>
            <span className="capitalize text-blue-400 font-semibold">{activeRole}</span>
          </div>
        </div>

        {/* View Switcher Content */}
        {currentTab === 'book' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Booking Form Left Column */}
            <div className="lg:col-span-7">
              <BookingForm
                riders={riders}
                selectedRider={selectedRider}
                onSelectRider={setSelectedRider}
                pickupPoint={pickupPoint}
                setPickupPoint={setPickupPoint}
                dropoffPoint={dropoffPoint}
                setDropoffPoint={setDropoffPoint}
                onInitiatePayment={handleInitiatePayment}
              />
            </div>

            {/* Interactive Live Map Right Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0c0c0c] rounded-xl border border-[#222222] p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <h3 className="font-bold text-white">Live Metropolitan Grid</h3>
                  </div>
                  <span className="text-slate-400">Click landmarks or couriers to preview</span>
                </div>
                <div className="h-[460px]">
                  <LiveMap
                    riders={riders}
                    selectedRider={selectedRider}
                    onSelectRider={setSelectedRider}
                    pickupPoint={pickupPoint}
                    dropoffPoint={dropoffPoint}
                    hubs={INITIAL_HUBS}
                    onSelectHub={(hub, type) => {
                      if (type === 'pickup') setPickupPoint(hub);
                      else setDropoffPoint(hub);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'tracking' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Tracking Panel Left Column */}
            <div className="lg:col-span-6 space-y-6">
              {/* Order selector tabs if multiple orders exist */}
              {orders.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="text-slate-400 font-medium shrink-0">Orders:</span>
                  {orders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`px-3 py-1.5 rounded-lg border font-mono transition-all whitespace-nowrap ${
                        selectedOrderId === o.id
                          ? 'bg-blue-600 text-white border-blue-400 font-bold'
                          : 'bg-[#121212] text-slate-300 border-[#262626]'
                      }`}
                    >
                      {o.trackingCode} ({o.status})
                    </button>
                  ))}
                </div>
              )}

              {activeTrackingOrder ? (
                <OrderTrackingPanel
                  order={activeTrackingOrder}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onOpenReviewModal={handleOpenReviewModal}
                />
              ) : (
                <div className="bg-[#0c0c0c] rounded-xl border border-[#222222] p-8 text-center text-xs text-slate-400">
                  No active deliveries found. Click 'Book Delivery' to start.
                </div>
              )}
            </div>

            {/* Live Visual Map Tracking */}
            <div className="lg:col-span-6">
              <div className="bg-[#0c0c0c] rounded-xl border border-[#222222] p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <h3 className="font-bold text-white">Live Courier Telemetry</h3>
                  </div>
                  <span className="text-blue-400 font-mono">
                    {activeTrackingOrder?.estimatedMinutesRemaining || 0} mins to dropoff
                  </span>
                </div>
                <div className="h-[520px]">
                  <LiveMap
                    riders={riders}
                    selectedRider={activeTrackingOrder?.rider || null}
                    pickupPoint={activeTrackingOrder?.pickupLocation || null}
                    dropoffPoint={activeTrackingOrder?.dropoffLocation || null}
                    activeOrder={activeTrackingOrder}
                    hubs={INITIAL_HUBS}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'rider' && (
          <RiderDashboard
            currentRider={riders[0]}
            onToggleOnline={handleToggleRiderOnline}
            activeOrders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onOpenReviewModal={handleOpenReviewModal}
          />
        )}

        {currentTab === 'radar' && (
          <FleetRadarView
            riders={riders}
            orders={orders}
            onSelectRider={(rider) => {
              setSelectedRider(rider);
              setCurrentTab('book');
            }}
          />
        )}

        {currentTab === 'reviews' && (
          <ReviewsView
            reviews={reviews}
            onOpenNewReviewModal={() => {
              setReviewTargetOrder(orders[0]);
              setIsReviewModalOpen(true);
            }}
          />
        )}
      </main>

      {/* 4. Minimalist Modern Footer */}
      <footer className="border-t border-[#1e1e1e] bg-black text-xs text-slate-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">PulseLogistics</span>
            <span>·</span>
            <span>Autonomous On-Demand Courier Network</span>
            <span>·</span>
            <span>© 2026 PulseLogistics Global Inc.</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Carriage</span>
            <span className="hover:text-white cursor-pointer transition-colors">Courier Safety Charter</span>
            <span className="hover:text-white cursor-pointer transition-colors">API &amp; Webhooks</span>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-over Drawers */}
      <PaymentGatewayModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderDraft={paymentDraftOrder}
        onPaymentSuccess={handlePaymentSuccess}
        userWalletBalance={currentUser.walletBalance}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        order={reviewTargetOrder}
        onSubmitReview={handleSubmitReview}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onRegisterCustomer={handleRegisterCustomer}
        onRegisterRider={handleRegisterRider}
        initialMode={activeRole === 'rider' ? 'rider' : 'customer'}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onSimulateNotification={() => {
          soundEffects.playDispatchAlert();
          addNotification({
            title: 'Automated Courier Ping',
            message: 'Courier Marcus Vance reported traffic clear along 4th Avenue. On schedule.',
            type: 'dispatch',
          });
        }}
      />
    </div>
  );
}
