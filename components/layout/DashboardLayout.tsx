'use client';

import { ReactNode } from 'react';
import { useUIStore } from '@/store';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardPanel } from './DashboardPanel';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  panel?: ReactNode;
  panelOpen?: boolean;
}

/**
 * 3-Column Dashboard Layout
 * Desktop: Sidebar (300px) | Center (flex) | Panel (320px sticky)
 * Mobile: Full-width center with collapsible sidebar (hamburger)
 */
export function DashboardLayout({
  header,
  sidebar,
  children,
  panel,
  panelOpen = false,
}: DashboardLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          'hidden lg:flex lg:w-80 lg:flex-col border-r bg-background transition-all duration-300',
          'overflow-y-auto'
        )}
      >
        {sidebar || <DashboardSidebar />}
      </aside>

      {/* Sidebar - Mobile (Overlay) */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={closeSidebar}
          />

          {/* Mobile Sidebar */}
          <aside
            className={cn(
              'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background',
              'overflow-y-auto lg:hidden'
            )}
          >
            {sidebar || <DashboardSidebar />}
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        {header && (
          <header className="border-b bg-background px-6 py-4">
            {header}
          </header>
        )}

        {/* Center Content */}
        <main className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </main>
      </div>

      {/* Right Panel - Desktop */}
      {panelOpen && (
        <aside
          className={cn(
            'hidden lg:flex lg:w-96 lg:flex-col border-l bg-background transition-all duration-300',
            'overflow-y-auto sticky right-0 top-0'
          )}
        >
          {panel || <DashboardPanel />}
        </aside>
      )}

      {/* Right Panel - Mobile (Modal) */}
      {panelOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={closeSidebar}
          />

          {/* Mobile Panel */}
          <div
            className={cn(
              'fixed right-0 top-0 z-40 h-screen w-full max-w-md border-l bg-background',
              'overflow-y-auto lg:hidden'
            )}
          >
            {panel || <DashboardPanel />}
          </div>
        </>
      )}
    </div>
  );
}
