export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: { DASHBOARD: '/admin', USERS: '/admin/users', DRIVERS: '/admin/drivers', RIDES: '/admin/rides', PAYMENTS: '/admin/payments' },
  DRIVER: { DASHBOARD: '/driver', CURRENT_TRIP: '/driver/current-trip', EARNINGS: '/driver/earnings', VEHICLE: '/driver/vehicle' },
  RIDER: { DASHBOARD: '/rider', BOOK: '/rider/book', HISTORY: '/rider/history', PAYMENTS: '/rider/payments' },
  NOT_FOUND: '/404',
};
