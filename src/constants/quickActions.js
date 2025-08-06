export const QUICK_ACTIONS = [
  { 
    title: 'Agregar Producto', 
    desc: 'Registrar nuevo producto', 
    icon: '➕', 
    color: '#3B82F6',
    route: '/productos'
  },
  { 
    title: 'Ver Inventario', 
    desc: 'Consultar productos', 
    icon: '📦', 
    color: '#10B981',
    route: '/productos'
  },
  {
    title: 'Registrar movimiento',
    desc: 'Agregar nuevo movimiento',
    icon: '🔄', // asegúrate que lucide-react lo reconozca
    color: '#F97316', // un naranja o cualquier color que quieras
    route: '/movimientos/nuevo'
  },
  { 
    title: 'Movimientos', 
    desc: 'Historial de cambios', 
    icon: '📊', 
    color: '#8B5CF6',
    route: '/movimientos'
  },
  { 
    title: 'Reportes', 
    desc: 'Análisis y estadísticas', 
    icon: '📈', 
    color: '#F59E0B',
    route: '/reportes'
  },
  { 
    title: 'Gestión Usuarios', 
    desc: 'Administrar usuarios del sistema', 
    icon: '👥', 
    color: '#EF4444',
    route: '/usuarios'
  }
];
