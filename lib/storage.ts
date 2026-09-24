import { useState, useEffect, useCallback } from 'react';
import type { UserSettings, WatchlistItem, PriceAlert } from '@/types';

// localStorage wrapper with error handling
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Keep the first render identical on server and client. Browser storage is
  // loaded after mount to avoid hydration mismatches.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item));
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as const;
}

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  favoriteRealms: [],
  theme: { mode: 'dark' },
  autoRefreshEnabled: true,
  refreshInterval: 5, // minutes
  compactMode: false,
  animationsEnabled: true,
  chartSettings: {
    defaultTimeframe: '1d',
    defaultChartType: 'candlestick',
    indicators: ['sma-7', 'sma-25'],
  },
  notificationSettings: {
    browserEnabled: true,
    soundEnabled: false,
    volume: 0.5,
  },
  displaySettings: {
    goldFormat: 'full',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
  },
};

// Settings management
export function useSettings() {
  const [settings, setSettings] = useLocalStorage<UserSettings>('userSettings', DEFAULT_SETTINGS);

  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  return {
    settings,
    updateSetting,
    resetSettings,
  };
}

// Watchlist management
export function useWatchlist() {
  const [watchlist, setWatchlist] = useLocalStorage<WatchlistItem[]>('watchlist', []);

  const addToWatchlist = useCallback((
    itemId: number,
    notes?: string,
    targetPrice?: number,
    metadata?: Pick<WatchlistItem, 'name' | 'iconUrl' | 'quality' | 'itemClass'>
  ) => {
    setWatchlist(prev => {
      if (prev.some(item => item.itemId === itemId)) {
        return prev; // Already in watchlist
      }
      
      return [...prev, {
        itemId,
        addedAt: Date.now(),
        notes,
        targetPrice,
        ...metadata,
      }];
    });
  }, [setWatchlist]);

  const removeFromWatchlist = useCallback((itemId: number) => {
    setWatchlist(prev => prev.filter(item => item.itemId !== itemId));
  }, [setWatchlist]);

  const updateWatchlistItem = useCallback((itemId: number, updates: Partial<Omit<WatchlistItem, 'itemId' | 'addedAt'>>) => {
    setWatchlist(prev => prev.map(item => 
      item.itemId === itemId ? { ...item, ...updates } : item
    ));
  }, [setWatchlist]);

  const isInWatchlist = useCallback((itemId: number) => {
    return watchlist.some(item => item.itemId === itemId);
  }, [watchlist]);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
  }, [setWatchlist]);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    isInWatchlist,
    clearWatchlist,
  };
}

// Price alerts management
export function usePriceAlerts() {
  const [alerts, setAlerts] = useLocalStorage<PriceAlert[]>('priceAlerts', []);

  const createAlert = useCallback((
    itemId: number,
    realmId: number,
    type: PriceAlert['type'],
    targetValue: number,
    frequency: PriceAlert['frequency'] = 'always'
  ) => {
    const alert: PriceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      realmId,
      type,
      targetValue,
      frequency,
      status: 'active',
      createdAt: Date.now(),
    };

    setAlerts(prev => [...prev, alert]);
    return alert.id;
  }, [setAlerts]);

  const updateAlert = useCallback((alertId: string, updates: Partial<PriceAlert>) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, ...updates } : alert
    ));
  }, [setAlerts]);

  const deleteAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, [setAlerts]);

  const triggerAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'triggered', triggeredAt: Date.now() }
        : alert
    ));
  }, [setAlerts]);

  const getActiveAlerts = useCallback(() => {
    return alerts.filter(alert => alert.status === 'active');
  }, [alerts]);

  const getAlertsForItem = useCallback((itemId: number, realmId: number) => {
    return alerts.filter(alert => 
      alert.itemId === itemId && alert.realmId === realmId && alert.status === 'active'
    );
  }, [alerts]);

  return {
    alerts,
    createAlert,
    updateAlert,
    deleteAlert,
    triggerAlert,
    getActiveAlerts,
    getAlertsForItem,
  };
}

// Search history management
export function useSearchHistory() {
  const [history, setHistory] = useLocalStorage<string[]>('searchHistory', []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setHistory(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== query.toLowerCase());
      return [query, ...filtered].slice(0, 20); // Keep last 20 searches
    });
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => prev.filter(item => item !== query));
  }, [setHistory]);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}

// Recent items management
export function useRecentItems() {
  const [recentItems, setRecentItems] = useLocalStorage<number[]>('recentItems', []);

  const addToRecent = useCallback((itemId: number) => {
    setRecentItems(prev => {
      const filtered = prev.filter(id => id !== itemId);
      return [itemId, ...filtered].slice(0, 50); // Keep last 50 items
    });
  }, [setRecentItems]);

  const clearRecent = useCallback(() => {
    setRecentItems([]);
  }, [setRecentItems]);

  const removeFromRecent = useCallback((itemId: number) => {
    setRecentItems(prev => prev.filter(id => id !== itemId));
  }, [setRecentItems]);

  return {
    recentItems,
    addToRecent,
    clearRecent,
    removeFromRecent,
  };
}

// Theme management
export function useTheme() {
  const [theme, setTheme] = useLocalStorage<'dark' | 'light' | 'system'>('theme', 'dark');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      return 'dark';
    });
  }, [setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}
