# Frontend Development & Production Guide

## Quick Start

### Development Mode
```bash
cd web-frontend
npm install
npm run dev
```
Visit `http://localhost:5173`

### Production Build
```bash
npm run build:production
npm run preview
```

## Complete API Integration Testing

### 1. Authentication Flow

**Register New User**
```javascript
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "rider" // or "driver" or "admin"
}

Response:
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "rider"
  },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Login**
```javascript
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "user": { ... },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### 2. Rider - Book a Ride

**Step 1: Request Ride**
```javascript
POST /api/v1/rides/book
Headers: Authorization: Bearer {accessToken}
{
  "pickupLocation": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "123 Main St, NY"
  },
  "dropoffLocation": {
    "latitude": 40.7589,
    "longitude": -73.9851,
    "address": "Times Square, NY"
  },
  "rideType": "standard", // or "premium", "xl"
  "preferences": {
    "musicPreference": "none",
    "talkPreference": "quiet"
  }
}

Response:
{
  "rideId": "ride_456",
  "status": "waiting_for_driver",
  "estimatedFare": 12.50,
  "estimatedTime": 5
}
```

**Step 2: Get Ride Details**
```javascript
GET /api/v1/rides/ride_456
Headers: Authorization: Bearer {accessToken}

Response:
{
  "id": "ride_456",
  "driver": {
    "id": "driver_789",
    "name": "Jane Smith",
    "rating": 4.8,
    "photo": "https://..."
  },
  "vehicle": {
    "type": "sedan",
    "make": "Toyota",
    "model": "Camry",
    "licensePlate": "ABC123",
    "color": "white"
  },
  "status": "driver_arriving",
  "currentLocation": { ... },
  "estimatedArrival": 3
}
```

**Step 3: Rate Ride**
```javascript
POST /api/v1/rides/ride_456/rate
Headers: Authorization: Bearer {accessToken}
{
  "rating": 5,
  "feedback": "Great driver, clean car!"
}
```

### 3. Driver - Accept & Complete Ride

**Get Available Rides**
```javascript
GET /api/v1/rides/available
Headers: Authorization: Bearer {accessToken}
Query Params: latitude=40.7128&longitude=-74.0060&radius=5

Response:
{
  "rides": [
    {
      "id": "ride_456",
      "pickup": { ... },
      "dropoff": { ... },
      "estimatedDistance": 3.5,
      "estimatedFare": 12.50
    }
  ]
}
```

**Accept Ride**
```javascript
POST /api/v1/rides/ride_456/accept
Headers: Authorization: Bearer {accessToken}

Response:
{
  "id": "ride_456",
  "status": "driver_accepted",
  "rider": { ... }
}
```

**Start Ride**
```javascript
POST /api/v1/rides/ride_456/start
Headers: Authorization: Bearer {accessToken}
{
  "currentLocation": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}

Response:
{
  "id": "ride_456",
  "status": "in_progress"
}
```

**Complete Ride**
```javascript
POST /api/v1/rides/ride_456/complete
Headers: Authorization: Bearer {accessToken}
{
  "finalLocation": {
    "latitude": 40.7589,
    "longitude": -73.9851
  }
}

Response:
{
  "id": "ride_456",
  "status": "completed",
  "actualFare": 12.50,
  "distance": 3.5
}
```

### 4. Payments

**Get Payment Methods**
```javascript
GET /api/v1/payments/methods
Headers: Authorization: Bearer {accessToken}

Response:
{
  "methods": [
    {
      "id": "card_123",
      "type": "credit_card",
      "brand": "visa",
      "last4": "1234",
      "isDefault": true
    }
  ]
}
```

**Add Payment Method**
```javascript
POST /api/v1/payments/methods
Headers: Authorization: Bearer {accessToken}
{
  "type": "credit_card",
  "cardNumber": "4111111111111111",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cvv": "123",
  "cardholderName": "John Doe"
}
```

