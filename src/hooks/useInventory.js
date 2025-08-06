// src/hooks/useInventory.js
import { useState, useEffect, useCallback } from 'react';
import inventoryService from '../services/inventoryService';

export const useInventory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para datos
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [movements, setMovements] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Función para manejar operaciones asíncronas
  const handleAsyncOperation = useCallback(async (operation, onSuccess = null) => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      
      if (result.success === false) {
        throw new Error(result.message);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Ha ocurrido un error';
      setError(errorMessage);
      console.error('Operation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // PRODUCTOS
  const loadProducts = useCallback(async (useCache = true) => {
    return handleAsyncOperation(
      () => inventoryService.getProducts(useCache),
      (result) => {
        if (result.status === 200) {
          setProducts(result.data);
        }
      }
    );
  }, [handleAsyncOperation]);

  const createProduct = useCallback(async (productData) => {
    const validation = inventoryService.validateProductData(productData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return handleAsyncOperation(
      () => inventoryService.createProduct(productData),
      () => loadProducts(false) // Recargar productos después de crear
    );
  }, [handleAsyncOperation, loadProducts]);

  const updateProduct = useCallback(async (id, productData) => {
    const validation = inventoryService.validateProductData(productData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return handleAsyncOperation(
      () => inventoryService.updateProduct(id, productData),
      () => loadProducts(false)
    );
  }, [handleAsyncOperation, loadProducts]);

  const deleteProduct = useCallback(async (id) => {
    return handleAsyncOperation(
      () => inventoryService.deleteProduct(id),
      () => loadProducts(false)
    );
  }, [handleAsyncOperation, loadProducts]);

  const searchProducts = useCallback(async (query, category = null) => {
    return handleAsyncOperation(
      () => inventoryService.searchProducts(query, category),
      (result) => {
        if (result.status === 200) {
          setProducts(result.data);
        }
      }
    );
  }, [handleAsyncOperation]);

  // CATEGORÍAS
  const loadCategories = useCallback(async (useCache = true) => {
    return handleAsyncOperation(
      () => inventoryService.getCategories(useCache),
      (result) => {
        if (result.status === 200) {
          setCategories(result.data);
        }
      }
    );
  }, [handleAsyncOperation]);

  const createCategory = useCallback(async (categoryData) => {
    return handleAsyncOperation(
      () => inventoryService.createCategory(categoryData),
      () => loadCategories(false)
    );
  }, [handleAsyncOperation, loadCategories]);

  const updateCategory = useCallback(async (id, categoryData) => {
    return handleAsyncOperation(
      () => inventoryService.updateCategory(id, categoryData),
      () => loadCategories(false)
    );
  }, [handleAsyncOperation, loadCategories]);

  const deleteCategory = useCallback(async (id) => {
    return handleAsyncOperation(
      () => inventoryService.deleteCategory(id),
      () => loadCategories(false)
    );
  }, [handleAsyncOperation, loadCategories]);

  // MOVIMIENTOS
  const loadMovements = useCallback(async (useCache = true) => {
    return handleAsyncOperation(
      () => inventoryService.getMovements(useCache),
      (result) => {
        if (result.status === 200) {
          setMovements(result.data);
        }
      }
    );
  }, [handleAsyncOperation]);

  const createMovement = useCallback(async (movementData) => {
    const validation = inventoryService.validateMovementData(movementData);
    console.log('Validación movimiento:', validation);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    return handleAsyncOperation(
      () => inventoryService.createMovement(movementData),
      () => {
        loadMovements(false);
        loadProducts(false); // También recargar productos por el cambio de stock
      }
    );
  }, [handleAsyncOperation, loadMovements, loadProducts]);

  const searchMovements = useCallback(async (query, type = null, startDate = null, endDate = null) => {
    return handleAsyncOperation(
      () => inventoryService.searchMovements(query, type, startDate, endDate),
      (result) => {
        if (result.status === 200) {
          setMovements(result.data);
        }
      }
    );
  }, [handleAsyncOperation]);

  // USUARIOS
  const loadUsers = useCallback(async () => {
    return handleAsyncOperation(
      () => inventoryService.getUsers(),
      (result) => {
        if (result.status === 200) {
          setUsers(result.data);
        }
      }
    );
  }, [handleAsyncOperation]);

  const createUser = useCallback(async (userData) => {
    return handleAsyncOperation(
      () => inventoryService.createUser(userData),
      () => loadUsers()
    );
  }, [handleAsyncOperation, loadUsers]);

  const updateUser = useCallback(async (id, userData) => {
    return handleAsyncOperation(
      () => inventoryService.updateUser(id, userData),
      () => loadUsers()
    );
  }, [handleAsyncOperation, loadUsers]);

  const deleteUser = useCallback(async (id) => {
    return handleAsyncOperation(
      () => inventoryService.deleteUser(id),
      () => loadUsers()
    );
  }, [handleAsyncOperation, loadUsers]);

  // DASHBOARD
  const loadDashboardStats = useCallback(async () => {
    return handleAsyncOperation(
      () => inventoryService.getDashboardStats(),
      (result) => {
        if (result.status === 200) {
          setDashboardStats(result.data);
        }
      }
    );
  }, [handleAsyncOperation]);

  // REPORTES
  const generateReport = useCallback(async (reportType) => {
    return handleAsyncOperation(
      () => inventoryService.generateReport(reportType)
    );
  }, [handleAsyncOperation]);

  // UTILIDADES
  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProducts(false),
        loadCategories(false),
        loadMovements(false),
        loadDashboardStats()
      ]);
    } catch (error) {
      setError('Error al actualizar los datos');
    } finally {
      setLoading(false);
    }
  }, [loadProducts, loadCategories, loadMovements, loadDashboardStats]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          loadCategories(),
          loadProducts(),
          loadDashboardStats()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, [loadCategories, loadProducts, loadDashboardStats]);

  return {
    // Estados
    loading,
    error,
    products,
    categories,
    movements,
    users,
    dashboardStats,

    // Productos
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,

    // Categorías
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    // Movimientos
    loadMovements,
    createMovement,
    searchMovements,

    // Usuarios
    loadUsers,
    createUser,
    updateUser,
    deleteUser,

    // Dashboard
    loadDashboardStats,

    // Reportes
    generateReport,

    // Utilidades
    refreshAll,
    clearError
  };
};

export default useInventory;