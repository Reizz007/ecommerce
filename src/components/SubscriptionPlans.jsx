import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUBSCRIPTION_PLANS, COMPARISON_MATRIX } from '../data/plansData';
import { 
  Check, 
  X, 
  Crown, 
  Zap, 
  Lock, 
  ShieldCheck, 
  Building, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function SubscriptionPlans() {
  const { addToCart, formatPrice, setIsCheckoutOpen } = useApp();
  const [isAnnual, setIsAnnual] = useState(true);

  const handleSubscribe = (plan) => {
    const unitPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const totalAmount = isAnnual ? unitPrice * 12 : unitPrice;

    addToCart({
      id: `${plan.id}_${isAnnual ? 'annual' : 'monthly'}`,
      name: `${plan.name} (${isAnnual ? 'Annual Membership' : 'Monthly Membership'})`,
      type: 'subscription',
      billing: isAnnual ? 'annual' : 'monthly',
      price: totalAmount,
      unitPriceMonthly: unitPrice,
      badge: isAnnual ? 'Annual (20% OFF)' : 'Monthly Plan'
    });
  };

  return (
    <section className="pricing-section" id="pricing">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-tag">
            <Crown size={14} /> UNIFIED SUBSCRIPTION PLANS
          </span>
          <h2 className="section-title">
            One Subscription. <span className="gradient-text">Unlimited AI Power.</span>
          </h2>
          <p className="section-desc">
            Stop paying for 10 separate $20/month AI tools. Unlock all 45+ premier AI engines, models, and priority cloud GPU queues under one unified membership.
          </p>

          {/* Billing Cycle Switch */}
          <div className="billing-toggle-wrapper">
            <span className={`billing-label ${!isAnnual ? 'active' : ''}`}>
              Monthly Billing
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isAnnual}
                onChange={(e) => setIsAnnual(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <span className={`billing-label ${isAnnual ? 'active' : ''}`}>
              Annual Billing
              <span className="discount-pill">
                <Sparkles size={12} className="inline mr-1" /> SAVE 20% + 2 MO FREE
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="pricing-grid">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const monthlyCost = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const annualBilledTotal = monthlyCost * 12;

            return (
              <div
                key={plan.id}
                className={`pricing-card ${plan.featured ? 'featured' : ''}`}
              >
                {plan.featured && (
                  <div className="popular-ribbon">
                    <Zap size={14} /> MOST POPULAR CHOICE
                  </div>
                )}

                <div className="card-badge-top">{plan.badge}</div>

                <div className="plan-header">
                  <h3 className="plan-title">{plan.name}</h3>
                  <p className="plan-desc">{plan.tagline}</p>
                </div>

                <div className="plan-pricing">
                  <div className="price-amount-wrap">
                    <span className="price-val">
                      {formatPrice(monthlyCost)}
                    </span>
                    <span className="price-period">/ month</span>
                  </div>
                  <div className="billing-note">
                    {isAnnual
                      ? `Billed annually (${formatPrice(annualBilledTotal)}/yr)`
                      : `Billed monthly with zero lock-in`}
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="plan-features">
                  {plan.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className={`feature-item ${feat.highlight ? 'highlight' : ''} ${!feat.included ? 'muted' : ''}`}
                    >
                      {feat.included ? (
                        <Check size={16} className="feature-check" />
                      ) : (
                        <X size={16} className="feature-x" />
                      )}
                      <span>{feat.text}</span>
                    </div>
                  ))}
                </div>

                {/* Subscribe Action */}
                <div className="plan-footer">
                  <button
                    className={`btn btn-full ${plan.featured ? 'btn-primary btn-glow' : 'btn-outline'}`}
                    onClick={() => handleSubscribe(plan)}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight size={16} />
                  </button>
                  <div className="guarantee-micro">
                    <Lock size={13} /> 14-day money-back guarantee • Cancel anytime
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix Table */}
        <div className="comparison-container">
          <h3 className="comparison-title text-center">Comprehensive Plan Comparison</h3>
          <div className="table-responsive">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Platform Capabilities</th>
                  <th>Starter Creator</th>
                  <th className="col-highlight">Pro AI Suite (Recommended)</th>
                  <th>Enterprise Sovereign</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_MATRIX.map((row, idx) => (
                  <tr key={idx}>
                    <td><strong>{row.feature}</strong></td>
                    <td>{row.starter}</td>
                    <td className="col-highlight"><strong>{row.pro}</strong></td>
                    <td>{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
