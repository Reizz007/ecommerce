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
import AiChatBot from './components/AiChatBot';
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
      if (!saved) return null;
      const user = JSON.parse(saved);
      if (user && (user.email === 'chetranicky@gmail.com' || user.email === 'admin@synapse.ai' || user.email === 'admin@dyzzstore.com')) {
        user.role = 'admin';
        localStorage.setItem('synapse_user', JSON.stringify(user));
      }
      return user;
    } catch {
      return null;
    }
  });

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('synapse_user');
      const user = saved ? JSON.parse(saved) : null;
      const wasActive = localStorage.getItem('synapse_admin_active') === 'true';
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAdmin = user && (user.role === 'admin' || user.email === 'chetranicky@gmail.com' || user.email === 'admin@synapse.ai' || user.email === 'admin@dyzzstore.com');
      return Boolean(isAdmin && (wasActive || hash === '#admin' || path === '/admin'));
    } catch {
      return false;
    }
  });
  const searchInputRef = useRef(null);
  const wasAdminOpen = useRef(isAdminOpen);

  // Sync admin state to localStorage and URL hash
  useEffect(() => {
    if (isAdminOpen) {
      localStorage.setItem('synapse_admin_active', 'true');
      if (window.location.hash !== '#admin') {
        window.history.replaceState(null, '', '#admin');
      }
    } else {
      localStorage.removeItem('synapse_admin_active');
      // Only remove #admin from the URL if the admin panel was actually open and then closed
      if (wasAdminOpen.current && (window.location.hash === '#admin' || window.location.pathname === '/admin')) {
        window.history.replaceState(null, '', window.location.pathname.replace(/\/admin$/, '') || '/');
      }
    }
    wasAdminOpen.current = isAdminOpen;
  }, [isAdminOpen]);

  // Check URL pathname or hash for /login, #login, /admin, or #admin
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'chetranicky@gmail.com' || currentUser.email === 'admin@synapse.ai' || currentUser.email === 'admin@dyzzstore.com');

      if (path === '/login' || hash === '#login') {
        if (!isAdmin) {
          setIsLoginOpen(true);
        }
      } else if (path === '/admin' || hash === '#admin') {
        if (isAdmin) {
          setIsAdminOpen(true);
          setIsLoginOpen(false);
          if (window.location.hash !== '#admin') {
            window.history.replaceState(null, '', '#admin');
          }
        } else {
          setIsLoginOpen(true);
          if (window.location.hash !== '#admin') {
            window.history.replaceState(null, '', '#admin');
          }
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
    if (user && (user.email === 'chetranicky@gmail.com' || user.email === 'admin@synapse.ai' || user.email === 'admin@dyzzstore.com')) {
      user.role = 'admin';
    }
    setCurrentUser(user);
    const isAdmin = user && (user.role === 'admin' || user.email === 'chetranicky@gmail.com' || user.email === 'admin@synapse.ai' || user.email === 'admin@dyzzstore.com');
    
    // If user is admin and either shouldOpenAdmin is requested or hash/path targets #admin
    const isTargetingAdmin = shouldOpenAdmin || window.location.hash === '#admin' || window.location.pathname === '/admin';
    if (isAdmin && isTargetingAdmin) {
      setIsAdminOpen(true);
      setIsLoginOpen(false);
      window.history.replaceState(null, '', '#admin');
    } else {
      if (window.location.pathname === '/login' || window.location.hash === '#login' || window.location.hash === '#admin' || window.location.pathname === '/admin') {
        window.history.replaceState(null, '', '/');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('synapse_user');
    localStorage.removeItem('synapse_token');
    localStorage.removeItem('synapse_admin_active');
    setCurrentUser(null);
    setIsAdminOpen(false);
    setIsLoginOpen(false);
    if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
      window.history.replaceState(null, '', '/');
    }
    addToast('Signed out successfully', 'info');
  };

  const handleOpenAdmin = () => {
    const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'chetranicky@gmail.com' || currentUser.email === 'admin@synapse.ai' || currentUser.email === 'admin@dyzzstore.com');
    if (isAdmin) {
      setIsAdminOpen(true);
      setIsLoginOpen(false);
      window.history.replaceState(null, '', '#admin');
    } else {
      window.history.replaceState(null, '', '#admin');
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

  // If Admin Panel is open AND user has role === 'admin' or admin email, render dedicated control center
  if (isAdminOpen && (currentUser?.role === 'admin' || currentUser?.email === 'chetranicky@gmail.com' || currentUser?.email === 'admin@synapse.ai' || currentUser?.email === 'admin@dyzzstore.com')) {
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
                <span className="partner-logo"> CloudScale AI</span>
                <span className="partner-logo"> DevCorp Global</span>
                <span className="partner-logo"> NeuralFlow Labs</span>
                <span className="partner-logo"> HyperScale YC</span>
                <span className="partner-logo"> StudioNova Creative</span>
                <span className="partner-logo"> ZeroDay Security</span>
                <span className="partner-logo"> CloudScale AI</span>
                <span className="partner-logo"> DevCorp Global</span>
                <span className="partner-logo"> NeuralFlow Labs</span>
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
                  Join 185,000+ engineers, designers, and founders who replaced monthly AI subscriptions with Dyzzstore perpetual licenses.
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
        onClose={() => {
          setIsLoginOpen(false);
          if (window.location.pathname === '/login' || window.location.hash === '#login' || window.location.hash === '#admin' || window.location.pathname === '/admin') {
            window.history.replaceState(null, '', '/');
          }
        }} 
        onLoginSuccess={handleLoginSuccess}
      />
      <ToastContainer />
      <AiChatBot />
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
