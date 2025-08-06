import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

// Icono de flecha hacia atrás
const ArrowLeftIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m12 19-7-7 7-7"/>
    <path d="M19 12H5"/>
  </svg>
);

const ProductsPage = () => {
  const { user, canEdit } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    categoryId: '',
    quantity: 0,
    minStock: 5,
    price: 0
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  // Función para regresar
  const handleGoBack = () => {
    window.history.back();
  };
  
  const loadData = async () => {
    setLoading(true);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        ApiService.products.getAll(),
        ApiService.categories.getAll()
      ]);
    
      setProducts(productsResponse.data || []);
      setCategories(categoriesResponse.data || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar productos o categorías:', err);
      setError('Error al cargar datos. Por favor, recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    if (!canEdit()) {
      setError('No tienes permisos para agregar productos');
      return;
    }
    
    setSelectedProduct(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      categoryId: '',
      quantity: 0,
      minStock: 5,
      price: 0
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleEditProduct = (product) => {
    if (!canEdit()) {
      setError('No tienes permisos para editar productos');
      return;
    }
    
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      code: product.code || '',
      description: product.description || '',
      categoryId: product.categoryId || product.category_id || '',
      quantity: product.quantity || 0,
      minStock: product.minStock || product.min_stock || 5,
      price: product.price || 0
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleDeleteProduct = (product) => {
    if (!canEdit()) {
      setError('No tienes permisos para eliminar productos');
      return;
    }

    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!formData.code.trim()) {
      errors.code = 'El código es requerido';
    }

    if (!formData.categoryId) {
      errors.categoryId = 'La categoría es requerida';
    }

    if (formData.price < 0) {
      errors.price = 'El precio debe ser mayor o igual a 0';
    }

    if (formData.quantity < 0) {
      errors.quantity = 'La cantidad no puede ser negativa';
    }

    if (formData.minStock < 0) {
      errors.minStock = 'El stock mínimo no puede ser negativo';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const productData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        quantity: parseInt(formData.quantity),
        minStock: parseInt(formData.minStock),
        price: parseFloat(formData.price)
      };

      console.log('Guardando producto:', productData);

      if (selectedProduct) {
        await ApiService.products.update(selectedProduct.id, productData);
      } else {
        await ApiService.products.create(productData);
      }
      
      await loadData(); // Recargar datos
      setModalOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    
    setSaving(true);
    try {
      // Corregido: usar ApiService.products.delete
      await ApiService.products.delete(selectedProduct.id);
      await loadData(); // Recargar datos
      setDeleteModalOpen(false);
      setSelectedProduct(null);
      setError(null);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setError(err.message || 'Error al eliminar el producto');
    } finally {
      setSaving(false);
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const productCategoryId = product.categoryId || product.category_id;
    const matchesCategory = !categoryFilter || productCategoryId === parseInt(categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product) => {
    // Intentar múltiples formas de acceder a quantity
    const quantity = parseInt(product.quantity) || 
                    parseInt(product.stock) || 
                    parseInt(product.qty) || 0;
                    
    const minStock = parseInt(product.minStock) || 
                    parseInt(product.min_stock) || 
                    parseInt(product.minimumStock) || 0;
    
    if (quantity === 0) return { status: 'out', color: '#ef4444', text: 'Sin stock' };
    if (quantity <= minStock) return { status: 'low', color: '#f59e0b', text: 'Stock bajo' };
    return { status: 'normal', color: '#10b981', text: 'Stock normal' };
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  // Funciones para estadísticas con manejo seguro de datos
  const getProductStats = () => {
    const totalProducts = products.length;
    
    const lowStockProducts = products.filter(p => {
      const quantity = parseInt(p.quantity) || parseInt(p.stock) || parseInt(p.qty) || 0;
      const minStock = parseInt(p.minStock) || parseInt(p.min_stock) || parseInt(p.minimumStock) || 0;
      return quantity <= minStock && quantity > 0;
    }).length;
    
    const outOfStockProducts = products.filter(p => {
      const quantity = parseInt(p.quantity) || parseInt(p.stock) || parseInt(p.qty) || 0;
      return quantity === 0;
    }).length;
    
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
    
    const activeProducts = products.filter(product => product.status === 'active');
    
    const totalValue = activeProducts.reduce((total, product) => {
      const quantity = getSafeQuantity(product);
      const price = getSafePrice(product);
      return total + quantity * price;
    }, 0);
    
    return {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue
    };
  };

  const stats = getProductStats();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Botón de regresar */}
            <div style={{ 
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 40
      }}>
        <Button
          variant="secondary"
          size="md"
          icon={<ArrowLeftIcon />}
          onClick={handleGoBack}
          className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-full"
        />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            Productos
          </h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            Gestiona tu inventario de productos
          </p>
        </div>
        {canEdit() && (
          <Button
            variant="primary"
            size="md"
            onClick={handleCreateProduct}
          >
            ➕ Agregar Producto
          </Button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#ef4444', marginRight: '8px' }}>⚠️</span>
            <span style={{ color: '#dc2626' }}>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1', color: '#000', minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Buscar productos por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 40px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          />
          <span style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af'
          }}>
            🔍
          </span>
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            minWidth: '200px',
            color: '#000'
          }}
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.totalProducts}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Productos</div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.lowStockProducts}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Stock Bajo</div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
            {stats.outOfStockProducts}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Sin Stock</div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
            ${stats.totalValue.toFixed(2)}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Valor Total</div>
        </div>
      </div>

      {/* Lista de productos */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>
            No se encontraron productos
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            {searchTerm || categoryFilter ? 'Ajusta los filtros de búsqueda' : 'Agrega tu primer producto para comenzar'}
          </p>
          {canEdit() && !searchTerm && !categoryFilter && (
            <Button
              variant="primary"
              size="md"
              onClick={handleCreateProduct}
            >
              ➕ Agregar Producto
            </Button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filteredProducts.map(product => {
            const stockInfo = getStockStatus(product);
            
            // Intentar múltiples formas de acceder a los datos
            const quantity = parseInt(product.quantity) || 
                           parseInt(product.stock) || 
                           parseInt(product.qty) || 0;
                           
            const price = parseFloat(product.price) || 
                         parseFloat(product.cost) || 
                         parseFloat(product.value) || 0;
                         
            const minStock = parseInt(product.minStock) || 
                           parseInt(product.min_stock) || 
                           parseInt(product.minimumStock) || 0;
                           
            const categoryId = product.categoryId || 
                             product.category_id || 
                             product.categoryID;
            
            return (
              <div key={product.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>
                      {product.name || 'Sin nombre'}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {product.code || 'Sin código'}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 0 0' }}>
                      {getCategoryName(categoryId)}
                    </p>
                  </div>
                  {canEdit() && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditProduct(product)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#f3f4f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#fee2e2',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                {product.description && (
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    {product.description}
                  </p>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Precio:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      ${price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Stock:</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                      {quantity.toLocaleString()} unidades
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: stockInfo.color + '20',
                    color: stockInfo.color
                  }}>
                    {stockInfo.text}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    Mín: {minStock}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de producto */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                {selectedProduct ? 'Editar Producto' : 'Agregar Producto'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '20px',
                  opacity: saving ? 0.5 : 1
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={saving}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        color: '#000',
                        borderRadius: '6px',
                        border: formErrors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
                        fontSize: '14px',
                        opacity: saving ? 0.5 : 1
                      }}
                      placeholder="Nombre del producto"
                    />
                    {formErrors.name && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Código *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      disabled={saving}
                      style={{
                        width: '100%',
                        color: '#000',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: formErrors.code ? '2px solid #ef4444' : '1px solid #d1d5db',
                        fontSize: '14px',
                        opacity: saving ? 0.5 : 1
                      }}
                      placeholder="Código único"
                    />
                    {formErrors.code && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.code}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={saving}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      color: '#000',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical',
                      opacity: saving ? 0.5 : 1
                    }}
                    placeholder="Descripción del producto (opcional)"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Categoría *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      disabled={saving}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        color: '#000',
                        borderRadius: '6px',
                        border: formErrors.categoryId ? '2px solid #ef4444' : '1px solid #d1d5db',
                        fontSize: '14px',
                        opacity: saving ? 0.5 : 1
                      }}
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.categoryId && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.categoryId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      disabled={saving}
                      style={{
                        width: '100%',
                        color: '#000',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: formErrors.quantity ? '2px solid #ef4444' : '1px solid #d1d5db',
                        fontSize: '14px',
                        opacity: saving ? 0.5 : 1
                      }}
                    />
                    {formErrors.quantity && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.quantity}
                      </p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      disabled={saving}
                      style={{
                        width: '100%',
                        color: '#000',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: formErrors.minStock ? '2px solid #ef4444' : '1px solid #d1d5db',
                        fontSize: '14px',
                        opacity: saving ? 0.5 : 1
                      }}
                    />
                    {formErrors.minStock && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {formErrors.minStock}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Precio
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    disabled={saving}
                    style={{
                      width: '100%',
                      color: '#000',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: formErrors.price ? '2px solid #ef4444' : '1px solid #d1d5db',
                      fontSize: '14px',
                      opacity: saving ? 0.5 : 1
                    }}
                    placeholder="0.00"
                  />
                  {formErrors.price && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {formErrors.price}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '24px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => setModalOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveProduct}
                disabled={saving}
              >
                {saving ? 'Guardando...' : (selectedProduct ? 'Actualizar' : 'Crear') + ' Producto'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px'
          }}>
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                Confirmar eliminación
              </h3>
            </div>
            
            <div style={{ padding: '24px' }}>
              <p style={{ color: '#6b7280', margin: 0 }}>
                ¿Estás seguro de que deseas eliminar el producto "{selectedProduct?.name}"? 
                Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '24px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <Button
                variant="outline"
                size="md"
                onClick={() => setDeleteModalOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmDelete}
                disabled={saving}
              >
                {saving ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>  
  );
}

export default ProductsPage;