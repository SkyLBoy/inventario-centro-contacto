import React from 'react';

const QuickActions = ({ actions, onActionClick }) => {
  return (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>Acciones Rápidas</h2>
      <div style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionClick(action.route)}
            style={{...styles.actionCard, backgroundColor: action.color}}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
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
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '24px'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '24px'
  },
  actionCard: {
    border: 'none',
    borderRadius: '12px',
    padding: '24px',
    color: 'white',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  actionIcon: {
    fontSize: '32px',
    marginBottom: '16px'
  },
  actionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 8px 0'
  },
  actionDesc: {
    fontSize: '14px',
    opacity: 0.9,
    margin: 0
  }
};

export default QuickActions;