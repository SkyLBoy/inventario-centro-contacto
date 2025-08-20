// hooks/useRecentActivities.js
import { useState, useEffect, useCallback } from 'react';

export const ACTIVITY_TYPES = {
  // Actividades de usuarios
  USER_CREATED: 'Usuario creado',
  USER_UPDATED: 'Usuario actualizado', 
  USER_DELETED: 'Usuario eliminado',
  
  // Actividades de productos
  PRODUCT_CREATED: 'Producto agregado',
  PRODUCT_UPDATED: 'Producto editado',
  PRODUCT_DELETED: 'Producto eliminado',
  STOCK_UPDATED: 'Stock actualizado',
  PRODUCT_MOVED: 'Producto movido',
  
  // Actividades de categorías
  CATEGORY_CREATED: 'Categoría creada',
  CATEGORY_UPDATED: 'Categoría editada',
  CATEGORY_DELETED: 'Categoría eliminada',
  
  // Actividades de movimientos
  MOVEMENT_CREATED: 'Movimiento registrado',
  MOVEMENT_UPDATED: 'Movimiento actualizado',
  MOVEMENT_DELETED: 'Movimiento eliminado',
  
  // Actividades del sistema (solo acciones importantes)
  QUICK_ACTION_STOCK_ALERT: 'Alerta de stock verificada',
  QUICK_ACTION_BACKUP_CREATED: 'Respaldo creado',
  QUICK_ACTION_REPORT_GENERATED: 'Reporte generado',
  QUICK_ACTION_SYSTEM_MAINTENANCE: 'Mantenimiento realizado',
  LOGIN: 'Inicio de sesión',
  LOGOUT: 'Cierre de sesión',
  BULK_IMPORT: 'Importación masiva',
  BULK_EXPORT: 'Exportación masiva'
};

const STORAGE_KEY = 'recentActivities';
const MAX_ACTIVITIES = 100;

export const useRecentActivities = () => {
  const [activities, setActivities] = useState([]);

  // Cargar actividades del localStorage al inicializar
  useEffect(() => {
    const loadActivities = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedActivities = JSON.parse(stored);
          setActivities(parsedActivities);
        }
      } catch (error) {
        console.error('Error loading activities from localStorage:', error);
      }
    };

    loadActivities();
  }, []);

  // Guardar actividades en localStorage cuando cambien
  useEffect(() => {
    if (activities.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
      } catch (error) {
        console.error('Error saving activities to localStorage:', error);
      }
    }
  }, [activities]);

  const addActivity = useCallback((activityData) => {
    const newActivity = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('es-ES'),
      time: new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      ...activityData
    };

    setActivities(prev => {
      const updated = [newActivity, ...prev].slice(0, MAX_ACTIVITIES);
      return updated;
    });

    return newActivity;
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const removeActivity = useCallback((activityId) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
  }, []);

  // Funciones específicas para diferentes tipos de actividades
  const logUserActivity = useCallback((type, userName, actorName, details = null) => {
    return addActivity({
      action: type,
      item: userName,
      user: actorName || 'Sistema',
      details,
      category: 'users',
      icon: '👤'
    });
  }, [addActivity]);

  const logProductActivity = useCallback((type, productName, actorName, details = null) => {
    const icons = {
      [ACTIVITY_TYPES.PRODUCT_CREATED]: '📦',
      [ACTIVITY_TYPES.PRODUCT_UPDATED]: '✏️',
      [ACTIVITY_TYPES.PRODUCT_DELETED]: '🗑️',
      [ACTIVITY_TYPES.STOCK_UPDATED]: '📊',
      [ACTIVITY_TYPES.PRODUCT_MOVED]: '🚚'
    };

    return addActivity({
      action: type,
      item: productName,
      user: actorName || 'Sistema',
      details,
      category: 'products',
      icon: icons[type] || '📦'
    });
  }, [addActivity]);

  const logCategoryActivity = useCallback((type, categoryName, actorName, details = null) => {
    const icons = {
      [ACTIVITY_TYPES.CATEGORY_CREATED]: '🏷️',
      [ACTIVITY_TYPES.CATEGORY_UPDATED]: '✏️',
      [ACTIVITY_TYPES.CATEGORY_DELETED]: '🗑️'
    };

    return addActivity({
      action: type,
      item: categoryName,
      user: actorName || 'Sistema',
      details,
      category: 'categories',
      icon: icons[type] || '🏷️'
    });
  }, [addActivity]);

  const logMovementActivity = useCallback((type, productName, actorName, movementType, quantity = null, location = null) => {
    const details = [];
    if (movementType) details.push(`Tipo: ${movementType}`);
    if (quantity) details.push(`Cantidad: ${quantity}`);
    if (location) details.push(`Ubicación: ${location}`);

    return addActivity({
      action: `${type}${movementType ? `: ${movementType}` : ''}`,
      item: productName,
      user: actorName || 'Sistema',
      details: details.length > 0 ? details.join(', ') : null,
      category: 'movements',
      icon: '📋'
    });
  }, [addActivity]);

  const logSystemActivity = useCallback((type, item, actorName, details = null) => {
    const icons = {
      [ACTIVITY_TYPES.QUICK_ACTION_STOCK_ALERT]: '⚠️',
      [ACTIVITY_TYPES.QUICK_ACTION_BACKUP_CREATED]: '💾',
      [ACTIVITY_TYPES.LOGIN]: '🔑',
      [ACTIVITY_TYPES.LOGOUT]: '🚪',
    };

    return addActivity({
      action: type,
      item,
      user: actorName || 'Sistema',
      details,
      category: 'system',
      icon: icons[type] || '⚙️'
    });
  }, [addActivity]);

  // Función para obtener actividades filtradas por categoría
  const getActivitiesByCategory = useCallback((category) => {
    return activities.filter(activity => activity.category === category);
  }, [activities]);

  // Función para obtener actividades de las últimas X horas
  const getRecentActivities = useCallback((hours = 24) => {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    
    return activities.filter(activity => {
      const activityTime = new Date(activity.timestamp);
      return activityTime >= cutoffTime;
    });
  }, [activities]);

  return {
    activities,
    addActivity,
    clearActivities,
    removeActivity,
    logUserActivity,
    logProductActivity,
    logCategoryActivity,
    logMovementActivity,
    logSystemActivity,
    getActivitiesByCategory,
    getRecentActivities,
    totalActivities: activities.length
  };
};