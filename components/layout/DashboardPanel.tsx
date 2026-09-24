'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store';

interface DashboardPanelProps {
  children?: ReactNode;
  title?: string;
}

/**
 * Right Panel - Item Details (desktop sticky, mobile modal)
 */
export function DashboardPanel({ children, title = 'Details' }: DashboardPanelProps) {
  const { setSidebarOpen } = useUIStore();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          className="h-8 w-8 lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {children || (
          <div className="text-sm text-text-secondary">
            <p>Select an item to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
