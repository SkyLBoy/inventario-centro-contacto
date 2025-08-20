import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';

const QuickActions = ({ actions, onActionClick }) => {
  // datos que vas a respaldar
  const { products, categories, movements } = useInventory();
  const { user } = useAuth();

  // crear y descargar el respaldo
  const handleCreateBackup = () => {
    const backup = {
      meta: {
        createdAt: new Date().toISOString(),
        createdBy: user?.name || 'Sistema',
        appVersion: '1.0'
      },
      data: {
        products: products || [],
        categories: categories || [],
        movements: movements || []
      }
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Acciones Rápidas</h2>
      <div style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              if (action.type === 'backup') {
                handleCreateBackup();
              } else {
                onActionClick(action.route);
              }
            }}
            style={{...styles.actionCard, backgroundColor: action.color}}
            onMouseEnter={(e) => {
              (e.currentTarget || e.target).style.transform = 'translateY(-4px)';
              (e.currentTarget || e.target).style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget || e.target).style.transform = 'translateY(0)';
              (e.currentTarget || e.target).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
          >
            <div style={styles.actionIcon}>{action.icon}</div>
            <h3 style={styles.actionTitle}>{action.title}</h3>
            <p style={styles.actionDesc}>{action.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  section: { marginBottom: '32px' },
  sectionTitle: { fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' },
  actionCard: {
    border: 'none', borderRadius: '12px', padding: '24px', color: 'white', textAlign: 'left',
    cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  actionIcon: { fontSize: '32px', marginBottom: '16px' },
  actionTitle: { fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' },
  actionDesc: { fontSize: '14px', opacity: 0.9, margin: 0 }
};

export default QuickActions;
