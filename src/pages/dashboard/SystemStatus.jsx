import React, { useEffect, useState } from 'react';
import inventoryService from '../../services/inventoryService';

const SystemStatus = () => {
  const [status, setStatus] = useState({
    db: { text: 'Cargando...', color: '#6B7280' },
    server: { text: 'Cargando...', color: '#6B7280' },
    stock: { text: 'Cargando...', color: '#6B7280' }
  });

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Verificar base de datos (con dashboardStats o productos)
        const dbResponse = await inventoryService.getDashboardStats();
        if (dbResponse?.status === 200) {
          setStatus(prev => ({
            ...prev,
            db: { text: 'Activa', color: '#10B981' }
          }));
        } else {
          setStatus(prev => ({
            ...prev,
            db: { text: 'Inactiva', color: '#EF4444' }
          }));
        }
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          db: { text: 'Inactiva', color: '#EF4444' }
        }));
      }

      try {
        // Verificar servidor (simulamos llamando algo simple)
        const serverResponse = await inventoryService.getProducts();
        if (serverResponse?.status === 200) {
          setStatus(prev => ({
            ...prev,
            server: { text: 'En línea', color: '#10B981' }
          }));
        } else {
          setStatus(prev => ({
            ...prev,
            server: { text: 'Desconectado', color: '#EF4444' }
          }));
        }
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          server: { text: 'Desconectado', color: '#EF4444' }
        }));
      }

      try {
        // Verificar productos con bajo stock
        const lowStockResponse = await inventoryService.getLowStockProducts();
        if (lowStockResponse?.status === 200) {
          const count = lowStockResponse.data.length;
          setStatus(prev => ({
            ...prev,
            stock: {
              text: `${count} productos`,
              color: count === 0 ? '#10B981' : '#F59E0B'
            }
          }));
        } else {
          setStatus(prev => ({
            ...prev,
            stock: { text: 'Error', color: '#EF4444' }
          }));
        }
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          stock: { text: 'Error', color: '#EF4444' }
        }));
      }
    };

    checkSystemStatus();
  }, []);

  const statusItems = [
    {
      label: 'Base de datos',
      status: status.db.text,
      color: status.db.color
    },
    {
      label: 'Servidor',
      status: status.server.text,
      color: status.server.color
    },
    {
      label: 'Stock bajo',
      status: status.stock.text,
      color: status.stock.color
    }
  ];

  return (
    <div style={styles.statusCard}>
      <h3 style={styles.cardTitle}>Estado del Sistema</h3>
      <div style={styles.statusList}>
        {statusItems.map((item, index) => (
          <div key={index} style={styles.statusItem}>
            <div style={styles.statusIndicator}>
              <div
                style={{
                  ...styles.statusDot,
                  backgroundColor: item.color
                }}
              ></div>
              <span style={styles.statusLabel}>{item.label}</span>
            </div>
            <span style={{ ...styles.statusValue, color: item.color }}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <div style={styles.tipCard}>
        <h4 style={styles.tipTitle}>💡 Consejo del día</h4>
        <p style={styles.tipText}>
          Revisa regularmente los productos con stock bajo para evitar desabastecimiento.
        </p>
      </div>
    </div>
  );
};

const styles = {
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(226, 232, 240, 0.5)'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
    marginBottom: '24px'
  },
  statusList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '24px'
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: 'rgba(249, 250, 251, 0.5)',
    borderRadius: '8px'
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center'
  },
  statusDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginRight: '12px'
  },
  statusLabel: {
    color: '#1f2937',
    fontWeight: '500',
    fontSize: '14px'
  },
  statusValue: {
    fontSize: '13px',
    fontWeight: '500'
  },
  tipCard: {
    padding: '16px',
    backgroundColor: 'rgba(219, 234, 254, 0.5)',
    borderRadius: '8px'
  },
  tipTitle: {
    color: '#1f2937',
    fontWeight: '500',
    margin: '0 0 8px 0',
    fontSize: '14px'
  },
  tipText: {
    color: '#6b7280',
    fontSize: '13px',
    margin: 0,
    lineHeight: '1.5'
  }
};

export default SystemStatus;
