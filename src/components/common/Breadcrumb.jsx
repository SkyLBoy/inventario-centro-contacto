import React from 'react';
import { useNavigate } from 'react-router-dom';

const Breadcrumb = ({ currentPath }) => {
  const navigate = useNavigate();
  
  const pathMap = {
    '/': 'Inicio',
    '/productos': 'Productos',
    '/movimientos': 'Movimientos',
    '/usuarios': 'Usuarios',
    '/reportes': 'Reportes',
    '/categorias': 'Categorías',
    '/configuracion': 'Configuración'
  };

  const pathSegments = currentPath.split('/').filter(segment => segment);
  const breadcrumbItems = [
    { path: '/', name: 'Inicio' },
    ...pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      return {
        path,
        name: pathMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1)
      };
    })
  ];

  // Remover duplicados si el usuario está en inicio
  const filteredItems = currentPath === '/' ? [{ path: '/', name: 'Inicio' }] : breadcrumbItems;

  if (filteredItems.length <= 1) return null;

  return (
    <div style={styles.breadcrumb}>
      {filteredItems.map((item, index) => (
        <React.Fragment key={index}>
          <span 
            style={{
              ...styles.breadcrumbItem,
              ...(index === filteredItems.length - 1 ? styles.breadcrumbActive : {})
            }}
            onClick={() => {
              if (index < filteredItems.length - 1) {
                navigate(item.path);
              }
            }}
          >
            {item.name}
          </span>
          {index < filteredItems.length - 1 && (
            <span style={styles.breadcrumbSeparator}>→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const styles = {
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '8px',
    border: '1px solid rgba(226, 232, 240, 0.5)'
  },
  breadcrumbItem: {
    color: '#6b7280',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    textTransform: 'capitalize'
  },
  breadcrumbActive: {
    color: '#1f2937',
    fontWeight: '600',
    backgroundColor: 'rgba(59, 130, 246, 0.1)'
  },
  breadcrumbSeparator: {
    color: '#9ca3af',
    margin: '0 8px',
    fontSize: '12px'
  }
};

export default Breadcrumb;