import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Star, 
  ShoppingCart, 
  CheckCircle2 
} from 'lucide-react';

export default function ToolQuickViewModal() {
  const { 
    selectedToolModal, 
    setSelectedToolModal, 
    addToCart, 
    formatPrice 
  } = useApp();

  if (!selectedToolModal) return null;

  const tool = selectedToolModal;

  const handleAddLifetime = () => {
    const price = tool.priceLifetime || tool.price_lifetime || tool.priceMonthly || tool.price_monthly || 0;
    addToCart({
      id: `${tool.id}_lifetime`,
      name: `${tool.name} (Perpetual Lifetime License)`,
      type: 'tool',
      price: price,
      toolId: tool.id,
      badge: tool.badge || 'Lifetime License'
    });
    setSelectedToolModal(null);
  };

  const toolPrice = tool.priceLifetime || tool.price_lifetime || tool.priceMonthly || tool.price_monthly || 0;
  const toolCapabilities = Array.isArray(tool.capabilities) 
    ? tool.capabilities 
    : (typeof tool.capabilities === 'string' ? tool.capabilities.split(',') : []);

  return (
    <div className="modal-backdrop">
      <div className="modal-container tool-details-container">
        <button
          className="modal-close"
          onClick={() => setSelectedToolModal(null)}
          aria-label="Close Details"
        >
          <X size={20} />
        </button>

        <div className="tool-details-header">
          <div className="tool-header-left">
            <span className="tool-badge-pill" style={{ color: tool.color || '#8b5cf6', borderColor: `${tool.color || '#8b5cf6'}50` }}>
              {tool.badge || 'PRO'}
            </span>
            <h2>{tool.name}</h2>
            <div className="tool-rating-line">
              <Star size={15} className="fill-warning text-warning" />
              <strong>{tool.rating || 5.0}</strong>
              <span className="text-muted">({(tool.reviewsCount || tool.reviews_count || 100).toLocaleString()} verified developers)</span>
              <span className="engine-tag">{tool.engineVersion || tool.engine_version || 'Production Release'}</span>
            </div>
          </div>
        </div>

        <div className="tool-details-body">
          <p className="tool-full-description">{tool.shortDesc || tool.short_desc || tool.description || ''}</p>

          <div className="tool-capabilities-section">
            <h4>Core Model Capabilities</h4>
            <div className="capabilities-grid">
              {toolCapabilities.map((cap, idx) => (
                <div key={idx} className="capability-card">
                  <CheckCircle2 size={16} className="text-cyan mr-2" />
                  <span>{String(cap).trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Checkout Options */}
          <div className="tool-details-actions" style={{ gridTemplateColumns: '1fr', marginTop: '1.5rem' }}>
            <div className="action-col" style={{ maxWidth: '480px', margin: '0 auto', width: '100%' }}>
              <div className="action-price-label">Perpetual Commercial License</div>
              <div className="action-price-val">{formatPrice(toolPrice)}</div>
              <p className="action-sub">Pay once, own forever. Instant production API keys and updates included.</p>
              <button
                className="btn btn-primary btn-glow btn-full"
                onClick={handleAddLifetime}
              >
                <ShoppingCart size={16} />
                <span>Buy Commercial License</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
