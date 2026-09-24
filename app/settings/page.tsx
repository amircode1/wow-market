'use client';

import { useState } from 'react';
import { Settings, Moon, Sun, Monitor, Bell, Volume2, Trash2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/lib/storage';
import { useTheme } from '@/components/providers/ThemeProvider';
import { CacheManager } from '@/lib/database';

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useSettings();
  const { theme, setTheme } = useTheme();
  const [cacheSize, setCacheSize] = useState<number | null>(null);

  const handleGetCacheSize = async () => {
    try {
      const size = await CacheManager.getCacheSize();
      setCacheSize(size.total);
    } catch (error) {
      console.error('Failed to get cache size:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      await CacheManager.clearAllCache();
      setCacheSize(0);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <p className="text-text-secondary">
          Customize your WoW Market Tracker experience
        </p>
      </div>

      <Tabs defaultValue="general" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Preferences
              </CardTitle>
              <CardDescription>
                Basic application settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div>
                <Label className="text-base font-medium">Theme</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    onClick={() => setTheme('dark')}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    onClick={() => setTheme('light')}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    onClick={() => setTheme('system')}
                    className="flex items-center gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>

              {/* Auto Refresh */}
              <div>
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="auto-refresh"
                    type="checkbox"
                    checked={settings.autoRefreshEnabled}
                    onChange={(e) => updateSetting('autoRefreshEnabled', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">
                    Automatically refresh auction data
                  </span>
                </div>
              </div>

              {/* Refresh Interval */}
              <div>
                <Label htmlFor="refresh-interval">Refresh Interval (minutes)</Label>
                <Input
                  id="refresh-interval"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.refreshInterval}
                  onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value) || 5)}
                  className="w-32 mt-2"
                />
              </div>

              {/* Compact Mode */}
              <div>
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="compact-mode"
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) => updateSetting('compactMode', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">
                    Use denser UI layout
                  </span>
                </div>
              </div>

              {/* Animations */}
              <div>
                <Label htmlFor="animations">Animations</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="animations"
                    type="checkbox"
                    checked={settings.animationsEnabled}
                    onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">
                    Enable animations and transitions
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>
                Customize how data is displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gold Format */}
              <div>
                <Label htmlFor="gold-format">Gold Display Format</Label>
                <select
                  id="gold-format"
                  value={settings.displaySettings.goldFormat}
                  onChange={(e) => updateSetting('displaySettings', {
                    ...settings.displaySettings,
                    goldFormat: e.target.value as 'full' | 'compact'
                  })}
                  className="mt-2 px-3 py-2 border border-border rounded-md bg-background text-text-primary"
                >
                  <option value="full">Full (1,234g 56s 78c)</option>
                  <option value="compact">Compact (1.2k gold)</option>
                </select>
              </div>

              {/* Date Format */}
              <div>
                <Label htmlFor="date-format">Date Format</Label>
                <Input
                  id="date-format"
                  value={settings.displaySettings.dateFormat}
                  onChange={(e) => updateSetting('displaySettings', {
                    ...settings.displaySettings,
                    dateFormat: e.target.value
                  })}
                  className="mt-2"
                />
              </div>

              {/* Time Format */}
              <div>
                <Label htmlFor="time-format">Time Format</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={settings.displaySettings.timeFormat === '12h' ? 'default' : 'outline'}
                    onClick={() => updateSetting('displaySettings', {
                      ...settings.displaySettings,
                      timeFormat: '12h'
                    })}
                  >
                    12 Hour
                  </Button>
                  <Button
                    variant={settings.displaySettings.timeFormat === '24h' ? 'default' : 'outline'}
                    onClick={() => updateSetting('displaySettings', {
                      ...settings.displaySettings,
                      timeFormat: '24h'
                    })}
                  >
                    24 Hour
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart Settings</CardTitle>
              <CardDescription>
                Default chart preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Timeframe */}
              <div>
                <Label htmlFor="default-timeframe">Default Timeframe</Label>
                <select
                  id="default-timeframe"
                  value={settings.chartSettings.defaultTimeframe}
                  onChange={(e) => updateSetting('chartSettings', {
                    ...settings.chartSettings,
                    defaultTimeframe: e.target.value
                  })}
                  className="mt-2 px-3 py-2 border border-border rounded-md bg-background text-text-primary"
                >
                  <option value="1h">1 Hour</option>
                  <option value="6h">6 Hours</option>
                  <option value="12h">12 Hours</option>
                  <option value="1d">1 Day</option>
                  <option value="3d">3 Days</option>
                  <option value="1w">1 Week</option>
                  <option value="1m">1 Month</option>
                </select>
              </div>

              {/* Default Chart Type */}
              <div>
                <Label htmlFor="default-chart-type">Default Chart Type</Label>
                <select
                  id="default-chart-type"
                  value={settings.chartSettings.defaultChartType}
                  onChange={(e) => updateSetting('chartSettings', {
                    ...settings.chartSettings,
                    defaultChartType: e.target.value
                  })}
                  className="mt-2 px-3 py-2 border border-border rounded-md bg-background text-text-primary"
                >
                  <option value="candlestick">Candlestick</option>
                  <option value="line">Line</option>
                  <option value="area">Area</option>
                  <option value="bar">Bar</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Browser Notifications */}
              <div>
                <Label htmlFor="browser-notifications">Browser Notifications</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="browser-notifications"
                    type="checkbox"
                    checked={settings.notificationSettings.browserEnabled}
                    onChange={(e) => updateSetting('notificationSettings', {
                      ...settings.notificationSettings,
                      browserEnabled: e.target.checked
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">
                    Show browser notifications for price alerts
                  </span>
                </div>
              </div>

              {/* Sound Notifications */}
              <div>
                <Label htmlFor="sound-notifications">Sound Notifications</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="sound-notifications"
                    type="checkbox"
                    checked={settings.notificationSettings.soundEnabled}
                    onChange={(e) => updateSetting('notificationSettings', {
                      ...settings.notificationSettings,
                      soundEnabled: e.target.checked
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-text-secondary">
                    Play sound for notifications
                  </span>
                </div>
              </div>

              {/* Volume */}
              <div>
                <Label htmlFor="notification-volume">Notification Volume</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Volume2 className="h-4 w-4" />
                  <input
                    id="notification-volume"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.notificationSettings.volume}
                    onChange={(e) => updateSetting('notificationSettings', {
                      ...settings.notificationSettings,
                      volume: parseFloat(e.target.value)
                    })}
                    className="flex-1"
                  />
                  <span className="text-sm text-text-secondary w-12">
                    {Math.round(settings.notificationSettings.volume * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your local data and cache
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cache Size */}
              <div>
                <Label>Cache Size</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" onClick={handleGetCacheSize}>
                    Check Cache Size
                  </Button>
                  {cacheSize !== null && (
                    <span className="text-sm text-text-secondary">
                      {cacheSize} items cached
                    </span>
                  )}
                </div>
              </div>

              {/* Clear Cache */}
              <div>
                <Label>Clear Cache</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    onClick={handleClearCache}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Cache
                  </Button>
                  <span className="text-sm text-text-secondary">
                    This will clear all cached data and force fresh downloads
                  </span>
                </div>
              </div>

              {/* Export Data */}
              <div>
                <Label>Export Data</Label>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Watchlist
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                </div>
              </div>

              {/* Import Data */}
              <div>
                <Label>Import Data</Label>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Watchlist
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reset Settings</CardTitle>
              <CardDescription>
                Reset all settings to default values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={resetSettings}
                className="text-destructive"
              >
                Reset All Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
