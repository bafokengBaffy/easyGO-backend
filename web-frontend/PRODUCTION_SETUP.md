# Production Deployment & Integration Guide

## Overview
This document covers the complete production setup, deployment, and integration between web-frontend and web-backend.

## Environment Configuration

### Frontend Environment Variables (.env.production)
```
VITE_API_BASE_URL=https://api.easygo.com/api/v1
VITE_BACKEND_URL=https://api.easygo.com

VITE_FIREBASE_API_KEY=AIzaSyA7HxJYxQ5R45WcRAmF_VPAZSurzQ52cCc
VITE_FIREBASE_AUTH_DOMAIN=easygols.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=easygols
VITE_FIREBASE_STORAGE_BUCKET=easygols.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=11467875224
VITE_FIREBASE_APP_ID=1:11467875224:web:af00c43f10cfe7adc681ed
VITE_FIREBASE_MEASUREMENT_ID=G-SVCSYMCW07
VITE_FIREBASE_DATABASE_URL=https://easygols-default-rtdb.asia-southeast1.firebasedatabase.app

VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

VITE_APP_ENV=production
VITE_APP_NAME=EasyGo
```

## API Endpoints Summary

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### User Endpoints
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/:id` - Update user profile
- `POST /api/v1/users/:id/profile-picture` - Upload profile picture
- `GET /api/v1/users/:id/preferences` - Get user preferences
- `PUT /api/v1/users/:id/preferences` - Update preferences
- `POST /api/v1/users/change-password` - Change password

### Ride Endpoints
- `POST /api/v1/rides/book` - Book a ride (Rider)
- `GET /api/v1/rides/available` - Get available rides (Driver)
- `POST /api/v1/rides/:id/accept` - Accept ride (Driver)
- `POST /api/v1/rides/:id/reject` - Reject ride (Driver)
- `GET /api/v1/rides/:id` - Get ride details
- `POST /api/v1/rides/:id/start` - Start ride (Driver)
- `POST /api/v1/rides/:id/complete` - Complete ride (Driver)
- `POST /api/v1/rides/:id/cancel` - Cancel ride
- `POST /api/v1/rides/:id/rate` - Rate ride (Rider)
- `GET /api/v1/rides/history` - Get ride history

### Payment Endpoints
- `GET /api/v1/payments/methods` - Get payment methods
- `POST /api/v1/payments/methods` - Add payment method
- `POST /api/v1/payments/methods/:id/default` - Set default method
- `DELETE /api/v1/payments/methods/:id` - Remove payment method
- `GET /api/v1/payments/wallet` - Get wallet balance
- `POST /api/v1/payments/wallet/add` - Add funds to wallet
- `GET /api/v1/payments/history` - Get payment history
- `GET /api/v1/payments/earnings/:id` - Get driver earnings
- `POST /api/v1/payments/payout` - Request payout

### Admin Endpoints
- `GET /api/v1/admin/users` - Get all users
- `POST /api/v1/admin/users/:id/suspend` - Suspend user
- `POST /api/v1/admin/users/:id/unsuspend` - Unsuspend user
- `GET /api/v1/admin/rides` - Get all rides
- `GET /api/v1/admin/payments` - Get payment transactions
- `GET /api/v1/admin/analytics` - Get analytics data

## Frontend Features Implemented

### UI Components
✅ Responsive Navbar with role-based menus
✅ Collapsible Sidebar with nested navigation
✅ Loading Spinners and Error Boundaries
✅ Modal components for dialogs
✅ Toast notifications for user feedback
✅ Professional Landing Page

### Services & API Integration
✅ Centralized API client with interceptors
✅ Authentication service with token refresh
✅ Ride booking and management
✅ Payment processing integration
✅ User profile management
✅ Admin analytics endpoints

### State Management
✅ Redux for global auth state
✅ React Query for server state
✅ Zustand for client preferences
✅ Custom hooks for API calls

### Real-time Features
✅ Firebase Realtime Database integration
✅ Firebase Analytics
✅ Cloud Messaging setup (optional)
✅ Notification subscription ready

## Production Build & Deployment

### Build Commands
```bash
# Development
npm run dev

# Build for staging
npm run build:staging

# Build for production
npm run build:production

# Preview production build
npm run preview
```

### Docker Deployment
```bash
# Build image
docker build -t easygo-frontend:latest .

# Run container
docker run -p 3000:3000 easygo-frontend:latest

# With docker-compose
docker-compose up frontend
```

### Nginx Configuration
The included `nginx.conf` handles:
- Gzip compression for assets
- Proper MIME types
- SPA routing (all requests to index.html)
- Cache headers for static assets
- Security headers

## Backend Integration Checklist

### Completed
✅ PostgreSQL database integration
✅ Sequelize ORM configuration
✅ Admin schema inspection endpoints
✅ Environment configuration
✅ CORS setup ready

### Verification Steps
```bash
# 1. Test backend is running
curl http://localhost:4000/api/v1/health

# 2. Test authentication
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 3. Test admin schema endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/v1/ops/schema

# 4. Test admin summary
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/v1/ops/schema/summary
```

## Security Best Practices

### Implemented
✅ JWT token-based authentication
✅ Secure HTTPS-only cookies (production)
✅ CORS configuration
✅ Rate limiting ready
✅ Input validation with Yup
✅ Error messages sanitized
✅ Admin endpoints require role verification

### Additional Security Measures
- Enable SSL/TLS certificates
- Implement rate limiting on backend
- Add Web Application Firewall (WAF)
- Regular security audits
- Keep dependencies updated: `npm audit fix`
- Use environment variables for secrets
- Implement Content Security Policy headers

## Performance Optimization

### Frontend
- Code splitting with React lazy loading
- Image optimization with Cloudinary
- Gzip compression for assets
- Browser caching with service workers
- React Query cache management
- Lazy loading routes

### Backend
- Database connection pooling
- Redis caching ready
- API response caching
- Query optimization
- Load balancing ready

## Monitoring & Logging

### Firebase Analytics Events
- `page_view` - Track page visits
- `user_action` - Track user interactions
- `error_event` - Track frontend errors
- `api_call` - Track API requests

### Backend Logging
- Use `/api/v1/ops/schema` for monitoring
- Enable audit logs for admin actions
- Track all payment transactions
- Monitor ride completions

## Next Steps for Production

1. **SSL Certificate**: Install production SSL certificate
2. **Database Backup**: Set up automated PostgreSQL backups
3. **Monitoring**: Deploy monitoring stack (DataDog, New Relic, etc.)
4. **CDN**: Configure CloudFront or similar for static assets
5. **Load Balancing**: Set up load balancer for backend
6. **Email Service**: Configure SMTP for notifications
7. **SMS Service**: Integrate Twilio or similar for OTP
8. **Payment Gateway**: Complete Stripe integration
9. **Analytics Dashboard**: Set up comprehensive analytics
10. **Documentation**: Update API documentation

## Troubleshooting

### Common Issues

**Frontend can't connect to backend**
```bash
# Check backend is running
ps aux | grep node

# Check port 4000 is open
netstat -an | grep 4000

# Test connectivity
curl http://localhost:4000/api/v1/health
```

**Firebase initialization fails**
```bash
# Verify Firebase credentials in .env
# Check browser console for specific errors
# Ensure Firebase project exists
```

**API tokens expiring**
```bash
# Check token refresh endpoint working
# Verify refresh token stored in localStorage
# Check authorization header format
```

## Support Contacts

- **Backend Issues**: Check web-backend logs
- **Database Issues**: PostgreSQL server status
- **Firebase Issues**: Firebase console logs
- **Deployment Issues**: Docker logs
