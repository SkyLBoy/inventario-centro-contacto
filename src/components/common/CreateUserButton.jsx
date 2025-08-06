import React from 'react';
import Button from './Button';

const CreateUserButton = ({ 
  onClick, 
  className = "", 
  size = "md",
  showIcon = true,
  variant = "emerald",
  children,
  ...props 
}) => {
  // Configuraciones de color según la variante
  const colorVariants = {
    emerald: {
      base: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
      style: {
        backgroundColor: '#059669',
        color: 'white',
        border: 'none',
        transition: 'all 0.2s ease'
      },
      hoverStyle: {
        backgroundColor: '#047857'
      },
      leaveStyle: {
        backgroundColor: '#059669'
      }
    },
    blue: {
      base: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      style: {
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        transition: 'all 0.2s ease'
      },
      hoverStyle: {
        backgroundColor: '#2563eb'
      },
      leaveStyle: {
        backgroundColor: '#3b82f6'
      }
    }
  };

  const currentVariant = colorVariants[variant] || colorVariants.emerald;
  
  // Si se está usando el componente Button (para mantener compatibilidad)
  if (props.useButtonComponent !== false) {
    return (
      <Button
        variant="primary"
        size={size}
        onClick={onClick}
        className={`${currentVariant.base} transform hover:scale-105 ${className}`}
        icon={showIcon ? "👤" : null}
        {...props}
      >
        {children || "Nuevo Usuario"}
      </Button>
    );
  }

  // Versión personalizada para mayor control (como en UsersPage)
  const baseStyle = {
    padding: size === "sm" ? '8px 16px' : size === "lg" ? '16px 32px' : '12px 24px',
    borderRadius: '8px',
    fontSize: size === "sm" ? '12px' : '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    ...currentVariant.style
  };

  return (
    <button
      onClick={onClick}
      style={baseStyle}
      className={className}
      onMouseEnter={(e) => {
        Object.assign(e.target.style, currentVariant.hoverStyle);
      }}
      onMouseLeave={(e) => {
        Object.assign(e.target.style, currentVariant.leaveStyle);
      }}
      {...props}
    >
      {showIcon && (variant === "blue" ? "➕" : "👤")} 
      {children || (variant === "blue" ? "Agregar Usuario" : "Nuevo Usuario")}
    </button>
  );
};

export default CreateUserButton;