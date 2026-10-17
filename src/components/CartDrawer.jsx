import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Trash2,
  ShoppingCart,
  ShieldCheck,
  Tag,
  ArrowRight,
  Check,
  Sparkles,
  Zap
} from 'lucide-react';

export default function CartDrawer() {
  const {
    cart,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    promoCode,
    setPromoCode,
    appliedDiscount,
    applyPromo,
    promoMessage,
    formatPrice,
    subtotalUSD,
    discountUSD,
    totalUSD
  } = useApp();

  const [inputPromo, setInputPromo] = useState('');

  if (!isCartOpen) return null;

  const totalItemsCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <div
        className="cart-drawer-overlay"
        onClick={() => setIsCartOpen(false)}
      />

      <aside className="cart-drawer">
        {/* Cart Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <ShoppingCart size={20} className="text-accent" />
            <h3>Your Cart</h3>
            <span className="cart-badge-count">{totalItemsCount}</span>
          </div>
          <button
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close Cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="cart-body">
          {cart.length > 0 ? (
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <div className="cart-item-info">
                    <div className="cart-item-badge">
                      <Zap size={12} className="inline mr-1" /> {item.badge || item.type}
                    </div>
                    <h4 className="cart-item-name">{item.name}</h4>
                    <div className="cart-item-price-unit">
                      {formatPrice(item.price)}
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <button
                      className="btn-remove-item"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="cart-clear-row">
                <button
                  className="btn-clear-cart"
                  onClick={clearCart}
                >
                  Clear all items
                </button>
              </div>
            </div>
          ) : (
            <div className="cart-empty">
              <div className="empty-cart-icon">
                <ShoppingCart size={40} />
              </div>
              <h4>Your cart is empty</h4>
              <p>Explore our AI tool catalog to add tools and models to your order.</p>
              <button
                className="btn btn-secondary btn-sm mt-3"
                onClick={() => setIsCartOpen(false)}
              >
                Browse AI Catalog
              </button>
            </div>
          )}
        </div>

        {/* Cart Footer & Totals */}
        {cart.length > 0 && (
          <div className="cart-footer">
            {/* Promo Code Box */}
            <div className="promo-box">
              <div className="promo-input-wrap">
                <Tag size={16} className="text-muted ml-2" />
                <input
                  type="text"
                  placeholder="Promo code (try NEURON20)"
                  value={inputPromo}
                  onChange={(e) => setInputPromo(e.target.value)}
                />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => applyPromo(inputPromo)}
                >
                  Apply
                </button>
              </div>

              {promoMessage && (
                <div className={`promo-feedback ${promoMessage.type}`}>
                  {promoMessage.type === 'success' ? <Check size={14} /> : <X size={14} />}
                  <span>{promoMessage.text}</span>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotalUSD)}</span>
              </div>

              {appliedDiscount && (
                <div className="summary-row discount-row">
                  <span>
                    Discount (<strong>{appliedDiscount.code}</strong>)
                  </span>
                  <span className="text-success">
                    -{formatPrice(discountUSD)}
                  </span>
                </div>
              )}

              <div className="summary-row">
                <span>Tax & Gateway Processing</span>
                <span className="text-success">Included ($0.00)</span>
              </div>

              <div className="summary-row total-row">
                <span>Total Due</span>
                <span className="total-amount">{formatPrice(totalUSD)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-glow btn-full"
              onClick={handleProceedToCheckout}
            >
              <ShieldCheck size={18} />
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div className="cart-trust-badges">
              <span><ShieldCheck size={13} /> 256-Bit Encrypted</span>
              <span><Sparkles size={13} /> Instant API Keys</span>
              <span className="text-cyan"><span className="aba-mini-tag">KHQR</span> National Banking</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
