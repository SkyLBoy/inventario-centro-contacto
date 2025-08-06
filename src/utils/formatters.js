// Utilidades para formatear datos

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };
  
  export const formatDate = (date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  export const formatTime = (date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  export const formatNumber = (number) => {
    return new Intl.NumberFormat('es-MX').format(number);
  };
  
  export const formatPercentage = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };