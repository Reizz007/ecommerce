import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TOOLS_DATA } from '../data/toolsData';
import { apiUrl } from '../utils/api';
import { getDeviceId, getDeviceName, getDeviceHeaders } from '../utils/device';
import { 
  LayoutDashboard, 
  Boxes, 
  FolderKanban,
  ShoppingCart, 
  Users, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Smartphone,
  SmartphoneNfc, 
  MessageSquare,
  ArrowLeft, 
  ArrowRight,
  DollarSign, 
  TrendingUp, 
  Cpu, 
  ShieldCheck, 
  ShieldAlert, 
  Save, 
  Eye, 
  EyeOff,
  Zap,
  Copy, 
  Check,
  LogOut,
  Tag,
  Palette,
  Database,
  Sparkles,
  Layers,
  Bot,
  Brain,
  Code2,
  Mic,
  Video,
  Headphones,
  BellRing,
  Send,
  Key,
  X
} from 'lucide-react';

export default function AdminPanel({ onCloseAdmin, onLogout }) {
  const { addToast, formatPrice, refreshTools, refreshCategories } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tools' | 'categories' | 'orders' | 'subscribers' | 'settings'
  const [loading, setLoading] = useState(false);

  // Data states from Laravel Backend
  const [stats, setStats] = useState({
    totalRevenue: 48920,
    activeSubscribers: 185240,
    totalOrders: 1248,
    apiRequestsToday: 142080,
    toolsCount: 10,
    productsCount: 10,
    categoriesCount: 6,
    abaOrdersCount: 3
  });

  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [settings, setSettings] = useState({
    abaPayLink: '',
    khqrGatewayUrl: 'https://khqr.cc/api/payment/requestv2/tW6PHjgPyzISFi3KK22hKZ57rag1cWHS',
    khqrProfileId: 'tW6PHjgPyzISFi3KK22hKZ57rag1cWHS',
    khqrSecretKey: 'zsFq7SWHV4gYFSAdfg2ud8WV747tBOei',
    announcementText: 'Dyzzstore Flagship Models are now live! Get 20% OFF all annual subscriptions with code NEURON20',
    maintenanceMode: false,
    telegramBotToken: '',
    telegramChatId: '',
    telegramEnabled: false,
    // Dedicated Telegram Security / Device Alert Group (gp)
    telegramDeviceChatId: '',
    telegramDeviceBotToken: '',
    telegramDeviceAlertsEnabled: true,
    telegramAlertOnNewDevice: true,
    telegramAlertOnPrimaryLogin: true,
    plasgatePrivateKey: '',
    plasgateSecretKey: '',
    plasgateSenderId: 'SMS Info',
    plasgateEnabled: false,
    singleDeviceLocked: true,
    isPrimaryDevice: getDeviceId() === 'dev_nku878yn_mvncy0wo' || localStorage.getItem('dyzz_is_primary') === 'true',
    settingsHidden: false,
    primaryDeviceName: 'Windows PC • Chrome',
    primaryDeviceAt: '',
    primaryDeviceIp: '127.0.0.1',
    currentDeviceId: getDeviceId()
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [showTelegramDeviceToken, setShowTelegramDeviceToken] = useState(false);
  const [showPlasgatePrivate, setShowPlasgatePrivate] = useState(false);
  const [showPlasgateSecret, setShowPlasgateSecret] = useState(false);
  const [plasgateTestPhone, setPlasgateTestPhone] = useState('012345678');
  const [plasgateTesting, setPlasgateTesting] = useState(false);
  const [plasgateTestResult, setPlasgateTestResult] = useState(null);
  const [khqrTestResult, setKhqrTestResult] = useState(null);
  const [khqrTesting, setKhqrTesting] = useState(false);
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState(null);
  const [testingTelegramGroup, setTestingTelegramGroup] = useState(false);
  const [telegramGroupTestResult, setTelegramGroupTestResult] = useState(null);
  const [authorizingDevice, setAuthorizingDevice] = useState(false);
  const [testingDeviceAlert, setTestingDeviceAlert] = useState(false);
  const [togglingSingleDevice, setTogglingSingleDevice] = useState(false);

  // Product Modal state (Create / Edit)
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [toolFormData, setToolFormData] = useState({
    name: '',
    category: 'llm',
    badge: 'PRO',
    priceMonthly: 29,
    priceLifetime: 199,
    shortDesc: '',
    capabilities: 'Multi-modal, Real-time Streaming, API Access',
    status: 'Active'
  });

  // Category Modal state (Create / Edit)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Brain',
    color: '#8b5cf6',
    badge: 'Flagship',
    display_order: 1,
    is_active: true,
    status: 'Active'
  });

  // Activation Modal State
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [activatingOrder, setActivatingOrder] = useState(null);
  const [activationInput, setActivationInput] = useState('');
  const [activationNoteInput, setActivationNoteInput] = useState('');
  const [activatingLoading, setActivatingLoading] = useState(false);
  const [prevOrderCount, setPrevOrderCount] = useState(0);

  // Audio Chime synthesizer for new incoming order alerts
  const playNotificationChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    } catch (e) {
      console.warn('Audio alert note:', e);
    }
  };

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // 'all' | 'Active' | 'Inactive'
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch all backend data from Laravel API
  const loadBackendData = async () => {
    setLoading(true);
    try {
      const [statsRes, toolsRes, categoriesRes, ordersRes, subsRes, settingsRes] = await Promise.all([
        fetch(apiUrl('/api/stats')).then(r => r.json()).catch(() => null),
        fetch(apiUrl('/api/products')).then(r => r.json()).catch(() => null),
        fetch(apiUrl('/api/categories')).then(r => r.json()).catch(() => null),
        fetch(apiUrl('/api/orders')).then(r => r.json()).catch(() => null),
        fetch(apiUrl('/api/subscribers')).then(r => r.json()).catch(() => null),
        fetch(apiUrl('/api/settings'), { headers: { ...getDeviceHeaders() } }).then(r => r.json()).catch(() => null)
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (toolsRes?.products || toolsRes?.tools) {
        const list = toolsRes.products || toolsRes.tools;
        setTools(list);
      }
      if (categoriesRes?.categories) {
        setCategories(categoriesRes.categories);
      }
      if (ordersRes?.orders) setOrders(ordersRes.orders);
      if (subsRes?.subscribers) setSubscribers(subsRes.subscribers);
      if (settingsRes?.settings) {
        setSettings(prev => ({ ...prev, ...settingsRes.settings }));
        if (settingsRes.settings.isPrimaryDevice) {
          localStorage.setItem('dyzz_is_primary', 'true');
        } else {
          localStorage.removeItem('dyzz_is_primary');
        }
      }
    } catch (err) {
      console.error('Failed to load Laravel backend data:', err);
      addToast('Connecting to Laravel backend API...', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // Strict Single Device Protection: Auto-redirect away from settings if accessed on unauthorized device
  useEffect(() => {
    if (settings.singleDeviceLocked && !settings.isPrimaryDevice && activeTab === 'settings') {
      setActiveTab('overview');
      addToast('🔒 Settings tab is locked. Only your primary authorized device can view and modify settings.', 'warning');
    }
  }, [settings.singleDeviceLocked, settings.isPrimaryDevice, activeTab]);

  // Real-time polling for new orders with audio chime alert
  useEffect(() => {
    const pollTimer = setInterval(async () => {
      try {
        const res = await fetch(apiUrl('/api/orders'));
        const data = await res.json();
        if (data?.orders) {
          if (prevOrderCount > 0 && data.orders.length > prevOrderCount) {
            const newest = data.orders[0];
            playNotificationChime();
            addToast(`🔔 New Order from ${newest.customer_name || 'Customer'} ($${newest.amount})! Click to publish activation link.`, 'warning');
          }
          setPrevOrderCount(data.orders.length);
          setOrders(data.orders);
        }
      } catch (_) {}
    }, 4000);
    return () => clearInterval(pollTimer);
  }, [prevOrderCount]);

  const pendingActivationCount = orders.filter(
    o => (!o.activation_link || o.status === 'Pending Activation' || o.status === 'Pending PayWay Checkout') && o.status !== 'Refunded'
  ).length;

  const handleOpenActivateModal = (order) => {
    setActivatingOrder(order);
    setActivationInput(order.activation_link || `https://t.me/dyzzstore_bot?start=act_${order.order_number || order.id}`);
    setActivationNoteInput(order.activation_note || 'Your premium workspace license has been activated! Click above to access your tools.');
    setIsActivateModalOpen(true);
  };

  const handleSubmitActivationLink = async (e) => {
    e.preventDefault();
    if (!activatingOrder || !activationInput.trim()) return;
    setActivatingLoading(true);

    try {
      const res = await fetch(apiUrl(`/api/orders/${activatingOrder.id}/activate`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activation_link: activationInput.trim(),
          activation_note: activationNoteInput.trim(),
          status: 'Activated'
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === activatingOrder.id ? (data.order || { ...o, activation_link: activationInput.trim(), status: 'Activated' }) : o));
        addToast(`🎉 Activation link published to ${activatingOrder.customer_name || 'Customer'}! User screen updated.`, 'success');
        setIsActivateModalOpen(false);
      } else {
        addToast(data.message || 'Failed to publish activation link', 'error');
      }
    } catch (err) {
      addToast('Network error publishing activation link', 'error');
    } finally {
      setActivatingLoading(false);
    }
  };

  // --- Category CRUD Operations ---
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'Boxes',
      color: '#8b5cf6',
      badge: 'New Suite',
      display_order: categories.length + 1,
      is_active: true,
      status: 'Active'
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    const isActive = cat.is_active !== undefined ? Boolean(cat.is_active) : (cat.status !== 'Inactive');
    setCategoryFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'Boxes',
      color: cat.color || '#8b5cf6',
      badge: cat.badge || '',
      display_order: cat.display_order || 1,
      is_active: isActive,
      status: isActive ? 'Active' : 'Inactive'
    });
    setIsCategoryModalOpen(true);
  };

  const handleToggleCategoryStatus = async (cat) => {
    const currentActive = cat.is_active !== undefined ? Boolean(cat.is_active) : (cat.status !== 'Inactive');
    const nextActive = !currentActive;
    const nextStatus = nextActive ? 'Active' : 'Inactive';
    try {
      const res = await fetch(apiUrl(`/api/categories/${cat.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive, status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        const updated = data.category;
        setCategories(prev => prev.map(c => c.id === cat.id ? updated : c));
        addToast(`Category "${cat.name}" is now ${nextStatus}!`, 'success');
        if (refreshCategories) refreshCategories();
        if (refreshTools) refreshTools();
      }
    } catch (err) {
      addToast('Failed to toggle category status', 'error');
    }
  };

  const handleToggleToolStatus = async (tool) => {
    const currentActive = tool.is_active !== undefined ? Boolean(tool.is_active) : (tool.status === 'Active');
    const nextActive = !currentActive;
    const nextStatus = nextActive ? 'Active' : 'Inactive';
    try {
      const res = await fetch(apiUrl(`/api/products/${tool.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, is_active: nextActive })
      });
      const data = await res.json();
      if (data.success) {
        const updatedTool = data.product || data.tool;
        setTools(prev => prev.map(t => t.id === tool.id ? updatedTool : t));
        addToast(`Product "${tool.name}" status changed to ${nextStatus}!`, 'success');
        if (refreshTools) refreshTools();
      }
    } catch (err) {
      addToast('Failed to update product status', 'error');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // PUT update in Laravel
        const res = await fetch(apiUrl(`/api/categories/${editingCategory.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryFormData)
        });
        const data = await res.json();
        if (data.success) {
          setCategories(prev => prev.map(c => c.id === editingCategory.id ? data.category : c));
          addToast(`Category "${categoryFormData.name}" updated in database!`, 'success');
        }
      } else {
        // POST create in Laravel
        const res = await fetch(apiUrl('/api/categories'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryFormData)
        });
        const data = await res.json();
        if (data.success) {
          setCategories(prev => [...prev, data.category]);
          addToast(`Category "${categoryFormData.name}" saved to Laravel database!`, 'success');
        }
      }
      setIsCategoryModalOpen(false);
      await loadBackendData();
      if (refreshCategories) refreshCategories();
      if (refreshTools) refreshTools();
    } catch (err) {
      addToast('Error saving category to database', 'error');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? Associated products will become uncategorized.`)) return;
    try {
      await fetch(apiUrl(`/api/categories/${id}`), { method: 'DELETE' });
      setCategories(prev => prev.filter(c => String(c.id) !== String(id) && c.slug !== id));
      await loadBackendData();
      if (refreshCategories) refreshCategories();
      if (refreshTools) refreshTools();
      addToast(`Category "${name}" deleted from database`, 'info');
    } catch (err) {
      setCategories(prev => prev.filter(c => String(c.id) !== String(id) && c.slug !== id));
      addToast(`Category "${name}" removed from view`, 'info');
    }
  };

  // --- Product CRUD Operations ---
  const handleOpenAddTool = () => {
    setEditingTool(null);
    setToolFormData({
      name: '',
      category: categories[0]?.slug || 'llm',
      badge: 'NEW',
      priceMonthly: 29,
      priceLifetime: 199,
      shortDesc: '',
      capabilities: 'Neural Processing, Low Latency, 24/7 API',
      status: 'Active'
    });
    setIsToolModalOpen(true);
  };

  const handleOpenEditTool = (tool) => {
    setEditingTool(tool);
    const catObj = (tool.category && typeof tool.category === 'object') ? tool.category : null;
    const toolStatus = tool.status || (tool.is_active !== false ? 'Active' : 'Inactive');
    setToolFormData({
      name: tool.name,
      category: tool.category_slug || catObj?.slug || (typeof tool.category === 'string' ? tool.category : (categories[0]?.slug || 'llm')),
      badge: tool.badge || 'PRO',
      priceMonthly: tool.priceMonthly || tool.price_monthly || 29,
      priceLifetime: tool.priceLifetime || tool.price_lifetime || 199,
      shortDesc: tool.shortDesc || tool.short_desc || '',
      capabilities: Array.isArray(tool.capabilities) ? tool.capabilities.join(', ') : (tool.capabilities || ''),
      status: toolStatus
    });
    setIsToolModalOpen(true);
  };

  const handleSaveTool = async (e) => {
    e.preventDefault();
    const payload = {
      ...toolFormData,
      status: toolFormData.status || 'Active',
      is_active: toolFormData.status === 'Active',
      capabilities: toolFormData.capabilities.split(',').map(s => s.trim()).filter(Boolean),
      priceMonthly: Number(toolFormData.priceMonthly),
      priceLifetime: Number(toolFormData.priceLifetime)
    };

    try {
      if (editingTool) {
        // PUT update in Laravel
        const res = await fetch(apiUrl(`/api/products/${editingTool.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          const updatedTool = data.product || data.tool;
          setTools(prev => prev.map(t => t.id === editingTool.id ? updatedTool : t));
          addToast(`Updated ${payload.name} in Laravel database!`, 'success');
        }
      } else {
        // POST create in Laravel
        const res = await fetch(apiUrl('/api/products'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          const newTool = data.product || data.tool;
          setTools(prev => [newTool, ...prev]);
          addToast(`Added new product to Laravel database: ${payload.name}`, 'success');
        }
      }
      setIsToolModalOpen(false);
      await loadBackendData();
      if (refreshTools) refreshTools();
      if (refreshCategories) refreshCategories();
    } catch (err) {
      addToast('Error saving product to Laravel database', 'error');
    }
  };

  const handleDeleteTool = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the database?`)) return;
    try {
      await fetch(apiUrl(`/api/products/${id}`), { method: 'DELETE' });
      setTools(prev => prev.filter(t => String(t.id) !== String(id) && t.slug !== id && t.product_id !== id));
      await loadBackendData();
      if (refreshTools) refreshTools();
      if (refreshCategories) refreshCategories();
      addToast(`Deleted "${name}" from database`, 'info');
    } catch (err) {
      addToast('Error deleting product', 'error');
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId, orderNum) => {
    const label = orderNum || orderId;
    if (!window.confirm(`Are you sure you want to delete order "${label}" from database?`)) return;
    try {
      await fetch(apiUrl(`/api/orders/${orderId}`), { method: 'DELETE' });
      setOrders(prev => prev.filter(o => String(o.id) !== String(orderId) && String(o.order_number) !== String(orderId)));
      addToast(`Deleted order "${label}"`, 'info');
    } catch (err) {
      setOrders(prev => prev.filter(o => String(o.id) !== String(orderId) && String(o.order_number) !== String(orderId)));
      addToast(`Removed order "${label}"`, 'info');
    }
  };

  // Delete Subscriber
  const handleDeleteSubscriber = async (subId, email) => {
    if (!window.confirm(`Are you sure you want to remove subscriber "${email || subId}"?`)) return;
    try {
      await fetch(apiUrl(`/api/subscribers/${subId}`), { method: 'DELETE' });
      setSubscribers(prev => prev.filter(s => String(s.id) !== String(subId) && s.email !== email));
      addToast('Subscriber removed from database', 'info');
    } catch (err) {
      setSubscribers(prev => prev.filter(s => String(s.id) !== String(subId) && s.email !== email));
      addToast('Subscriber removed from view', 'info');
    }
  };

  // Bulk Clear Orders
  const handleClearAllOrders = async () => {
    if (!window.confirm(`Are you sure you want to delete ALL ${orders.length} orders from the database? This cannot be undone.`)) return;
    try {
      await fetch(apiUrl('/api/orders/bulk'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      setOrders([]);
      addToast('All orders cleared from database', 'info');
    } catch (err) {
      setOrders([]);
      addToast('Orders cleared from view', 'info');
    }
  };

  // Bulk Clear Subscribers
  const handleClearAllSubscribers = async () => {
    if (!window.confirm(`Are you sure you want to remove ALL ${subscribers.length} subscribers from the database?`)) return;
    try {
      await fetch(apiUrl('/api/subscribers/bulk'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true })
      });
      setSubscribers([]);
      addToast('All subscribers cleared from database', 'info');
    } catch (err) {
      setSubscribers([]);
      addToast('Subscribers cleared from view', 'info');
    }
  };

  // Order Status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(apiUrl(`/api/orders/${orderId}/status`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        addToast(`Order ${orderId} marked as ${newStatus}`, 'success');
      }
    } catch (err) {
      addToast('Failed to update order status', 'error');
    }
  };

  // Save Settings (ABA Payway Link, Banner, Gateways)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl('/api/settings'), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...getDeviceHeaders()
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        addToast('✅ Store & Gateway settings saved to Laravel database!', 'success');
      } else {
        addToast(data.message || 'Error saving settings: Device may be restricted.', 'error');
      }
    } catch (err) {
      addToast('Error saving settings', 'error');
    }
  };

  // Toggle Single Device Privacy Lock (with optimistic state & spam-click prevention)
  const handleToggleSingleDevice = async () => {
    if (togglingSingleDevice) return;

    const prevLocked = Boolean(settings.singleDeviceLocked);
    const nextLocked = !prevLocked;

    // 1. Instant optimistic update so UI switch animates with 0ms lag
    setSettings(prev => ({ ...prev, singleDeviceLocked: nextLocked }));
    setTogglingSingleDevice(true);

    try {
      const res = await fetch(apiUrl('/api/settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getDeviceHeaders()
        },
        body: JSON.stringify({ singleDeviceLocked: nextLocked })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(prev => ({ ...prev, ...data.settings, singleDeviceLocked: nextLocked }));
        addToast(nextLocked ? '🔒 Single Device Lock Activated: Settings hidden on other devices!' : '🔓 Single Device Lock Disabled: Settings visible on all devices.', 'info');
      } else {
        // Rollback state if server returns error
        setSettings(prev => ({ ...prev, singleDeviceLocked: prevLocked }));
        addToast(data.message || 'Failed to update setting', 'error');
      }
    } catch {
      // Rollback state if network failed
      setSettings(prev => ({ ...prev, singleDeviceLocked: prevLocked }));
      addToast('Error communicating with backend', 'error');
    } finally {
      setTogglingSingleDevice(false);
    }
  };

  // Authorize Current Device as Primary
  const handleAuthorizeThisDevice = async () => {
    setAuthorizingDevice(true);
    try {
      const res = await fetch(apiUrl('/api/settings/authorize-device'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getDeviceHeaders()
        },
        body: JSON.stringify({
          device_id: getDeviceId(),
          device_name: getDeviceName()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(`🛡️ ${data.message}`, 'success');
        await loadBackendData();
      } else {
        addToast(data.message || 'Could not authorize device', 'error');
      }
    } catch {
      addToast('Error authorizing device', 'error');
    } finally {
      setAuthorizingDevice(false);
    }
  };

  // Dispatch Test New Device Login Alert to Telegram
  const handleTestDeviceAlert = async () => {
    setTestingDeviceAlert(true);
    try {
      const res = await fetch(apiUrl('/api/settings/test-device-alert'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getDeviceHeaders()
        },
        body: JSON.stringify({
          device_id: getDeviceId(),
          device_name: getDeviceName()
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('✈️ Test New Device alert dispatched to Telegram!', 'success');
      } else {
        addToast(data.message || 'Telegram alert test failed', 'error');
      }
    } catch {
      addToast('Network error connecting to backend', 'error');
    } finally {
      setTestingDeviceAlert(false);
    }
  };

  // Test Direct Connection to Telegram Security Group (gp)
  const handleTestDeviceGroupAlert = async () => {
    setTestingTelegramGroup(true);
    setTelegramGroupTestResult(null);
    try {
      const res = await fetch(apiUrl('/api/settings/test-telegram-group'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getDeviceHeaders()
        },
        body: JSON.stringify({
          telegramDeviceChatId: settings.telegramDeviceChatId,
          telegramDeviceBotToken: settings.telegramDeviceBotToken
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(`✅ ${data.message}`, 'success');
        setTelegramGroupTestResult({ success: true, message: data.message });
      } else {
        addToast(`❌ ${data.message || 'Failed to send alert to Telegram Group'}`, 'error');
        setTelegramGroupTestResult({ success: false, message: data.message });
      }
    } catch {
      addToast('Network error connecting to backend', 'error');
      setTelegramGroupTestResult({ success: false, message: 'Network connection error' });
    } finally {
      setTestingTelegramGroup(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(settings.abaPayLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    addToast('ABA Payway link copied to clipboard!', 'info');
  };

  const handleTestKhqr = async () => {
    setKhqrTesting(true);
    setKhqrTestResult(null);
    try {
      const res = await fetch(apiUrl('/api/payment/khqr/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1.00,
          customerName: 'Admin Connection Test',
          customerEmail: 'admin@synapse.ai',
          items: ['Admin Gateway Connectivity Test']
        })
      });
      const data = await res.json();
      setKhqrTestResult(data);
      if (data.success) {
        addToast('✅ KHQR signed request generated successfully!', 'success');
      } else {
        addToast('⚠️ KHQR test failed: ' + (data.message || 'Error'), 'error');
      }
    } catch (err) {
      addToast('Error communicating with KHQR backend', 'error');
    } finally {
      setKhqrTesting(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      addToast('Please enter both Telegram Bot Token and Chat ID', 'error');
      return;
    }
    setTelegramTesting(true);
    setTelegramTestResult(null);

    try {
      const res = await fetch(apiUrl('/api/settings/test-telegram'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: settings.telegramBotToken,
          chat_id: settings.telegramChatId
        })
      });
      const data = await res.json();
      if (data.success) {
        setTelegramTestResult({ success: true, message: data.message });
        addToast('🎉 Telegram test alert delivered successfully!', 'success');
      } else {
        setTelegramTestResult({ success: false, message: data.message || 'Failed to send test alert' });
        addToast(data.message || 'Telegram test failed', 'error');
      }
    } catch (err) {
      console.error('Telegram test request failed:', err);
      setTelegramTestResult({ success: false, message: 'Could not connect to backend server' });
      addToast('Failed to connect to backend server', 'error');
    } finally {
      setTelegramTesting(false);
    }
  };

  const handleTestPlasgate = async () => {
    if (!settings.plasgatePrivateKey || !settings.plasgateSecretKey) {
      addToast('Please enter both Plasgate Private Key and Secret Key in settings', 'error');
      return;
    }
    if (!plasgateTestPhone) {
      addToast('Please enter a phone number to test SMS sending', 'error');
      return;
    }
    setPlasgateTesting(true);
    setPlasgateTestResult(null);

    try {
      const res = await fetch(apiUrl('/api/settings/test-plasgate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: plasgateTestPhone,
          private_key: settings.plasgatePrivateKey,
          secret_key: settings.plasgateSecretKey,
          sender: settings.plasgateSenderId || 'SMS Info'
        })
      });
      const data = await res.json();
      if (data.success) {
        setPlasgateTestResult({ success: true, message: data.message, phone: data.normalized_phone });
        addToast('🎉 Plasgate test SMS sent successfully!', 'success');
      } else {
        setPlasgateTestResult({ success: false, message: data.message || 'Failed to send test SMS', phone: data.normalized_phone });
        addToast(data.message || 'Plasgate SMS test failed', 'error');
      }
    } catch (err) {
      console.error('Plasgate test request failed:', err);
      setPlasgateTestResult({ success: false, message: 'Could not connect to backend server' });
      addToast('Failed to connect to backend server', 'error');
    } finally {
      setPlasgateTesting(false);
    }
  };

  // Filtered products list
  const filteredTools = tools.filter(t => {
    const nameStr = String(t.name || '').toLowerCase();
    const descStr = String(t.shortDesc || t.short_desc || '').toLowerCase();
    const query = (searchTerm || '').toLowerCase();
    const matchesSearch = !query || nameStr.includes(query) || descStr.includes(query);

    const toolCat = String(t.category_slug || t.category || t.category_id || '').toLowerCase();
    const selectedCat = String(selectedCategoryFilter || 'all').toLowerCase();
    const matchesCat = selectedCat === 'all' || toolCat === selectedCat || String(t.category_id) === selectedCat;

    const toolActive = t.is_active !== undefined ? Boolean(t.is_active) : (String(t.status || 'Active').toLowerCase() === 'active');
    const matchesStatus = selectedStatusFilter === 'all' ||
      (selectedStatusFilter === 'Active' && toolActive) ||
      (selectedStatusFilter === 'Inactive' && !toolActive);

    return matchesSearch && matchesCat && matchesStatus;
  });

  const getCategoryDetails = (catVal) => {
    if (!catVal && catVal !== 0) {
      return { name: 'GENERAL', color: '#8b5cf6', slug: 'general' };
    }
    // Handle relation object from Laravel
    if (typeof catVal === 'object' && catVal !== null) {
      const slug = catVal.slug || String(catVal.id || 'general');
      const name = catVal.name || slug.toUpperCase();
      const color = catVal.color || '#8b5cf6';
      return { name, color, slug };
    }
    const slugStr = String(catVal).toLowerCase();
    const found = categories.find(c => 
      String(c.slug || '').toLowerCase() === slugStr || 
      String(c.id) === String(catVal) || 
      String(c.name || '').toLowerCase() === slugStr
    );
    if (found) return found;
    return {
      name: String(catVal).toUpperCase(),
      color: '#8b5cf6',
      slug: slugStr
    };
  };

  return (
    <div className="admin-root-container">
      <div className="admin-wrapper">
        {/* Top Control Bar */}
        <header className="admin-top-nav">
          <div className="admin-badge-logo">
            <div className="logo-symbol-admin">
              <img src="/favicon.svg" alt="Dyzzstore Logo" width="22" height="22" style={{ borderRadius: '50%' }} />
            </div>
            <div>
              <span className="admin-title">DYZZSTORE CONTROL CENTER</span>
              <span className="admin-sub-tag">Laravel 12 REST API & Database Control</span>
            </div>
          </div>

          <div className="admin-nav-actions">
            <div className="server-status-pill">
              <span className="dot-pulse-green"></span>
              <span>Laravel 12 (SQLite DB) Online • 127.0.0.1:8000</span>
            </div>

            <button
              className="btn-admin-refresh"
              onClick={loadBackendData}
              title="Sync with Laravel Database"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Sync DB</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={onCloseAdmin}
              title="Return to Public Storefront"
            >
              <ArrowLeft size={14} />
              <span>Back to Store</span>
            </button>

            <button
              className="btn btn-outline btn-sm text-danger"
              onClick={onLogout}
              title="Sign out of Admin session"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        <div className="admin-layout-body">
          {/* Left Navigation Sidebar */}
          <aside className="admin-sidebar">
            <nav className="admin-menu">
              <button
                className={`admin-menu-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </button>

              <button
                className={`admin-menu-item ${activeTab === 'tools' ? 'active' : ''}`}
                onClick={() => setActiveTab('tools')}
              >
                <Boxes size={18} />
                <span>Products & AI Tools ({tools.length})</span>
              </button>

              <button
                className={`admin-menu-item ${activeTab === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveTab('categories')}
              >
                <FolderKanban size={18} />
                <span>Categories ({categories.length})</span>
              </button>

              <button
                className={`admin-menu-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingCart size={18} />
                <span>Customer Orders & KHQR ({orders.length})</span>
                {pendingActivationCount > 0 && (
                  <span className="badge-pending-order-count">
                    {pendingActivationCount} NEW
                  </span>
                )}
              </button>

              <button
                className={`admin-menu-item ${activeTab === 'subscribers' ? 'active' : ''}`}
                onClick={() => setActiveTab('subscribers')}
              >
                <Users size={18} />
                <span>Customer Directory ({subscribers.length})</span>
              </button>

              {/* Settings Tab Menu - Hidden if Single Device Locked AND not on primary device */}
              {(!settings.singleDeviceLocked || settings.isPrimaryDevice) && (
                <button
                  className={`admin-menu-item ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('settings')}
                >
                  <Settings size={18} />
                  <span>Cambodia KHQR & Settings</span>
                  {settings.singleDeviceLocked && (
                    <span className="badge-primary-pill" title="Strict Single Device Security: Only your authorized primary device can view and modify platform settings">
                      <ShieldCheck size={11} className="inline mr-1" />
                      MY DEVICE ONLY
                    </span>
                  )}
                </button>
              )}
            </nav>

          </aside>

          {/* Main Content Area */}
          <main className="admin-content-area">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="admin-tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h2>Platform Performance & Telemetry</h2>
                    <p>Live metrics synchronized in real-time from the Laravel SQLite database.</p>
                  </div>
                  <div className="tab-header-actions">
                    <div className="db-indicator-chip">
                      <Database size={14} className="text-cyan inline mr-1" />
                      <span>Database: <strong>database/database.sqlite</strong></span>
                    </div>
                  </div>
                </div>

                {/* KPI Metrics 4-Card Grid */}
                <div className="admin-metrics-grid">
                  <div className="admin-metric-card metric-card-revenue">
                    <div className="metric-header">
                      <span>Total Platform Revenue</span>
                      <div className="metric-icon-wrap icon-revenue">
                        <DollarSign size={20} />
                      </div>
                    </div>
                    <div className="metric-val">{formatPrice(stats.totalRevenue || 3336.99)}</div>
                    <div className="metric-trend up">
                      <TrendingUp size={14} /> +24.8% from last month
                    </div>
                  </div>

                  <div className="admin-metric-card metric-card-products">
                    <div className="metric-header">
                      <span>Managed Products</span>
                      <div className="metric-icon-wrap icon-products">
                        <Boxes size={20} />
                      </div>
                    </div>
                    <div className="metric-val">{tools.length}</div>
                    <div className="metric-trend info">Across {categories.length} active categories</div>
                  </div>

                  <div className="admin-metric-card metric-card-categories">
                    <div className="metric-header">
                      <span>Product Categories</span>
                      <div className="metric-icon-wrap icon-categories">
                        <FolderKanban size={20} />
                      </div>
                    </div>
                    <div className="metric-val">{categories.length}</div>
                    <div className="metric-trend info">LLM, Vision, Code, Audio, Video, Agents</div>
                  </div>

                  <div className="admin-metric-card metric-card-khqr">
                    <div className="metric-header">
                      <span>Cambodia KHQR Volume</span>
                      <div className="metric-icon-wrap icon-khqr">
                        <SmartphoneNfc size={20} />
                      </div>
                    </div>
                    <div className="metric-val">{orders.length} Orders</div>
                    <div className="metric-trend up">
                      <ShieldCheck size={14} /> Instant KHQR verification
                    </div>
                  </div>
                </div>

                {/* System Architecture Strip */}
                <div className="admin-system-strip">
                  <div className="system-strip-item">
                    <div className="system-strip-dot online"></div>
                    <div>
                      <div className="system-strip-title">Laravel 12 API</div>
                      <div className="system-strip-sub">REST Endpoints 127.0.0.1:8000</div>
                    </div>
                  </div>
                  <div className="system-strip-item">
                    <div className="system-strip-dot online"></div>
                    <div>
                      <div className="system-strip-title">SQLite Database</div>
                      <div className="system-strip-sub">Local ACID storage synchronized</div>
                    </div>
                  </div>
                  <div className="system-strip-item">
                    <div className="system-strip-dot online"></div>
                    <div>
                      <div className="system-strip-title">Cambodia KHQR Gateway</div>
                      <div className="system-strip-sub">Merchant: dyzz (National Standard)</div>
                    </div>
                  </div>
                  <div className="system-strip-item">
                    <div className="system-strip-dot online"></div>
                    <div>
                      <div className="system-strip-title">Currency Engines</div>
                      <div className="system-strip-sub">USD ($) & KHR (៛) Active</div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="admin-card-section mt-4">
                  <div className="card-section-header">
                    <div>
                      <h3>Recent Transactions from Database</h3>
                      <p className="card-section-sub">Latest customer purchases processed via Cambodia National KHQR.</p>
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('orders')}>
                      <span>View All Orders</span>
                      <ArrowRight size={14} className="ml-1 inline" />
                    </button>
                  </div>

                  <div className="admin-table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order Number</th>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Payment Gateway</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id}>
                            <td><code className="order-code-badge">{o.order_number || o.id}</code></td>
                            <td>
                              <div className="customer-cell-wrap">
                                <div className="customer-avatar-mini">
                                  {(o.customer_name || o.customerName || 'C')[0].toUpperCase()}
                                </div>
                                <div>
                                  <strong>{o.customer_name || o.customerName || 'Anonymous Customer'}</strong>
                                  <div className="sub-text">{o.customer_email || o.customerEmail || 'No email provided'}</div>
                                </div>
                              </div>
                            </td>
                            <td><strong className="text-emerald">${Number(o.amount).toFixed(2)}</strong></td>
                            <td>
                              <span className="gateway-khqr-tag">
                                Cambodia KHQR
                              </span>
                            </td>
                            <td>
                              <span className={`status-pill ${String(o.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                <span className="status-dot-mini"></span>
                                {o.status}
                              </span>
                            </td>
                            <td><span className="text-muted">{o.created_at ? new Date(o.created_at).toLocaleDateString() : (o.date || 'Today')}</span></td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan="6" className="text-center py-4 text-muted">
                              No transactions recorded yet in the database.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS INVENTORY (CRUD) */}
            {activeTab === 'tools' && (
              <div className="admin-tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h2>Products & AI Tools Management</h2>
                    <p>Add new products, configure categories, pricing, capabilities, and publish to the live store.</p>
                  </div>
                  <button className="btn btn-primary btn-glow" onClick={handleOpenAddTool}>
                    <Plus size={16} />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Toolbar: Search + Category Filter */}
                <div className="admin-toolbar-row">
                  <div className="admin-search-box">
                    <Search size={15} />
                    <input
                      type="text"
                      placeholder="Search by product name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="admin-filter-group">
                    <label>Filter by Category:</label>
                    <select
                      className="admin-select"
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    >
                      <option value="all">All Categories ({tools.length})</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>
                          {c.name} ({c.products_count ?? tools.filter(t => t.category === c.slug || t.category_slug === c.slug).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-filter-group">
                    <label>Filter by Status:</label>
                    <select
                      className="admin-select"
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses ({tools.length})</option>
                      <option value="Active">Active ({tools.filter(t => t.is_active !== false && String(t.status || 'Active').toLowerCase() === 'active').length})</option>
                      <option value="Inactive">Inactive ({tools.filter(t => t.is_active === false || String(t.status || '').toLowerCase() === 'inactive').length})</option>
                    </select>
                  </div>

                  <span className="results-label">Showing {filteredTools.length} of {tools.length} Products</span>
                </div>

                <div className="admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>License Price</th>
                        <th>Rating</th>
                        <th>Status</th>
                        <th>Date Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTools.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                              <Boxes size={36} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>No Products Found</div>
                              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                                {searchTerm ? `No tools match "${searchTerm}".` : 'No products found matching filters.'}
                              </p>
                              <button className="btn btn-secondary btn-sm mt-1" onClick={() => { setSearchTerm(''); setSelectedCategoryFilter('all'); setSelectedStatusFilter('all'); }}>
                                Clear Filters
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredTools.map(tool => {
                          const cat = getCategoryDetails(tool.category || tool.category_slug || tool.category_id);
                          const currentStatus = tool.status || (tool.is_active !== false ? 'Active' : 'Inactive');
                          return (
                            <tr key={tool.id}>
                              <td>
                                <div className="tool-name-cell">
                                  <span className="tool-color-dot" style={{ background: tool.color || cat.color || '#8b5cf6' }}></span>
                                  <div>
                                    <strong>{tool.name}</strong>
                                    {tool.badge && <span className="tool-badge-small ml-2">{tool.badge}</span>}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span 
                                  className="category-badge-chip"
                                  style={{ 
                                    backgroundColor: `${cat.color}20`,
                                    borderColor: `${cat.color}50`,
                                    color: cat.color 
                                  }}
                                >
                                  {cat.name}
                                </span>
                              </td>
                              <td><strong>${tool.priceLifetime || tool.price_lifetime || tool.price || 199}</strong></td>
                              <td>★ {tool.rating || '4.95'}</td>
                              <td>
                                <button
                                  type="button"
                                  className={`status-pill clickable-toggle ${currentStatus.toLowerCase()}`}
                                  onClick={() => handleToggleToolStatus(tool)}
                                  title={`Status: ${currentStatus}. Click to toggle Active / Inactive`}
                                >
                                  <span className="status-dot-mini"></span>
                                  {currentStatus}
                                </button>
                              </td>
                              <td>
                                <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                                  {tool.created_at ? new Date(tool.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                                </span>
                              </td>
                              <td>
                                <div className="table-actions-group">
                                  <button
                                    className="btn-table-action edit"
                                    onClick={() => handleOpenEditTool(tool)}
                                    title="Edit Product Details"
                                  >
                                    <Edit3 size={15} />
                                  </button>
                                  <button
                                    className="btn-table-action delete"
                                    onClick={() => handleDeleteTool(tool.id, tool.name)}
                                    title="Delete Product"
                                  >
                                    <Trash2 size={15} />
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

            {/* TAB 3: CATEGORIES MANAGEMENT (CRUD) */}
            {activeTab === 'categories' && (
              <div className="admin-tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h2>Category & Taxonomy Management</h2>
                    <p>Organize products into intuitive categories with custom theme colors, badges, and display orders.</p>
                  </div>
                  <button className="btn btn-primary btn-glow" onClick={handleOpenAddCategory}>
                    <Plus size={16} />
                    <span>Create New Category</span>
                  </button>
                </div>

                {/* Categories Grid View */}
                <div className="categories-grid-cards">
                  {categories.map(cat => {
                    const prodCount = cat.products_count ?? tools.filter(t => t.category === cat.slug || t.category_slug === cat.slug).length;
                    return (
                      <div key={cat.id} className="admin-category-card" style={{ borderColor: `${cat.color}40` }}>
                        <div className="cat-card-top">
                          <div className="cat-icon-avatar" style={{ background: `${cat.color}25`, color: cat.color }}>
                            <FolderKanban size={22} />
                          </div>
                          <div className="cat-card-actions">
                            <button
                              type="button"
                              className={`status-pill clickable-toggle ${cat.is_active !== false ? 'active' : 'inactive'}`}
                              onClick={() => handleToggleCategoryStatus(cat)}
                              title={`Category status: ${cat.is_active !== false ? 'Active' : 'Inactive'}. Click to toggle.`}
                            >
                              <span className="status-dot-mini"></span>
                              {cat.is_active !== false ? 'Active' : 'Inactive'}
                            </button>
                            <button
                              className="btn-table-action edit"
                              onClick={() => handleOpenEditCategory(cat)}
                              title="Edit Category"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              className="btn-table-action delete"
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              title="Delete Category"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="cat-card-body">
                          <div className="cat-name-row">
                            <h3 className="cat-name">{cat.name}</h3>
                            {cat.badge && (
                              <span className="cat-badge" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                                {cat.badge}
                              </span>
                            )}
                          </div>
                          <code className="cat-slug-code">slug: {cat.slug}</code>
                          <p className="cat-desc">{cat.description || 'No description provided.'}</p>
                        </div>

                        <div className="cat-card-footer">
                          <span className="cat-count-pill">
                            <Boxes size={13} className="inline mr-1" /> {prodCount} {prodCount === 1 ? 'Product' : 'Products'}
                          </span>
                          {cat.created_at && (
                            <span className="text-muted" style={{ fontSize: '0.72rem', opacity: 0.8 }}>
                              {new Date(cat.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                          <span className="cat-color-dot-indicator" style={{ backgroundColor: cat.color }}></span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Categories Detailed Table */}
                <div className="admin-card-section mt-4">
                  <div className="card-section-header">
                    <h3>Database Categories Table</h3>
                  </div>

                  <div className="admin-table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Category Name</th>
                          <th>Slug</th>
                          <th>Theme Color</th>
                          <th>Products Count</th>
                          <th>Badge</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat, idx) => {
                          const prodCount = cat.products_count ?? tools.filter(t => t.category === cat.slug || t.category_slug === cat.slug).length;
                          return (
                            <tr key={cat.id}>
                              <td><strong>#{cat.display_order || idx + 1}</strong></td>
                              <td>
                                <div className="tool-name-cell">
                                  <span className="tool-color-dot" style={{ background: cat.color }}></span>
                                  <strong>{cat.name}</strong>
                                </div>
                              </td>
                              <td><code>{cat.slug}</code></td>
                              <td>
                                <div className="color-swatch-cell">
                                  <span className="color-circle" style={{ background: cat.color }}></span>
                                  <code>{cat.color}</code>
                                </div>
                              </td>
                              <td>
                                <span className="badge-neutral font-bold">{prodCount} Products</span>
                              </td>
                              <td>
                                {cat.badge ? <span className="cat-badge">{cat.badge}</span> : <span className="text-muted">—</span>}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className={`status-pill clickable-toggle ${cat.is_active !== false ? 'active' : 'inactive'}`}
                                  onClick={() => handleToggleCategoryStatus(cat)}
                                  title={`Status: ${cat.is_active !== false ? 'Active' : 'Inactive'}. Click to toggle.`}
                                >
                                  <span className="status-dot-mini"></span>
                                  {cat.is_active !== false ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td>
                                <div className="table-actions-group">
                                  <button
                                    className="btn-table-action edit"
                                    onClick={() => handleOpenEditCategory(cat)}
                                    title="Edit Category"
                                  >
                                    <Edit3 size={15} />
                                  </button>
                                  <button
                                    className="btn-table-action delete"
                                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                    title="Delete Category"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ORDERS & TRANSACTIONS */}
            {activeTab === 'orders' && (
              <div className="admin-tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h2>Customer Orders & Transactions</h2>
                    <p>Inspect issued API keys, verify payments, and monitor ABA PayWay gateway settlements.</p>
                  </div>
                  {orders.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleClearAllOrders}
                      title="Clear all orders in database"
                    >
                      <Trash2 size={14} className="mr-1" /> Clear All Orders ({orders.length})
                    </button>
                  )}
                </div>

                <div className="admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Purchased Items</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Activation Link (To Customer)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td><code>{o.order_number || o.id}</code></td>
                          <td>
                            <strong>{o.customer_name || o.customerName}</strong>
                            <div className="sub-text">{o.customer_email || o.customerEmail}</div>
                          </td>
                          <td>
                            {Array.isArray(o.items) ? o.items.join(', ') : o.items}
                          </td>
                          <td><strong>${o.amount}</strong></td>
                          <td>
                            <span className={
                              (o.payment_method || o.paymentMethod)?.includes('KHQR')
                                ? 'badge-khqr'
                                : (o.payment_method || o.paymentMethod)?.includes('ABA')
                                ? 'badge-aba'
                                : 'badge-neutral'
                            }>
                              {o.payment_method || o.paymentMethod}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill ${(o.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                              {o.status}
                            </span>
                          </td>
                          <td>
                            {o.activation_link ? (
                              <div className="activation-table-cell">
                                <span className="badge-activated-pill">
                                  <CheckCircle2 size={11} className="inline mr-1" /> Active
                                </span>
                                <div className="link-preview-box">
                                  <a href={o.activation_link} target="_blank" rel="noopener noreferrer" className="activation-table-link">
                                    <span>{o.activation_link}</span>
                                    <ExternalLink size={11} className="inline ml-1" />
                                  </a>
                                  <button
                                    type="button"
                                    className="btn-copy-mini"
                                    onClick={() => {
                                      navigator.clipboard.writeText(o.activation_link);
                                      addToast('Activation link copied!', 'info');
                                    }}
                                    title="Copy Link"
                                  >
                                    <Copy size={11} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-warning btn-xs btn-glow"
                                onClick={() => handleOpenActivateModal(o)}
                              >
                                <Zap size={12} className="mr-1" /> Publish Link
                              </button>
                            )}
                          </td>
                          <td>
                            <div className="table-actions-group">
                              <button
                                type="button"
                                className="btn-table-action activate"
                                onClick={() => handleOpenActivateModal(o)}
                                title={o.activation_link ? "Edit Activation Link" : "Publish Activation Link"}
                              >
                                <Key size={14} />
                              </button>
                              <select
                                className="status-select-sm"
                                value={o.status || 'Verified'}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              >
                                <option value="Activated">Activated</option>
                                <option value="Verified">Verified</option>
                                <option value="Pending Activation">Pending Activation</option>
                                <option value="Pending PayWay Checkout">Pending PayWay</option>
                                <option value="Refunded">Refunded</option>
                              </select>
                              <button
                                type="button"
                                className="btn-table-action delete"
                                onClick={() => handleDeleteOrder(o.id, o.order_number)}
                                title="Delete Order"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: ACTIVE SUBSCRIBERS */}
            {activeTab === 'subscribers' && (
              <div className="admin-tab-pane">
                <div className="tab-pane-header">
                  <div>
                    <h2>Active Subscribers</h2>
                    <p>Manage membership tiers, quota limits, and renewal dates.</p>
                  </div>
                  {subscribers.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleClearAllSubscribers}
                      title="Remove all subscribers from database"
                    >
                      <Trash2 size={14} className="mr-1" /> Remove All ({subscribers.length})
                    </button>
                  )}
                </div>

                <div className="admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Subscriber Name</th>
                        <th>Membership Plan</th>
                        <th>Token Consumption</th>
                        <th>Renewal Date</th>
                        <th>Payment Gateway</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map(sub => (
                        <tr key={sub.id}>
                          <td>
                            <strong>{sub.name}</strong>
                            <div className="sub-text">{sub.email}</div>
                          </td>
                          <td><span className="badge-plan-tier">{sub.plan}</span></td>
                          <td>
                            <div className="token-progress-cell">
                              <span>{(sub.tokens_used || sub.tokensUsed || 0).toLocaleString()} / {(sub.token_limit || sub.tokenLimit || 15000000).toLocaleString()}</span>
                            </div>
                          </td>
                          <td>{sub.renews_on || sub.renewsOn}</td>
                          <td>
                            <span className={(sub.payment_method || sub.paymentMethod)?.includes('ABA') ? 'badge-aba' : 'badge-neutral'}>
                              {sub.payment_method || sub.paymentMethod}
                            </span>
                          </td>
                          <td>
                            <span className="status-pill verified">{sub.status}</span>
                          </td>
                          <td>
                            <div className="table-actions-group">
                              <button
                                type="button"
                                className="btn-table-action delete"
                                onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                                title="Remove Subscriber"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 6: ABA PAYWAY & SETTINGS */}
            {activeTab === 'settings' && (
              <div className="admin-tab-pane">
                {settings.singleDeviceLocked && !settings.isPrimaryDevice ? (
                  <div className="settings-locked-screen">
                    <div className="settings-locked-card">
                      <div className="locked-icon-shield">
                        <ShieldAlert size={46} className="text-danger" />
                      </div>
                      <h3>Settings Hidden & Locked to Primary Device</h3>
                      <p className="locked-subtitle">
                        Single Device Security is active. Store configuration, Telegram tokens, and payment gateways are strictly hidden on this device.
                      </p>

                      <div className="locked-device-meta">
                        <div className="locked-meta-row">
                          <span className="text-muted">Current Device:</span>
                          <strong>{getDeviceName()}</strong>
                          <span className="badge-device-unauthorized">Unauthorized Device</span>
                        </div>
                        <div className="locked-meta-row">
                          <span className="text-muted">Current IP Address:</span>
                          <code className="text-danger font-semibold">{settings.clientIp || '127.0.0.1'}</code>
                        </div>
                        <div className="locked-meta-row">
                          <span className="text-muted">Device ID:</span>
                          <code>{getDeviceId()}</code>
                        </div>
                        <div className="locked-meta-row">
                          <span className="text-muted">Primary Authorized Device:</span>
                          <strong className="text-cyan">{settings.primaryDeviceName || 'Registered Primary Device'}</strong>
                        </div>
                        <div className="locked-meta-row">
                          <span className="text-muted">Primary Authorized IP:</span>
                          <code className="text-cyan">{settings.primaryDeviceIp || 'Protected'}</code>
                        </div>
                      </div>

                      <div className="locked-telegram-notice">
                        <BellRing size={15} className="text-cyan inline mr-1" />
                        <span>A security alert with your device & IP was dispatched to Telegram.</span>
                      </div>

                      <div className="locked-actions-group">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setActiveTab('overview')}
                        >
                          Return to Overview
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="tab-pane-header">
                      <div>
                        <h2>Global Store & Gateway Settings</h2>
                        <p>Configure the active ABA PayWay direct link, promo discount codes, and announcements.</p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveSettings} className="admin-settings-form">
                      {/* CARD 0: SINGLE DEVICE PRIVACY & TELEGRAM SECURITY LOCK */}
                      <div className="settings-card device-security-settings-card">
                        <div className="settings-card-header">
                          <div className="telegram-mini-badge-admin" style={{ background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.35)', color: '#38bdf8' }}>
                            <ShieldCheck size={16} />
                            <span>Device + IP Security</span>
                          </div>
                          <div>
                            <h4>Single Device Privacy & Telegram Login Alerts</h4>
                            <span className="text-xs text-muted">
                              Strictly hide this Settings menu on other devices. If any other device or IP logs in, an instant alert is pushed to Telegram.
                            </span>
                          </div>
                          <div className="telegram-header-controls ml-auto">
                            <span className={`status-badge-inline ${settings.singleDeviceLocked ? 'active' : 'inactive'}`}>
                              {settings.singleDeviceLocked ? '1-DEVICE LOCKED' : 'ALL DEVICES'}
                            </span>
                            <label className="toggle-switch-compact" title="Toggle Single Device Lock">
                              <input
                                type="checkbox"
                                checked={Boolean(settings.singleDeviceLocked)}
                                onChange={handleToggleSingleDevice}
                                disabled={togglingSingleDevice}
                              />
                              <span className={`slider-compact round ${togglingSingleDevice ? 'opacity-70' : ''}`}></span>
                            </label>
                          </div>
                        </div>

                        <div className="device-security-info-box">
                          <div className="device-info-grid">
                            <div className="device-info-col">
                              <span className="device-info-label">Active Device:</span>
                              <div className="device-info-val">
                                <Smartphone size={15} className="text-cyan inline mr-1" />
                                <strong>{getDeviceName()}</strong>
                                <span className="badge-primary-chip">This Device</span>
                              </div>
                            </div>
                            <div className="device-info-col">
                              <span className="device-info-label">Current IP Address:</span>
                              <div className="device-info-val">
                                <code className="text-cyan font-semibold">{settings.clientIp || '127.0.0.1'}</code>
                                <span className="badge-primary-chip" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.35)', color: '#10b981' }}>LIVE IP</span>
                              </div>
                            </div>
                            <div className="device-info-col">
                              <span className="device-info-label">Primary Device Status:</span>
                              <div className="device-info-val">
                                <span className="text-success font-semibold flex items-center gap-1">
                                  <CheckCircle2 size={15} /> Authorized Primary Device
                                </span>
                              </div>
                            </div>
                            <div className="device-info-col">
                              <span className="device-info-label">Primary Registered IP:</span>
                              <div className="device-info-val">
                                <code>{settings.primaryDeviceIp || settings.clientIp || '127.0.0.1'}</code>
                              </div>
                            </div>
                            <div className="device-info-col">
                              <span className="device-info-label">Device Identifier (ID):</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                                <code style={{ fontSize: '0.78rem', background: '#070a12', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                                  {getDeviceId()}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(getDeviceId());
                                    addToast('📋 Device ID copied to clipboard: ' + getDeviceId(), 'info');
                                  }}
                                  style={{
                                    background: 'rgba(56, 189, 248, 0.1)',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                    color: '#38bdf8',
                                    borderRadius: '6px',
                                    padding: '3px 8px',
                                    fontSize: '0.72rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Copy Device ID"
                                >
                                  <Copy size={12} />
                                  <span>Copy</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="device-actions-row">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={handleAuthorizeThisDevice}
                              disabled={authorizingDevice}
                            >
                              <ShieldCheck size={14} className="inline mr-1 text-cyan" />
                              {authorizingDevice ? 'Authorizing...' : 'Authorize This Device + IP as Primary'}
                            </button>

                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={handleTestDeviceAlert}
                              disabled={testingDeviceAlert}
                            >
                              <ShieldAlert size={13} className="inline mr-1 text-danger" />
                              {testingDeviceAlert ? 'Sending Alert...' : 'Simulate Unauthorized Login Alert'}
                            </button>
                          </div>

                          {/* TELEGRAM ALERT GROUP (GP) SETUP */}
                          <div className="telegram-gp-security-section">
                            <div className="telegram-gp-sec-header">
                              <div className="telegram-gp-tag">
                                <Send size={13} />
                                <span>Telegram Alert Group (gp) Setup</span>
                              </div>
                              <span className="text-xs text-muted">
                                Route real-time login alerts, security warnings, and unauthorized intrusion alerts directly to a dedicated Telegram Group.
                              </span>
                            </div>

                            <div className="form-grid">
                              <div className="form-group">
                                <label className="flex items-center gap-1.5 font-medium">
                                  <span>Telegram Security Alert Group ID (Chat ID)</span>
                                  <span className="badge-hint">Recommended</span>
                                </label>
                                <input
                                  type="text"
                                  value={settings.telegramDeviceChatId || ''}
                                  onChange={(e) => setSettings({ ...settings, telegramDeviceChatId: e.target.value })}
                                  placeholder="e.g. -1002345678901 (Group Chat ID)"
                                  className="form-control"
                                />
                                <span className="input-hint text-xs">
                                  Create a Telegram Group, add your bot as an admin/member, and paste the Group ID here (starts with <code>-100...</code>). If blank, defaults to main Telegram Chat ID ({settings.telegramChatId || 'Not set'}).
                                </span>
                              </div>

                              <div className="form-group">
                                <label className="flex items-center justify-between font-medium">
                                  <span>Security Bot Token (Optional)</span>
                                  <button
                                    type="button"
                                    className="btn-text-xs"
                                    onClick={() => setShowTelegramDeviceToken(!showTelegramDeviceToken)}
                                  >
                                    {showTelegramDeviceToken ? <EyeOff size={13} className="inline mr-1" /> : <Eye size={13} className="inline mr-1" />}
                                    {showTelegramDeviceToken ? 'Hide' : 'Reveal'}
                                  </button>
                                </label>
                                <input
                                  type={showTelegramDeviceToken ? 'text' : 'password'}
                                  value={settings.telegramDeviceBotToken || ''}
                                  onChange={(e) => setSettings({ ...settings, telegramDeviceBotToken: e.target.value })}
                                  placeholder="Leave blank to use main store bot token"
                                  className="form-control"
                                />
                                <span className="input-hint text-xs">
                                  Leave empty to automatically use main store bot token ({settings.telegramBotToken ? '••••••••' + settings.telegramBotToken.slice(-6) : 'Configured in Telegram card below'}).
                                </span>
                              </div>
                            </div>

                            {/* ALERT TRIGGERS & SWITCHES */}
                            <div className="telegram-gp-switches-grid">
                              <label className="toggle-checkbox-card">
                                <input
                                  type="checkbox"
                                  checked={Boolean(settings.telegramDeviceAlertsEnabled ?? true)}
                                  onChange={(e) => setSettings({ ...settings, telegramDeviceAlertsEnabled: e.target.checked })}
                                />
                                <div className="toggle-card-content">
                                  <strong>Enable Telegram Security Alerts</strong>
                                  <span className="text-xs text-muted">Master switch for real-time security alerts pushed to Telegram.</span>
                                </div>
                              </label>

                              <label className="toggle-checkbox-card">
                                <input
                                  type="checkbox"
                                  checked={Boolean(settings.telegramAlertOnNewDevice ?? true)}
                                  onChange={(e) => setSettings({ ...settings, telegramAlertOnNewDevice: e.target.checked })}
                                />
                                <div className="toggle-card-content">
                                  <strong>🚨 Alert on Another / New Device Login</strong>
                                  <span className="text-xs text-muted">Push instant high-priority red alert if an unrecognized device or IP logs in.</span>
                                </div>
                              </label>

                              <label className="toggle-checkbox-card">
                                <input
                                  type="checkbox"
                                  checked={Boolean(settings.telegramAlertOnPrimaryLogin ?? true)}
                                  onChange={(e) => setSettings({ ...settings, telegramAlertOnPrimaryLogin: e.target.checked })}
                                />
                                <div className="toggle-card-content">
                                  <strong>🔔 Notice on Primary Device Login</strong>
                                  <span className="text-xs text-muted">Push verified login confirmation when this authorized device logs in.</span>
                                </div>
                              </label>
                            </div>

                            {/* ACTIONS ROW */}
                            <div className="telegram-gp-actions-row">
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={handleTestDeviceGroupAlert}
                                disabled={testingTelegramGroup}
                              >
                                <Send size={13} className="inline mr-1" />
                                {testingTelegramGroup ? 'Testing Group Connection...' : '🚀 Test Send Alert to Telegram Group (gp)'}
                              </button>

                              {settings.telegramDeviceChatId && (
                                <span className="badge-gp-status active">
                                  <CheckCircle2 size={13} className="inline mr-1" />
                                  Target: Group {settings.telegramDeviceChatId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CARD 1: KHQR DIRECT GATEWAY SETTINGS */}
                      <div className="settings-card khqr-admin-settings-card">
                    <div className="settings-card-header">
                      <div className="khqr-mini-badge-admin">KHQR</div>
                      <div>
                        <h4>National KHQR Direct Gateway (khqr.cc)</h4>
                        <span className="text-xs text-muted">Dynamic payment link generation with SHA-1 cryptographic signature</span>
                      </div>
                      <span className="status-live-tag ml-auto">CONNECTED</span>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>KHQR Profile ID *</label>
                        <input
                          type="text"
                          required
                          value={settings.khqrProfileId || ''}
                          onChange={(e) => setSettings({ ...settings, khqrProfileId: e.target.value })}
                          placeholder="e.g. tW6PHjgPyzISFi3KK22hKZ57rag1cWHS"
                        />
                      </div>

                      <div className="form-group">
                        <label>KHQR Gateway Base URL *</label>
                        <input
                          type="url"
                          required
                          value={settings.khqrGatewayUrl || ''}
                          onChange={(e) => setSettings({ ...settings, khqrGatewayUrl: e.target.value })}
                          placeholder="https://khqr.cc/api/payment/requestv2/..."
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>KHQR Secret Key (for SHA-1 Hash Signature) *</label>
                      <div className="input-with-action">
                        <input
                          type={showSecretKey ? "text" : "password"}
                          required
                          value={settings.khqrSecretKey || ''}
                          onChange={(e) => setSettings({ ...settings, khqrSecretKey: e.target.value })}
                          placeholder="Enter secret key..."
                        />
                        <button
                          type="button"
                          className="btn-toggle-eye"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          title={showSecretKey ? "Hide key" : "Show key"}
                        >
                          {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <span className="input-hint">
                        Algorithm: <code>sha1(secretKey + transaction_id + amount + remark)</code>. Kept securely in Laravel.
                      </span>
                    </div>

                    {/* Live Signature & Gateway Tester */}
                    <div className="khqr-test-panel">
                      <div className="khqr-test-header">
                        <Zap size={16} className="text-accent" />
                        <strong>Live KHQR Gateway Connectivity Tester:</strong>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm ml-auto"
                          onClick={handleTestKhqr}
                          disabled={khqrTesting}
                        >
                          {khqrTesting ? <RefreshCw size={13} className="spin-icon inline mr-1" /> : <Zap size={13} className="inline mr-1" />}
                          {khqrTesting ? 'Testing Signature...' : 'Generate Live Test Link ($1.00)'}
                        </button>
                      </div>

                      {khqrTestResult && (
                        <div className="khqr-test-result-box">
                          <div className="test-result-row">
                            <span>Status:</span>
                            <span className="text-success font-semibold">✓ Generated & Signed OK</span>
                          </div>
                          <div className="test-result-row">
                            <span>Test Transaction ID:</span>
                            <code>{khqrTestResult.transaction_id}</code>
                          </div>
                          <div className="test-result-row">
                            <span>Generated Hash:</span>
                            <code className="text-cyan">{khqrTestResult.hash}</code>
                          </div>
                          <div className="test-result-row">
                            <span>Checkout URL:</span>
                            <a 
                              href={khqrTestResult.checkout_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-xs"
                            >
                              Open Live Test Checkout <ExternalLink size={11} className="inline" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD 2: TELEGRAM ORDER & PAYMENT ALERTS */}
                  <div className="settings-card telegram-admin-settings-card mt-4">
                    <div className="settings-card-header">
                      <div className="telegram-mini-badge-admin">
                        <Send size={15} />
                        <span>Telegram</span>
                      </div>
                      <div>
                        <h4>Telegram Order & Payment Alerts</h4>
                        <span className="text-xs text-muted">
                          Receive instant push notifications on your Telegram for new orders, activations, and payments
                        </span>
                      </div>
                      <div className="telegram-header-controls ml-auto">
                        <span className={`status-badge-inline ${settings.telegramEnabled ? 'active' : 'inactive'}`}>
                          {settings.telegramEnabled ? 'ALERTS ON' : 'MUTED'}
                        </span>
                        <label className="toggle-switch-compact" title="Toggle Telegram Notifications">
                          <input
                            type="checkbox"
                            checked={Boolean(settings.telegramEnabled)}
                            onChange={(e) => setSettings({ ...settings, telegramEnabled: e.target.checked })}
                          />
                          <span className="slider-compact round"></span>
                        </label>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Telegram Bot Token ($token) *</label>
                        <div className="input-with-action">
                          <input
                            type={showTelegramToken ? "text" : "password"}
                            value={settings.telegramBotToken || ''}
                            onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                            placeholder="e.g. 7123456789:AAHxyzYourBotTokenHere"
                          />
                          <button
                            type="button"
                            className="btn-toggle-eye"
                            onClick={() => setShowTelegramToken(!showTelegramToken)}
                            title={showTelegramToken ? "Hide token" : "Show token"}
                          >
                            {showTelegramToken ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <span className="input-hint">
                          Created via <strong>@BotFather</strong> on Telegram using <code>/newbot</code> command.
                        </span>
                      </div>

                      <div className="form-group">
                        <label>Telegram Chat ID ($chat_id) *</label>
                        <input
                          type="text"
                          value={settings.telegramChatId || ''}
                          onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                          placeholder="e.g. 987654321 or -1001234567890"
                        />
                        <span className="input-hint">
                          Your private user ID, group, or channel ID (e.g. from <strong>@userinfobot</strong> or <strong>@getidsbot</strong>).
                        </span>
                      </div>
                    </div>

                    {/* Telegram Quick Setup Guide */}
                    <div className="telegram-quick-guide">
                      <div className="guide-title">
                        <BellRing size={14} className="text-cyan inline mr-1" />
                        <strong>Quick Setup Instructions:</strong>
                      </div>
                      <ol className="guide-steps">
                        <li>Message <strong>@BotFather</strong> on Telegram → send <code>/newbot</code> to get your <strong>$token</strong>.</li>
                        <li>Message <strong>@userinfobot</strong> or <strong>@getidsbot</strong> to copy your <strong>$chat_id</strong> (for channels/groups, add the bot as Admin).</li>
                        <li><strong>Important:</strong> Open your new bot and click <strong>Start</strong> so the bot is allowed to message you.</li>
                        <li>Paste your <strong>$token</strong> and <strong>$chat_id</strong> above, then click <strong>Send Test Telegram Alert</strong> below!</li>
                      </ol>
                    </div>

                    {/* Telegram Live Tester Panel */}
                    <div className="khqr-test-panel telegram-test-panel">
                      <div className="khqr-test-header">
                        <Send size={15} className="text-cyan" />
                        <strong>Telegram Bot Connectivity Tester:</strong>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm ml-auto"
                          onClick={handleTestTelegram}
                          disabled={telegramTesting}
                        >
                          {telegramTesting ? <RefreshCw size={13} className="spin-icon inline mr-1" /> : <Send size={13} className="inline mr-1" />}
                          {telegramTesting ? 'Sending Test...' : 'Send Test Telegram Alert'}
                        </button>
                      </div>

                      {telegramTestResult && (
                        <div className={`khqr-test-result-box ${telegramTestResult.success ? 'telegram-result-success' : 'telegram-result-error'}`}>
                          <div className="test-result-row">
                            <span>Status:</span>
                            <span className={telegramTestResult.success ? "text-success font-semibold" : "text-danger font-semibold"}>
                              {telegramTestResult.success ? '✓ Delivered to Telegram' : '✗ Failed to Deliver'}
                            </span>
                          </div>
                          <div className="test-result-row">
                            <span>Message:</span>
                            <span className="text-xs">{telegramTestResult.message}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CARD 3: PLASGATE SMS GATEWAY (CAMBODIA) */}
                  <div className="settings-card plasgate-admin-settings-card mt-4">
                    <div className="settings-card-header">
                      <div className="telegram-mini-badge-admin" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}>
                        <Smartphone size={15} />
                        <span>Plasgate SMS</span>
                      </div>
                      <div>
                        <h4>Plasgate Cambodia SMS Gateway (+Gate)</h4>
                        <span className="text-xs text-muted">
                          Direct REST API integration (<code>https://cloudapi.plasgate.com/api/send</code>) for sending OTP by mobile number
                        </span>
                      </div>
                      <div className="telegram-header-controls ml-auto">
                        <span className={`status-badge-inline ${settings.plasgateEnabled ? 'active' : 'inactive'}`}>
                          {settings.plasgateEnabled ? 'SMS OTP ACTIVE' : 'DISABLED'}
                        </span>
                        <label className="toggle-switch-compact" title="Toggle Plasgate SMS Gateway">
                          <input
                            type="checkbox"
                            checked={Boolean(settings.plasgateEnabled)}
                            onChange={(e) => setSettings({ ...settings, plasgateEnabled: e.target.checked })}
                          />
                          <span className="slider-compact round"></span>
                        </label>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Plasgate Private Key (?private_key=...) *</label>
                        <div className="input-with-action">
                          <input
                            type={showPlasgatePrivate ? "text" : "password"}
                            value={settings.plasgatePrivateKey || ''}
                            onChange={(e) => setSettings({ ...settings, plasgatePrivateKey: e.target.value })}
                            placeholder="Enter your Plasgate Private Key..."
                          />
                          <button
                            type="button"
                            className="btn-toggle-eye"
                            onClick={() => setShowPlasgatePrivate(!showPlasgatePrivate)}
                            title={showPlasgatePrivate ? "Hide private key" : "Show private key"}
                          >
                            {showPlasgatePrivate ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <span className="input-hint">
                          Passed as secure query parameter to <code>https://cloudapi.plasgate.com/api/send</code>
                        </span>
                      </div>

                      <div className="form-group">
                        <label>Plasgate Secret Key (X-Secret Header) *</label>
                        <div className="input-with-action">
                          <input
                            type={showPlasgateSecret ? "text" : "password"}
                            value={settings.plasgateSecretKey || ''}
                            onChange={(e) => setSettings({ ...settings, plasgateSecretKey: e.target.value })}
                            placeholder="Enter your Plasgate X-Secret key..."
                          />
                          <button
                            type="button"
                            className="btn-toggle-eye"
                            onClick={() => setShowPlasgateSecret(!showPlasgateSecret)}
                            title={showPlasgateSecret ? "Hide secret key" : "Show secret key"}
                          >
                            {showPlasgateSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <span className="input-hint">
                          Sent in <code>X-Secret</code> authentication header with JSON payload.
                        </span>
                      </div>
                    </div>

                    <div className="form-group mt-3">
                      <label>Sender Name / ID (sender) *</label>
                      <input
                        type="text"
                        value={settings.plasgateSenderId || 'SMS Info'}
                        onChange={(e) => setSettings({ ...settings, plasgateSenderId: e.target.value })}
                        placeholder="e.g. YourApprovedBrandName, DyzzStore, etc."
                      />
                      <span className="input-hint" style={{ color: '#fbbf24' }}>
                        ⚠️ Must match the <strong>approved Sender Name</strong> in your Plasgate dashboard (portal.plasgate.com). If unapproved, Plasgate returns <em>400 Invalid Sender</em>.
                      </span>
                    </div>

                    {/* Plasgate SMS Live Tester Panel */}
                    <div className="khqr-test-panel mt-3">
                      <div className="khqr-test-header">
                        <Smartphone size={15} className="text-success" />
                        <strong>Live Plasgate SMS Gateway Tester:</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 200px' }}>
                          <input
                            type="tel"
                            className="form-control-sm"
                            style={{ width: '100%', padding: '7px 12px', background: '#0a0f1d', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                            placeholder="Phone number e.g. 012345678 or 855..."
                            value={plasgateTestPhone}
                            onChange={(e) => setPlasgateTestPhone(e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleTestPlasgate}
                          disabled={plasgateTesting}
                        >
                          {plasgateTesting ? <RefreshCw size={13} className="spin-icon inline mr-1" /> : <Send size={13} className="inline mr-1" />}
                          {plasgateTesting ? 'Sending SMS...' : 'Send Test SMS'}
                        </button>
                      </div>

                      {plasgateTestResult && (
                        <div className={`khqr-test-result-box mt-3 ${plasgateTestResult.success ? 'telegram-result-success' : 'telegram-result-error'}`}>
                          <div className="test-result-row">
                            <span>Status:</span>
                            <span className={plasgateTestResult.success ? "text-success font-semibold" : "text-danger font-semibold"}>
                              {plasgateTestResult.success ? '✓ Sent Successfully' : '✗ Failed to Send'}
                            </span>
                          </div>
                          {plasgateTestResult.phone && (
                            <div className="test-result-row">
                              <span>Recipient (Normalized):</span>
                              <code>+{plasgateTestResult.phone}</code>
                            </div>
                          )}
                          <div className="test-result-row">
                            <span>API Message:</span>
                            <span className="text-xs">{plasgateTestResult.message}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="settings-card mt-4">
                    <div className="settings-card-header">
                      <AlertCircle size={20} className="text-accent" />
                      <h4>Platform Announcement Bar</h4>
                    </div>

                    <div className="form-group">
                      <label>Top Banner Text:</label>
                      <textarea
                        rows={2}
                        value={settings.announcementText}
                        onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="settings-card mt-4">
                    <div className="settings-card-header">
                      <Tag size={20} className="text-purple" />
                      <h4>Active Promo Codes</h4>
                    </div>
                    <div className="promo-codes-list">
                      <div className="promo-pill"><strong>NEURON20</strong> — 20% OFF Everything</div>
                      <div className="promo-pill"><strong>AIWELCOME</strong> — $10 Flat Discount</div>
                    </div>
                  </div>

                  <div className="settings-actions mt-4">
                    <button type="submit" className="btn btn-primary btn-glow">
                      <Save size={18} />
                      <span>Save Changes to Laravel Database</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
          </main>
        </div>

        {/* MODAL 1: CREATE / EDIT PRODUCT MODAL */}
        {isToolModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-container admin-tool-modal">
              <button
                className="modal-close"
                onClick={() => setIsToolModalOpen(false)}
              >
                &times;
              </button>

              <div className="modal-header-admin">
                <h3>{editingTool ? `Edit ${editingTool.name}` : 'Add New Product to Store'}</h3>
                <p>Changes will be committed directly to the Laravel database and updated live on the store.</p>
              </div>

              <form onSubmit={handleSaveTool} className="admin-modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      required
                      value={toolFormData.name}
                      onChange={(e) => setToolFormData({ ...toolFormData, name: e.target.value })}
                      placeholder="e.g. Dyzzstore Quantum LLM"
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={toolFormData.category}
                      onChange={(e) => setToolFormData({ ...toolFormData, category: e.target.value })}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Lifetime License Price ($USD) *</label>
                    <input
                      type="number"
                      required
                      value={toolFormData.priceLifetime}
                      onChange={(e) => setToolFormData({ ...toolFormData, priceLifetime: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Monthly License Price ($USD) *</label>
                    <input
                      type="number"
                      required
                      value={toolFormData.priceMonthly}
                      onChange={(e) => setToolFormData({ ...toolFormData, priceMonthly: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Badge / Highlight Tag</label>
                    <input
                      type="text"
                      value={toolFormData.badge}
                      onChange={(e) => setToolFormData({ ...toolFormData, badge: e.target.value })}
                      placeholder="e.g. 8K Photorealism, Flagship, Fast"
                    />
                  </div>

                  <div className="form-group">
                    <label>Status (Active / Inactive) *</label>
                    <select
                      value={toolFormData.status || 'Active'}
                      onChange={(e) => setToolFormData({ ...toolFormData, status: e.target.value })}
                    >
                      <option value="Active">Active (Visible in Storefront)</option>
                      <option value="Inactive">Inactive (Hidden from Storefront)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Short Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={toolFormData.shortDesc}
                    onChange={(e) => setToolFormData({ ...toolFormData, shortDesc: e.target.value })}
                    placeholder="Brief summary of capabilities..."
                  />
                </div>

                <div className="form-group">
                  <label>Capabilities (Comma separated):</label>
                  <input
                    type="text"
                    value={toolFormData.capabilities}
                    onChange={(e) => setToolFormData({ ...toolFormData, capabilities: e.target.value })}
                    placeholder="2M Context, Streaming, JSON Mode, OCR"
                  />
                </div>

                <div className="modal-actions-admin">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsToolModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-glow">
                    <Save size={16} />
                    <span>{editingTool ? 'Save Updates to Database' : 'Publish Product to Database'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: CREATE / EDIT CATEGORY MODAL */}
        {isCategoryModalOpen && (
          <div className="modal-backdrop">
            <div className="modal-container admin-tool-modal">
              <button
                className="modal-close"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                &times;
              </button>

              <div className="modal-header-admin">
                <h3>{editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}</h3>
                <p>Saved into Laravel SQLite database `categories` table with slug indexing.</p>
              </div>

              <form onSubmit={handleSaveCategory} className="admin-modal-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Category Name *</label>
                    <input
                      type="text"
                      required
                      value={categoryFormData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCategoryFormData({
                          ...categoryFormData,
                          name: val,
                          slug: editingCategory ? categoryFormData.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                        });
                      }}
                      placeholder="e.g. Robotics & Embodied AI"
                    />
                  </div>

                  <div className="form-group">
                    <label>URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={categoryFormData.slug}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                      placeholder="e.g. robotics"
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Highlight Badge</label>
                    <input
                      type="text"
                      value={categoryFormData.badge}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, badge: e.target.value })}
                      placeholder="e.g. Hot, Enterprise, NextGen"
                    />
                  </div>

                  <div className="form-group">
                    <label>Status (Active / Inactive) *</label>
                    <select
                      value={categoryFormData.is_active ? 'Active' : 'Inactive'}
                      onChange={(e) => {
                        const active = e.target.value === 'Active';
                        setCategoryFormData({
                          ...categoryFormData,
                          is_active: active,
                          status: e.target.value
                        });
                      }}
                    >
                      <option value="Active">Active (Visible in Storefront)</option>
                      <option value="Inactive">Inactive (Hidden from Storefront)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Theme Color *</label>
                  <div className="color-picker-row">
                    <input
                      type="color"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                      className="color-input"
                    />
                    <input
                      type="text"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                      className="color-text-input"
                    />
                  </div>
                  {/* Quick Swatches */}
                  <div className="quick-color-swatches">
                    {['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6'].map(col => (
                      <button
                        key={col}
                        type="button"
                        className="swatch-btn"
                        style={{ backgroundColor: col }}
                        onClick={() => setCategoryFormData({ ...categoryFormData, color: col })}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={3}
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    placeholder="Describe what kind of tools belong in this category..."
                  />
                </div>

                <div className="modal-actions-admin">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsCategoryModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-glow">
                    <Save size={16} />
                    <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Publish Customer Activation Link */}
        {isActivateModalOpen && activatingOrder && (
          <div className="modal-backdrop">
            <div className="modal-container admin-action-modal">
              <button 
                className="modal-close" 
                onClick={() => setIsActivateModalOpen(false)}
                aria-label="Close Modal"
              >
                <X size={18} />
              </button>

              <div className="admin-modal-header">
                <div className="admin-modal-icon-badge">
                  <Zap size={22} className="text-warning" />
                </div>
                <div>
                  <h3>Publish Customer Activation Link</h3>
                  <p>
                    Order <strong>#{activatingOrder.order_number || activatingOrder.id}</strong> • Customer: <strong>{activatingOrder.customer_name || activatingOrder.customerName}</strong>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitActivationLink} className="admin-modal-form">
                {/* Customer & Order Summary Card */}
                <div className="order-summary-micro-card">
                  <div className="summary-micro-col">
                    <span className="micro-label">Customer Email:</span>
                    <strong>{activatingOrder.customer_email || activatingOrder.customerEmail}</strong>
                  </div>
                  <div className="summary-micro-col">
                    <span className="micro-label">Paid Amount:</span>
                    <strong className="text-success">${activatingOrder.amount} USD</strong>
                  </div>
                  <div className="summary-micro-col">
                    <span className="micro-label">Payment Method:</span>
                    <span className="badge-aba">{activatingOrder.payment_method || activatingOrder.paymentMethod}</span>
                  </div>
                </div>

                {/* Quick URL Generator Presets */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Customer Activation URL:</span>
                    <span className="text-muted text-xs"> (The link your customer will see and click)</span>
                  </label>
                  <div className="preset-buttons-row mb-2">
                    <button
                      type="button"
                      className="btn-preset-chip"
                      onClick={() => setActivationInput(`https://t.me/dyzzstore_bot?start=act_${activatingOrder.order_number || activatingOrder.id}`)}
                    >
                      🤖 Telegram Bot Link
                    </button>
                    <button
                      type="button"
                      className="btn-preset-chip"
                      onClick={() => setActivationInput(`https://app.dyzzstore.com/activate?token=act_${activatingOrder.order_number || activatingOrder.id}`)}
                    >
                      🌐 Web Portal Link
                    </button>
                    <button
                      type="button"
                      className="btn-preset-chip"
                      onClick={() => setActivationInput(activatingOrder.aba_link || settings.abaPayLink)}
                    >
                      💳 ABA PayWay Receipt
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. https://t.me/my_bot?start=xxx or https://app.dyzzstore.com/activate/xxx"
                    value={activationInput}
                    onChange={(e) => setActivationInput(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Optional Message / Instructions for Customer:</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="e.g. Your premium account is now active! Click the link above to start generating."
                    value={activationNoteInput}
                    onChange={(e) => setActivationNoteInput(e.target.value)}
                  />
                </div>

                <div className="admin-modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsActivateModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-glow" disabled={activatingLoading}>
                    <Send size={15} />
                    <span>{activatingLoading ? 'Publishing...' : 'Publish Activation Link to User'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
