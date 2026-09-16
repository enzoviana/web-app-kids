import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarV2 } from './SidebarV2';


export const DashboardLayoutV2: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <SidebarV2 collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">


        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
