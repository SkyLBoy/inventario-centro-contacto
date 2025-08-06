// constants.js - Constantes para el sistema de usuarios

// Roles de usuario
export const USER_ROLES = {
    ADMIN: 'admin',
    EDITOR: 'editor',
    VIEWER: 'viewer'
  };
  
  // Etiquetas de roles para mostrar
  export const ROLE_LABELS = {
    [USER_ROLES.ADMIN]: 'Administrador',
    [USER_ROLES.EDITOR]: 'Editor',
    [USER_ROLES.VIEWER]: 'Visualizador'
  };
  
  // Descripciones de roles
  export const ROLE_DESCRIPTIONS = {
    [USER_ROLES.ADMIN]: 'Administrador - Acceso completo',
    [USER_ROLES.EDITOR]: 'Editor - Puede editar inventario',
    [USER_ROLES.VIEWER]: 'Visualizador - Solo lectura'
  };
  
  // Estados de usuario
  export const USER_STATUS = {
    ACTIVE: true,
    INACTIVE: false
  };
  
  // Etiquetas de estado
  export const STATUS_LABELS = {
    [USER_STATUS.ACTIVE]: 'Activo',
    [USER_STATUS.INACTIVE]: 'Inactivo'
  };
  
  // Colores para badges de roles
  export const ROLE_COLORS = {
    [USER_ROLES.ADMIN]: {
      background: '#fef2f2',
      text: '#dc2626'
    },
    [USER_ROLES.EDITOR]: {
      background: '#eff6ff',
      text: '#2563eb'
    },
    [USER_ROLES.VIEWER]: {
      background: '#f9fafb',
      text: '#6b7280'
    }
  };
  
  // Colores para badges de estado
  export const STATUS_COLORS = {
    [USER_STATUS.ACTIVE]: {
      background: '#dcfce7',
      text: '#166534'
    },
    [USER_STATUS.INACTIVE]: {
      background: '#fee2e2',
      text: '#dc2626'
    }
  };
  
  // Validaciones
  export const VALIDATION_RULES = {
    USERNAME_MIN_LENGTH: 3,
    PASSWORD_MIN_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  };
  
  // Mensajes de error
  export const ERROR_MESSAGES = {
    REQUIRED_FIELD: 'Este campo es requerido',
    INVALID_EMAIL: 'Email inválido',
    USERNAME_TOO_SHORT: `El nombre de usuario debe tener al menos ${VALIDATION_RULES.USERNAME_MIN_LENGTH} caracteres`,
    PASSWORD_TOO_SHORT: `La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`,
    ACCESS_DENIED: 'No tienes permisos para acceder a esta sección',
    LOAD_ERROR: 'Error cargando usuarios',
    SAVE_ERROR: 'Error guardando usuario',
    DELETE_ERROR: 'Error eliminando usuario'
  };
  
  // Configuración de tabla
  export const TABLE_CONFIG = {
    ITEMS_PER_PAGE: 10,
    SORT_DIRECTIONS: {
      ASC: 'asc',
      DESC: 'desc'
    }
  };
  
  // Iconos
  export const ICONS = {
    ADD_USER: '➕',
    EDIT: '✏️',
    DELETE: '🗑️',
    ACTIVE: '▶️',
    INACTIVE: '⏸️',
    HOME: '🏠',
    WARNING: '⚠️',
    CLOSE: '✕'
  };
  
  // Rutas de navegación
  export const ROUTES = {
    HOME: '/',
    USERS: '/users',
    LOGIN: '/login'
  };