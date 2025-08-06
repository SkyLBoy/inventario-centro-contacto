// src/services/authService.js
import { authAPI } from './api';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'inventario_auth_token';
    this.USER_KEY = 'inventario_current_user';
  }

  // Iniciar sesión
  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.status === 200) {
        // Guardar token y usuario en localStorage
        localStorage.setItem(this.TOKEN_KEY, response.data.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
          message: 'Inicio de sesión exitoso'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión'
      };
    }
  }

  // Cerrar sesión
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    return {
      success: true,
      message: 'Sesión cerrada correctamente'
    };
  }

  // Obtener token actual
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Obtener usuario actual
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  // Validar token con el servidor
  async validateToken() {
    const token = this.getToken();
    if (!token) {
      return { valid: false, message: 'No hay token' };
    }

    try {
      const response = await authAPI.validateToken(token);
      
      if (response.status === 200) {
        // Actualizar datos del usuario si es necesario
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
        
        return {
          valid: true,
          user: response.data.user
        };
      }
    } catch (error) {
      // Token inválido, limpiar localStorage
      this.logout();
      return {
        valid: false,
        message: error.message || 'Token inválido'
      };
    }
  }

  // Verificar permisos del usuario
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Administradores tienen todos los permisos
    if (user.role === 'admin') return true;

    // Definir permisos por rol
    const permissions = {
      user: ['read_products', 'read_categories', 'create_movements'],
      manager: ['read_products', 'read_categories', 'create_movements', 'create_products', 'update_products'],
      admin: ['*'] // Todos los permisos
    };

    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }

  // Verificar si es administrador
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  // Verificar si es manager
  isManager() {
    const user = this.getCurrentUser();
    return user?.role === 'manager';
  }

  // Obtener headers de autenticación para requests
  getAuthHeaders() {
    const token = this.getToken();
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  }

  // Manejar errores de autenticación
  handleAuthError(error) {
    if (error.status === 401) {
      this.logout();
      return {
        success: false,
        message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
        requiresLogin: true
      };
    }

    return {
      success: false,
      message: error.message || 'Error de autenticación'
    };
  }

  // Renovar sesión automáticamente
  async refreshSession() {
    const validation = await this.validateToken();
    if (!validation.valid) {
      this.logout();
      return false;
    }
    return true;
  }

  // Configurar renovación automática de sesión
  setupAutoRefresh(intervalMinutes = 30) {
    setInterval(async () => {
      if (this.isAuthenticated()) {
        await this.refreshSession();
      }
    }, intervalMinutes * 60 * 1000);
  }
}

// Crear instancia singleton
const authService = new AuthService();

// Configurar renovación automática al importar
if (typeof window !== 'undefined') {
  authService.setupAutoRefresh(30); // Cada 30 minutos
}

export default authService;