import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Components
import Breadcrumb from '../components/common/Breadcrumb';
import UserForm from '../components/modals/UserForm'; 
import MetricsGrid from './dashboard/MetricsGrid';
import QuickActions from './dashboard/QuickActions';
import RecentActivity from './dashboard/RecentActivity';
import SystemStatus from './dashboard/SystemStatus';
import DashboardHeader from './dashboard/DashboardHeader';

// Hooks
import { useDashboardStats } from '../hooks/useDashboardStats'; 
import { useRecentActivities } from '../hooks/useRecentActivities';
import { useAuth } from '../context/AuthContext';

// Utils
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';

// Constants
import { QUICK_ACTIONS } from '../constants/quickActions';

const DashboardPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserModal, setShowUserModal] = useState(false);
  const { user } = useAuth(); // Obtener usuario actual
  const navigate = useNavigate();
  const location = useLocation();
  
  // Custom hooks
  const { stats, updateStats } = useDashboardStats();
  const { activities, addActivity } = useRecentActivities();

  // Actualizar reloj cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleGoBack = () => {
    navigate('/');
  };

  const handleAddUser = () => {
    setShowUserModal(true);
  };

  const handleSaveUser = (userData) => {
    // Agregar a actividad reciente
    addActivity({
      action: 'Usuario creado',
      item: userData.name,
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    });
    
    // Mostrar mensaje de éxito
    alert(`✅ Usuario "${userData.name}" creado exitosamente`);
    setShowUserModal(false);
  };

  const isHomePage = location.pathname === '/';
  
  // CORRECCIÓN: Función handleQuickAction que recibe la route directamente
  const handleQuickAction = (route) => {
    console.log('Navegando a:', route);
    
    if (route) {
      // Navegar a la ruta proporcionada
      navigate(route);
      
      // Agregar actividad reciente
      const actionName = QUICK_ACTIONS.find(action => action.route === route)?.title || 'Acción';
      addActivity({
        action: actionName,
        item: 'Acceso desde dashboard',
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      });
    } else {
      console.warn('No se proporcionó una ruta válida');
    }
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <DashboardHeader 
        currentTime={currentTime}
        isHomePage={isHomePage}
        onGoBack={handleGoBack}
        onAddUser={handleAddUser}
        formatDate={formatDate}
        formatTime={formatTime}
        userName={user?.name}
      />

      <div style={styles.content}>
        {/* Breadcrumb */}
        <Breadcrumb currentPath={location.pathname} />

        {/* Métricas principales */}
        <MetricsGrid 
          stats={stats}
          formatCurrency={formatCurrency}
        />

        {/* Acciones rápidas */}
        <QuickActions 
          actions={QUICK_ACTIONS}
          onActionClick={handleQuickAction}
        />

        {/* Dashboard inferior */}
        <div style={styles.bottomGrid}>
          {/* Actividad reciente */}
          <RecentActivity 
            activities={activities}
            onViewAll={() => navigate('/movimientos')}
          />

          {/* Panel de estado */}
          <SystemStatus />
        </div>
      </div>

      {/* Modal de agregar usuario */}
      {showUserModal && (
        <UserForm 
          onClose={() => setShowUserModal(false)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    fontFamily: "'Inter', system-ui, sans-serif"
  },
  content: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '32px 24px'
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '32px'
  }
};

export default DashboardPage;