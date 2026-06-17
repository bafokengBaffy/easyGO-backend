// src/pages/public/LandingPage.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Clock, DollarSign, ChevronRight, Star, Phone, MapPin } from 'lucide-react';
import Button from '@/components/common/Button';

const LandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: Car,
      title: 'Fast & Reliable',
      description: 'Get a ride in minutes with our extensive network of drivers',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'All drivers are background checked and rides are tracked',
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Customer support available around the clock',
    },
    {
      icon: DollarSign,
      title: 'Best Prices',
      description: 'Competitive pricing with no hidden fees',
    },
  ];

  const stats = [
    { value: '1M+', label: 'Happy Riders' },
    { value: '50K+', label: 'Active Drivers' },
    { value: '10M+', label: 'Completed Rides' },
    { value: '99.9%', label: 'Satisfaction Rate' },
  ];

  const testimonials = [
    {
      name: 'John Doe',
      role: 'Regular Rider',
      content: 'EasyGo has transformed my daily commute. Reliable, affordable, and always on time!',
      rating: 5,
      avatar: 'JD',
    },
    {
      name: 'Sarah Smith',
      role: 'Driver Partner',
      content: 'Great platform to earn flexible income. The support team is amazing!',
      rating: 5,
      avatar: 'SS',
    },
    {
      name: 'Mike Johnson',
      role: 'Business Traveler',
      content: 'My go-to app for airport transfers. Professional drivers and clean cars.',
      rating: 5,
      avatar: 'MJ',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container-custom py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fade-in">
                Your Ride, Your Way, Anywhere
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Safe, reliable, and affordable rides at your fingertips. 
                Join millions of satisfied riders worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    Get Started
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="/hero-illustration.svg" 
                alt="Ride sharing illustration"
                className="w-full max-w-md mx-auto animate-slide-up"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose EasyGo?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the best ride-hailing service with features designed for you
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Download the EasyGo App
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Get the best experience with our mobile app. Available on iOS and Android.
              </p>
              <div className="flex gap-4">
                <img src="/app-store-badge.svg" alt="App Store" className="h-12" />
                <img src="/google-play-badge.svg" alt="Google Play" className="h-12" />
              </div>
            </div>
            <div className="flex justify-center">
              <img src="/app-mockup.png" alt="App Mockup" className="w-64" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by millions of riders and drivers worldwide
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Ride?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join EasyGo today and experience the future of transportation
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;