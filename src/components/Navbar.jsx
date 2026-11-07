import React, { useState, useEffect } from 'react';
import { useApp, CURRENCIES, LANGUAGES } from '../context/AppContext';
import LanguageSelector from './LanguageSelector';
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
  Gamepad2,
  ShieldCheck,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({ onOpenSearch, onOpenAdmin, currentUser, onOpenLogin, onLogout }) {
  const { 
    cart, 
    currency, 
    setCurrency, 
    setIsCartOpen, 
    setIsAccountOpen,
    theme,
    toggleTheme,
    t
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
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'chetranicky@gmail.com' || currentUser.email === 'admin@synapse.ai' || currentUser.email === 'admin@dyzzstore.com');

  return (
    <>
      {/* Top Notification Announcement Bar */}
      

      {/* Main Header */}
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container header-container">
          {/* Brand Logo */}
          <a href="#" className="brand-logo" aria-label="Dyzzstore Home">
            <div className="logo-symbol">
              <img src="/favicon.svg" alt="Dyzzstore Logo" className="logo-icon-img" width="26" height="26" />
              <span className="pulse-dot"></span>
            </div>
            <span className="logo-text">Dyzz<span className="logo-gradient">store</span></span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="nav-links">
            <a href="#topup" className="nav-link topup-highlight-link">
              <Gamepad2 size={16} className="text-cyan-400" />
              <span>{t('nav_game_topup', 'Game Top-Up')}</span>
              <span style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)', color: '#fff', fontSize: '0.62rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>NEW</span>
            </a>
            <a href="#tools" className="nav-link">
              <Boxes size={16} />
              <span>{t('nav_ai_tools', 'AI Tools')}</span>
            </a>
          </nav>

          {/* Header Action Controls */}
          <div className="header-actions">
            {/* Language Switcher */}
            <LanguageSelector />

            {/* Currency Selector */}
            <div className="currency-picker header-currency-picker">
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
              <span className="search-text">{t('nav_search_placeholder', 'Search...')}</span>
              <kbd className="kbd-shortcut">Ctrl+K</kbd>
            </button>

            {/* Auth / Account Controls */}
            {currentUser ? (
              <div className="auth-user-group">
                {/* ONLY SHOW ADMIN BUTTON WHEN USER IS ADMIN */}
                {isAdmin && (
                  <button 
                    className="btn-admin-nav"
                    onClick={onOpenAdmin}
                    title="Control Center (Role: Admin)"
                  >
                    <ShieldCheck size={16} className="text-cyan" />
                    <span>{t('nav_admin_panel', 'Admin Panel')}</span>
                    <span className="badge-admin-dot"></span>
                  </button>
                )}

                {!isAdmin && (
                  <button 
                    className="btn-account"
                    onClick={() => setIsAccountOpen(true)}
                    title="Dashboard & API Keys"
                  >
                    <User size={15} />
                    <span className="account-btn-label">{currentUser.name || 'Account'}</span>
                  </button>
                )}

                <button
                  className="btn-logout-mini"
                  onClick={onLogout}
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : null}

            {/* Theme Toggle (Light / Dark Mode) */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Light and Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun size={17} className="theme-toggle-icon sun" />
              ) : (
                <Moon size={17} className="theme-toggle-icon moon" />
              )}
            </button>

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
              <a href="#topup" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link text-cyan">
                <Gamepad2 size={18} /> {t('nav_game_topup', 'Game Top-Up')}
              </a>
              <a href="#tools" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">
                <Boxes size={18} /> {t('nav_ai_tools', 'AI Tools')}
              </a>
              <div className="mobile-actions-stack">
                {isAdmin && (
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
                    {!isAdmin && (
                      <button 
                        className="btn btn-secondary btn-full"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsAccountOpen(true);
                        }}
                      >
                        <User size={16} /> Dashboard & API Keys ({currentUser.name})
                      </button>
                    )}
                    <button 
                      className="btn btn-outline btn-full text-danger"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                    >
                      <LogOut size={16} /> {t('nav_sign_out', 'Sign Out')}
                    </button>
                  </>
                ) : null}

                {/* Mobile Currency Selector */}
                <div className="mobile-drawer-settings-card">
                  <div className="mobile-drawer-setting-row">
                    <span className="mobile-setting-label">{t('currency', 'Currency')}</span>
                    <div className="currency-picker mobile-currency-picker">
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
                  </div>
                </div>

                <button 
                  type="button"
                  className="btn btn-secondary btn-full theme-mobile-toggle"
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }}
                >
                  {theme === 'dark' ? <Sun size={16} className="text-warning" /> : <Moon size={16} className="text-primary" />}
                  <span>{theme === 'dark' ? (t('theme_switch_light', 'Switch to Light Mode')) : (t('theme_switch_dark', 'Switch to Dark Mode'))}</span>
                </button>

                <a 
                  href="#tools" 
                  className="btn btn-primary btn-glow btn-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Boxes size={16} /> {t('nav_explore_marketplace', 'Explore AI Marketplace')}
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
