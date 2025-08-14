import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';

// Services
import { default as ApiService } from './services/api';

// Layout
import Layout from './components/layout/Layout';

// Components
import SessionModal from './components/common/SessionModal';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/inventory/ProductsPage';
import CategoriesPage from './pages/inventory/CategoriesPage';
import MovementsPage from './pages/inventory/MovementPage';
import UsersPage from './pages/users/UsersPage';
import ReportsPage from './pages/reports/ReportsPage';

// Forms (solo si van a ser páginas independientes)
import MovementForm from './components/forms/MovementForm';

// Ruta protegida mejorada
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  useEffect(() => {
    ApiService.initializeData();
  }, []);

  return (
    <>
      {/* Modal de sesión global */}
      <SessionModal />
      
      <Router>
        <Routes>
          {/* Ruta de login (pública) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard principal */}
            <Route index element={<DashboardPage />} />
            
            {/* Rutas de productos */}
            <Route path="productos" element={<ProductsPage />} />
            
            {/* Rutas de inventario */}
            <Route path="categorias" element={<CategoriesPage />} />
            
            {/* Rutas de movimientos */}
            <Route path="movimientos" element={<MovementsPage />} />
            <Route path="movimientos/nuevo" element={<MovementForm />} />
            
            {/* Rutas de usuarios */}
            <Route path="usuarios" element={<UsersPage />} />
            
            {/* Rutas de reportes */}
            <Route path="reportes" element={<ReportsPage />} />
            
            {/* Ruta de configuración */}
            <Route path="configuracion" element={
              <div className="p-8">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuración</h2>
                  <p className="text-gray-600">Esta sección está en desarrollo</p>
                </div>
              </div>
            } />
            
            {/* Redirección para rutas no encontradas */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <InventoryProvider>
          <AppContent />
        </InventoryProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;