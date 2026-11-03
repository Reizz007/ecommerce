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

export default function TopupShop({ onBackToTools }) {
  const { addToast, currency, formatPrice } = useApp();

  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [gamesError, setGamesError] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);

  // Form State
  const [playerId, setPlayerId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('payway'); // 'payway' | 'khqr'

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

  // Active View Tab: 'shop' | 'tracking'
  const [viewTab, setViewTab] = useState('shop');
  const [trackingOrderNo, setTrackingOrderNo] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Fetch Games Catalog with graceful retry on wake-up
  const loadGames = useCallback(async () => {
    setLoadingGames(true);
    setGamesError('');
    try {
      const data = await fetchJson('/api/topup/games', {}, 2, 2000);
      const items = data.data || (Array.isArray(data) ? data : []);
      setGames(items);
      if (items.length > 0) {
        setSelectedGame((prev) => (prev ? items.find((g) => g.id === prev.id) || items[0] : items[0]));
      }
    } catch (err) {
      setGamesError(err.message || 'Unable to load top-up catalog.');
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
      setSelectedPackageId(selectedGame.packages[0].id);
    } else {
      setSelectedPackageId(null);
    }
    setVerifiedName('');
    setVerifyError('');
  }, [selectedGame]);

  // Determine if zone/server ID input is required
  const isZoneRequired = useMemo(() => {
    if (!selectedGame) return false;
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

  // Verify Player ID Handler
  const handleVerifyPlayerId = async () => {
    const cleanPlayer = playerId.trim();
    const cleanZone = zoneId.trim();

    if (!cleanPlayer) {
      setVerifyError('Please enter your Player ID / User ID.');
      return;
    }
    if (isZoneRequired && !cleanZone) {
      setVerifyError('Please enter your Server / Zone ID.');
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
          game_code: selectedGame.code,
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

    const cleanPlayer = playerId.trim();
    const cleanZone = zoneId.trim();

    if (!selectedGame) {
      addToast('Please select a game first.', 'error');
      return;
    }
    if (!cleanPlayer) {
      addToast('Please enter your Player ID.', 'error');
      return;
    }
    if (isZoneRequired && !cleanZone) {
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
          game_code: selectedGame.code,
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

  // Order Tracking Handler
  const handleTrackOrder = async (e) => {
    e?.preventDefault();
    const cleanNo = trackingOrderNo.trim();
    if (!cleanNo) {
      setTrackingError('Please enter an Order ID.');
      return;
    }

    setIsTrackingLoading(true);
    setTrackingError('');
    setTrackedOrder(null);

    try {
      const data = await fetchJson(`/api/topup/orders/${encodeURIComponent(cleanNo)}`, {}, 1, 1000);
      if (!data.success) {
        throw new Error(data.message || 'Order not found.');
      }
      setTrackedOrder(data.data || data.order);
    } catch (err) {
      setTrackingError(err.message || 'Could not locate order.');
    } finally {
      setIsTrackingLoading(false);
    }
  };

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

        <div className="topup-nav-tabs">
          <button 
            type="button"
            className={`topup-tab-btn ${viewTab === 'shop' ? 'active' : ''}`}
            onClick={() => setViewTab('shop')}
          >
            <Sparkles size={16} />
            <span>Select Game & Top Up</span>
          </button>
          <button 
            type="button"
            className={`topup-tab-btn ${viewTab === 'tracking' ? 'active' : ''}`}
            onClick={() => setViewTab('tracking')}
          >
            <Search size={16} />
            <span>Track Order Status</span>
          </button>
        </div>
      </div>

      {viewTab === 'tracking' ? (
        /* Order Tracking View */
        <div className="topup-tracking-card">
          <div className="topup-card-header">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="text-cyan-400" size={20} />
              Real-Time Order Tracking
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Enter your Order Number (e.g. <code>ORD_2026...</code>) to check live payment and diamond fulfillment status.
            </p>
          </div>

          <form onSubmit={handleTrackOrder} className="topup-tracking-form">
            <div className="topup-input-group flex-1">
              <input
                type="text"
                placeholder="Enter Order ID (ORD_...)"
                value={trackingOrderNo}
                onChange={(e) => setTrackingOrderNo(e.target.value)}
                className="topup-text-input"
              />
            </div>
            <button 
              type="submit" 
              disabled={isTrackingLoading} 
              className="btn btn-primary topup-track-submit-btn"
            >
              {isTrackingLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Track Status</span>
                </>
              )}
            </button>
          </form>

          {trackingError && (
            <div className="topup-alert-box error mt-4">
              <AlertCircle size={18} />
              <span>{trackingError}</span>
            </div>
          )}

          {trackedOrder && (
            <div className="topup-tracked-result mt-6">
              <div className="topup-status-banner">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400">Order Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`topup-status-tag ${trackedOrder.status}`}>
                      {trackedOrder.status?.toUpperCase()}
                    </span>
                    {trackedOrder.status === 'success' && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Diamonds Transferred
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Total Paid</span>
                  <p className="text-2xl font-black text-white mt-1">
                    ${Number(trackedOrder.amount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="topup-details-grid">
                <div className="detail-item">
                  <span className="label">Order Number</span>
                  <span className="value font-mono">{trackedOrder.order_no}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Game</span>
                  <span className="value">{trackedOrder.game?.name || 'Mobile Game'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Item / Diamonds</span>
                  <span className="value font-semibold text-cyan-400">
                    💎 {trackedOrder.package?.name || `${trackedOrder.diamond_amount} Diamonds`}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Player ID</span>
                  <span className="value font-mono">
                    {trackedOrder.player_id} {trackedOrder.zone_id ? `(${trackedOrder.zone_id})` : ''}
                  </span>
                </div>
                {trackedOrder.player_username && (
                  <div className="detail-item">
                    <span className="label">Player Username</span>
                    <span className="value font-bold text-emerald-400">
                      {trackedOrder.player_username}
                    </span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="label">Payment Gateway</span>
                  <span className="value uppercase font-medium">{trackedOrder.payment_method || 'ABA PayWay'}</span>
                </div>
              </div>

              {trackedOrder.gateway_checkout_url && trackedOrder.status === 'pending' && (
                <div className="mt-4 p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-purple-200">Payment still pending</p>
                    <p className="text-xs text-purple-300/80">Click checkout to finish transaction with ABA PayWay or KHQR.</p>
                  </div>
                  <a
                    href={trackedOrder.gateway_checkout_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    <span>Open Checkout</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Top Up Shop View */
        <div className="topup-shop-layout">
          {/* Left Column: Form & Selection */}
          <div className="topup-main-column">
            {/* Step 1: Select Game */}
            <section className="topup-card">
              <div className="topup-step-indicator">
                <span className="step-num">1</span>
                <div>
                  <h2 className="step-title">Select Game</h2>
                  <p className="step-desc">Choose the game you wish to reload</p>
                </div>
              </div>

              {loadingGames ? (
                <div className="topup-loading-skeleton">
                  <RefreshCw size={24} className="animate-spin text-cyan-400" />
                  <span>Loading game catalog... (Connecting to server)</span>
                </div>
              ) : gamesError ? (
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
                        <div className="text-left flex-1 min-w-0">
                          <h3 className="topup-game-name truncate">{g.name}</h3>
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
                <span className="step-num">2</span>
                <div>
                  <h2 className="step-title">Enter Account Details</h2>
                  <p className="step-desc">
                    {isZoneRequired 
                      ? 'Enter your User ID and Zone ID located in your game profile' 
                      : 'Enter your Player / User ID'}
                  </p>
                </div>
              </div>

              <div className="topup-inputs-row">
                <div className="topup-field-box">
                  <label className="topup-field-label">User ID / Player ID *</label>
                  <input
                    type="text"
                    placeholder="e.g. 12345678"
                    value={playerId}
                    onChange={(e) => {
                      setPlayerId(e.target.value);
                      setVerifiedName('');
                    }}
                    className="topup-text-input"
                  />
                </div>

                {isZoneRequired && (
                  <div className="topup-field-box">
                    <label className="topup-field-label">Zone / Server ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. 1234"
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
                <button
                  type="button"
                  disabled={isCheckingId || !playerId.trim()}
                  onClick={handleVerifyPlayerId}
                  className="btn btn-secondary btn-sm topup-verify-btn"
                >
                  {isCheckingId ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Checking Name...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Verify In-Game Username</span>
                    </>
                  )}
                </button>

                {verifiedName && (
                  <div className="topup-verified-badge">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>In-Game Name: <b>{verifiedName}</b></span>
                  </div>
                )}
              </div>

              {verifyError && (
                <div className="topup-alert-box error mt-3">
                  <AlertCircle size={16} />
                  <span>{verifyError}</span>
                </div>
              )}
            </section>

            {/* Step 3: Choose Package */}
            <section className="topup-card">
              <div className="topup-step-indicator">
                <span className="step-num">3</span>
                <div>
                  <h2 className="step-title">Select Recharge Package</h2>
                  <p className="step-desc">Direct top-up diamonds & special event passes</p>
                </div>
              </div>

              {selectedGame?.packages?.length === 0 ? (
                <p className="text-sm text-slate-400 py-4">No packages currently active for this game.</p>
              ) : (
                <div className="topup-packages-grid">
                  {selectedGame?.packages?.map((pkg) => {
                    const isSelected = activePackage?.id === pkg.id;
                    const isWeekly = (pkg.name || '').toLowerCase().includes('weekly') || (pkg.name || '').toLowerCase().includes('pass');

                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`topup-package-card ${isSelected ? 'selected' : ''} ${isWeekly ? 'featured' : ''}`}
                      >
                        {isWeekly && (
                          <span className="topup-badge-popular">
                            <Flame size={12} /> POPULAR
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="topup-diamond-icon">💎</span>
                          <span className="font-bold text-white text-base">
                            {pkg.diamond_amount} Diamonds
                          </span>
                        </div>

                        <span className="topup-package-title truncate">
                          {pkg.name}
                        </span>

                        <div className="topup-package-footer">
                          <span className="topup-price-tag font-bold">
                            ${Number(pkg.price).toFixed(2)}
                          </span>
                          <span className="topup-radio-circle"></span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Step 4: Payment Gateway */}
            <section className="topup-card">
              <div className="topup-step-indicator">
                <span className="step-num">4</span>
                <div>
                  <h2 className="step-title">Payment Method</h2>
                  <p className="step-desc">Instant confirmation with zero extra transaction fees</p>
                </div>
              </div>

              <div className="topup-payment-grid">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('payway')}
                  className={`topup-payment-card ${paymentMethod === 'payway' ? 'selected' : ''}`}
                >
                  <div className="topup-pay-icon aba">
                    <span className="font-black text-xs">ABA</span>
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm">ABA PayWay</h4>
                    <p className="text-xs text-slate-400">ABA Mobile App & Scan QR</p>
                  </div>
                  <div className="topup-radio-circle"></div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('khqr')}
                  className={`topup-payment-card ${paymentMethod === 'khqr' ? 'selected' : ''}`}
                >
                  <div className="topup-pay-icon khqr">
                    <span className="font-black text-xs">KHQR</span>
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm">KHQR Bakong</h4>
                    <p className="text-xs text-slate-400">All Cambodian Banks Support</p>
                  </div>
                  <div className="topup-radio-circle"></div>
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Checkout Summary Sticky Widget */}
          <div className="topup-sidebar-column">
            <div className="topup-summary-box sticky top-24">
              <h3 className="text-lg font-bold text-white pb-3 border-b border-white/10 flex items-center justify-between">
                <span>Order Summary</span>
                <Sparkles size={16} className="text-cyan-400" />
              </h3>

              <div className="topup-summary-details mt-4 space-y-3 text-sm">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Selected Game</span>
                  <span className="font-semibold text-white">{selectedGame?.name || '-'}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Selected Item</span>
                  <span className="font-semibold text-cyan-400 truncate max-w-[170px]">
                    {activePackage ? `${activePackage.diamond_amount} Diamonds` : 'None'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span>Player ID</span>
                  <span className="font-mono text-white">
                    {playerId ? `${playerId}${zoneId ? ` (${zoneId})` : ''}` : 'Not entered'}
                  </span>
                </div>

                {verifiedName && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Username</span>
                    <span className="font-bold text-emerald-400 truncate max-w-[170px]">{verifiedName}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-300">
                  <span>Payment Gateway</span>
                  <span className="font-bold uppercase text-white">{paymentMethod}</span>
                </div>
              </div>

              <div className="topup-summary-total mt-6 pt-4 border-t border-white/10">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Total Amount</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-3xl font-black text-white">
                    ${activePackage ? Number(activePackage.price).toFixed(2) : '0.00'}
                  </span>
                  <span className="text-xs text-slate-400">USD</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting || !activePackage || !playerId.trim()}
                onClick={handleCreateOrder}
                className="btn btn-primary btn-xl w-full mt-6 topup-buy-now-btn"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Instant Checkout</span>
                  </>
                )}
              </button>

              <div className="topup-trust-points mt-6 pt-4 border-t border-white/10 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>100% Authorized Game Reseller</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400" />
                  <span>Instant Delivery via Flash API</span>
                </div>
              </div>
            </div>
          </div>
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

            <div className="topup-modal-header text-center">
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                Scan & Complete Payment
              </span>
              <h3 className="text-2xl font-black text-white mt-1">
                Order #{activeOrder.order_no}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Amount: <b className="text-white">${Number(activeOrder.amount).toFixed(2)} USD</b> for 💎 {activeOrder.diamond_amount} Diamonds
              </p>
            </div>

            <div className="topup-modal-body my-4">
              {activeOrder.status === 'success' || activeOrder.status === 'completed' ? (
                <div className="topup-success-box text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle2 size={36} />
                  </div>
                  <h4 className="text-xl font-bold text-white">Top-Up Successful!</h4>
                  <p className="text-sm text-slate-300 mt-2 max-w-sm mx-auto">
                    Your {activeOrder.diamond_amount} diamonds have been dispatched to User ID <b>{activeOrder.player_id}</b>. Enjoy your game!
                  </p>
                  <button 
                    type="button" 
                    className="btn btn-primary mt-6 px-8"
                    onClick={() => {
                      setIsPaymentModalOpen(false);
                      setActiveOrder(null);
                    }}
                  >
                    Done & Return
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="topup-qr-frame">
                    {checkoutUrl ? (
                      <iframe 
                        src={checkoutUrl}
                        title="Payment Gateway"
                        className="topup-checkout-iframe"
                      />
                    ) : (
                      <div className="py-12 flex flex-col items-center justify-center">
                        <QrCode size={64} className="text-slate-500 mb-3" />
                        <p className="text-sm text-slate-400">Loading payment gateway...</p>
                      </div>
                    )}
                  </div>

                  <div className="topup-polling-status mt-4 flex items-center justify-center gap-2 text-xs text-cyan-400">
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Waiting for bank confirmation (auto-detecting)...</span>
                  </div>

                  {checkoutUrl && (
                    <div className="mt-4 flex gap-3 justify-center">
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
                        {copiedOrderNo ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
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
