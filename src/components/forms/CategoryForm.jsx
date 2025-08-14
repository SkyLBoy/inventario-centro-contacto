import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';

const CategoryForm = ({ initialData, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  // Cargar datos iniciales si se está editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || ''
      });
    }
  }, [initialData]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la categoría es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'La descripción no puede exceder 200 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Form submitted!', formData);
    console.log('🔍 onSubmit function:', typeof onSubmit, onSubmit);

    if (!validateForm()) {
      console.log('❌ Validation failed:', errors);
      return;
    }

    // Verificar que onSubmit existe
    if (!onSubmit || typeof onSubmit !== 'function') {
      console.error('❌ onSubmit is not a function or is undefined');
      return;
    }

    try {
      const categoryData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        updatedAt: new Date().toISOString()
      };

      // Si no estamos editando, agregar fecha de creación y un ID único
      if (!initialData) {
        categoryData.id = Date.now().toString(); // ID temporal
        categoryData.createdAt = new Date().toISOString();
      }

      console.log('📤 Submitting data:', categoryData);
      await onSubmit(categoryData);
      console.log('✅ Form submitted successfully!');
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      // Mostrar el error al usuario si es posible
      alert('Error al guardar la categoría: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campo Nombre */}
      <div>
        <label htmlFor="name" className="block font-medium text-gray-800 mb-1">
          Nombre de la Categoría *
        </label>
        <Input 
          className='text-gray-800'
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej: Electrónicos, Ropa, Hogar..."
          error={errors.name}
          disabled={loading}
          required
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Campo Descripción */}
      <div>
        <label htmlFor="description" className="block font-medium text-gray-700 mb-2">
          Descripción (Opcional)
        </label>
        <textarea 
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descripción breve de la categoría..."
          rows={3}
          maxLength={200}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-gray-900"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/200 caracteres
        </p>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !formData.name.trim()}
        >
          {loading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear Categoría'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;