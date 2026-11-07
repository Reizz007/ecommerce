import React, { useState, useRef, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ToolsCatalog from './components/ToolsCatalog';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AccountDashboardModal from './components/AccountDashboardModal';
import ToolQuickViewModal from './components/ToolQuickViewModal';
import ToastContainer from './components/ToastContainer';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import TopupShop from './components/TopupShop';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

function MainContent() {
  const { addToast, setIsCheckoutOpen, t } = useApp();

  useEffect(() => {
    window.__openCheckout = (open = true) => setIsCheckoutOpen(open);
  }, [setIsCheckoutOpen]);

  // Apply Live SEO Meta Tags & Target Search Keywords from Admin Settings
  useEffect(() => {
    fetch(apiUrl('/api/settings'))
      .then(r => r.json())
      .then(data => {
        const s = data?.settings;
        if (s) {
          if (s.seoTitle) {
            document.title = s.seoTitle;
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.content = s.seoTitle;
          }
          if (s.seoDescription) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.content = s.seoDescription;
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.content = s.seoDescription;
          }
          if (s.seoKeywords) {
            let metaKey = document.querySelector('meta[name="keywords"]');
            if (!metaKey) {
              metaKey = document.createElement('meta');
              metaKey.name = 'keywords';
              document.head.appendChild(metaKey);
            }
            metaKey.content = s.seoKeywords;
          }
          if (s.googleVerification) {
            let gv = document.querySelector('meta[name="google-site-verification"]');
            if (!gv) {
              gv = document.createElement('meta');
              gv.name = 'google-site-verification';
              document.head.appendChild(gv);
            }
            gv.content = s.googleVerification;
          }
        }
      })
      .catch(() => {});
  }, []);

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
      } else if (path === '/topup' || hash === '#topup') {
        setTimeout(() => {
          document.getElementById('topup')?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
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
            <p className="trust-label">{t('trust_marquee_label', 'TRUSTED BY 185,000+ DEVELOPERS, CREATORS, AND INNOVATION LABS')}</p>
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

        {/* Game Top-Up Shop Section */}
        <section id="topup" className="topup-site-section">
          <TopupShop onBackToTools={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })} />
        </section>

        {/* AI Tools Catalog / Marketplace */}
        <ToolsCatalog searchRef={searchInputRef} />
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
