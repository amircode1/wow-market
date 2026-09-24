'use client';

import { ReactNode } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { DashboardHeader } from './DashboardHeader';
import { DashboardCenter } from './DashboardCenter';

export interface DashboardPageProps {
  title?: string;
  description?: string;
  headerActions?: ReactNode;
  sidebarContent?: ReactNode;
  children: ReactNode;
  panelContent?: ReactNode;
  panelOpen?: boolean;
}

/**
 * Template page for consistent dashboard layout across the app
 */
export function DashboardPageTemplate({
  title,
  description,
  headerActions,
  sidebarContent,
  children,
  panelContent,
  panelOpen = false,
}: DashboardPageProps) {
  return (
    <DashboardLayout
      header={
        title ? (
          <DashboardHeader
            title={title}
            description={description}
            actions={headerActions}
          />
        ) : undefined
      }
      sidebar={sidebarContent}
      panelOpen={panelOpen}
      panel={panelContent}
    >
      <DashboardCenter>{children}</DashboardCenter>
    </DashboardLayout>
  );
}
