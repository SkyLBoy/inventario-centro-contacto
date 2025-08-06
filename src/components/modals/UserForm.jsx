import React, { useState } from 'react';

const UserForm = ({ onClose, onSave, onGoHome }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'viewer'
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre completo es requerido';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simular guardado
      const newUser = {
        id: Date.now(),
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      console.log('👤 Nuevo usuario creado:', newUser);
      onSave(newUser);
      onClose();
    }
  };

  const formStyles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px 24px 0 24px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '16px',
      marginBottom: '24px'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    headerButtons: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },
    homeButton: {
      background: 'none',
      border: '1px solid #3b82f6',
      fontSize: '12px',
      color: '#3b82f6',
      cursor: 'pointer',
      padding: '6px 12px',
      borderRadius: '6px',
      transition: 'all 0.2s ease',
      fontWeight: '500'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      color: '#6b7280',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '4px',
      transition: 'all 0.2s ease'
    },
    form: {
      padding: '0 24px 24px 24px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '20px',
      marginBottom: '20px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px'
    },
    input: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      transition: 'border-color 0.2s ease',
      outline: 'none',
      color: '#1f2937',
      backgroundColor: '#ffffff'
    },
    inputError: {
      borderColor: '#ef4444'
    },
    select: {
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white',
      outline: 'none',
      color: '#1f2937'
    },
    errorText: {
      color: '#ef4444',
      fontSize: '12px',
      marginTop: '4px'
    },
    formButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    },
    cancelButton: {
      padding: '10px 20px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: 'white',
      color: '#374151',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    saveButton: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#059669',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }
  };

  return (
    <div style={formStyles.modalOverlay} onClick={onClose}>
      <div style={formStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={formStyles.modalHeader}>
          <h2 style={formStyles.modalTitle}>➕ Agregar Nuevo Usuario</h2>
          <div style={formStyles.headerButtons}>
            {onGoHome && (
              <button 
                style={formStyles.homeButton} 
                onClick={onGoHome}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#dbeafe';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
                title="Ir al inicio"
              >
                🏠 Inicio
              </button>
            )}
            <button 
              style={formStyles.closeButton} 
              onClick={onClose}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              ✕
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} style={formStyles.form}>
          <div style={formStyles.formGrid}>
            <div style={formStyles.formGroup}>
              <label style={formStyles.label}>Nombre completo *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={{...formStyles.input, ...(errors.name ? formStyles.inputError : {})}}
                placeholder="Ej: Juan Pérez García"
              />
              {errors.name && <span style={formStyles.errorText}>{errors.name}</span>}
            </div>

            <div style={formStyles.formGroup}>
              <label style={formStyles.label}>Nombre de usuario *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                style={{...formStyles.input, ...(errors.username ? formStyles.inputError : {})}}
                placeholder="Ej: juan.perez"
              />
              {errors.username && <span style={formStyles.errorText}>{errors.username}</span>}
            </div>

            <div style={formStyles.formGroup}>
              <label style={formStyles.label}>Correo electrónico *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={{...formStyles.input, ...(errors.email ? formStyles.inputError : {})}}
                placeholder="Ej: juan.perez@email.com"
              />
              {errors.email && <span style={formStyles.errorText}>{errors.email}</span>}
            </div>

            <div style={formStyles.formGroup}>
              <label style={formStyles.label}>Contraseña *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                style={{...formStyles.input, ...(errors.password ? formStyles.inputError : {})}}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && <span style={formStyles.errorText}>{errors.password}</span>}
            </div>

            <div style={formStyles.formGroup}>
              <label style={formStyles.label}>Rol</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                style={formStyles.select}
              >
                <option value="viewer">Visualizador - Solo lectura</option>
                <option value="editor">Editor - Puede editar inventario</option>
                <option value="admin">Administrador - Acceso completo</option>
              </select>
            </div>
          </div>

          <div style={formStyles.formButtons}>
            <button 
              type="button" 
              onClick={onClose} 
              style={formStyles.cancelButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              style={formStyles.saveButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#047857';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#059669';
              }}
            >
              👤 Crear Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;