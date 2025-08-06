import databaseService from './databaseService';

// Simulador de respuestas HTTP
const createResponse = (data, status = 200) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (status >= 400) {
        reject({ 
          status, 
          message: data.message || 'Error en la operación',
          data 
        });
      } else {
        resolve({ 
          status, 
          data,
          message: 'Operación exitosa'
        });
      }
    }, Math.random() * 500 + 100); // Simula latencia variable
  });
};

// API para productos
export const productsAPI = {
  getAll: async () => {
    try {
      const products = await databaseService.getProductsWithCategory();
      return createResponse(products);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  getById: async (id) => {
    try {
      const product = await databaseService.getById('products', id);
      if (!product) {
        return createResponse({ message: 'Producto no encontrado' }, 404);
      }
      return createResponse(product);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  create: async (productData) => {
    try {
      // Validación básica
      if (!productData.name || !productData.categoryId) {
        return createResponse({ message: 'Nombre y categoría son requeridos' }, 400);
      }

      const product = await databaseService.create('products', {
        ...productData,
        status: 'active'
      });
      return createResponse(product, 201);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  update: async (id, productData) => {
    try {
      const product = await databaseService.update('products', id, productData);
      return createResponse(product);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      return createResponse({ message: error.message }, status);
    }
  },

  delete: async (id) => {
    try {
      await databaseService.delete('products', id);
      return createResponse({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      return createResponse({ message: error.message }, status);
    }
  },

  getLowStock: async () => {
    try {
      const products = await databaseService.getLowStockProducts();
      return createResponse(products);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  }
};

// API para categorías
export const categoriesAPI = {
  getAll: async () => {
    try {
      const categories = await databaseService.getAll('categories');
      return createResponse(categories.filter(cat => cat.isActive));
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  getById: async (id) => {
    try {
      const category = await databaseService.getById('categories', id);
      if (!category) {
        return createResponse({ message: 'Categoría no encontrada' }, 404);
      }
      return createResponse(category);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  create: async (categoryData) => {
    try {
      if (!categoryData.name) {
        return createResponse({ message: 'El nombre es requerido' }, 400);
      }

      const category = await databaseService.create('categories', {
        ...categoryData,
        isActive: true,
        color: categoryData.color || '#3B82F6'
      });
      return createResponse(category, 201);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  update: async (id, categoryData) => {
    try {
      const category = await databaseService.update('categories', id, categoryData);
      return createResponse(category);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      return createResponse({ message: error.message }, status);
    }
  },

  delete: async (id) => {
    try {
      // Soft delete - marcar como inactiva en lugar de eliminar
      const category = await databaseService.update('categories', id, { isActive: false });
      return createResponse({ message: 'Categoría desactivada correctamente' });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      return createResponse({ message: error.message }, status);
    }
  }
};

// API para movimientos
export const movementsAPI = {
  getAll: async () => {
    try {
      const movements = await databaseService.getMovementsWithDetails();
      return createResponse(movements.reverse()); // Más recientes primero
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  getById: async (id) => {
    try {
      const movement = await databaseService.getById('movements', id);
      if (!movement) {
        return createResponse({ message: 'Movimiento no encontrado' }, 404);
      }
      return createResponse(movement);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  create: async (movementData) => {
    try {
      if (!movementData.productId || !movementData.type || !movementData.quantity) {
        return createResponse({ 
          message: 'Producto, tipo y cantidad son requeridos' 
        }, 400);
      }

      const movement = await databaseService.createMovement(movementData);
      return createResponse(movement, 201);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  }
};

// API para usuarios
export const usersAPI = {
  getAll: async () => {
    try {
      const users = await databaseService.getAll('users');
      // No devolver passwords
      const safeUsers = users.map(({ password, ...user }) => user);
      return createResponse(safeUsers);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  getById: async (id) => {
    try {
      const user = await databaseService.getById('users', id);
      if (!user) {
        return createResponse({ message: 'Usuario no encontrado' }, 404);
      }
      const { password, ...safeUser } = user;
      return createResponse(safeUser);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  create: async (userData) => {
    try {
      if (!userData.username || !userData.email || !userData.password) {
        return createResponse({ 
          message: 'Username, email y password son requeridos' 
        }, 400);
      }

      const user = await databaseService.create('users', {
        ...userData,
        role: userData.role || 'user',
        isActive: true
      });

      const { password, ...safeUser } = user;
      return createResponse(safeUser, 201);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  update: async (id, userData) => {
    try {
      const user = await databaseService.update('users', id, userData);
      const { password, ...safeUser } = user;
      return createResponse(safeUser);
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      return createResponse({ message: error.message }, status);
    }
  },

  delete: async (id) => {
    try {
      // Soft delete
      await databaseService.update('users', id, { isActive: false });
      return createResponse({ message: 'Usuario desactivado correctamente' });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 500;
      return createResponse({ message: error.message }, status);
    }
  }
};

// API para autenticación - ACTUALIZADA CON LOGOUT
export const authAPI = {
  login: async ({ username, password }) => {
    try {
      if (!username || !password) {
        return createResponse({ message: 'Username y password son requeridos' }, 400);
      }

      const user = await databaseService.authenticateUser(username, password);

      if (!user) {
        return createResponse({ message: 'Credenciales inválidas' }, 401);
      }

      const { password: pwd, ...safeUser } = user;
      // Puedes generar un token falso para simular autenticación
      const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));

      return createResponse({
        user: safeUser,
        token,
        expiresIn: '24h'
      }, 200);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  logout: async () => {
    try {
      // Aquí puedes limpiar cualquier estado de sesión si fuera necesario
      return createResponse({ message: 'Logout exitoso' }, 200);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  }
};
// API para dashboard
export const dashboardAPI = {
  getStats: async () => {
    try {
      const stats = await databaseService.getDashboardStats();
      return createResponse(stats);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  }
};

// API para reportes
export const reportsAPI = {
  getAll: async () => {
    try {
      const reports = await databaseService.getAll('reports');
      return createResponse(reports);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  generate: async (reportType) => {
    try {
      let reportData = {};

      switch (reportType) {
        case 'inventory':
          reportData = await databaseService.getProductsWithCategory();
          break;
        case 'movements':
          reportData = await databaseService.getMovementsWithDetails();
          break;
        case 'lowstock':
          reportData = await databaseService.getLowStockProducts();
          break;
        default:
          return createResponse({ message: 'Tipo de reporte no válido' }, 400);
      }

      const report = await databaseService.create('reports', {
        name: `Reporte ${reportType}`,
        type: reportType,
        userId: 1, // ID del usuario actual
        status: 'completed',
        data: reportData
      });

      return createResponse(report, 201);
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  }
};

// Funciones de utilidad para el manejo de la base de datos
export const databaseUtils = {
  reset: async () => {
    try {
      await databaseService.resetDatabase();
      return createResponse({ message: 'Base de datos reiniciada correctamente' });
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  export: () => {
    try {
      const data = databaseService.exportData();
      return createResponse({ data });
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  },

  import: async (jsonData) => {
    try {
      const success = await databaseService.importData(jsonData);
      if (success) {
        return createResponse({ message: 'Datos importados correctamente' });
      } else {
        return createResponse({ message: 'Error al importar datos' }, 400);
      }
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  }
};

// Export por defecto con todas las APIs - ACTUALIZADO CON initializeData
const api = {
  products: productsAPI,
  categories: categoriesAPI,
  movements: movementsAPI,
  users: usersAPI,
  auth: authAPI,
  dashboard: dashboardAPI,
  reports: reportsAPI,
  database: databaseUtils,
  
  // NUEVA FUNCIÓN initializeData
  initializeData: async () => {
    try {
      // Verificar si ya hay datos inicializados
      const users = await databaseService.getAll('users');
      if (users && users.length > 0) {
        return createResponse({ message: 'Datos ya inicializados' });
      }

      await databaseService.initializeDefaultData?.() || Promise.resolve();
      
      return createResponse({ message: 'Datos inicializados correctamente' });
    } catch (error) {
      return createResponse({ message: error.message }, 500);
    }
  }
};

export default api;

export const ApiService = api;