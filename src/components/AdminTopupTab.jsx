import React, { useState, useEffect, useCallback } from 'react';
import { apiUrl, fetchJson } from '../utils/api';
import { getDeviceHeaders } from '../utils/device';
import './AdminTopupTab.css';
import {
  Gamepad2,
  RefreshCw,
  Search,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  ExternalLink,
  DollarSign,
  Package,
  Boxes,
  Layers,
  Check,
  X,
  Filter
} from 'lucide-react';

export default function AdminTopupTab({ formatPrice, addToast }) {
  const [subTab, setSubTab] = useState('orders'); // 'orders' | 'games' | 'packages'
  const [loading, setLoading] = useState(false);

  // Data states
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersCount: 0,
    successCount: 0,
    pendingCount: 0,
    holdCount: 0,
    gamesCount: 0,
    packagesCount: 0
  });
  const [games, setGames] = useState([]);
  const [orders, setOrders] = useState([]);

  // Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Manual verify state
  const [verifyingId, setVerifyingId] = useState(null);

  // Modals
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [gameForm, setGameForm] = useState({
    name: '',
    code: '',
    api_game_id: '',
    is_active: true
  });

  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({
    game_id: '',
    name: '',
    diamond_amount: '',
    price: '',
    sku: '',
    sort_order: 0,
    is_active: true
  });

  // Fetch Dashboard & Orders
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, ordersRes] = await Promise.all([
        fetch(apiUrl('/api/admin/topup/dashboard'), { headers: { ...getDeviceHeaders() } }).then(r => r.json()).catch(() => null),
        fetch(apiUrl('/api/admin/topup/orders'), { headers: { ...getDeviceHeaders() } }).then(r => r.json()).catch(() => null)
      ]);

      if (dashRes?.success) {
        setStats(dashRes.stats);
        if (dashRes.games) setGames(dashRes.games);
      }
      if (ordersRes?.success && ordersRes.orders?.data) {
        setOrders(ordersRes.orders.data);
      }
    } catch (e) {
      console.error('Failed to load topup admin data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Order Actions
  const handleManualVerify = async (order) => {
    if (order.status === 'success') {
      addToast('Order is already fulfilled successfully.', 'info');
      return;
    }

    setVerifyingId(order.id);
    try {
      const data = await fetchJson(`/api/admin/topup/orders/${order.id}/manual-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, 0);
      if (data.success) {
        addToast(`✅ Order ${order.order_no} pushed to FlashTopUp API!`, 'success');
      } else {
        addToast(`⚠️ FlashTopUp: ${data.message || 'Verification on hold'}`, 'info');
      }
      loadData();
    } catch (err) {
      addToast('Verification failed: ' + err.message, 'error');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const data = await fetchJson(`/api/admin/topup/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }, 0);
      if (data.success) {
        addToast(`Status updated to ${newStatus}`, 'success');
        loadData();
      }
    } catch (e) {
      addToast('Error updating status: ' + e.message, 'error');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/topup/orders/${orderId}`), {
        method: 'DELETE',
        headers: { ...getDeviceHeaders() }
      });
      if (res.ok) {
        addToast('Topup order deleted.', 'info');
        loadData();
      }
    } catch (e) {
      addToast('Error deleting order: ' + e.message, 'error');
    }
  };

  // Game Management
  const openNewGameModal = () => {
    setEditingGame(null);
    setGameForm({ name: '', code: '', api_game_id: '', is_active: true });
    setIsGameModalOpen(true);
  };

  const openEditGameModal = (game) => {
    setEditingGame(game);
    setGameForm({
      name: game.name || '',
      code: game.code || '',
      api_game_id: game.api_game_id || '',
      is_active: Boolean(game.is_active)
    });
    setIsGameModalOpen(true);
  };

  const handleSaveGame = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingGame
        ? `/api/admin/topup/games/${editingGame.id}`
        : '/api/admin/topup/games';
      const method = editingGame ? 'PATCH' : 'POST';

      const data = await fetchJson(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameForm)
      }, 0);
      if (data.success) {
        addToast(editingGame ? 'Game updated!' : 'Game created!', 'success');
        setIsGameModalOpen(false);
        loadData();
      } else {
        addToast(data.message || 'Error saving game.', 'error');
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('Delete this game and all its packages?')) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/topup/games/${gameId}`), {
        method: 'DELETE',
        headers: { ...getDeviceHeaders() }
      });
      if (res.ok) {
        addToast('Game deleted.', 'info');
        loadData();
      }
    } catch (e) {
      addToast('Error deleting game: ' + e.message, 'error');
    }
  };

  // Package Management
  const openNewPackageModal = (preselectedGameId = '') => {
    setEditingPackage(null);
    setPackageForm({
      game_id: preselectedGameId || (games[0]?.id || ''),
      name: '',
      diamond_amount: '',
      price: '',
      sku: '',
      sort_order: 0,
      is_active: true
    });
    setIsPackageModalOpen(true);
  };

  const openEditPackageModal = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      game_id: pkg.topup_game_id || '',
      name: pkg.name || '',
      diamond_amount: pkg.diamond_amount || '',
      price: pkg.price || '',
      sku: pkg.sku || '',
      sort_order: pkg.sort_order || 0,
      is_active: Boolean(pkg.is_active)
    });
    setIsPackageModalOpen(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingPackage
        ? `/api/admin/topup/packages/${editingPackage.id}`
        : '/api/admin/topup/packages';
      const method = editingPackage ? 'PATCH' : 'POST';

      const data = await fetchJson(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packageForm)
      }, 0);
      if (data.success) {
        addToast(editingPackage ? 'Package updated!' : 'Package created!', 'success');
        setIsPackageModalOpen(false);
        loadData();
      } else {
        addToast(data.message || 'Error saving package.', 'error');
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      const res = await fetch(apiUrl(`/api/admin/topup/packages/${packageId}`), {
        method: 'DELETE',
        headers: { ...getDeviceHeaders() }
      });
      if (res.ok) {
        addToast('Package deleted.', 'info');
        loadData();
      }
    } catch (e) {
      addToast('Error deleting package: ' + e.message, 'error');
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchNo = (o.order_no || '').toLowerCase().includes(q);
      const matchPlayer = (o.player_id || '').toLowerCase().includes(q);
      const matchName = (o.player_username || '').toLowerCase().includes(q);
      const matchGame = (o.game?.name || '').toLowerCase().includes(q);
      return matchNo || matchPlayer || matchName || matchGame;
    }
    return true;
  });

  // Flat packages list
  const allPackages = games.flatMap((g) => (g.packages || []).map((p) => ({ ...p, gameName: g.name })));

  return (
    <div className="admin-tab-pane">
      {/* Top Header */}
      <div className="tab-pane-header">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            <Gamepad2 style={{ color: '#06b6d4' }} size={26} />
            <span>Game Top-Up Management & FlashTopUp Fulfillment</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: '6px 0 0' }}>
            Manage active games, diamond pricing, FlashTopUp SKUs, and live customer top-up transactions.
          </p>
        </div>

        <div className="pane-header-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          {subTab === 'games' && (
            <button type="button" className="btn btn-primary btn-sm" onClick={openNewGameModal}>
              <Plus size={14} />
              <span>Add Game</span>
            </button>
          )}
          {subTab === 'packages' && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openNewPackageModal()}>
              <Plus size={14} />
              <span>Add Package</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar (4-Card Horizontal Responsive Grid) */}
      <div className="admin-metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-metric-card metric-card-revenue">
          <div className="metric-header">
            <span>Top-Up Revenue</span>
            <div className="metric-icon-wrap icon-revenue">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-val" style={{ color: '#38bdf8' }}>
            {formatPrice ? formatPrice(stats.totalRevenue || 0) : `$${Number(stats.totalRevenue || 0).toFixed(2)}`}
          </div>
          <div className="metric-trend up">
            <CheckCircle2 size={14} /> From {stats.successCount || 0} completed orders
          </div>
        </div>

        <div className="admin-metric-card metric-card-products">
          <div className="metric-header">
            <span>Total Orders</span>
            <div className="metric-icon-wrap icon-products">
              <Boxes size={20} />
            </div>
          </div>
          <div className="metric-val">{stats.ordersCount || 0}</div>
          <div className="metric-trend info">
            <Clock size={14} /> {stats.pendingCount || 0} pending payment
          </div>
        </div>

        <div className="admin-metric-card metric-card-khqr">
          <div className="metric-header">
            <span>Delivered Successfully</span>
            <div className="metric-icon-wrap icon-khqr">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="metric-val" style={{ color: '#34d399' }}>{stats.successCount || 0}</div>
          <div className="metric-trend up">
            <Zap size={14} /> Automated FlashTopUp push
          </div>
        </div>

        <div className="admin-metric-card metric-card-categories">
          <div className="metric-header">
            <span>Manual Attention / Hold</span>
            <div className="metric-icon-wrap icon-categories">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="metric-val" style={{ color: '#fbbf24' }}>{stats.holdCount || 0}</div>
          <div className="metric-trend" style={{ color: '#f59e0b' }}>
            Requires admin verification
          </div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="topup-admin-subtabs" style={{ marginBottom: '18px' }}>
        <button
          type="button"
          onClick={() => setSubTab('orders')}
          className={`topup-admin-tab-btn ${subTab === 'orders' ? 'active' : ''}`}
        >
          <Clock size={15} />
          <span>Customer Top-Up Orders ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('games')}
          className={`topup-admin-tab-btn ${subTab === 'games' ? 'active' : ''}`}
        >
          <Gamepad2 size={15} />
          <span>Games Catalog ({games.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('packages')}
          className={`topup-admin-tab-btn ${subTab === 'packages' ? 'active' : ''}`}
        >
          <Package size={15} />
          <span>Diamond Packages & Flash SKUs ({allPackages.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: ORDERS */}
      {subTab === 'orders' && (
        <div className="topup-orders-view">
          {/* Controls Bar */}
          <div className="topup-controls-bar" style={{ marginBottom: '16px' }}>
            <div className="topup-search-box">
              <Search size={15} style={{ color: '#64748b', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search order no, player ID, username..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="topup-search-input"
              />
            </div>

            <div className="topup-filter-group">
              <Filter size={14} style={{ color: '#94a3b8' }} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="topup-filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="success">Success / Completed</option>
                <option value="manual_hold">Manual Hold</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order No & Date</th>
                  <th>Game</th>
                  <th>Diamonds / Package</th>
                  <th>Player ID & Zone</th>
                  <th>Player Username</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
                      <AlertCircle size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
                      <div>No top-up orders match your filters.</div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isManualVerifying = verifyingId === order.id;

                    return (
                      <tr key={order.id}>
                        <td>
                          <div className="topup-order-no">{order.order_no}</div>
                          <div className="topup-order-date">
                            {new Date(order.created_at).toLocaleString()}
                          </div>
                        </td>
                        <td>
                          <div className="topup-game-cell-title">
                            <Gamepad2 size={14} style={{ color: '#06b6d4', flexShrink: 0 }} />
                            <span>{order.game?.name || 'Game'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="topup-diamonds-val">
                            💎 {order.diamond_amount} Diamonds
                          </div>
                          <div className="topup-package-sub">{order.package?.name || '-'}</div>
                        </td>
                        <td>
                          <code className="topup-player-code">{order.player_id}</code>
                          {order.zone_id && (
                            <span className="topup-zone-pill">Zone {order.zone_id}</span>
                          )}
                        </td>
                        <td>
                          {order.player_username ? (
                            <span className="topup-username-badge">
                              <CheckCircle2 size={12} />
                              {order.player_username}
                            </span>
                          ) : (
                            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>—</span>
                          )}
                        </td>
                        <td>
                          <span className="topup-payment-pill">
                            {order.payment_method || 'payway'}
                          </span>
                        </td>
                        <td>
                          <span className="topup-amount-val">
                            ${Number(order.amount).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className={`topup-status-select ${order.status}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="success">Success</option>
                            <option value="manual_hold">Manual Hold</option>
                            <option value="failed">Failed</option>
                          </select>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions-group">
                            <button
                              type="button"
                              disabled={isManualVerifying || order.status === 'success'}
                              onClick={() => handleManualVerify(order)}
                              title="Verify payment and auto-push diamond order to FlashTopUp API"
                              className={`topup-btn-autopush ${order.status === 'success' ? 'dispatched' : ''}`}
                            >
                              {isManualVerifying ? (
                                <RefreshCw size={12} className="animate-spin" />
                              ) : (
                                <Zap size={12} />
                              )}
                              <span>{order.status === 'success' ? 'Dispatched' : 'Auto Push'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Delete order"
                              className="btn-table-action delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GAMES CATALOG */}
      {subTab === 'games' && (
        <div className="topup-games-admin-view">
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Game Name</th>
                  <th>Game Code</th>
                  <th>Flash API Game ID</th>
                  <th>Packages Count</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {games.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      No games found. Click &quot;Add Game&quot; above to create one.
                    </td>
                  </tr>
                ) : (
                  games.map((g) => (
                    <tr key={g.id}>
                      <td>
                        <div className="topup-game-cell-title">
                          <Gamepad2 size={16} style={{ color: '#06b6d4', flexShrink: 0 }} />
                          <span style={{ fontWeight: 700, color: '#ffffff' }}>{g.name}</span>
                        </div>
                      </td>
                      <td>
                        <code className="topup-code-badge">{g.code}</code>
                      </td>
                      <td>
                        <span className="topup-api-id-text">{g.api_game_id || 'Auto (3)'}</span>
                      </td>
                      <td>
                        <span className="topup-count-pill">{g.packages?.length || 0} Packages</span>
                      </td>
                      <td>
                        <span className={`status-pill ${g.is_active ? 'active' : 'inactive'}`}>
                          <span className="status-dot-mini"></span>
                          {g.is_active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-group">
                          <button
                            type="button"
                            onClick={() => openNewPackageModal(g.id)}
                            className="topup-btn-autopush"
                            title="Add package to this game"
                          >
                            <Plus size={13} />
                            <span>Add SKU</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditGameModal(g)}
                            className="btn-table-action edit"
                            title="Edit game details"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGame(g.id)}
                            className="btn-table-action delete"
                            title="Delete game"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PACKAGES & SKUS */}
      {subTab === 'packages' && (
        <div className="topup-packages-admin-view">
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Package Name</th>
                  <th>Diamonds</th>
                  <th>Price (USD)</th>
                  <th>FlashTopUp SKU / Service Code</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPackages.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                      No packages found. Click &quot;Add Package&quot; above to create one.
                    </td>
                  </tr>
                ) : (
                  allPackages.map((pkg) => (
                    <tr key={pkg.id}>
                      <td>
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>{pkg.gameName}</span>
                      </td>
                      <td>
                        <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{pkg.name || `${pkg.diamond_amount} Diamonds`}</span>
                      </td>
                      <td>
                        <span className="topup-diamonds-val">💎 {pkg.diamond_amount}</span>
                      </td>
                      <td>
                        <span className="topup-price-badge">${Number(pkg.price).toFixed(2)}</span>
                      </td>
                      <td>
                        <code className="topup-sku-badge">
                          {pkg.sku || 'Auto-Resolved'}
                        </code>
                      </td>
                      <td>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{pkg.sort_order ?? 0}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${pkg.is_active ? 'active' : 'inactive'}`}>
                          <span className="status-dot-mini"></span>
                          {pkg.is_active ? 'ACTIVE' : 'HIDDEN'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions-group">
                          <button
                            type="button"
                            onClick={() => openEditPackageModal(pkg)}
                            className="btn-table-action edit"
                            title="Edit package"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePackage(pkg.id)}
                            className="btn-table-action delete"
                            title="Delete package"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT GAME */}
      {isGameModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container admin-tool-modal">
            <button className="modal-close" onClick={() => setIsGameModalOpen(false)}>
              &times;
            </button>
            <div className="modal-header-admin">
              <h3>{editingGame ? `Edit Game: ${editingGame.name}` : 'Add New Game'}</h3>
              <p>Configure game code and API mapping for automated validation & diamond top-ups.</p>
            </div>

            <form onSubmit={handleSaveGame} className="admin-modal-form">
              <div className="form-group">
                <label>Game Title / Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile Legends"
                  value={gameForm.name}
                  onChange={(e) => setGameForm({ ...gameForm, name: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group mt-3">
                <label>Game Code (Unique Identifier) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mlbb, freefire_global, magic_chest_gogo"
                  value={gameForm.code}
                  onChange={(e) => setGameForm({ ...gameForm, code: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group mt-3">
                <label>FlashTopUp Product ID (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 3 for MLBB, 5 for Exclusive, 107 for MCGG"
                  value={gameForm.api_game_id}
                  onChange={(e) => setGameForm({ ...gameForm, api_game_id: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group mt-3">
                <label className="toggle-checkbox-card">
                  <input
                    type="checkbox"
                    checked={gameForm.is_active}
                    onChange={(e) => setGameForm({ ...gameForm, is_active: e.target.checked })}
                  />
                  <div className="toggle-card-content">
                    <strong>Active & Published</strong>
                    <span className="text-xs text-muted">Show this game to customers on public store</span>
                  </div>
                </label>
              </div>

              <div className="modal-actions-admin mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsGameModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingGame ? 'Save Changes' : 'Create Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PACKAGE */}
      {isPackageModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-container admin-tool-modal">
            <button className="modal-close" onClick={() => setIsPackageModalOpen(false)}>
              &times;
            </button>
            <div className="modal-header-admin">
              <h3>{editingPackage ? `Edit Package: ${editingPackage.name}` : 'Add Diamond Package'}</h3>
              <p>Configure diamond denomination, price, and FlashTopUp reseller SKU / service code.</p>
            </div>

            <form onSubmit={handleSavePackage} className="admin-modal-form">
              <div className="form-group">
                <label>Target Game *</label>
                <select
                  required
                  value={packageForm.game_id}
                  onChange={(e) => setPackageForm({ ...packageForm, game_id: e.target.value })}
                  className="form-control"
                >
                  <option value="">Select a Game</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-grid mt-3">
                <div className="form-group">
                  <label>Package Title / Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 55 Diamonds, Weekly Pass"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Diamond Amount *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 55, 86, 220"
                    value={packageForm.diamond_amount}
                    onChange={(e) => setPackageForm({ ...packageForm, diamond_amount: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-grid mt-3">
                <div className="form-group">
                  <label>Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={0}
                    placeholder="e.g. 0.88"
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Flash SKU / Service Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 38, 89, 142, MOBILE_LEGENDS_55_DIAMONDS"
                    value={packageForm.sku}
                    onChange={(e) => setPackageForm({ ...packageForm, sku: e.target.value })}
                    className="form-control"
                  />
                  <span className="input-hint text-xs">
                    Official SKU from FlashTopUp service code list or numerical short code.
                  </span>
                </div>
              </div>

              <div className="form-grid mt-3">
                <div className="form-group">
                  <label>Sort Order</label>
                  <input
                    type="number"
                    value={packageForm.sort_order}
                    onChange={(e) => setPackageForm({ ...packageForm, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="form-control"
                  />
                </div>

                <div className="form-group flex items-end">
                  <label className="toggle-checkbox-card w-full">
                    <input
                      type="checkbox"
                      checked={packageForm.is_active}
                      onChange={(e) => setPackageForm({ ...packageForm, is_active: e.target.checked })}
                    />
                    <div className="toggle-card-content">
                      <strong>Active Package</strong>
                    </div>
                  </label>
                </div>
              </div>

              <div className="modal-actions-admin mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsPackageModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPackage ? 'Save Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

