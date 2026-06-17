// src/utils/permissions.js
export const permissions = {
  // User permissions
  user: {
    read: 'user:read',
    update: 'user:update',
    delete: 'user:delete',
  },
  
  // Ride permissions
  ride: {
    create: 'ride:create',
    read: 'ride:read',
    update: 'ride:update',
    cancel: 'ride:cancel',
    rate: 'ride:rate',
  },
  
  // Driver permissions
  driver: {
    read: 'driver:read',
    update: 'driver:update',
    verify: 'driver:verify',
    suspend: 'driver:suspend',
  },
  
  // Payment permissions
  payment: {
    create: 'payment:create',
    read: 'payment:read',
    refund: 'payment:refund',
  },
  
  // Admin permissions
  admin: {
    access: 'admin:access',
    manageUsers: 'admin:manageUsers',
    manageDrivers: 'admin:manageDrivers',
    manageRides: 'admin:manageRides',
    viewAnalytics: 'admin:viewAnalytics',
    manageSettings: 'admin:manageSettings',
  },
};

export const rolePermissions = {
  rider: [
    permissions.user.read,
    permissions.user.update,
    permissions.ride.create,
    permissions.ride.read,
    permissions.ride.cancel,
    permissions.ride.rate,
    permissions.payment.create,
    permissions.payment.read,
  ],
  
  driver: [
    permissions.user.read,
    permissions.user.update,
    permissions.ride.read,
    permissions.ride.update,
    permissions.driver.read,
    permissions.driver.update,
  ],
  
  admin: [
    ...Object.values(permissions.admin),
    ...Object.values(permissions.user),
    ...Object.values(permissions.ride),
    ...Object.values(permissions.driver),
    ...Object.values(permissions.payment),
  ],
};

export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions) return false;
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions) return false;
  return requiredPermissions.some(permission => userPermissions.includes(permission));
};