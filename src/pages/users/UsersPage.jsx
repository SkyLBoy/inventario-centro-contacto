import React, { useState, useEffect } from 'react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import UserForm from './../../components/modals/UserForm'; // Importar el componente UserForm
import Button from '../../components/common/Button';

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

const UsersPage = ({ onGoHome }) => {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Función helper para verificar si es admin
  const checkIsAdmin = () => {
    if (typeof isAdmin === 'function') {
      return isAdmin();
    }
    // Si isAdmin es una propiedad booleana
    if (typeof isAdmin === 'boolean') {
      return isAdmin;
    }
    // Si no existe isAdmin, verificar por rol del usuario
    if (currentUser && currentUser.role) {
      return currentUser.role === 'admin';
    }
    return false;
  };

  useEffect(() => {
    if (!checkIsAdmin()) {
      setError('No tienes permisos para acceder a esta sección');
      setLoading(false);
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await ApiService.users.getAll();
      if (response.status === 200) {
        setUsers(response.data);
      } else {
        setError(response.message || 'Error cargando usuarios');
      }
    } catch (err) {
      setError('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    // Aquí podrías abrir el UserForm en modo edición si lo necesitas
    setShowUserForm(true);
  };
  
  // Función para regresar
  const handleGoBack = () => {
    window.history.back();
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleSaveUser = (userData) => {
    try {
      if (selectedUser) {
        // Modo edición
        ApiService.updateUser(selectedUser.id, userData);
      } else {
        // Modo creación
        ApiService.users.create(userData);
      }
      
      loadUsers();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      ApiService.deleteUser(selectedUser.id);
      loadUsers();
      setDeleteModalOpen(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      ApiService.toggleUserStatus(userId);
      loadUsers();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-red-100 text-red-800',
      editor: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    
    const labels = {
      admin: 'Administrador',
      editor: 'Editor',
      viewer: 'Visualizador'
    };

    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: role === 'admin' ? '#fef2f2' : role === 'editor' ? '#eff6ff' : '#f9fafb',
        color: role === 'admin' ? '#dc2626' : role === 'editor' ? '#2563eb' : '#6b7280'
      }}>
        {labels[role]}
      </span>
    );
  };

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
          <p style={{ color: '#6b7280' }}>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (!checkIsAdmin()) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 16px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
          Acceso Denegado
        </h2>
        <p style={{ color: '#6b7280' }}>
          No tienes permisos para acceder a la gestión de usuarios.
        </p>
        {onGoHome && (
          <button
            onClick={onGoHome}
            style={{
              marginTop: '16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            🏠 Volver al Inicio
          </button>
        )}
      </div>
    );
  }
        return (
          <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
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
            Gestión de Usuarios
          </h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>
            Administra los usuarios del sistema y sus permisos
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {onGoHome && (
            <button
              onClick={onGoHome}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                padding: '12px 20px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
            >
              🏠 Inicio
            </button>
          )}
          <button
            onClick={handleCreateUser}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
            }}
          >
            ➕ Agregar Usuario
          </button>
        </div>
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
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
            {users.filter(u => u.isActive).length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Usuarios Activos</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Administradores</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
            {users.filter(u => u.role === 'editor').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Editores</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>
            {users.filter(u => u.role === 'viewer').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Visualizadores</div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Usuario
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Nombre
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Email
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Rol
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Estado
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Creado
              </th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} style={{ borderTop: index > 0 ? '1px solid #e5e7eb' : 'none' }}>
                <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                  {user.username}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                  {user.name}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                  {user.email}
                </td>
                <td style={{ padding: '16px' }}>
                  {getRoleBadge(user.role)}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                    color: user.isActive ? '#166534' : '#dc2626'
                  }}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                  {new Date(user.createdAt).toLocaleDateString('es-MX')}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleEditUser(user)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f3f4f6',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: user.isActive ? '#fee2e2' : '#dcfce7',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title={user.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {user.isActive ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#fee2e2',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* UserForm Modal */}
      {showUserForm && (
        <UserForm
          onClose={() => setShowUserForm(false)}
          onSave={handleSaveUser}
          onGoHome={onGoHome}
        />
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
                ¿Estás seguro de que deseas eliminar al usuario "{selectedUser?.name}"? 
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
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UsersPage;