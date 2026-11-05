import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { apiFetch, apiUrl, fetchJson } from '../utils/api';
import './TopupShop.css';
import { 
  Gamepad2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ArrowRight, 
  Zap, 
  RefreshCw, 
  ExternalLink, 
  QrCode, 
  Clock, 
  Copy, 
  Check, 
  HelpCircle,
  CreditCard,
  X,
  Flame,
  Award
} from 'lucide-react';

// Built-in instantaneous fallback game catalog to prevent cold-start blank states
const FALLBACK_GAMES = [
  {
    id: 1,
    code: 'mlbb',
    name: 'Mobile Legends',
    api_game_id: 3,
    is_active: true,
    packages: [
      { id: 17, topup_game_id: 1, name: 'Limited-Time Value Pack', diamond_amount: 11, price: 0.29, sku: '139', is_active: true },
      { id: 31, topup_game_id: 1, name: '55 Diamonds', diamond_amount: 55, price: 0.88, sku: '38', is_active: true },
      { id: 1, topup_game_id: 1, name: '86 Diamonds', diamond_amount: 86, price: 1.30, sku: '89', is_active: true },
      { id: 3, topup_game_id: 1, name: 'Weekly Pass', diamond_amount: 220, price: 1.50, sku: '142', is_active: true },
      { id: 12, topup_game_id: 1, name: '172 Diamonds', diamond_amount: 172, price: 2.60, sku: '41', is_active: true },
      { id: 14, topup_game_id: 1, name: '275 Diamonds', diamond_amount: 275, price: 3.99, sku: '43', is_active: true },
      { id: 11, topup_game_id: 1, name: '343 Diamonds', diamond_amount: 343, price: 4.86, sku: '44', is_active: true },
    ]
  },
  {
    id: 13,
    code: 'magic_chest_gogo',
    name: 'Magic Chess Gogo',
    api_game_id: 107,
    is_active: true,
    packages: [
      { id: 29, topup_game_id: 13, name: '5 Diamonds', diamond_amount: 5, price: 0.13, sku: '2134', is_active: true },
      { id: 30, topup_game_id: 13, name: '22 Diamonds', diamond_amount: 22, price: 0.35, sku: '2136', is_active: true },
      { id: 32, topup_game_id: 13, name: '86 Diamonds', diamond_amount: 86, price: 1.35, sku: '2139', is_active: true },
    ]
  },
  {
    id: 14,
    code: 'freefire_global',
    name: 'Free Fire',
    api_game_id: null,
    is_active: true,
    packages: []
  }
];

