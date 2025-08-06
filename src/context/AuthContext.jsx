import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Duración sesión y advertencia (5 min y 1 min)
  const SESSION_DURATION = 5 * 60 * 1000;
  const WARNING_TIME = 1 * 60 * 1000;

  const checkSession = useCallback(() => {
    const currentUser = user;
    const loginTime = localStorage.getItem('loginTime');

    if (currentUser && loginTime) {
      const timeElapsed = Date.now() - parseInt(loginTime);

      if (timeElapsed > SESSION_DURATION) {
        logout(true);
        return false;
      }

      if (timeElapsed > SESSION_DURATION - WARNING_TIME && !sessionExpired) {
        setSessionExpired(true);
      }

      return true;
    }
    return false;
  }, [SESSION_DURATION, WARNING_TIME, sessionExpired, user]);

  const extendSession = () => {
    const now = Date.now().toString();
    localStorage.setItem('loginTime', now);
    localStorage.setItem('lastActivity', now);
    setSessionExpired(false);
  };

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user'); // <-- obtener del localStorage
        const currentUser = storedUser ? JSON.parse(storedUser) : null;
        const loginTime = localStorage.getItem('loginTime');
  
        if (currentUser && loginTime) {
          const timeElapsed = Date.now() - parseInt(loginTime);
          if (timeElapsed <= SESSION_DURATION) {
            setUser(currentUser);
          } else {
            ApiService.auth.logout();
            localStorage.removeItem('loginTime');
            localStorage.removeItem('lastActivity');
            localStorage.removeItem('user'); // <-- también eliminar aquí
            console.log('Sesión expirada al cargar la aplicación');
          }
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        ApiService.auth.logout();
        localStorage.removeItem('loginTime');
        localStorage.removeItem('lastActivity');
        localStorage.removeItem('user');
      }
      setLoading(false);
    };
  
    initializeAuth();
  }, [SESSION_DURATION]);
  

  useEffect(() => {
    const handleUserActivity = () => {
      if (user && !sessionExpired) {
        const lastActivity = localStorage.getItem('lastActivity');
        const now = Date.now();

        if (!lastActivity || now - parseInt(lastActivity) > 10000) {
          extendSession();
        }
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [user, sessionExpired]);

  // CAMBIO CLAVE: uso await para login y manejo correcto respuesta
  const login = async (username, password, rememberMe = false) => {
    try {
      setLoading(true);
      const response = await ApiService.auth.login({username, password});

      if (response.status === 200 && response.data?.user) {
        setUser(response.data.user);
        setSessionExpired(false);

        const now = Date.now().toString();
        localStorage.setItem('loginTime', now);
        localStorage.setItem('lastActivity', now);

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        return { success: true, user: response.data.user };
      } else {
        return { success: false, message: response.message || 'Credenciales incorrectas' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: error.message || 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = (expired = false) => {
    ApiService.auth.logout();
    setUser(null);
    setSessionExpired(false);

    localStorage.removeItem('loginTime');
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('user');
    
    if (expired) {
      console.log('Sesión expirada - timeout de 5 minutos alcanzado');
      alert('Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.');
    }
  };

  const isAuthenticated = () => {
    if (!user) return false;

    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return false;

    const timeElapsed = Date.now() - parseInt(loginTime);
    return timeElapsed <= SESSION_DURATION;
  };

  const hasRole = (role) => user?.role === role;
  const isAdmin = () => user?.role === 'admin';
  const isViewer = () => user?.role === 'viewer';
  const canEdit = () => user?.role === 'admin' || user?.role === 'editor';

  const getRemainingTime = () => {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return 0;

    const timeElapsed = Date.now() - parseInt(loginTime);
    const remaining = SESSION_DURATION - timeElapsed;

    return Math.max(0, Math.floor(remaining / 1000)); // en segundos
  };

  const getRemainingTimeFormatted = () => {
    const seconds = getRemainingTime();
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole,
    isAdmin,
    isViewer,
    canEdit,
    loading,
    sessionExpired,
    extendSession,
    getRemainingTime,
    getRemainingTimeFormatted,
    SESSION_DURATION
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
