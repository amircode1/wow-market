'use client';

import { ReactNode } from 'react';

interface DashboardHeaderProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Dashboard Header - Title, description, and action controls
 */
export function DashboardHeader({
  children,
  title,
  description,
  actions,
}: DashboardHeaderProps) {
  if (children) {
    return <div>{children}</div>;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        {title && <h1 className="text-2xl font-bold">{title}</h1>}
        {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
