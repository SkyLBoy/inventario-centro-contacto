// src/services/inventoryService.js
import api from './api';
import authService from './authService';

class InventoryService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // Utilidades de caché
  getCacheKey(method, params = {}) {
    return `${method}_${JSON.stringify(params)}`;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clearCache() {
    this.cache.clear();
  }

  // PRODUCTOS
  async getProducts(useCache = true) {
    const cacheKey = this.getCacheKey('products');
    
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await api.products.getAll();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async getProduct(id) {
    try {
      const response = await api.products.getById(id);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async createProduct(productData) {
    try {
      const response = await api.products.create(productData);
      if (response.status === 201) {
        this.clearCache(); // Limpiar caché después de crear
      }
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async updateProduct(id, productData) {
    try {
      const response = await api.products.update(id, productData);
      if (response.status === 200) {
        this.clearCache(); // Limpiar caché después de actualizar
      }
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async deleteProduct(id) {
    try {
      const response = await api.products.delete(id);
      if (response.status === 200) {
        this.clearCache(); // Limpiar caché después de eliminar
      }
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async getLowStockProducts() {
    const cacheKey = this.getCacheKey('lowStock');
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.products.getLowStock();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  // CATEGORÍAS
  async getCategories(useCache = true) {
    const cacheKey = this.getCacheKey('categories');
    
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await api.categories.getAll();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async getCategory(id) {
    try {
      const response = await api.categories.getById(id);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await api.categories.create(categoryData);
      if (response.status === 201) {
        this.clearCache();
      }
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const response = await api.categories.update(id, categoryData);
      if (response.status === 200) {
        this.clearCache();
      }
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async deleteCategory(id) {
    try {
      const response = await api.categories.delete(id);
      if (response.status === 200) {
        this.clearCache();
      }
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  // MOVIMIENTOS
  async getMovements(useCache = true) {
    const cacheKey = this.getCacheKey('movements');
    
    if (useCache) {
      const cached = this.getCache(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await api.movements.getAll();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async getMovement(id) {
    try {
      const response = await api.movements.getById(id);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async createMovement(movementData) {
    try {
      // Agregar el ID del usuario actual
      const currentUser = authService.getCurrentUser();
      const dataWithUser = {
        ...movementData,
        userId: currentUser?.id || 1
      };

      const response = await api.movements.create(dataWithUser);
      if (response.status === 201) {
        this.clearCache(); // Limpiar caché después de crear movimiento
      }
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  // USUARIOS
  async getUsers() {
    try {
      const response = await api.users.getAll();
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async getUser(id) {
    try {
      const response = await api.users.getById(id);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async createUser(userData) {
    try {
      const response = await api.users.create(userData);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await api.users.update(id, userData);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async deleteUser(id) {
    try {
      const response = await api.users.delete(id);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  // DASHBOARD Y ESTADÍSTICAS
  async getDashboardStats() {
    const cacheKey = this.getCacheKey('dashboardStats');
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.dashboard.getStats();
      this.setCache(cacheKey, response);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  // REPORTES
  async getReports() {
    try {
      const response = await api.reports.getAll();
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async generateReport(reportType) {
    try {
      const response = await api.reports.generate(reportType);
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  // FUNCIONES DE BÚSQUEDA Y FILTRADO
  async searchProducts(query, category = null) {
    try {
      const response = await this.getProducts();
      if (!response || response.status !== 200) return response;

      let products = response.data;

      // Filtrar por categoría si se especifica
      if (category) {
        products = products.filter(product => product.categoryId === parseInt(category));
      }

      // Filtrar por texto de búsqueda
      if (query) {
        const searchQuery = query.toLowerCase();
        products = products.filter(product => 
          product.name.toLowerCase().includes(searchQuery) ||
          product.description.toLowerCase().includes(searchQuery) ||
          product.code.toLowerCase().includes(searchQuery) ||
          product.supplier.toLowerCase().includes(searchQuery)
        );
      }

      return {
        ...response,
        data: products
      };
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async searchMovements(query, type = null, startDate = null, endDate = null) {
    try {
      const response = await this.getMovements();
      if (!response || response.status !== 200) return response;

      let movements = response.data;

      // Filtrar por tipo
      if (type) {
        movements = movements.filter(movement => movement.type === type);
      }

      // Filtrar por rango de fechas
      if (startDate) {
        movements = movements.filter(movement => 
          new Date(movement.createdAt) >= new Date(startDate)
        );
      }

      if (endDate) {
        movements = movements.filter(movement => 
          new Date(movement.createdAt) <= new Date(endDate)
        );
      }

      // Filtrar por texto de búsqueda
      if (query) {
        const searchQuery = query.toLowerCase();
        movements = movements.filter(movement => 
          movement.product?.name.toLowerCase().includes(searchQuery) ||
          movement.reason.toLowerCase().includes(searchQuery) ||
          movement.notes?.toLowerCase().includes(searchQuery)
        );
      }

      return {
        ...response,
        data: movements
      };
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  // FUNCIONES DE VALIDACIÓN
  validateProductData(productData) {
    const errors = [];

    if (!productData.name || productData.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!productData.categoryId) {
      errors.push('Debe seleccionar una categoría');
    }

    if (productData.quantity < 0) {
      errors.push('La cantidad no puede ser negativa');
    }

    if (productData.minStock < 0) {
      errors.push('El stock mínimo no puede ser negativo');
    }

    if (productData.price < 0) {
      errors.push('El precio no puede ser negativo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateMovementData(movementData) {
    const errors = [];

    if (!movementData.productId) {
      errors.push('Debe seleccionar un producto');
    }

    if (!movementData.type || !['entrada', 'salida'].includes(movementData.type)) {
      errors.push('Debe seleccionar un tipo de movimiento válido');
    }

    if (!movementData.quantity || movementData.quantity <= 0) {
      errors.push('La cantidad debe ser mayor a 0');
    }

    if (!movementData.reason || movementData.reason.trim().length < 3) {
      errors.push('Debe especificar una razón para el movimiento');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // UTILIDADES DE BASE DE DATOS
  async resetDatabase() {
    try {
      const response = await api.database.reset();
      if (response.status === 200) {
        this.clearCache();
      }
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async exportData() {
    try {
      const response = await api.database.export();
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }

  async importData(jsonData) {
    try {
      const response = await api.database.import(jsonData);
      if (response.status === 200) {
        this.clearCache();
      }
      return response;
    } catch (error) {
      return authService.handleAuthError(error);
    }
  }
}

// Crear instancia singleton
const inventoryService = new InventoryService();
export default inventoryService;