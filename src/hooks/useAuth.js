import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';

const useAuth = () => {
  const [storedUser, setStoredUser] = useLocalStorage('inventory_current_user', null);
  const [user, setUser] = useState(storedUser);

  const login = (userData) => {
    setUser(userData);
    setStoredUser(userData);
  };

  const logout = () => {
    setUser(null);
    setStoredUser(null);
  };

  const isAuthenticated = !!user;
  const role = user?.rol || 'visualizador';

  return { user, login, logout, isAuthenticated, role };
};

export default useAuth;
