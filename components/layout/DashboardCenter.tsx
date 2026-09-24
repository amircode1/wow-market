'use client';

import { ReactNode } from 'react';

interface DashboardCenterProps {
  children?: ReactNode;
}

/**
 * Center Column - Main content area for charts, data, widgets
 */
export function DashboardCenter({ children }: DashboardCenterProps) {
  return (
    <div className="space-y-6">
      {children || (
        <div className="text-center text-text-secondary py-12">
          <p>Dashboard content goes here</p>
        </div>
      )}
    </div>
  );
}
