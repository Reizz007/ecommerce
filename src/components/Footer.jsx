import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiUrl } from '../utils/api';
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

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WhatsappIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const TiktokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  const { setIsCartOpen, t } = useApp();

  const [socials, setSocials] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    telegram: 'https://t.me/dyzzstore_bot',
    whatsapp: '',
    tiktok: ''
  });

  useEffect(() => {
    fetch(apiUrl('/api/settings'))
      .then(r => r.json())
      .then(data => {
        if (data?.settings) {
          setSocials({
            facebook: data.settings.socialFacebook || '',
            instagram: data.settings.socialInstagram || '',
            twitter: data.settings.socialTwitter || '',
            linkedin: data.settings.socialLinkedin || '',
            telegram: data.settings.socialTelegram || 'https://t.me/dyzzstore_bot',
            whatsapp: data.settings.socialWhatsapp || '',
            tiktok: data.settings.socialTiktok || ''
          });
        }
      })
      .catch(() => {});
  }, []);

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
            {socials.facebook && (
              <a href={socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook">
                <FacebookIcon />
              </a>
            )}
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram">
                <InstagramIcon />
              </a>
            )}
            {socials.twitter && (
              <a href={socials.twitter} target="_blank" rel="noreferrer" aria-label="Twitter / X" title="Twitter / X">
                <TwitterIcon />
              </a>
            )}
            {socials.telegram && (
              <a href={socials.telegram} target="_blank" rel="noreferrer" aria-label="Telegram Support" title={`Telegram: ${socials.telegram}`}>
                <TelegramIcon />
              </a>
            )}
            {socials.whatsapp && (
              <a href={socials.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp" title="WhatsApp">
                <WhatsappIcon />
              </a>
            )}
            {socials.tiktok && (
              <a href={socials.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok" title="TikTok">
                <TiktokIcon />
              </a>
            )}
            {socials.linkedin && (
              <a href={socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn">
                <LinkedinIcon />
              </a>
            )}
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