export default function TopupShop({ onBackToTools }) {
  const { addToast, currency, formatPrice } = useApp();

  const [games, setGames] = useState(FALLBACK_GAMES);
  const [loadingGames, setLoadingGames] = useState(false);
  const [gamesError, setGamesError] = useState('');
  const [selectedGame, setSelectedGame] = useState(FALLBACK_GAMES[0]);

  // Form State
  const [playerId, setPlayerId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState(FALLBACK_GAMES[0].packages[2].id);
  const [paymentMethod, setPaymentMethod] = useState('khqr'); // Unified KHQR Gateway (ABA & Bakong)

  // Username Verification State
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');
  const [verifyError, setVerifyError] = useState('');

  // Order Submission & Checkout State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [copiedOrderNo, setCopiedOrderNo] = useState(false);

  // Fetch Games Catalog with graceful retry on wake-up
  const loadGames = useCallback(async () => {
    setLoadingGames(true);
    setGamesError('');
    try {
      const data = await fetchJson('/api/topup/games', {}, 2, 2000);
      const items = data.data || (Array.isArray(data) ? data : []);
      if (items.length > 0) {
        setGames(items);
        setSelectedGame((prev) => (prev ? items.find((g) => g.id === prev.id) || items[0] : items[0]));
      }
    } catch (err) {
      console.warn('Topup games background sync note:', err.message);
      // Keep using fallback games gracefully
    } finally {
      setLoadingGames(false);
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // Set default package when selected game changes
  useEffect(() => {
    if (selectedGame?.packages?.length > 0) {
      setSelectedPackageId((prevId) => {
        const hasPrev = selectedGame.packages.some((p) => p.id === prevId);
        return hasPrev ? prevId : selectedGame.packages[0].id;
      });
    } else {
      setSelectedPackageId(null);
    }
    setVerifiedName('');
    setVerifyError('');
  }, [selectedGame]);

  // Determine if zone/server ID input is required
  const isZoneRequired = useMemo(() => {
    if (!selectedGame) return true;
    const code = (selectedGame.code || '').toLowerCase();
    const name = (selectedGame.name || '').toLowerCase();
    return (
      code.includes('mlbb') ||
      code.includes('mobile_legends') ||
      code.includes('magic_chest') ||
      code.includes('magic_chess') ||
      name.includes('mobile legends') ||
      name.includes('magic chess')
    );
  }, [selectedGame]);

  // Selected package object
  const activePackage = useMemo(() => {
    if (!selectedGame?.packages) return null;
    return selectedGame.packages.find((pkg) => pkg.id === selectedPackageId) || null;
  }, [selectedGame, selectedPackageId]);

  // Auto-parse combined player ID (e.g. "702425515(10301)")
  const handlePlayerIdInput = (val) => {
    const trimmed = val.trim();
    const match = trimmed.match(/^(\d+)\s*[\(\[]([^\)\]]+)[\)\]]$/);
    if (match) {
      setPlayerId(match[1]);
      setZoneId(match[2]);
    } else {
      setPlayerId(val);
    }
    setVerifiedName('');
    setVerifyError('');
  };

  // Verify Player ID Handler
  const handleVerifyPlayerId = async () => {
    let cleanPlayer = playerId.trim();
    let cleanZone = zoneId.trim();

    // Auto-extract combined format: 702425515(10301)
    const combinedMatch = cleanPlayer.match(/^(\d+)\s*[\(\[]([^\)\]]+)[\)\]]$/);
    if (combinedMatch) {
      cleanPlayer = combinedMatch[1];
      cleanZone = combinedMatch[2];
      setPlayerId(cleanPlayer);
      setZoneId(cleanZone);
    }

    if (!cleanPlayer) {
      setVerifyError('Please enter your Player ID / User ID.');
      return;
    }

    const activeGame = selectedGame || games.find((g) => (g.code || '').toLowerCase().includes('mlbb')) || games[0] || FALLBACK_GAMES[0];
    if (!selectedGame) {
      setSelectedGame(activeGame);
    }

    const needsZone = isZoneRequired || (activeGame.code || '').toLowerCase().includes('mlbb');
    if (needsZone && !cleanZone) {
      setVerifyError('Please enter your Server / Zone ID (e.g. 10301).');
      return;
    }

    setIsCheckingId(true);
    setVerifyError('');
    setVerifiedName('');

    try {
      const data = await fetchJson('/api/topup/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_code: activeGame.code || 'mlbb',
          player_id: cleanPlayer,
          zone_id: cleanZone,
        }),
      }, 1, 1000);

      if (!data.success) {
        throw new Error(data.message || 'Player not found. Please verify your ID.');
      }

      const pName = data.result?.player_name || data.result?.username || data.result?.name;
      if (!pName || pName.toLowerCase() === 'na') {
        throw new Error('Player name returned empty. Please double-check User ID.');
      }

      setVerifiedName(pName);
      addToast(`Verified: ${pName}`, 'success');
    } catch (err) {
      setVerifyError(err.message || 'Verification failed. Please check your Player ID.');
      addToast(err.message || 'Verification failed', 'error');
    } finally {
      setIsCheckingId(false);
    }
  };

  // Create Order & Open Checkout Modal
  const handleCreateOrder = async (e) => {
    e?.preventDefault();

    let cleanPlayer = playerId.trim();
    let cleanZone = zoneId.trim();

    // Auto-extract combined format: 702425515(10301)
    const combinedMatch = cleanPlayer.match(/^(\d+)\s*[\(\[]([^\)\]]+)[\)\]]$/);
    if (combinedMatch) {
      cleanPlayer = combinedMatch[1];
      cleanZone = combinedMatch[2];
      setPlayerId(cleanPlayer);
      setZoneId(cleanZone);
    }

    const activeGame = selectedGame || games.find((g) => (g.code || '').toLowerCase().includes('mlbb')) || games[0] || FALLBACK_GAMES[0];
    if (!selectedGame) {
      setSelectedGame(activeGame);
    }

    if (!cleanPlayer) {
      addToast('Please enter your Player ID.', 'error');
      return;
    }

    const needsZone = isZoneRequired || (activeGame.code || '').toLowerCase().includes('mlbb');
    if (needsZone && !cleanZone) {
      addToast('Please enter your Server / Zone ID.', 'error');
      return;
    }
    if (!activePackage) {
      addToast('Please select a diamond package.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await fetchJson('/api/topup/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_code: activeGame.code || 'mlbb',
          package_id: activePackage.id,
          player_id: cleanPlayer,
          player_username: verifiedName || '',
          zone_id: cleanZone,
          payment_method: paymentMethod,
        }),
      }, 0);

      if (!data.success || !data.order) {
        throw new Error(data.message || 'Failed to initialize order checkout.');
      }

      setActiveOrder(data.order);
      setCheckoutUrl(data.checkout_url);
      setIsPaymentModalOpen(true);
      addToast('Checkout generated! Please complete payment.', 'success');
    } catch (err) {
      addToast(err.message || 'Unable to place topup order.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live Polling for Active Order in Checkout Modal
  useEffect(() => {
    let intervalId = null;
    if (isPaymentModalOpen && activeOrder?.order_no) {
      const orderNo = activeOrder.order_no;

      const checkStatus = async () => {
        try {
          const data = await fetchJson(`/api/topup/orders/${encodeURIComponent(orderNo)}`, {}, 0);
          const updated = data.data || data.order;
          if (updated) {
            setActiveOrder((prev) => ({ ...prev, ...updated }));
            if (updated.status === 'success' || updated.status === 'completed') {
              addToast('Payment confirmed! Diamonds delivered successfully 🎉', 'success');
              if (intervalId) clearInterval(intervalId);
            }
          }
        } catch (e) {
          // ignore transient polling errors
        }
      };

      intervalId = setInterval(checkStatus, 3500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPaymentModalOpen, activeOrder?.order_no, addToast]);

  const copyOrderToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedOrderNo(true);
    setTimeout(() => setCopiedOrderNo(false), 2000);
    addToast('Order number copied!', 'info');
  };

  return (
    <div className="topup-container">
      {/* Top Header Bar */}
      <div className="topup-header-bar">
        <div className="topup-brand-title">
          <div className="topup-icon-badge">
            <Gamepad2 size={24} className="text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="topup-main-title">Game Top-Up Center</h1>
              <span className="topup-live-pill">
                <span className="topup-pulse-dot"></span> LIVE 24/7
              </span>
            </div>
            <p className="topup-subtitle">
              Instant mobile game diamond delivery via ABA PayWay & KHQR
            </p>
          </div>
        </div>

      </div>

      <div className="topup-shop-layout">
        {/* Left Column: Form & Selection */}
        <div className="topup-main-column">
            {/* Step 1: Select Game */}
            <section className="topup-card">
              <div className="topup-step-indicator">
                <div>
                  <h2 className="step-title">Select Game</h2>
                  <p className="step-desc">Choose the game you wish to reload</p>
                </div>
              </div>

              {loadingGames && games.length === 0 ? (
                <div className="topup-loading-skeleton">
                  <RefreshCw size={24} className="animate-spin text-cyan-400" />
                  <span>Loading game catalog... (Connecting to server)</span>
                </div>
              ) : gamesError && games.length === 0 ? (
                <div className="topup-alert-box error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} />
                    <span>{gamesError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadGames()}
                    className="topup-retry-btn"
                    style={{
                      background: 'rgba(239, 68, 68, 0.25)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      color: '#fff',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                  >
                    <RefreshCw size={14} className={loadingGames ? 'animate-spin' : ''} />
                    Retry Now
                  </button>
                </div>
              ) : (
                <div className="topup-games-grid">
                  {games.map((g) => {
                    const isSelected = selectedGame?.id === g.id;
                    const code = (g.code || '').toLowerCase();
                    const badge = code.includes('mlbb') ? 'MLBB' : code.includes('magic') ? 'MCGG' : code.includes('freefire') ? 'FF' : 'GAME';

                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGame(g)}
                        className={`topup-game-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="topup-game-icon-box">
                          <span className="topup-game-badge-txt">{badge}</span>
                        </div>
                        <div className="text-left flex-1 min-w-0 pr-2">
                          <h3 className="topup-game-name">{g.name}</h3>
                          <span className="topup-game-count text-xs text-slate-400">
                            {g.packages?.length || 0} packages available
                          </span>
                        </div>
                        {isSelected && (
                          <div className="topup-check-mark">
                            <Check size={14} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Step 2: Player ID & Server Verification */}
            <section className="topup-card">
              <div className="topup-step-indicator">
                <div>
                  <h2 className="step-title">Player Details</h2>
                  <p className="step-desc">
                    Fill in your info exactly as shown in your game account.
                  </p>
                </div>
              </div>

              <div className="topup-inputs-row">
                <div className="topup-field-box">
                  <label className="topup-field-label">USER ID / PLAYER ID</label>
                  <input
                    type="text"
                    placeholder="702425515"
                    value={playerId}
                    onChange={(e) => handlePlayerIdInput(e.target.value)}
                    className="topup-text-input"
                  />
                </div>

                {isZoneRequired && (
                  <div className="topup-field-box">
                    <label className="topup-field-label">SERVER / ZONE ID</label>
                    <input
                      type="text"
                      placeholder="10301"
                      value={zoneId}
                      onChange={(e) => {
                        setZoneId(e.target.value);
                        setVerifiedName('');
                      }}
                      className="topup-text-input"
                    />
                  </div>
                )}
              </div>

              <div className="topup-verify-row">
                {verifiedName && (
                  <div className="topup-verified-badge" style={{ marginRight: 'auto' }}>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>In-Game Name: <b>{verifiedName}</b></span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={isCheckingId || !playerId.trim()}
                  onClick={handleVerifyPlayerId}
                  className="topup-verify-btn"
                >
                  {isCheckingId ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>CHECKING...</span>
                    </>
                  ) : (
                    <span>CHECK ID</span>
                  )}
                </button>
              </div>

              {verifyError && (
                <div className="topup-alert-box error mt-3" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.84rem' }}>{verifyError}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1', paddingLeft: '24px' }}>
                    💡 Tip: Username lookup is optional. You can proceed directly to <b>Instant Checkout</b> with your Player ID & Zone!
                  </span>
                </div>
              )}
            </section>

            {/* Step 3: Choose Package */}
            <section className="topup-card">
              <div className="topup-step-indicator" style={{ marginBottom: '14px' }}>
                <div>
                  <h2 className="step-title">Select Package</h2>
                </div>
              </div>

              {selectedGame?.packages?.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">No packages currently active for this game.</p>
              ) : (
                <div className="topup-packages-list">
                  {selectedGame?.packages?.map((pkg) => {
                    const isSelected = activePackage?.id === pkg.id;
                    const priceFormatted = formatPrice ? formatPrice(pkg.price) : `$${Number(pkg.price).toFixed(2)}`;

                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`topup-package-row ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="topup-package-row-left">
                          <h4 className="topup-package-row-name">{pkg.name}</h4>
                          <div className="topup-package-row-sub">
                            {pkg.diamond_amount ? (
                              <>
                                <span className="topup-diamond-num">{pkg.diamond_amount}</span>
                                <span className="topup-diamond-glyph">💎</span>
                              </>
                            ) : (
                              <span className="topup-diamond-glyph">💎</span>
                            )}
                          </div>
                        </div>

                        <div className="topup-package-price-pill">
                          {priceFormatted}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Step 4: Payment Gateway (ABA PayWay & Bakong KHQR) */}
            <section className="topup-card">
              <div className="topup-step-indicator">
                <div>
                  <h2 className="step-title">Select Payment Method</h2>
                  <p className="step-desc">Choose whether to pay via ABA PayWay or Bakong KHQR.</p>
                </div>
              </div>

              <div className="topup-payment-grid">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('payway')}
                  className={`topup-payment-card ${paymentMethod === 'payway' ? 'selected' : ''}`}
                >
                  <div className="topup-pay-icon aba">
                    <span>ABA</span>
                  </div>
                  <div className="topup-pay-info">
                    <h4 className="topup-pay-title">ABA PayWay</h4>
                    <p className="topup-pay-subtitle">ABA Mobile App &amp; Cards</p>
                  </div>
                  <div className="topup-radio-circle">
                    {paymentMethod === 'payway' && <div className="topup-radio-dot" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('khqr')}
                  className={`topup-payment-card ${paymentMethod === 'khqr' ? 'selected' : ''}`}
                >
                  <div className="topup-pay-icon khqr">
                    <span>KHQR</span>
                  </div>
                  <div className="topup-pay-info">
                    <h4 className="topup-pay-title">Bakong KHQR</h4>
                    <p className="topup-pay-subtitle">All Banks in Cambodia</p>
                  </div>
                  <div className="topup-radio-circle">
                    {paymentMethod === 'khqr' && <div className="topup-radio-dot" />}
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Checkout Summary Sticky Widget */}
          <div className="topup-sidebar-column">
            <aside className="topup-summary-box">
              <p className="topup-aside-tag">Before Payment</p>
              <h3 className="topup-aside-sel">{activePackage?.name || "No Selection"}</h3>
              <p className="topup-aside-hint">Review your package and confirm to continue.</p>

              <div className="topup-total-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="topup-total-label" style={{ margin: 0 }}>Payment Method</span>
                  <span className={`topup-method-badge ${paymentMethod}`}>
                    {paymentMethod === 'payway' ? 'ABA PayWay' : 'Bakong KHQR'}
                  </span>
                </div>
                <p className="topup-total-label">Total</p>
                <p className="topup-total-price">
                  ${Number(activePackage?.price || 0).toFixed(2)}
                </p>
              </div>

              <div className="topup-summary-list">
                <div className="topup-summary-row">
                  <span className="topup-summary-label">Selected Game</span>
                  <span className="topup-summary-val game-val">{selectedGame?.name || '—'}</span>
                </div>

                <div className="topup-summary-row">
                  <span className="topup-summary-label">Recharge Item</span>
                  <span className="topup-summary-val diamond-val">
                    {activePackage ? `💎 ${activePackage.diamond_amount} Diamonds` : 'None selected'}
                  </span>
                </div>

                <div className="topup-summary-row">
                  <span className="topup-summary-label">Player ID</span>
                  <span className="topup-summary-val" style={{ fontFamily: 'monospace' }}>
                    {playerId ? `${playerId}${zoneId ? ` (${zoneId})` : ''}` : 'Not entered'}
                  </span>
                </div>

                {verifiedName && (
                  <div className="topup-summary-row highlight">
                    <span className="topup-summary-label">Player Name</span>
                    <span className="topup-summary-val username-val">
                      <CheckCircle2 size={14} /> {verifiedName}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={isSubmitting || !activePackage || !playerId.trim()}
                onClick={handleCreateOrder}
                className="topup-pay-btn"
              >
                <span>{isSubmitting ? "Processing..." : "Pay Now"}</span>
                <span className="topup-pay-badge">
                  {paymentMethod === 'payway' ? 'ABA PAY' : 'KHQR'}
                </span>
              </button>

              <div className="topup-trust-badges">
                <div className="topup-trust-item">
                  <ShieldCheck size={14} className="topup-trust-icon" />
                  <span>100% Authorized Game Reseller</span>
                </div>
                <div className="topup-trust-item">
                  <CheckCircle2 size={14} className="topup-trust-icon" />
                  <span>Official Top-Up Gateway API</span>
                </div>
              </div>
            </aside>
          </div>
        </div>

      {/* Mobile Floating Checkout Bar (< 1024px) */}
      {activePackage && playerId.trim() && (
        <div className="topup-mobile-floating-bar">
          <div className="topup-mobile-float-info">
            <span className="topup-mobile-float-item">
              💎 {activePackage.diamond_amount} Diamonds ({selectedGame?.name || 'Top-Up'})
            </span>
            <span className="topup-mobile-float-price">
              ${Number(activePackage.price).toFixed(2)} USD
            </span>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCreateOrder}
            className="topup-mobile-float-btn"
          >
            {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
            <span>Pay Now ({paymentMethod === 'payway' ? 'ABA' : 'KHQR'})</span>
          </button>
        </div>
      )}

      {/* Payment & Polling Modal */}
      {isPaymentModalOpen && activeOrder && (
        <div className="topup-modal-backdrop">
          <div className="topup-modal-window">
            <button 
              type="button" 
              className="topup-modal-close-btn"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              <X size={20} />
            </button>

            <div className="topup-modal-header">
              <span className="topup-modal-kicker">
                Scan & Complete Payment
              </span>
              <h3 className="topup-modal-order-no">
                Order #{activeOrder.order_no}
              </h3>
              <p className="topup-modal-subtitle">
                Amount: <b>${Number(activeOrder.amount).toFixed(2)} USD</b> for 💎 {activeOrder.diamond_amount} Diamonds
              </p>
            </div>

            <div className="topup-modal-body" style={{ margin: '16px 0' }}>
              {activeOrder.status === 'success' || activeOrder.status === 'completed' ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Top-Up Successful!
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: '10px 0 0' }}>
                    Your {activeOrder.diamond_amount} diamonds have been dispatched to User ID <b>{activeOrder.player_id}</b>. Enjoy your game!
                  </p>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    style={{ marginTop: '24px', padding: '12px 32px' }}
                    onClick={() => {
                      setIsPaymentModalOpen(false);
                      setActiveOrder(null);
                    }}
                  >
                    Done & Return
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div className="topup-qr-frame">
                    {checkoutUrl ? (
                      <iframe 
                        src={checkoutUrl}
                        title="Payment Gateway"
                        className="topup-checkout-iframe"
                      />
                    ) : (
                      <div style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <QrCode size={64} style={{ color: '#64748b', marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Loading payment gateway...</p>
                      </div>
                    )}
                  </div>

                  <div className="topup-polling-status">
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Waiting for bank confirmation (auto-detecting)...</span>
                  </div>

                  {checkoutUrl && (
                    <div className="topup-modal-actions">
                      <a
                        href={checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <span>Open in New Tab</span>
                        <ExternalLink size={14} />
                      </a>
                      <button
                        type="button"
                        onClick={() => copyOrderToClipboard(activeOrder.order_no)}
                        className="btn btn-secondary btn-sm"
                      >
                        {copiedOrderNo ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
                        <span>{copiedOrderNo ? 'Copied' : 'Copy Order No'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
