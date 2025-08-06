import React from 'react';

const MetricsGrid = ({ stats, loading, previousStats, formatCurrency }) => {
  // Calcular cambios porcentuales
  const getPercentageChange = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Determinar color según el cambio
  const getChangeColor = (current, previous, isPositiveGood = true) => {
    const change = current - previous;
    if (change === 0) return '#6B7280';
    if (isPositiveGood) {
      return change > 0 ? '#10B981' : '#F59E0B';
    } else {
      return change > 0 ? '#F59E0B' : '#10B981';
    }
  };

  // Configuración de métricas con datos reales
  const metrics = [
    {
      label: 'Total Productos',
      value: loading ? 'Cargando...' : stats.totalProducts.toLocaleString(),
      icon: '📦',
      color: '#3B82F6',
      footer: loading ? '' : 
        `${stats.totalProducts > (previousStats?.totalProducts || 0) ? '↗️' : stats.totalProducts < (previousStats?.totalProducts || 0) ? '↘️' : '➖'} ${getPercentageChange(stats.totalProducts, previousStats?.totalProducts || stats.totalProducts)}% vs anterior`,
      footerColor: getChangeColor(stats.totalProducts, previousStats?.totalProducts || stats.totalProducts)
    },
    {
      label: 'Stock Bajo',
      value: loading ? 'Cargando...' : stats.lowStock,
      icon: '⚠️',
      color: '#F59E0B',
      valueColor: stats.lowStock > 0 ? '#F59E0B' : '#10B981',
      footer: loading ? '' : 
        stats.lowStock === 0 ? '✅ Stock saludable' : 
        stats.lowStock === 1 ? '⚠️ 1 producto requiere atención' :
        `⚠️ ${stats.lowStock} productos requieren atención`,
      footerColor: stats.lowStock > 0 ? '#F59E0B' : '#10B981'
    },
    {
      label: 'Valor Total',
      value: loading ? 'Cargando...' : formatCurrency(stats.totalValue),
      icon: '💰',
      color: '#10B981',
      footer: loading ? '' :
        `${stats.totalValue > (previousStats?.totalValue || 0) ? '↗️' : stats.totalValue < (previousStats?.totalValue || 0) ? '↘️' : '➖'} ${getPercentageChange(stats.totalValue, previousStats?.totalValue || stats.totalValue)}% vs anterior`,
      footerColor: getChangeColor(stats.totalValue, previousStats?.totalValue || stats.totalValue)
    },
    {
      label: 'Movimientos Hoy',
      value: loading ? 'Cargando...' : stats.recentMovements,
      icon: '📈',
      color: '#8B5CF6',
      footer: loading ? '' :
        stats.recentMovements === 0 ? '📅 Sin movimientos hoy' :
        stats.recentMovements === 1 ? '📅 1 movimiento registrado' :
        `📅 ${stats.recentMovements} movimientos registrados`,
      footerColor: '#6B7280'
    }
  ];

  return (
    <div style={styles.metricsGrid}>
      {metrics.map((metric, index) => (
        <div 
          key={index} 
          style={{
            ...styles.metricCard,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'default' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          <div style={styles.metricHeader}>
            <div>
              <p style={styles.metricLabel}>{metric.label}</p>
              <p style={{
                ...styles.metricValue, 
                color: metric.valueColor || '#1f2937'
              }}>
                {metric.value}
              </p>
            </div>
            <div style={{
              ...styles.metricIcon, 
              backgroundColor: metric.color,
              opacity: loading ? 0.5 : 1
            }}>
              {loading ? '⏳' : metric.icon}
            </div>
          </div>
          <div style={styles.metricFooter}>
            <span style={{
              color: metric.footerColor, 
              fontSize: '14px', 
              fontWeight: '500'
            }}>
              {metric.footer}
            </span>
          </div>
          
          {/* Indicador de carga */}
          {loading && (
            <div style={styles.loadingBar}>
              <div style={styles.loadingBarFill}></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  metricCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(226, 232, 240, 0.5)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  metricLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    margin: 0
  },
  metricValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '4px 0 0 0'
  },
  metricIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: 'white',
    transition: 'all 0.3s ease'
  },
  metricFooter: {
    fontSize: '14px'
  },
  loadingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    overflow: 'hidden'
  },
  loadingBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    animation: 'loading 2s ease-in-out infinite',
    width: '30%',
    background: 'linear-gradient(90deg, transparent, #3B82F6, transparent)'
  }
};

// Agregar animación CSS para la barra de carga
const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
  @keyframes loading {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(400%); }
  }
`;
document.head.appendChild(styleSheet);

export default MetricsGrid;