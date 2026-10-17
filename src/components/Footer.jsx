import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  ArrowRight, 
  Lock, 
  Check, 
  ShieldCheck,
  Smartphone,
  Zap,
  RotateCcw,
  Sparkles,
  Tag
} from 'lucide-react';

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6h0a14.5 14.5 0 0 0-4-1.5 9.6 9.6 0 0 0-.5 1 12.3 12.3 0 0 0-3 0 9.6 9.6 0 0 0-.5-1A14.5 14.5 0 0 0 6 6a15.8 15.8 0 0 0-2 11 15.3 15.3 0 0 0 5 2.5 10.9 10.9 0 0 0 1-1.7 9.3 9.3 0 0 1-1.6-.8l.4-.3a11.5 11.5 0 0 0 10.4 0l.4.3a9.3 9.3 0 0 1-1.6.8 10.9 10.9 0 0 0 1 1.7 15.3 15.3 0 0 0 5-2.5 15.8 15.8 0 0 0-2-11z" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
  </svg>
);

export default function Footer() {
  const { addToast, setIsCartOpen } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    addToast('🎉 VIP Store discount code NEURON20 sent to your email!', 'success');
  };

  return (
    <footer className="site-footer">
      <div className="container footer-container">
        {/* Brand & Store Overview Column */}
        <div className="footer-col brand-col">
          <a href="#" className="brand-logo footer-logo">
            <div className="logo-symbol">
              <ShoppingBag size={22} className="logo-icon text-cyan" />
            </div>
            <span className="logo-text">SYNAPSE<span className="logo-gradient"> STORE</span></span>
          </a>

          <p className="footer-bio">
            The premier digital marketplace to buy verified AI tools, autonomous coding agents, and perpetual software licenses. Pay once via Cambodia National KHQR or Card — zero recurring subscriptions.
          </p>

          <div className="system-status">
            <span className="status-dot-active"></span>
            <span>Store Open 24/7 • Automated Instant Delivery</span>
          </div>

          <div className="footer-socials">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
              <GithubIcon />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <TwitterIcon />
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" aria-label="Discord">
              <DiscordIcon />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <LinkedinIcon />
            </a>
          </div>
        </div>

        {/* Shop AI Tools Categories */}
        <div className="footer-col">
          <h4 className="footer-heading">Shop AI Tools</h4>
          <ul className="footer-links">
            <li><a href="#tools">Synapse Omni-LLM 4.5</a></li>
            <li><a href="#tools">Visionary Diffusion X</a></li>
            <li><a href="#tools">DeepCode Copilot Pro</a></li>
            <li><a href="#tools">EchoVoice Neural Studio</a></li>
            <li><a href="#tools">VideoGen 4D Ultra</a></li>
            <li><a href="#tools">AgenticFlow Automator</a></li>
            <li><a href="#tools" className="text-cyan font-semibold">Browse All 45+ Tools & Deals →</a></li>
          </ul>
        </div>

        {/* Store Customer Service & Orders */}
        <div className="footer-col">
          <h4 className="footer-heading">Orders & Support</h4>
          <ul className="footer-links">
            <li>
              <button 
                type="button" 
                onClick={() => setIsCartOpen(true)}
              >
                Shopping Cart & Checkout
              </button>
            </li>
            <li><a href="#faq">Cambodia KHQR Payment Guide</a></li>
            <li><a href="#faq">Instant Digital Delivery SLA</a></li>
            <li><a href="#faq">14-Day Money-Back Guarantee</a></li>
            <li><a href="#faq">Commercial Licensing Rights</a></li>
            <li><a href="#testimonials">Customer Reviews & Proof</a></li>
          </ul>
        </div>

        {/* VIP Store Deals & Newsletter Signup */}
        <div className="footer-col">
          <h4 className="footer-heading">VIP Deals & Discounts</h4>
          <p className="newsletter-sub">
            Join 25,000+ buyers to receive secret flash discounts, bundle coupons, and new AI tool releases.
          </p>

          {subscribed ? (
            <div className="newsletter-success-box">
              <Check size={18} className="text-success inline mr-2" />
              <span>You are on the VIP discount list! Use code <strong>NEURON20</strong> for 20% off.</span>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="buyer@company.com"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <span>Get VIP Deals</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          <span className="spam-free-note">
            <Lock size={12} className="inline mr-1" /> No spam. 100% verified discounts. Unsubscribe anytime.
          </span>
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
          <p>&copy; 2026 SYNAPSE.AI Digital Store. All rights reserved. Registered Digital Software Marketplace.</p>
          
          <div className="footer-trust-tags">
            <span className="footer-trust-tag"><Zap size={13} className="text-cyan" /> Instant Delivery</span>
            <span className="footer-trust-tag"><ShieldCheck size={13} className="text-success" /> 100% Genuine Licenses</span>
            <span className="footer-trust-tag"><Tag size={13} className="text-warning" /> Zero Monthly Fees</span>
          </div>

          <div className="legal-links">
            <a href="#faq">Refund Policy</a>
            <a href="#faq">Terms of Sale</a>
            <a href="#faq">Privacy & Security</a>
            <a href="#login" className="text-muted">Staff / Admin Login</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
