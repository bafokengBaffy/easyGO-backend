// src/utils/validationSchemas.js
import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
});

export const registerSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').required('Phone number is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup.string().oneOf(['rider', 'driver'], 'Invalid role').required('Role is required')
});

export const rideRequestSchema = yup.object({
  pickup: yup.object({
    lat: yup.number().required(),
    lng: yup.number().required(),
    address: yup.string().required('Pickup address is required')
  }).required('Pickup location is required'),
  destination: yup.object({
    lat: yup.number().required(),
    lng: yup.number().required(),
    address: yup.string().required('Destination address is required')
  }).required('Destination is required'),
  vehicleType: yup.string().oneOf(['economy', 'standard', 'premium', 'suv']).required('Vehicle type is required'),
  paymentMethodId: yup.string().required('Payment method is required'),
  scheduledTime: yup.date().min(new Date(), 'Scheduled time must be in the future').nullable()
});

export const paymentMethodSchema = yup.object({
  type: yup.string().oneOf(['credit_card', 'debit_card', 'mobile_money']).required(),
  cardNumber: yup.string().when('type', {
    is: (type) => ['credit_card', 'debit_card'].includes(type),
    then: yup.string().matches(/^[0-9]{16}$/, 'Invalid card number').required()
  }),
  expiryDate: yup.string().when('type', {
    is: (type) => ['credit_card', 'debit_card'].includes(type),
    then: yup.string().matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date (MM/YY)').required()
  }),
  cvv: yup.string().when('type', {
    is: (type) => ['credit_card', 'debit_card'].includes(type),
    then: yup.string().matches(/^[0-9]{3,4}$/, 'Invalid CVV').required()
  }),
  cardName: yup.string().when('type', {
    is: (type) => ['credit_card', 'debit_card'].includes(type),
    then: yup.string().required('Cardholder name is required')
  }),
  mobileNumber: yup.string().when('type', {
    is: 'mobile_money',
    then: yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number').required()
  }),
  provider: yup.string().when('type', {
    is: 'mobile_money',
    then: yup.string().oneOf(['mpesa', 'ecocash', 'airtel_money']).required()
  })
});

export const driverRegistrationSchema = yup.object({
  name: yup.string().min(2).required(),
  email: yup.string().email().required(),
  phone: yup.string().matches(/^\+?[1-9]\d{1,14}$/).required(),
  password: yup.string().min(8).required(),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required(),
  vehicle: yup.object({
    model: yup.string().required('Vehicle model is required'),
    licensePlate: yup.string().required('License plate is required'),
    color: yup.string().required('Vehicle color is required'),
    year: yup.number().min(2000).max(new Date().getFullYear()).required('Vehicle year is required'),
    seats: yup.number().min(2).max(7).required('Number of seats is required')
  }).required(),
  documents: yup.object({
    driversLicense: yup.mixed().required('Driver\'s license is required'),
    vehicleRegistration: yup.mixed().required('Vehicle registration is required'),
    insurance: yup.mixed().required('Insurance document is required'),
    backgroundCheck: yup.mixed().required('Background check consent is required')
  }).required()
});

export const supportTicketSchema = yup.object({
  category: yup.string().oneOf(['ride_issue', 'payment', 'driver', 'technical', 'other']).required('Category is required'),
  subject: yup.string().min(5).max(100).required('Subject is required'),
  message: yup.string().min(20).max(1000).required('Message is required'),
  rideId: yup.string().nullable(),
  urgency: yup.string().oneOf(['low', 'medium', 'high']).required('Urgency level is required'),
  attachments: yup.mixed().nullable()
});

export const profileUpdateSchema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters'),
  phone: yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  address: yup.string().min(5, 'Address must be at least 5 characters'),
  dateOfBirth: yup.date().max(new Date(), 'Invalid date of birth'),
  preferredLanguage: yup.string().oneOf(['en', 'fr', 'es', 'ar']),
  notificationPreferences: yup.object({
    email: yup.boolean(),
    push: yup.boolean(),
    sms: yup.boolean()
  })
});

export const rideRatingSchema = yup.object({
  rating: yup.number().min(1).max(5).required('Rating is required'),
  feedback: yup.string().max(500, 'Feedback must be less than 500 characters'),
  categories: yup.object({
    punctuality: yup.number().min(1).max(5),
    cleanliness: yup.number().min(1).max(5),
    drivingSkill: yup.number().min(1).max(5),
    friendliness: yup.number().min(1).max(5)
  }),
  compliment: yup.string().max(200),
  reportIssue: yup.boolean()
});

export const withdrawalRequestSchema = yup.object({
  amount: yup.number()
    .min(10, 'Minimum withdrawal amount is $10')
    .max(10000, 'Maximum withdrawal amount is $10,000')
    .required('Amount is required'),
  methodId: yup.string().required('Withdrawal method is required'),
  notes: yup.string().max(200)
});