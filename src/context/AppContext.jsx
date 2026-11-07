import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { TOOLS_DATA } from '../data/toolsData';
import { apiUrl } from '../utils/api';

const AppContext = createContext();

export const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', code: 'USD' },
  KHR: { symbol: '៛', rate: 4100, label: 'Riel (៛)', code: 'KHR' }
};

export const LANGUAGES = {
  kh: { code: 'kh', label: 'ភាសាខ្មែរ', flag: '/kh-flag-icon.svg', shortLabel: 'KH' },
  en: { code: 'en', label: 'English', flag: '/en-flag-icon.svg', shortLabel: 'EN' },
  zh: { code: 'zh', label: '中文', flag: '/ch-flag-icon.svg', shortLabel: 'ZH' }
};

export function AppProvider({ children }) {
  // Cart state with localStorage persistence - defaults to EMPTY array (no hardcoded items)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('synapse_cart');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not load cart from localStorage', e);
    }
    return [];
  });

  // Save cart changes to localStorage immediately
  useEffect(() => {
    try {
      localStorage.setItem('synapse_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  // Clean up legacy localStorage cache keys once so stale records don't persist
  useEffect(() => {
    try {
      localStorage.removeItem('synapse_custom_tools');
      localStorage.removeItem('synapse_custom_categories');
      localStorage.removeItem('synapse_deleted_tools');
    } catch {}
  }, []);

  // Tools state — purely live list from Laravel database API
  const [tools, setTools] = useState([]);
  const [toolsLoading, setToolsLoading] = useState(true);

  const refreshTools = useCallback(async () => {
    try {
      setToolsLoading(true);
      const res = await fetch(apiUrl('/api/products'));
      if (res.ok) {
        const data = await res.json();
        const list = data.products || data.tools;
        if (Array.isArray(list)) {
          setTools(list);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch live products, keeping current state:', e);
    } finally {
      setToolsLoading(false);
    }
  }, []);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const refreshCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await fetch(apiUrl('/api/categories'));
      if (res.ok) {
        const data = await res.json();
        const list = data.categories || data;
        if (Array.isArray(list)) {
          setCategories(list);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch categories:', e);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTools();
    refreshCategories();
  }, [refreshTools, refreshCategories]);

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null); // { code: 'NEURON20', percent: 20 }
  const [promoMessage, setPromoMessage] = useState(null);

  // Theme state ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('synapse_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch {}
    return 'dark';
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
      } else {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
      }
      localStorage.setItem('synapse_theme', theme);
    } catch (e) {
      console.warn('Could not save theme:', e);
    }
  }, [theme]);

  // Language & i18n state
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('octopos_lang') || localStorage.getItem('synapse_lang');
      if (saved && (saved === 'kh' || saved === 'en' || saved === 'zh')) {
        return saved;
      }
    } catch {}
    return 'kh';
  });

  const [translations, setTranslations] = useState({});
  const [fallbackTranslations, setFallbackTranslations] = useState({});

  // Load language dictionaries from /i18n/{code}.json
  useEffect(() => {
    let isMounted = true;

    async function loadTranslations() {
      try {
        const [langRes, fallbackRes] = await Promise.all([
          fetch(`/i18n/${language}.json`),
          fetch('/i18n/en.json')
        ]);

        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (isMounted) setFallbackTranslations(fallbackData);
        }

        if (langRes.ok) {
          const langData = await langRes.json();
          if (isMounted) setTranslations(langData);
        }
      } catch (err) {
        console.warn('Could not load i18n translation files:', err);
      }
    }

    loadTranslations();
    return () => { isMounted = false; };
  }, [language]);

  const setLanguage = useCallback((langCode) => {
    const validLang = (langCode === 'kh' || langCode === 'en' || langCode === 'zh') ? langCode : 'kh';
    setLanguageState(validLang);
    try {
      localStorage.setItem('octopos_lang', validLang);
      localStorage.setItem('synapse_lang', validLang);
      document.cookie = `octopos_lang=${validLang}; path=/; max-age=31536000`;
    } catch (e) {
      console.warn('Could not persist language choice:', e);
    }
  }, []);

  // Translation helper function
  const t = useCallback((key, fallback = '') => {
    if (!key) return '';
    if (translations && translations[key]) return translations[key];
    if (fallbackTranslations && fallbackTranslations[key]) return fallbackTranslations[key];
    return fallback || key;
  }, [translations, fallbackTranslations]);

  // Currency
  const [currency, setCurrency] = useState('USD');

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [selectedToolModal, setSelectedToolModal] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // User Account State
  const [userSubscription, setUserSubscription] = useState({
    planName: 'Omni-LLM Developer Suite (Perpetual)',
    planId: 'omni_llm',
    status: 'Active',
    renewsOn: 'Lifetime Access (No Expiry)',
    tokensUsed: 3840000,
    tokenLimit: 15000000,
    gpuCredits: 'Unlimited (Turbo Priority)'
  });

  const [apiKeys, setApiKeys] = useState([
    {
      id: 'key_1',
      name: 'Production Cloud Cluster',
      key: 'sk_synapse_live_98a7f1c90e2b45398ab7102e88a',
      created: 'Oct 12, 2026',
      status: 'Active',
      lastUsed: 'Just now'
    },
    {
      id: 'key_2',
      name: 'Staging / Internal Agent API',
      key: 'sk_synapse_live_77190ca382ef6b12a9d8011c750',
      created: 'Nov 03, 2026',
      status: 'Active',
      lastUsed: '2 hrs ago'
    }
  ]);

  const [purchasedLicenses, setPurchasedLicenses] = useState([
    {
      id: 'lic_1',
      toolId: 'claude-3-opus',
      toolName: 'Claude 3.5 Sonnet & Opus',
      type: 'Perpetual Commercial License',
      key: 'CLD-OPUS-8912-8812-PRO',
      downloadUrl: '#',
      docsUrl: 'https://docs.anthropic.com',
      date: 'Oct 18, 2026'
    },
    {
      id: 'lic_2',
      toolId: 'midjourney-v6',
      toolName: 'Midjourney v6 Unlimited',
      type: '1-Year Enterprise Tier',
      key: 'MJ-UNLIMITED-TURBO-7729',
      downloadUrl: '#',
      docsUrl: 'https://midjourney.com',
      date: 'Nov 01, 2026'
    }
  ]);

  // Cart operations
  const addToCart = useCallback((tool, tierId = 'monthly') => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.tool.id === tool.id && item.tierId === tierId);
      if (existing) {
        return prevCart.map((item) =>
          item.tool.id === tool.id && item.tierId === tierId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { tool, tierId, quantity: 1 }];
    });
    addToast(`Added "${tool.name}" to cart`, 'success');
  }, []);

  const removeFromCart = useCallback((toolId, tierId) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.tool.id === toolId && item.tierId === tierId)));
  }, []);

  const updateQuantity = useCallback((toolId, tierId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(toolId, tierId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.tool.id === toolId && item.tierId === tierId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Promo Code Operations
  const applyPromoCode = useCallback((code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'NEURON20' || clean === 'SYNAPSE20' || clean === 'AI2026') {
      setAppliedDiscount({ code: clean, percent: 20 });
      setPromoMessage({ type: 'success', text: 'Promo code applied! 20% discount activated.' });
      return true;
    } else if (clean === 'DEV50') {
      setAppliedDiscount({ code: clean, percent: 50 });
      setPromoMessage({ type: 'success', text: 'Dev tier activated! 50% discount applied.' });
      return true;
    } else {
      setPromoMessage({ type: 'error', text: 'Invalid promo code. Try "NEURON20" for 20% off.' });
      return false;
    }
  }, []);

  const removePromoCode = useCallback(() => {
    setAppliedDiscount(null);
    setPromoMessage(null);
  }, []);

  // Calculation helpers
  const getSubtotal = useCallback(() => {
    return cart.reduce((sum, item) => {
      const price = item.tool.priceTier ? item.tool.priceTier[item.tierId] || item.tool.price : item.tool.price;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const getDiscountAmount = useCallback(() => {
    if (!appliedDiscount) return 0;
    return (getSubtotal() * appliedDiscount.percent) / 100;
  }, [appliedDiscount, getSubtotal]);

  const getTotal = useCallback(() => {
    return Math.max(0, getSubtotal() - getDiscountAmount());
  }, [getSubtotal, getDiscountAmount]);

  const formatPrice = useCallback((amountInUSD) => {
    const cur = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = amountInUSD * cur.rate;
    if (currency === 'KHR') {
      return `${Math.round(converted).toLocaleString()} ៛`;
    }
    return `$${converted.toFixed(2)}`;
  }, [currency]);

  // Toast Management
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // API Key Actions
  const generateNewApiKey = useCallback((name) => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newKey = {
      id: `key_${Date.now()}`,
      name: name || `Agent Cluster #${apiKeys.length + 1}`,
      key: `sk_synapse_live_${randomHex.slice(0, 24)}`,
      created: 'Just now',
      status: 'Active',
      lastUsed: 'Never'
    };
    setApiKeys((prev) => [newKey, ...prev]);
    addToast('New high-throughput API key generated!', 'success');
  }, [apiKeys.length, addToast]);

  const revokeApiKey = useCallback((keyId) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    addToast('API key revoked successfully', 'info');
  }, [addToast]);

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        currency,
        setCurrency,
        formatPrice,
        promoCode,
        setPromoCode,
        appliedDiscount,
        applyPromoCode,
        removePromoCode,
        promoMessage,
        getSubtotal,
        getDiscountAmount,
        getTotal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAccountOpen,
        setIsAccountOpen,
        selectedToolModal,
        setSelectedToolModal,
        toasts,
        addToast,
        removeToast,
        userSubscription,
        setUserSubscription,
        apiKeys,
        generateNewApiKey,
        revokeApiKey,
        purchasedLicenses,
        setPurchasedLicenses,
        tools,
        toolsLoading,
        setTools,
        refreshTools,
        categories,
        categoriesLoading,
        setCategories,
        refreshCategories,
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        t,
        translations
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
