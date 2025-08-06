import React from 'react';
import { Outlet } from 'react-router-dom';
// Importa aquí tu Navbar, Sidebar u otros componentes comunes

const Layout = () => {
  return (
    <div className="flex h-screen text-white">
      {/* Aquí puedes meter tu Sidebar */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
