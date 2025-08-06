import React from 'react';
import { useAuth } from '../../context/AuthContext';
const DashboardHeader = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Redirigir al login después del logout
    window.location.href = '/login';
  };

  // Función para obtener el nombre a mostrar
  const getDisplayName = () => {
    if (!user) return 'Usuario';
    
    // Priorizar nombre completo, luego username, luego email
    return user.name || user.firstName || user.username || user.email || 'Usuario';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Lado izquierdo - Saludo personalizado */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard - Centro de Contacto
            </h1>
            {user && (
              <p className="text-m text-gray-800 mt-2">
                ¡Hola <span className="font-medium text-indigo-600">{getDisplayName()}</span>,  
                Bienvenido de nuevo!
              </p>
            )}
          </div>

          {/* Lado derecho - Info del usuario y controles */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                {/* Info del usuario */}
                <div className="hidden md:flex flex-col items-end text-sm">
                  <span className="text-gray-900 font-medium">
                    {'Rol - Correo'}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {user.role || 'Usuario'} • {user.email}
                  </span>
                </div>

                {/* Botón de logout */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;