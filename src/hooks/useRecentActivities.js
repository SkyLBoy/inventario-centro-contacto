import { useState } from 'react';

export const useRecentActivities = () => {
  const [activities, setActivities] = useState([
    { action: 'Producto agregado', item: 'Laptop HP Pavilion', time: '10:30 AM' },
    { action: 'Stock actualizado', item: 'Mouse Logitech', time: '09:15 AM' },
    { action: 'Producto eliminado', item: 'Teclado genérico', time: '08:45 AM' },
  ]);

  const addActivity = (newActivity) => {
    setActivities(prev => [newActivity, ...prev.slice(0, 2)]);
  };

  const clearActivities = () => {
    setActivities([]);
  };

  return {
    activities,
    addActivity,
    clearActivities
  };
};