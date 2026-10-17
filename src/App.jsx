import React, { useState, useRef, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ToolsCatalog from './components/ToolsCatalog';
import PlatformFeatures from './components/PlatformFeatures';
import Testimonials from './components/Testimonials';
import FaqSection from './components/FaqSection';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AccountDashboardModal from './components/AccountDashboardModal';
import ToolQuickViewModal from './components/ToolQuickViewModal';
import ToastContainer from './components/ToastContainer';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

function MainContent() {
  const { addToast, setIsCheckoutOpen } = useApp();

  useEffect(() => {
    window.__openCheckout = (open = true) => setIsCheckoutOpen(open);
  }, [setIsCheckoutOpen]);

  // Authentication & Role State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('synapse_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Check URL pathname or hash for /login or #login or #admin
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path === '/login' || hash === '#login') {
        setIsLoginOpen(true);
      } else if (path === '/admin' || hash === '#admin') {
        if (currentUser?.role === 'admin') {
          setIsAdminOpen(true);
        } else {
          setIsLoginOpen(true);
          addToast('Please sign in as Administrator to access Admin Control Center', 'info');
        }
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, [currentUser]);

  const handleOpenSearch = () => {
    const toolsSection = document.getElementById('tools');
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 400);
  };

  const handleLoginSuccess = (user, shouldOpenAdmin) => {
    setCurrentUser(user);
    if (user.role === 'admin' && shouldOpenAdmin) {
      setIsAdminOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('synapse_user');
    localStorage.removeItem('synapse_token');
    setCurrentUser(null);
    setIsAdminOpen(false);
    addToast('Signed out successfully', 'info');
  };

  const handleOpenAdmin = () => {
    if (currentUser?.role === 'admin') {
      setIsAdminOpen(true);
    } else {
      setIsLoginOpen(true);
      addToast('Administrator login required', 'info');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // If Admin Panel is open AND user has role === 'admin', render dedicated control center
  if (isAdminOpen && currentUser?.role === 'admin') {
    return (
      <div className="admin-root-container">
        <AdminPanel 
          onCloseAdmin={() => setIsAdminOpen(false)} 
          onLogout={handleLogout}
        />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Ambient background glows */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      <div className="ambient-glow glow-3"></div>

      {/* Navigation */}
      <Navbar 
        onOpenSearch={handleOpenSearch} 
        onOpenAdmin={handleOpenAdmin}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      <main id="main-content">
        {/* Hero Section */}
        <Hero />

        {/* Marquee Trust Banner */}
        <section className="trust-banner">
          <div className="container">
            <p className="trust-label">TRUSTED BY 185,000+ DEVELOPERS, CREATORS, AND INNOVATION LABS</p>
            <div className="logo-marquee">
              <div className="marquee-track">
                <span className="partner-logo">⚡ CloudScale AI</span>
                <span className="partner-logo">🌐 DevCorp Global</span>
                <span className="partner-logo">🔷 NeuralFlow Labs</span>
                <span className="partner-logo">🚀 HyperScale YC</span>
                <span className="partner-logo">🎨 StudioNova Creative</span>
                <span className="partner-logo">🛡️ ZeroDay Security</span>
                <span className="partner-logo">⚡ CloudScale AI</span>
                <span className="partner-logo">🌐 DevCorp Global</span>
                <span className="partner-logo">🔷 NeuralFlow Labs</span>
              </div>
            </div>
          </div>
        </section>

        {/* AI Tools Catalog / Marketplace */}
        <ToolsCatalog searchRef={searchInputRef} />

        {/* Platform & Infrastructure Highlights */}
        {/* <PlatformFeatures /> */}

        {/* Customer Testimonials & Reviews */}
        <Testimonials />

        {/* FAQ Section */}
        <FaqSection />

        {/* High-Impact CTA Banner */}
        {/* <section className="cta-banner-section">
          <div className="container">
            <div className="cta-card">
              <div className="cta-card-glow"></div>
              <div className="cta-content">
                <span className="badge-pill">
                  <Zap size={14} className="inline mr-1" /> READY TO BUILD?
                </span>
                <h2>Start Supercharging Your Workflow with 45+ AI Engines</h2>
                <p>
                  Join 185,000+ engineers, designers, and founders who replaced monthly AI subscriptions with Synapse.AI perpetual licenses.
                </p>
                <div className="cta-action-row">
                  <a href="#tools" className="btn btn-primary btn-xl btn-glow">
                    <Sparkles size={18} />
                    <span>Shop AI Tools & Deals</span>
                  </a>
                  <a href="#faq" className="btn btn-secondary btn-xl">
                    <span>Payment & Licensing FAQ</span>
                    <ArrowRight size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section> */}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Modals & Drawers */}
      <CartDrawer />
      <CheckoutModal />
      <AccountDashboardModal />
      <ToolQuickViewModal />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
