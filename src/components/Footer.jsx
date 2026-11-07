import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  Lock, 
  ShieldCheck,
  Smartphone,
  Zap,
  Tag,
  Mail,
  Send,
  Gamepad2,
  Boxes
} from 'lucide-react';

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.5 2L2 9.5l7 3 2.5 7.5L15 15l6.5 5 3-18z" />
  </svg>
);

export default function Footer() {
  const { setIsCartOpen, t } = useApp();

  return (
    <footer className="site-footer">
      <div className="container footer-container">
        {/* Brand & Store Overview Column */}
        <div className="footer-col brand-col">
          <a href="#" className="brand-logo footer-logo" aria-label="Dyzzstore Home">
            <div className="logo-symbol">
              <img src="/favicon.svg" alt="Dyzzstore Logo" className="logo-icon-img" width="26" height="26" />
            </div>
            <span className="logo-text">Dyzz<span className="logo-gradient">store</span></span>
          </a>

          <p className="footer-bio">
            {t('footer_desc', 'The premier digital marketplace to buy verified AI tools, autonomous coding agents, and perpetual software licenses. Pay once via Cambodia National KHQR or Card — zero recurring subscriptions.')}
          </p>

          <div className="system-status">
            <span className="status-dot-active"></span>
            <span>{t('footer_open_status', 'Store Open 24/7 • Automated Instant Delivery')}</span>
          </div>

          <div className="footer-socials">
            <a href="https://t.me/dyzzstore_bot" target="_blank" rel="noreferrer" aria-label="Telegram Support" title="Telegram: @dyzzstore_bot">
              <TelegramIcon />
            </a>
            <a href="mailto:admin@dyzzstore.com" aria-label="Email Support" title="Email: admin@dyzzstore.com">
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Real Column 1: Game Top-Up Center */}
        <div className="footer-col">
          <h4 className="footer-heading">
            <Gamepad2 size={16} className="inline mr-1 text-cyan" /> {t('footer_col_topup', 'Game Top-Up')}
          </h4>
          <ul className="footer-links">
            <li><a href="#topup">{t('footer_topup_mlbb', 'Mobile Legends: Bang Bang')}</a></li>
            <li><a href="#topup">{t('footer_topup_chess', 'Magic Chess Go Go')}</a></li>
            <li><a href="#topup">{t('footer_topup_freefire', 'Free Fire Diamonds')}</a></li>
            <li><a href="#topup" className="text-cyan font-semibold">{t('footer_topup_khqr', 'Instant Bakong KHQR Reload →')}</a></li>
          </ul>
        </div>

        {/* Real Column 2: AI Software & Tools */}
        <div className="footer-col">
          <h4 className="footer-heading">
            <Boxes size={16} className="inline mr-1 text-purple-400" /> {t('footer_col_tools', 'AI Tools & Software')}
          </h4>
          <ul className="footer-links">
            <li><a href="#tools">{t('footer_tools_lifetime', 'Perpetual AI Licenses')}</a></li>
            <li><a href="#tools">{t('footer_tools_api', 'Developer API Access')}</a></li>
            <li><a href="#tools" className="text-cyan font-semibold">{t('footer_tools_browse', 'Browse Tools Catalog →')}</a></li>
          </ul>
        </div>

        {/* Real Column 3: Store Customer Service & Orders */}
        <div className="footer-col">
          <h4 className="footer-heading">{t('footer_col_support', 'Orders & Support')}</h4>
          <ul className="footer-links">
            <li>
              <button 
                type="button" 
                onClick={() => setIsCartOpen(true)}
              >
                {t('footer_support_cart', 'Shopping Cart & Checkout')}
              </button>
            </li>
            <li>
              <span className="text-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} className="text-amber-400" /> {t('footer_support_delivery', '24/7 Automated Instant Delivery')}
              </span>
            </li>
            <li>
              <span className="text-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} className="text-emerald-400" /> {t('footer_support_khqr', 'Bakong KHQR National Payment')}
              </span>
            </li>
            <li>
              <a href="https://t.me/dyzzstore_bot" target="_blank" rel="noreferrer" className="text-cyan">
                {t('footer_support_telegram', 'Telegram Support (@dyzzstore_bot)')}
              </a>
            </li>
            <li>
              <a href="mailto:admin@dyzzstore.com">
                {t('footer_support_email', 'Official Email (admin@dyzzstore.com)')}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container">
        {/* Verified Secure Store Payments Strip */}
        <div className="footer-store-trust-strip">
          <div className="trust-strip-label">
            <ShieldCheck size={16} className="text-success" />
            <span>VERIFIED SECURE PAYMENT GATEWAY:</span>
          </div>
          <div className="trust-strip-badges">
            <span className="payment-pill khqr-pill">
              <span className="badge-khqr-dot"></span> Cambodia National KHQR (Bakong / ABA / All Banks)
            </span>
            <span className="payment-pill khqr-instant-pill">
              <Smartphone size={14} /> Instant Mobile Banking Scan
            </span>
            <span className="payment-pill ssl-pill">
              <Lock size={14} /> 256-Bit SSL Encrypted Checkout
            </span>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; 2026 Dyzzstore. {t('footer_all_rights', 'All rights reserved.')} Registered Digital Marketplace.</p>
          
          <div className="footer-trust-tags">
            <span className="footer-trust-tag"><Zap size={13} className="text-cyan" /> Instant Delivery</span>
            <span className="footer-trust-tag"><ShieldCheck size={13} className="text-success" /> 100% Genuine Licenses</span>
            <span className="footer-trust-tag"><Tag size={13} className="text-warning" /> Zero Monthly Fees</span>
          </div>

          <div className="legal-links">
            <a href="#topup">Game Reload</a>
            <a href="#tools">AI Catalog</a>
            <a href="#admin" className="text-muted">Staff / Admin Login</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
