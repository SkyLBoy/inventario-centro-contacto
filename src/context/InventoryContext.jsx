import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from './AuthContext';

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const deleteMovement = async (movementId) => {
    setLoading(true);
    try {
      // Buscar el movimiento que se eliminará
      const movementToDelete = movements.find(m => m.id === movementId);
      if (!movementToDelete) throw new Error('Movimiento no encontrado');
  
      // Eliminar el movimiento en la base de datos
      await ApiService.deleteMovement(movementId);
  
      // Revertir el stock del producto
      const product = products.find(p => p.id === movementToDelete.productId);
      if (product) {
        const revertQuantity = movementToDelete.type === 'entrada'
          ? product.quantity - movementToDelete.quantity
          : product.quantity + movementToDelete.quantity;
  
        const updatedProduct = await ApiService.updateProduct(product.id, {
          ...product,
          quantity: Math.max(0, revertQuantity)
        });
  
        if (updatedProduct) {
          setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
        }
      }
  
      // Actualizar movimientos localmente
      setMovements(prev => prev.filter(m => m.id !== movementId));
      setError(null);
    } catch (err) {
      setError('Error al eliminar movimiento');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  

  // Cargar movimientos
  const loadMovements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ApiService.movements.getAll();
      setMovements(res.data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar productos y categorías
  const loadProductsAndCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        ApiService.products.getAll(),
        ApiService.categories.getAll(),
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar productos o categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadAllData = async () => {
      await loadProductsAndCategories();
      await loadMovements();
    };
    loadAllData();
  }, [loadProductsAndCategories, loadMovements]);

  const clearError = () => setError(null);

  const createMovement = async (movementData) => {
    setLoading(true);
    try {
      const res = await ApiService.movements.create({
        ...movementData,
        userId: user?.id || 1
      });

      const newMovement = res.data;

      const product = products.find(p => p.id === movementData.productId);
      if (product) {
        const newQuantity = movementData.type === 'entrada'
          ? product.quantity + movementData.quantity
          : product.quantity - movementData.quantity;

        const updatedRes = await ApiService.products.update(product.id, {
          ...product,
          quantity: Math.max(0, newQuantity)
        });

        if (updatedRes?.data) {
          setProducts(prev => prev.map(p => p.id === product.id ? updatedRes.data : p));
        }
      }

      await loadMovements();
      setError(null);
      return newMovement;
    } catch (err) {
      setError('Error al crear movimiento');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData) => {
    setLoading(true);
    try {
      const res = await ApiService.products.create(productData);
      setProducts(prev => [...prev, res.data]);
      setError(null);
      return res.data;
    } catch (err) {
      setError('Error al crear producto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id, productData) => {
    setLoading(true);
    try {
      const res = await ApiService.products.update(id, productData);
      if (res?.data) {
        setProducts(prev => prev.map(p => p.id === id ? res.data : p));
      }
      setError(null);
      return res.data;
    } catch (err) {
      setError('Error al actualizar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    setLoading(true);
    try {
      await ApiService.products.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setError(null);
    } catch (err) {
      setError('Error al eliminar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    setLoading(true);
    try {
      const res = await ApiService.categories.create(categoryData);
      setCategories(prev => [...prev, res.data]);
      setError(null);
      return res.data;
    } catch (err) {
      setError('Error al crear categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, categoryData) => {
    setLoading(true);
    try {
      const res = await ApiService.categories.update(id, categoryData);
      if (res?.data) {
        setCategories(prev => prev.map(c => c.id === id ? res.data : c));
      }
      setError(null);
      return res.data;
    } catch (err) {
      setError('Error al actualizar categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    setLoading(true);
    try {
      await ApiService.categories.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setError(null);
    } catch (err) {
      setError('Error al eliminar categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.quantity <= (p.minStock || 0)).length;
    const outOfStockProducts = products.filter(p => p.quantity === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

    const recentMovements = [...movements]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      recentMovements,
      totalCategories: categories.length,
      totalMovements: movements.length
    };
  };

  return (
    <InventoryContext.Provider value={{
      products,
      categories,
      movements,
      loading,
      error,
      clearError,
      loadMovements,
      loadProductsAndCategories,
      createMovement,
      createProduct,
      updateProduct,
      deleteProduct,
      createCategory,
      updateCategory,
      deleteCategory,
      getStats,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
