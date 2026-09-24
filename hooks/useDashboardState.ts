import { useDashboardData } from './useDashboardData';
import { useDashboardStore, useChartStore, useUIStore, useSettingsStore, useRealmStore, useRegionStore } from '@/store';

/**
 * Unified dashboard state hook
 * Combines all dashboard stores + data fetching into a single subscribed state
 */
export function useDashboardState() {
  // Data
  const dashboardData = useDashboardData();

  // Stores
  const dashboardState = useDashboardStore();
  const chartState = useChartStore();
  const uiState = useUIStore();
  const settingsState = useSettingsStore();
  const realmState = useRealmStore();
  const regionState = useRegionStore();

  return {
    // Data
    ...dashboardData,

    // Dashboard
    selectedItemForPanel: dashboardState.selectedItemForPanel,
    setSelectedItemForPanel: dashboardState.setSelectedItemForPanel,
    refreshRate: dashboardState.refreshRate,
    setRefreshRate: dashboardState.setRefreshRate,
    alertsEnabled: dashboardState.alertsEnabled,
    setAlertsEnabled: dashboardState.setAlertsEnabled,

    // Chart
    selectedTimeframe: chartState.selectedTimeframe,
    selectedChartType: chartState.selectedChartType,
    selectedIndicators: chartState.selectedIndicators,
    setTimeframe: chartState.setTimeframe,
    setChartType: chartState.setChartType,
    setIndicators: chartState.setIndicators,
    toggleIndicator: chartState.toggleIndicator,

    // UI
    sidebarOpen: uiState.sidebarOpen,
    setSidebarOpen: uiState.setSidebarOpen,
    notifications: uiState.notifications,
    addNotification: uiState.addNotification,
    removeNotification: uiState.removeNotification,

    // Settings
    settings: settingsState.settings,
    updateSetting: settingsState.updateSetting,

    // Region & Realm
    selectedRegion: regionState.selectedRegion,
    setRegion: regionState.setRegion,
    selectedRealmByRegion: realmState.selectedRealmByRegion,
    setSelectedRealm: realmState.setSelectedRealm,
  };
}
