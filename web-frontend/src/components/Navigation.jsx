import { useState, useState as useStateNamespace } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'For Riders', to: '/#riders' },
    { label: 'For Drivers', to: '/#drivers' },
    { label: 'About', to: '/#about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-black/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group hover:opacity-90 transition-opacity">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gold-500 flex-shrink-0 group-hover:shadow-lg transition-shadow">
              <span className="text-xl font-bold text-brand-dark">eg</span>
            </div>
            <span className="text-2xl font-bold text-brand-dark tracking-tight hidden sm:block">
              easyGo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative text-base font-medium transition-colors ${
                    isActive ? 'text-brand-dark' : 'text-brand-dark/70 hover:text-brand-dark'
                  }`
                }
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold-500 group-hover:w-full transition-all duration-200" />
              </NavLink>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <NavLink
              to="/login"
              className="px-6 py-2.5 text-sm font-semibold text-brand-dark border-2 border-brand-dark rounded-full hover:bg-brand-dark hover:text-white transition-all duration-200"
            >
              Sign In
            </NavLink>
            <NavLink
              to="/register"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-dark rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started
            </NavLink>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-brand-dark/5 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-brand-dark" />
            ) : (
              <Menu className="w-6 h-6 text-brand-dark" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 border-t border-black/5 animate-fade-down">
            <nav className="flex flex-col gap-4 mt-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-gold-500 text-brand-dark'
                        : 'text-brand-dark/70 hover:bg-brand-dark/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex gap-3 mt-6 pt-4 border-t border-black/5">
              <NavLink
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-brand-dark border-2 border-brand-dark rounded-full hover:bg-brand-dark hover:text-white transition-all"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-brand-dark rounded-full hover:shadow-lg transition-all"
              >
                Get Started
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navigation;
