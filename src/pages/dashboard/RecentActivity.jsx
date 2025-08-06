import React from 'react';

const RecentActivity = ({ activities, onViewAll }) => {
  return (
    <div style={styles.activityCard}>
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>Actividad Reciente</h3>
        <button 
          style={styles.linkButton}
          onClick={onViewAll}
        >
          Ver todo
        </button>
      </div>
      <div style={styles.activityList}>
        {activities.map((activity, index) => (
          <div key={index} style={styles.activityItem}>
            <div style={styles.activityDot}></div>
            <div style={styles.activityContent}>
              <p style={styles.activityAction}>{activity.action}</p>
              <p style={styles.activityItemName}>{activity.item}</p>
            </div>
            <span style={styles.activityTime}>{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid rgba(226, 232, 240, 0.5)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: 'rgba(249, 250, 251, 0.5)',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease'
  },
  activityDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#3b82f6',
    borderRadius: '50%',
    marginRight: '16px'
  },
  activityContent: {
    flex: 1
  },
  activityAction: {
    color: '#1f2937',
    fontWeight: '500',
    margin: 0,
    fontSize: '14px'
  },
  activityItemName: {
    color: '#6b7280',
    fontSize: '13px',
    margin: '2px 0 0 0'
  },
  activityTime: {
    color: '#9ca3af',
    fontSize: '13px'
  }
};

export default RecentActivity;