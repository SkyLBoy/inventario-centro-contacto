import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Components
import Breadcrumb from '../components/common/Breadcrumb';
import UserForm from '../components/modals/UserForm'; 
import MetricsGrid from './dashboard/MetricsGrid';
import QuickActions from './dashboard/QuickActions';
import SystemStatus from './dashboard/SystemStatus';
import DashboardHeader from './dashboard/DashboardHeader';

// Hooks
import { useDashboardStats } from '../hooks/useDashboardStats'; 
import { useRecentActivities, ACTIVITY_TYPES } from '../hooks/useRecentActivities';
import { useAuth } from '../context/AuthContext';

// Utils
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';

// Constants
import { QUICK_ACTIONS } from '../constants/quickActions';

const RecentActivityItem = ({ activity }) => {
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      products: 'bg-blue-100 text-blue-800',
      users: 'bg-green-100 text-green-800',
      categories: 'bg-purple-100 text-purple-800',
      movements: 'bg-orange-100 text-orange-800',
      system: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px',
      borderRadius: '8px',
      transition: 'background-color 0.2s',
      ':hover': { backgroundColor: '#f9fafb' }
    }}>
      <div style={{
        flexShrink: 0,
        width: '32px',
        height: '32px',
        backgroundColor: '#f3f4f6',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px'
      }}>
        {activity.icon}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              margin: '0 0 2px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {activity.action}
            </p>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 4px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              <span style={{ fontWeight: '500' }}>{activity.item}</span>
              {activity.user && activity.user !== 'Sistema' && (
                <span style={{ color: '#9ca3af' }}> por {activity.user}</span>
              )}
            </p>
            {activity.details && (
              <p style={{
                fontSize: '12px',
                color: '#9ca3af',
                margin: '0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {activity.details}
              </p>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>
              {getTimeAgo(activity.timestamp)}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '500',
              backgroundColor: getCategoryColor(activity.category).includes('blue') ? '#dbeafe' :
                              getCategoryColor(activity.category).includes('green') ? '#d1fae5' :
                              getCategoryColor(activity.category).includes('purple') ? '#e9d5ff' :
                              getCategoryColor(activity.category).includes('orange') ? '#fed7aa' : '#f3f4f6',
              color: getCategoryColor(activity.category).includes('blue') ? '#1e40af' :
                     getCategoryColor(activity.category).includes('green') ? '#065f46' :
                     getCategoryColor(activity.category).includes('purple') ? '#6b21a8' :
                     getCategoryColor(activity.category).includes('orange') ? '#9a3412' : '#374151'
            }}>
              {activity.category === 'products' && 'Productos'}
              {activity.category === 'users' && 'Usuarios'}
              {activity.category === 'categories' && 'Categorías'}
              {activity.category === 'movements' && 'Movimientos'}
              {activity.category === 'system' && 'Sistema'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecentActivity = () => {
  const { getRecentActivities, clearActivities } = useRecentActivities();
  
  // Obtener solo las actividades de las últimas 24 horas, limitadas a 8
  const recentActivities = getRecentActivities(24).slice(0, 8);

  if (recentActivities.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Actividad Reciente
          </h2>
        </div>
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 16px',
            backgroundColor: '#f3f4f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="24" height="24" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>No hay actividades recientes</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          margin: 0
        }}>
          Actividad Reciente
        </h2>
        <button
          onClick={clearActivities}
          style={{
            fontSize: '14px',
            color: '#9ca3af',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.2s',
            ':hover': { color: '#ef4444' }
          }}
          title="Limpiar actividades"
        >
          Limpiar
        </button>
      </div>
      
      <div style={{ padding: '8px 0' }}>
        {recentActivities.map((activity) => (
          <RecentActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
      
      {recentActivities.length >= 8 && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          borderRadius: '0 0 12px 12px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            textAlign: 'center',
            margin: 0
          }}>
            Mostrando las 8 actividades más recientes
          </p>
        </div>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserModal, setShowUserModal] = useState(false);
  const { user } = useAuth(); // Obtener usuario actual
  const navigate = useNavigate();
  const location = useLocation();
  
  // Custom hooks
  const { stats } = useDashboardStats();
  const { logUserActivity, logSystemActivity } = useRecentActivities();

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
    // Registrar la actividad usando el hook correcto
    logUserActivity(
      ACTIVITY_TYPES.USER_CREATED,
      userData.name,
      user?.name,
      `Email: ${userData.email}`
    );
    
    // Mostrar mensaje de éxito
    alert(`✅ Usuario "${userData.name}" creado exitosamente`);
    setShowUserModal(false);
  };

  const isHomePage = location.pathname === '/';
  
  // Función handleQuickAction que recibe la route directamente
  const handleQuickAction = (route) => {
    console.log('Navegando a:', route);
    
    if (route) {
      // Navegar a la ruta proporcionada
      navigate(route);
      
      // Registrar actividad usando el hook correcto
      const actionName = QUICK_ACTIONS.find(action => action.route === route)?.title || 'Acción';
      logSystemActivity(
        ACTIVITY_TYPES.QUICK_ACTION,
        actionName,
        user?.name,
        `Navegación desde dashboard`
      );
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
          {/* Actividad reciente - Usando el nuevo componente */}
          <RecentActivity />

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