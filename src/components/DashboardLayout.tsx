import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppBackground } from './AppBackground';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const DashboardLayout: React.FC = () => {
  return (
    <AppBackground>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header title="" subtitle="" />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AppBackground>
  );
};
