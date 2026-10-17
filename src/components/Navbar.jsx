import React, { useState, useEffect } from 'react';
import { useApp, CURRENCIES } from '../context/AppContext';
import { 
  Brain, 
  ShoppingCart, 
  User, 
  Search, 
  ArrowRight, 
  Menu, 
  X,
  Sparkles,
  Boxes,
  Zap,
  HelpCircle,
  Star,
  ShieldCheck,
  LogIn,
  LogOut
} from 'lucide-react';

export default function Navbar({ onOpenSearch, onOpenAdmin, currentUser, onOpenLogin, onLogout }) {
  const { 
    cart, 
    currency, 
    setCurrency, 
    setIsCartOpen, 
    setIsAccountOpen 
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItemsCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <>
      {/* Top Notification Announcement Bar */}
      

      {/* Main Header */}
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container header-container">
          {/* Brand Logo */}
          <a href="#" className="brand-logo">
            <div className="logo-symbol">
              <Brain size={22} className="logo-icon" />
              <span className="pulse-dot"></span>
            </div>
            <span className="logo-text">SYNAPSE<span className="logo-gradient">.AI</span></span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="nav-links">
            <a href="#tools" className="nav-link">
              <Boxes size={16} />
              <span>AI Tools</span>
            </a>
            <a href="#features" className="nav-link">
              <span>Platform</span>
            </a>
            <a href="#testimonials" className="nav-link">
              <Star size={16} />
              <span>Reviews</span>
            </a>
            <a href="#faq" className="nav-link">
              <HelpCircle size={16} />
              <span>FAQ</span>
            </a>
          </nav>

          {/* Header Action Controls */}
          <div className="header-actions">
            {/* Currency Selector */}
            <div className="currency-picker">
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                aria-label="Select Currency"
                className="currency-select"
              >
                {Object.entries(CURRENCIES).map(([code, cur]) => (
                  <option key={code} value={code}>
                    {cur.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Trigger */}
            <button 
              className="search-trigger-btn"
              onClick={onOpenSearch}
              title="Search AI Tools"
            >
              <Search size={15} />
              <span className="search-text">Search...</span>
              <kbd className="kbd-shortcut">Ctrl+K</kbd>
            </button>

            {/* Auth / Account Controls */}
            {currentUser ? (
              <div className="auth-user-group">
                {/* ONLY SHOW ADMIN BUTTON WHEN ROLE === 'ADMIN' */}
                {currentUser.role === 'admin' && (
                  <button 
                    className="btn-admin-nav"
                    onClick={onOpenAdmin}
                    title="Control Center (Role: Admin)"
                  >
                    <ShieldCheck size={16} className="text-cyan" />
                    <span>Admin Panel</span>
                    <span className="badge-admin-dot"></span>
                  </button>
                )}

                <button 
                  className="btn-account"
                  onClick={() => setIsAccountOpen(true)}
                  title="Dashboard & API Keys"
                >
                  <User size={15} />
                  <span className="account-btn-label">{currentUser.name || 'Account'}</span>
                </button>

                <button
                  className="btn-logout-mini"
                  onClick={onLogout}
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              // <button 
              //   className="btn-signin-nav"
              //   onClick={onOpenLogin}
              //   title="Sign in / Login"
              // >
              //   <LogIn size={15} />
              //   <span>Sign In</span>
              // </button>
              <div></div>
            )}

            {/* Cart Button */}
            <button 
              className="cart-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="View Shopping Cart"
            >
              <ShoppingCart size={18} />
              {totalItemsCount > 0 && (
                <span className="cart-counter">{totalItemsCount}</span>
              )}
            </button>

            {/* Explore Tools CTA */}
            <a href="#tools" className="btn btn-primary btn-glow nav-cta">
              <span>Explore Tools</span>
              <ArrowRight size={15} />
            </a>

            {/* Mobile Menu Toggle Button */}
            <button 
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <nav className="mobile-nav-links">
              <a href="#tools" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <Boxes size={18} /> AI Tools Marketplace
              </a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                Platform Architecture
              </a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <Star size={18} /> Customer Stories
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <HelpCircle size={18} /> FAQ
              </a>
              <div className="mobile-actions-stack">
                {currentUser?.role === 'admin' && (
                  <button 
                    className="btn btn-secondary btn-full text-cyan"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                  >
                    <ShieldCheck size={16} /> Open Admin Panel
                  </button>
                )}

                {currentUser ? (
                  <>
                    <button 
                      className="btn btn-secondary btn-full"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsAccountOpen(true);
                      }}
                    >
                      <User size={16} /> Dashboard & API Keys ({currentUser.name})
                    </button>
                    <button 
                      className="btn btn-outline btn-full text-danger"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn btn-secondary btn-full"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLogin();
                    }}
                  >
                    <LogIn size={16} /> Sign In / Create Account
                  </button>
                )}

                <a 
                  href="#tools" 
                  className="btn btn-primary btn-glow btn-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Boxes size={16} /> Explore AI Marketplace
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
