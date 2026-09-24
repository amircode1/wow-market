import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Realm, UserSettings, Theme } from '@/types';
import type { BlizzardRegion } from '@/config/blizzard';

// Realm Store
interface RealmState {
  selectedRealmByRegion: Record<BlizzardRegion, number | null>;
  availableRealms: Realm[];
  isLoading: boolean;
  error: string | null;
  setSelectedRealm: (region: BlizzardRegion, realmId: number | null) => void;
  setAvailableRealms: (realms: Realm[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRealmStore = create<RealmState>()(
  devtools(
    persist(
      (set) => ({
        selectedRealmByRegion: { us: null, eu: null, kr: null, tw: null, cn: null },
        availableRealms: [],
        isLoading: false,
        error: null,
        setSelectedRealm: (region, realmId) =>
          set((state) => ({
            selectedRealmByRegion: {
              ...state.selectedRealmByRegion,
              [region]: realmId,
            },
          })),
        setAvailableRealms: (realms) => set({ availableRealms: realms }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
      }),
      {
        name: 'wow-market-realm',
        version: 1,
        partialize: (state) => ({ selectedRealmByRegion: state.selectedRealmByRegion }),
        migrate: (persistedState: any) => {
          // v0 -> v1 migration (selectedRealmId -> selectedRealmByRegion.us)
          if (persistedState?.selectedRealmId !== undefined) {
            return {
              selectedRealmByRegion: {
                us: persistedState.selectedRealmId ?? null,
                eu: null,
                kr: null,
                tw: null,
                cn: null,
              },
            };
          }
          return persistedState;
        },
      }
    ),
    { name: 'realm-store' }
  )
);

// Theme Store
interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    (set, get) => ({
      theme: { mode: 'dark' },
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const current = get().theme.mode;
        let next: Theme['mode'];
        
        if (current === 'dark') next = 'light';
        else if (current === 'light') next = 'system';
        else next = 'dark';
        
        set({ theme: { mode: next } });
      },
    }),
    { name: 'theme-store' }
  )
);

// UI State Store
interface UIState {
  sidebarOpen: boolean;
  searchOpen: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  setSidebarOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: false,
      searchOpen: false,
      notifications: [],
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      addNotification: (notification) => set((state) => ({
        notifications: [
          ...state.notifications,
          {
            ...notification,
            id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
          },
        ],
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    { name: 'ui-store' }
  )
);

// Market Data Store
interface MarketState {
  lastUpdate: number | null;
  isUpdating: boolean;
  updateError: string | null;
  setLastUpdate: (timestamp: number) => void;
  setUpdating: (updating: boolean) => void;
  setUpdateError: (error: string | null) => void;
}

export const useMarketStore = create<MarketState>()(
  devtools(
    (set) => ({
      lastUpdate: null,
      isUpdating: false,
      updateError: null,
      setLastUpdate: (timestamp) => set({ lastUpdate: timestamp }),
      setUpdating: (updating) => set({ isUpdating: updating }),
      setUpdateError: (error) => set({ updateError: error }),
    }),
    { name: 'market-store' }
  )
);

// Settings Store
interface SettingsState {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  favoriteRealms: [],
  theme: { mode: 'dark' },
  autoRefreshEnabled: true,
  refreshInterval: 5,
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

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSetting: (key, value) => set((state) => ({
        settings: {
          ...state.settings,
          [key]: value,
        },
      })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: 'settings-store' }
  )
);

// Search State Store
interface SearchState {
  query: string;
  results: any[];
  isLoading: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  setResults: (results: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    (set) => ({
      query: '',
      results: [],
      isLoading: false,
      error: null,
      setQuery: (query) => set({ query }),
      setResults: (results) => set({ results }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearSearch: () => set({ query: '', results: [], error: null }),
    }),
    { name: 'search-store' }
  )
);

// Chart State Store
interface ChartState {
  selectedTimeframe: string;
  selectedChartType: string;
  selectedIndicators: string[];
  setTimeframe: (timeframe: string) => void;
  setChartType: (type: string) => void;
  setIndicators: (indicators: string[]) => void;
  toggleIndicator: (indicator: string) => void;
}

export const useChartStore = create<ChartState>()(
  devtools(
    (set, get) => ({
      selectedTimeframe: '1d',
      selectedChartType: 'candlestick',
      selectedIndicators: ['sma-7', 'sma-25'],
      setTimeframe: (timeframe) => set({ selectedTimeframe: timeframe }),
      setChartType: (type) => set({ selectedChartType: type }),
      setIndicators: (indicators) => set({ selectedIndicators: indicators }),
      toggleIndicator: (indicator) => set((state) => {
        const indicators = state.selectedIndicators.includes(indicator)
          ? state.selectedIndicators.filter(i => i !== indicator)
          : [...state.selectedIndicators, indicator];
        return { selectedIndicators: indicators };
      }),
    }),
    { name: 'chart-store' }
  )
);

// Region Store
interface RegionState {
  selectedRegion: BlizzardRegion;
  isHydrated: boolean;
  setRegion: (region: BlizzardRegion) => void;
}

export const useRegionStore = create<RegionState>()(
  devtools(
    persist(
      (set) => ({
        selectedRegion: 'us',
        isHydrated: false,
        setRegion: (region) => set({ selectedRegion: region }),
      }),
      {
        name: 'wow-market-region',
        partialize: (state) => ({ selectedRegion: state.selectedRegion }),
        onRehydrateStorage: () => () => {
          useRegionStore.setState({ isHydrated: true });
        },
      }
    ),
    { name: 'region-store' }
  )
);

// Dashboard State Store
interface DashboardState {
  selectedItemForPanel: number | null;
  refreshRate: number; // seconds
  alertsEnabled: boolean;
  setSelectedItemForPanel: (itemId: number | null) => void;
  setRefreshRate: (rate: number) => void;
  setAlertsEnabled: (enabled: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set) => ({
        selectedItemForPanel: null,
        refreshRate: 60,
        alertsEnabled: true,
        setSelectedItemForPanel: (itemId) => set({ selectedItemForPanel: itemId }),
        setRefreshRate: (rate) => set({ refreshRate: rate }),
        setAlertsEnabled: (enabled) => set({ alertsEnabled: enabled }),
      }),
      {
        name: 'wow-market-dashboard',
        partialize: (state) => ({ refreshRate: state.refreshRate, alertsEnabled: state.alertsEnabled }),
      }
    ),
    { name: 'dashboard-store' }
  )
);
