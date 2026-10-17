import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TOOLS_DATA } from '../data/toolsData';
import { apiUrl } from '../utils/api';

const AppContext = createContext();

export const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', code: 'USD' },
  KHR: { symbol: '៛', rate: 4100, label: 'Riel (៛)', code: 'KHR' }
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

  // Tools state with persistent database sync & localStorage cache
  const [tools, setTools] = useState(() => {
    try {
      const saved = localStorage.getItem('synapse_custom_tools');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const refreshTools = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/products'));
      if (res.ok) {
        const data = await res.json();
        const list = data.products || data.tools;
        if (Array.isArray(list)) {
          let deleted = [];
          try {
            deleted = JSON.parse(localStorage.getItem('synapse_deleted_tools') || '[]');
          } catch {}
          const filtered = list.filter(t => !deleted.includes(t.id) && !deleted.includes(t.slug) && !deleted.includes(t.product_id));
          setTools(filtered);
          localStorage.setItem('synapse_custom_tools', JSON.stringify(filtered));
        }
      }
    } catch (e) {
      // offline or server error fallback
    }
  }, []);

  useEffect(() => {
    refreshTools();
  }, [refreshTools]);

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null); // { code: 'NEURON20', percent: 20 }
  const [promoMessage, setPromoMessage] = useState(null);

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
      name: 'Local Dev & Testing',
      key: 'sk_synapse_test_54b3a8d11c8842109fe1299c104',
      created: 'Oct 14, 2026',
      status: 'Active',
      lastUsed: '4 hours ago'
    }
  ]);

  const [purchasedLicenses, setPurchasedLicenses] = useState([
    {
      id: 'lic_1',
      toolName: 'DeepCode Copilot Pro',
      licenseKey: 'LIC-DCP-9812-7801-XC',
      version: 'v4.5 Enterprise',
      date: 'Oct 15, 2026'
    }
  ]);

  // Format currency helper
  // Format currency helper - supports exact decimals (e.g. $2.10)
  const formatPrice = (usdAmount) => {
    const num = Number(usdAmount) || 0;
    const cur = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = num * cur.rate;
    if (currency === 'KHR') {
      return `${Math.round(converted).toLocaleString()} ៛`;
    }
    const formatted = num % 1 === 0 ? num.toLocaleString() : num.toFixed(2);
    return `${cur.symbol}${formatted}`;
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart operations with immediate synchronous localStorage sync
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      let updated;
      if (existing) {
        addToast(`Increased quantity for ${item.name}`, 'info');
        updated = prev.map((i) =>
          i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        );
      } else {
        addToast(`Added "${item.name}" to cart!`, 'success');
        updated = [...prev, { ...item, quantity: 1 }];
      }
      try {
        localStorage.setItem('synapse_cart', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      try {
        localStorage.setItem('synapse_cart', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.setItem('synapse_cart', JSON.stringify([]));
    } catch (e) {}
  };

  // Promo code apply
  const applyPromo = (codeToTest) => {
    const code = (codeToTest || promoCode).trim().toUpperCase();
    if (code === 'NEURON20') {
      setAppliedDiscount({ code: 'NEURON20', percent: 20, type: 'percent' });
      setPromoMessage({ text: '20% discount applied successfully!', type: 'success' });
      addToast('🎉 Promo code NEURON20 applied: 20% OFF!', 'success');
    } else if (code === 'AIWELCOME') {
      setAppliedDiscount({ code: 'AIWELCOME', amount: 10, type: 'fixed' });
      setPromoMessage({ text: '$10 discount applied successfully!', type: 'success' });
      addToast('🎉 Promo code AIWELCOME applied: $10 OFF!', 'success');
    } else {
      setPromoMessage({ text: 'Invalid promo code. Try NEURON20', type: 'error' });
      addToast('Invalid promo code. Use NEURON20', 'error');
    }
  };

  // Totals
  const subtotalUSD = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);
  let discountUSD = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === 'percent') {
      discountUSD = (subtotalUSD * appliedDiscount.percent) / 100;
    } else if (appliedDiscount.type === 'fixed') {
      discountUSD = Math.min(subtotalUSD, appliedDiscount.amount);
    }
  }
  const totalUSD = Math.max(0, subtotalUSD - discountUSD);

  // Generate new API Key
  const generateNewApiKey = (name = 'New Production Key') => {
    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const newKey = {
      id: `key_${Date.now()}`,
      name: name,
      key: `sk_synapse_live_${randomHex}`,
      created: 'Just now',
      status: 'Active',
      lastUsed: 'Never'
    };
    setApiKeys((prev) => [newKey, ...prev]);
    addToast(`Generated new API key: ${name}`, 'success');
    return newKey;
  };

  const revokeApiKey = (keyId) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    addToast('API key revoked successfully', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        promoCode,
        setPromoCode,
        appliedDiscount,
        applyPromo,
        promoMessage,
        currency,
        setCurrency,
        formatPrice,
        subtotalUSD,
        discountUSD,
        totalUSD,
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
        setTools,
        refreshTools
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
