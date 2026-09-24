'use client';

import { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store';

interface DashboardSidebarProps {
  children?: ReactNode;
}

/**
 * Left Sidebar - Filters, Watchlist Preview, Navigation
 */
export function DashboardSidebar({ children }: DashboardSidebarProps) {
  const { setSidebarOpen } = useUIStore();

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b lg:hidden">
        <h2 className="text-lg font-semibold">Filters</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          className="h-8 w-8"
        >
          ✕
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {children || (
          <div className="text-sm text-text-secondary">
            <p className="mb-4 font-medium">Sidebar Content</p>
            <ul className="space-y-2 text-xs">
              <li>• Watchlist Preview</li>
              <li>• Category Filters</li>
              <li>• Price Range</li>
              <li>• Item Level</li>
              <li>• Rarity Filters</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
