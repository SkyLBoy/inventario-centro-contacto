import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  TrendingUp, 
  Users, 
  BarChart3,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Productos', href: '/productos', icon: Package },
    { name: 'Categorías', href: '/categorias', icon: Tag },
    { name: 'Movimientos', href: '/movimientos', icon: TrendingUp },
    { name: 'Usuarios', href: '/usuarios', icon: Users },
    { name: 'Reportes', href: '/reportes', icon: BarChart3 },
    { name: 'Configuración', href: '/configuracion', icon: Settings },
  ];

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <Package className="w-8 h-8 text-white mr-2" />
        <span className="text-white text-lg font-semibold">Inventario</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;