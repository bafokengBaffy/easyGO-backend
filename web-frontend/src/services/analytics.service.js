import { trackEvent, trackPageView } from '@/utils/analytics';

export const analyticsService = {
  trackPageView: (page) => { trackPageView(page); },
  trackEvent: (event, properties) => { trackEvent(event, properties); },
  trackRideRequested: (rideData) => { trackEvent('ride_requested', rideData); },
  trackRideCompleted: (rideData) => { trackEvent('ride_completed', rideData); },
  trackPaymentSuccess: (paymentData) => { trackEvent('payment_success', paymentData); },
  trackDriverOnline: (driverData) => { trackEvent('driver_online', driverData); },
};
