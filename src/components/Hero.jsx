import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag,
  ShoppingCart,
  Sparkles, 
  ShieldCheck, 
  RotateCcw, 
  QrCode, 
  FileCheck, 
  Star, 
  Tag, 
  CheckCircle2, 
  Zap, 
  Flame,
  ArrowRight
} from 'lucide-react';

export default function Hero() {
  const { tools, addToCart, setIsCartOpen, formatPrice } = useApp();

  // Find a flagship tool for the featured storefront showcase card
  const featuredProduct = (tools && tools.length > 0) 
    ? tools[0] 
    : {
        id: 'omni-llm',
        name: 'Synapse Omni-LLM 4.5',
        category: 'llm',
        badge: 'Flagship AI',
        price: 199,
        priceLifetime: 199
      };

  const handleQuickAddToCart = (e) => {
    e.preventDefault();
    addToCart({
      id: featuredProduct.id || 'omni-llm',
      name: featuredProduct.name || 'Synapse Omni-LLM 4.5',
      price: featuredProduct.priceLifetime || featuredProduct.price || 199,
      category: featuredProduct.category || 'llm'
    });
  };

  return (
    <section className="hero-section" id="hero">
      <div className="container hero-container">
        {/* Left Column: Store Value Proposition & Direct Shopping CTAs */}
        <div className="hero-content">
          <div className="hero-badge store-badge-pulse">
            <span className="badge-icon"><ShoppingBag size={14} className="text-cyan" /></span>
            <span className="badge-text">Official AI Software Store & Perpetual License Marketplace</span>
            <span className="badge-tag">FLASH SALE LIVE</span>
          </div>

          <h1 className="hero-title">
            Buy Verified AI Tools. <span className="gradient-text">Pay Once, Own Forever.</span>
          </h1>

          <p className="hero-subtitle">
            The premier digital store for developers and creators. Purchase perpetual licenses for frontier AI models, autonomous coding agents, and generative design studios. Instant delivery via Cambodia National KHQR or Card — zero subscriptions, zero monthly fees.
          </p>

          <div className="hero-cta-group">
            <a href="#tools" className="btn btn-primary btn-xl btn-glow" id="hero-btn-shop">
              <ShoppingBag size={20} />
              <span>Shop All AI Tools & Deals</span>
            </a>
            <button 
              type="button" 
              onClick={() => setIsCartOpen(true)} 
              className="btn btn-secondary btn-xl"
              id="hero-btn-cart"
            >
              <ShoppingCart size={20} />
              <span>View Cart & Instant Checkout</span>
            </button>
          </div>

          {/* Real-Time E-Commerce Store Stats Grid */}
          <div className="hero-stats-grid">
            <div className="stat-card">
              <div className="stat-number">45+</div>
              <div className="stat-label">AI Tools In Stock</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <div className="stat-number">$0</div>
              <div className="stat-label">Monthly Subscriptions</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <div className="stat-number">18,500+</div>
              <div className="stat-label">Licenses Delivered</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-card">
              <div className="stat-number flex-items-center">
                <Star size={16} className="text-warning fill-warning mr-1" /> 4.98/5
              </div>
              <div className="stat-label">14,200+ Verified Buyers</div>
            </div>
          </div>

          {/* Store Trust Guarantees */}
          <div className="hero-guarantees">
            <span className="guarantee-item">
              <Zap size={16} /> Instant Digital Delivery
            </span>
            <span className="guarantee-item">
              <QrCode size={16} /> Cambodia National KHQR Checkout
            </span>
            <span className="guarantee-item">
              <ShieldCheck size={16} /> 100% Genuine Lifetime License
            </span>
            <span className="guarantee-item">
              <RotateCcw size={16} /> 14-Day Money-Back Guarantee
            </span>
            <span className="guarantee-item">
              <FileCheck size={16} /> Commercial Use Included
            </span>
          </div>
        </div>

        {/* Right Column: Featured Best-Selling Product Storefront Showcase */}
        <div className="hero-visual">
          <div className="visual-card-glass">
            <div className="visual-card-header store-card-header">
              <div className="window-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="window-title">
                <Sparkles size={14} className="text-warning mr-1" />
                <span className="font-semibold text-white">FEATURED DEAL OF THE DAY</span>
              </div>
              <span className="status-indicator-live">
                <span className="indicator-pulse"></span> IN STOCK
              </span>
            </div>

            <div className="hero-image-wrap">
              <img 
                src="/assets/images/hero.jpg" 
                alt="Synapse AI Store Featured Tool" 
                className="hero-img"
                loading="eager"
              />
              <div className="image-overlay-glow"></div>

              {/* Floating Store Badge Top-Left: Deal / Discount */}
              <div className="floating-badge badge-top-left store-deal-badge">
                <div className="badge-icon-wrap violet">
                  <Flame size={16} />
                </div>
                <div className="badge-info">
                  <span className="f-title">40% OFF FLASH DEAL</span>
                  <span className="f-sub">Perpetual Commercial License</span>
                </div>
              </div>

              {/* Floating Store Badge Bottom-Right: Live Purchase Notification */}
              <div className="floating-badge badge-bottom-right store-order-badge">
                <div className="badge-icon-wrap emerald">
                  <CheckCircle2 size={16} />
                </div>
                <div className="badge-info">
                  <span className="f-title">Verified Buyer Order</span>
                  <span className="f-sub">Sophea K. bought Omni-LLM • 2m ago</span>
                </div>
              </div>

              {/* Floating Store Badge Bottom-Left: Payment Security */}
              <div className="floating-badge badge-bottom-left store-secure-badge">
                <div className="badge-icon-wrap cyan">
                  <ShieldCheck size={16} />
                </div>
                <div className="badge-info">
                  <span className="f-title">Official Synapse Store</span>
                  <span className="f-sub">Instant KHQR & Card Access</span>
                </div>
              </div>
            </div>

            {/* Interactive Store Product Footer Bar with 1-Click Add to Cart */}
            <div className="visual-card-footer store-visual-footer">
              <div className="featured-product-brief">
                <div className="product-title-row">
                  {/* <span className="product-name">{featuredProduct.name || 'Synapse Omni-LLM 4.5'}</span> */}
                  {/* <span className="product-badge-deal">SAVE 40%</span> */}
                </div>
                <div className="product-price-row">
                  {/* <span className="price-tag-hero">{formatPrice(featuredProduct.priceLifetime || featuredProduct.price || 199)}</span> */}
                  {/* <span className="price-original-hero">{formatPrice(349)}</span> */}
                  {/* <span className="license-type-note">One-time payment • Lifetime updates</span> */}
                </div>
              </div>
             
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
