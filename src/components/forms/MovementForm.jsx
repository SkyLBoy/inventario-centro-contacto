import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../services/api';
import { useInventory } from '../../hooks/useInventory';

const MovementForm = () => {
  const { createMovement } = useInventory();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [form, setForm] = useState({
    type: 'prestamo',
    person: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Configuración de tipos de movimiento
  const movementTypes = [
    { value: 'prestamo', label: 'Préstamo', icon: '📤', color: 'text-blue-600' },
    { value: 'devolucion', label: 'Devolución', icon: '📥', color: 'text-green-600' }
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const response = await ApiService.products.getAll();
        setProducts(response.data);
      } catch {
        setError('Error al cargar productos. Intenta recargar la página.');
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.product-search-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar productos según el término de búsqueda y excluir los ya seleccionados
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedProducts.some(sp => sp.id === product.id)
  );

  const handleProductSelect = (product) => {
    const newSelectedProduct = {
      id: product.id,
      name: product.name,
      availableStock: product.quantity || 0,
      quantity: 1 // Cantidad inicial por defecto
    };
    
    setSelectedProducts(prev => [...prev, newSelectedProduct]);
    setSearchTerm('');
    setShowDropdown(false);
    if (error) setError('');
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleProductQuantityChange = (productId, quantity) => {
    const numericQuantity = parseInt(quantity) || 0;
    setSelectedProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, quantity: numericQuantity }
          : p
      )
    );
    if (error) setError('');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
  };

  const validateForm = () => {
    const { type, person } = form;
    
    if (!type || !person.trim()) {
      setError('El tipo de movimiento y la persona responsable son obligatorios');
      return false;
    }

    if (selectedProducts.length === 0) {
      setError('Debes seleccionar al menos un producto');
      return false;
    }

    // Validar cada producto seleccionado
    for (const selectedProduct of selectedProducts) {
      if (!selectedProduct.quantity || selectedProduct.quantity <= 0) {
        setError(`La cantidad para "${selectedProduct.name}" debe ser mayor a 0`);
        return false;
      }

      if (type === 'prestamo' && selectedProduct.quantity > selectedProduct.availableStock) {
        setError(`Stock insuficiente para "${selectedProduct.name}". Disponible: ${selectedProduct.availableStock}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    const { type, person } = form;

    // Mapear tipo para backend
    const backendType = type === 'prestamo' ? 'salida' : 
                       type === 'devolucion' ? 'entrada' : type;

    try {
      // Crear un movimiento por cada producto seleccionado
      const movementPromises = selectedProducts.map(product =>
        createMovement({
          productId: product.id,
          type: backendType,
          quantity: product.quantity,
          reason: person.trim()
        })
      );

      await Promise.all(movementPromises);

      // Mostrar mensaje de éxito antes de navegar
      setError('');
      navigate('/movimientos', { 
        state: { 
          message: `${selectedProducts.length} movimiento(s) de ${type} registrado(s) exitosamente`,
          type: 'success' 
        }
      });
    } catch (err) {
      setError('Error al guardar los movimientos. Verifica los datos e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const selectedMovementType = movementTypes.find(mt => mt.value === form.type);

  const getTotalQuantity = () => {
    return selectedProducts.reduce((total, product) => total + (product.quantity || 0), 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              📦 Registrar Movimiento de Inventario
            </h1>
            <p className="text-blue-100 mt-2">
              Gestiona préstamos y devoluciones de múltiples productos
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-center">
                  <span className="text-red-400 text-xl mr-2">⚠️</span>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Buscador de Productos */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Buscar y agregar productos *
                </label>
                <div className="relative product-search-container">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={productsLoading ? 'Cargando productos...' : 'Buscar producto para agregar...'}
                    disabled={productsLoading}
                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 placeholder-gray-500 disabled:bg-gray-50 pl-12"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-gray-400 text-lg">🔍</span>
                  </div>
                  
                  {/* Dropdown de productos */}
                  {showDropdown && filteredProducts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">ID: {product.id}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                (product.quantity || 0) > 10 
                                  ? 'bg-green-100 text-green-800' 
                                  : (product.quantity || 0) > 0 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                Stock: {product.quantity || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Mensaje cuando no hay resultados */}
                  {showDropdown && filteredProducts.length === 0 && searchTerm && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-4">
                      <p className="text-gray-500 text-center">
                        {selectedProducts.length > 0 && products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0
                          ? 'Producto ya agregado'
                          : 'No se encontraron productos'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista de Productos Seleccionados */}
              {selectedProducts.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Productos seleccionados ({selectedProducts.length})
                  </label>
                  <div className="space-y-3 max-h-80 overflow-y-auto bg-gray-50 rounded-xl p-4">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="bg-white text-gray-700 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-800">{product.name}</h4>
                              <button
                                type="button"
                                onClick={() => handleRemoveProduct(product.id)}
                                className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                title="Eliminar producto"
                              >
                                🗑️
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Cantidad
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max={product.availableStock}
                                  value={product.quantity}
                                  onChange={(e) => handleProductQuantityChange(product.id, e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                />
                              </div>
                              
                              <div className="text-right">
                                <p className="text-xs font-medium text-gray-600 mb-1">Stock disponible</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  product.availableStock > 10 
                                    ? 'bg-green-100 text-green-800' 
                                    : product.availableStock < 0 
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.availableStock}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tipo de Movimiento */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Tipo de movimiento *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {movementTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        form.type === type.value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={form.type === type.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-3">{type.icon}</span>
                      <div>
                        <p className={`font-medium ${form.type === type.value ? type.color : 'text-gray-700'}`}>
                          {type.label}
                        </p>
                      </div>
                      {form.type === type.value && (
                        <div className="absolute top-2 right-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Persona */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Persona responsable *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="person"
                    value={form.person}
                    onChange={handleChange}
                    placeholder="Nombre de la persona"
                    className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pl-12 text-gray-900 placeholder-gray-500"
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-gray-400 text-lg">👤</span>
                  </div>
                </div>
              </div>

              {/* Resumen */}
              {selectedProducts.length > 0 && form.person && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    📋 Resumen del movimiento
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-medium">Productos:</span> {selectedProducts.length} productos seleccionados</p>
                    <p><span className="font-medium">Cantidad total:</span> {getTotalQuantity()} unidades</p>
                    <p><span className="font-medium">Tipo:</span> 
                      <span className={`ml-1 ${selectedMovementType?.color}`}>
                        {selectedMovementType?.icon} {selectedMovementType?.label}
                      </span>
                    </p>
                    <p><span className="font-medium">Responsable:</span> {form.person}</p>
                    
                    <div className="mt-3 pt-2 border-t border-green-200">
                      <p className="font-medium mb-2">Detalle por producto:</p>
                      <div className="space-y-1 text-xs">
                        {selectedProducts.map(product => (
                          <div key={product.id} className="flex justify-between">
                            <span>• {product.name}</span>
                            <span className="font-medium">{product.quantity} unidades</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading || productsLoading || selectedProducts.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando movimientos...
                    </>
                  ) : (
                    <>
                      💾 Guardar {selectedProducts.length > 0 ? `${selectedProducts.length} movimiento(s)` : 'movimiento'}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 focus:ring-4 focus:ring-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  ⬅️ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementForm;