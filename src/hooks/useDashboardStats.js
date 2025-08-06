import { useState, useEffect } from 'react';
import database from '../data/database.json';
import { useInventory } from '../context/InventoryContext';


export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalValue: 0,
    recentMovements: 0
  });

  const [loading, setLoading] = useState(true);
  const [previousStats, setPreviousStats] = useState({
    totalProducts: 0,
    totalValue: 0
  });
  
  const { products, movements } = useInventory();

  // Calcular estadísticas reales desde database.json
  const calculateStats = () => {
    try {
      setLoading(true);

      // 1. Total de productos activos
      const activeProducts = products.filter(product => product.status === 'active');
      const totalProducts = activeProducts.length;

      // 2. Productos con stock bajo (quantity <= minStock)
      const lowStock = activeProducts.filter(product => 
        product.quantity <= product.minStock
      ).length;

      // 3. Valor total del inventario (quantity * price)
      const getSafeQuantity = (product) =>
        parseInt(product.quantity) ||
        parseInt(product.stock) ||
        parseInt(product.qty) ||
        0;

      const getSafePrice = (product) =>
        parseFloat(product.price) ||
        parseFloat(product.cost) ||
        parseFloat(product.value) ||
        0;

      // Calcular el valor total con los campos flexibles
      const totalValue = activeProducts.reduce((total, product) => {
        const quantity = getSafeQuantity(product);
        const price = getSafePrice(product);
        return total + (quantity * price);
      }, 0);


      // 4. Movimientos de hoy
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      const recentMovements = movements.filter(movement => {
        const movementDate = movement.createdAt.split('T')[0];
        return movementDate === todayStr;
      }).length;

      // Guardar estadísticas anteriores para comparación
      setPreviousStats({
        totalProducts: stats.totalProducts,
        totalValue: stats.totalValue
      });

      // Actualizar estadísticas
      const newStats = {
        totalProducts,
        lowStock,
        totalValue,
        recentMovements
      };

      setStats(newStats);
      
      console.log('📊 Estadísticas calculadas:', newStats);
      
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtener detalles adicionales para el dashboard
  const getAdditionalMetrics = () => {
    const { products, movements, categories } = database;
    
    return {
      // Productos por categoría
      productsByCategory: categories.map(category => ({
        ...category,
        productCount: products.filter(p => p.categoryId === category.id && p.status === 'active').length
      })),
      
      // Movimientos recientes (últimos 7 días)
      recentMovementsDetail: movements
        .filter(movement => {
          const movementDate = new Date(movement.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return movementDate >= weekAgo;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      
      // Productos con stock crítico (detalles)
      criticalStockProducts: products
        .filter(product => product.quantity <= product.minStock && product.status === 'active')
        .map(product => ({
          ...product,
          categoryName: categories.find(c => c.id === product.categoryId)?.name || 'Sin categoría'
        })),
      
      // Movimientos por tipo (entrada/salida)
      movementsByType: {
        entrada: movements.filter(m => m.type === 'entrada').length,
        salida: movements.filter(m => m.type === 'salida').length
      },
      
      // Valor por categoría
      valueByCategory: categories.map(category => {
        const categoryProducts = products.filter(p => 
          p.categoryId === category.id && p.status === 'active'
        );
        const categoryValue = categoryProducts.reduce((total, product) => 
          total + (product.quantity * product.price), 0
        );
        return {
          ...category,
          value: categoryValue,
          productCount: categoryProducts.length
        };
      }),
      
      // Estadísticas de la última semana
      weeklyStats: calculateWeeklyStats(movements)
    };
  };

  // Calcular estadísticas semanales
  const calculateWeeklyStats = (movements) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyMovements = movements.filter(movement => 
      new Date(movement.createdAt) >= weekAgo
    );
    
    return {
      totalMovements: weeklyMovements.length,
      entradas: weeklyMovements.filter(m => m.type === 'entrada').length,
      salidas: weeklyMovements.filter(m => m.type === 'salida').length,
      dailyAverage: Math.round(weeklyMovements.length / 7)
    };
  };

  // Actualizar estadísticas manualmente
  const updateStats = (newStats) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  // Refrescar datos
  const refreshStats = () => {
    calculateStats();
  };

  // Cargar datos iniciales
  useEffect(() => {
    calculateStats();
  }, []);

  // Auto-refresh cada 2 minutos para simular datos en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      calculateStats();
    }, 2 * 60 * 1000); // 2 minutos

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    loading,
    previousStats,
    updateStats,
    refreshStats,
    getAdditionalMetrics,
    // Funciones helper para formateo
    formatters: {
      currency: (value) => new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }).format(value),
      
      percentage: (current, previous) => {
        if (previous === 0) return '0';
        const change = ((current - previous) / previous * 100);
        return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
      },
      
      date: (dateString) => new Date(dateString).toLocaleDateString('es-MX'),
      
      time: (dateString) => new Date(dateString).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  };
};