**Get Wallet Balance**
```javascript
GET /api/v1/payments/wallet
Headers: Authorization: Bearer {accessToken}

Response:
{
  "balance": 50.00,
  "currency": "USD"
}
```

### 5. Admin - View Analytics

**Get All Rides**
```javascript
GET /api/v1/admin/rides
Headers: Authorization: Bearer {adminToken}
Query Params: page=1&limit=20&status=completed

Response:
{
  "rides": [ ... ],
  "total": 1000,
  "page": 1,
  "pages": 50
}
```

**Get Analytics Dashboard**
```javascript
GET /api/v1/admin/analytics
Headers: Authorization: Bearer {adminToken}
Query Params: period=week

Response:
{
  "totalRides": 1000,
  "totalRevenue": 12500,
  "averageRating": 4.8,
  "activeUsers": 500,
  "trends": { ... }
}
```

## Frontend Implementation Examples

### Using Custom Hooks

```javascript
import { useApi, useMutation } from '@/hooks/useApi';
import rideService from '@/services/ride.service';

function RideBookingPage() {
  const [bookRide, { data, loading, error }] = useLazyApi(
    async (pickup, dropoff) => {
      return rideService.bookRide(pickup, dropoff, 'standard');
    }
  );

  const handleBookRide = async () => {
    await bookRide(pickupLocation, dropoffLocation);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBoundary />;

  return (
    <div>
      {data && <p>Ride ID: {data.rideId}</p>}
      <button onClick={handleBookRide}>Book Ride</button>
    </div>
  );
}
```

### Real-time Updates with Firebase

```javascript
import { onNotificationMessage } from '@/config/firebase';

useEffect(() => {
  onNotificationMessage((message) => {
    console.log('New notification:', message);
    toast.success(message.notification.title);
  });
}, []);
```

## Environment Configuration Files

### .env.production
```
VITE_API_BASE_URL=https://api.easygo.com/api/v1
VITE_BACKEND_URL=https://api.easygo.com
VITE_FIREBASE_API_KEY=AIzaSyA7HxJYxQ5R45WcRAmF_VPAZSurzQ52cCc
# ... other Firebase config
VITE_APP_ENV=production
```

### .env.staging
```
VITE_API_BASE_URL=https://staging-api.easygo.com/api/v1
VITE_BACKEND_URL=https://staging-api.easygo.com
VITE_APP_ENV=staging
```

### .env.development
```
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_BACKEND_URL=http://localhost:4000
VITE_APP_ENV=development
```

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Firebase credentials validated
- [ ] Backend API endpoints tested
- [ ] Frontend build completes without errors
- [ ] Performance audit passed (Lighthouse score > 80)
- [ ] Security audit passed (no vulnerabilities)
- [ ] SSL certificate installed
- [ ] CORS configured properly
- [ ] Cache headers set correctly
- [ ] CDN configured for assets
- [ ] Database backups configured
- [ ] Monitoring and logging enabled
- [ ] Error tracking (Sentry) configured
- [ ] Analytics tracking verified
- [ ] Load testing completed
- [ ] Failover plan documented

## Performance Optimization Tips

1. **Code Splitting**: Routes are lazy loaded
2. **Image Optimization**: Use Cloudinary
3. **Bundle Analysis**: `npm run build -- --stats`
4. **Caching**: Set appropriate cache headers
5. **Compression**: Gzip enabled in nginx
6. **Minification**: Vite handles automatically

## Troubleshooting

### API Connection Issues
```bash
# Test backend connectivity
curl http://localhost:4000/api/v1/health

# Check network tab in DevTools
# Verify CORS headers
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Try specific version
npm install --exact @version
```

### Firebase Issues
```bash
# Verify config in .env
# Check browser console for specific errors
# Test Firebase connectivity
```

## Support & Resources

- **API Documentation**: [Backend API Docs](../web-backend/README.md)
- **Firebase Console**: https://console.firebase.google.com
- **Deployment Guide**: [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
- **Component Library**: [Storybook]() (if configured)
