// src/services/storageService.js - ACTUALIZADO
import { JsonStorageService } from './jsonStorageService';

export class StorageService {
  static SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos
  static syncTimer = null;

  /**
   * Obtener item con fallback a JSON inicial
   * @param {string} key - Clave de localStorage
   * @returns {*} Datos obtenidos
   */
  static getItem(key) {
    try {
      const item = localStorage.getItem(key);
      
      if (item !== null) {
        return JSON.parse(item);
      }

      // Si no existe en localStorage, intentar inicializar desde JSON
      const dataKey = key.replace('inventory_', '');
      if (['users', 'categories', 'products', 'movements'].includes(dataKey)) {
        console.log(`📁 Inicializando ${dataKey} desde JSON...`);
        return JsonStorageService.initializeFromJson(key, dataKey);
      }

      return null;
    } catch (error) {
      console.error('Error getting item from storage:', error);
      
      // En caso de error, intentar recuperar desde backup
      const restored = JsonStorageService.restoreFromLatestBackup(key);
      if (restored) {
        console.log(`♻️ Datos restaurados desde backup para ${key}`);
        return this.getItem(key); // Reintentar después de la restauración
      }
      
      return null;
    }
  }

  /**
   * Guardar item con backup automático
   * @param {string} key - Clave de localStorage
   * @param {*} value - Valor a guardar
   * @returns {boolean} Éxito de la operación
   */
  static setItem(key, value) {
    try {
      // Crear backup antes de modificar datos críticos
      if (key.startsWith('inventory_')) {
        JsonStorageService.createBackup(key);
      }

      localStorage.setItem(key, JSON.stringify(value));
      
      // Programar sincronización automática
      this.scheduleSyncToJson();
      
      return true;
    } catch (error) {
      console.error('Error setting item in storage:', error);
      
      // Si falla por falta de espacio, limpiar backups antiguos e intentar de nuevo
      if (error.name === 'QuotaExceededError') {
        console.warn('💾 Espacio de localStorage agotado, limpiando backups...');
        this.cleanupStorage();
        
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (secondError) {
          console.error('Error persistente guardando en storage:', secondError);
          return false;
        }
      }
      
      return false;
    }
  }

  /**
   * Remover item con backup de seguridad
   * @param {string} key - Clave de localStorage
   * @returns {boolean} Éxito de la operación
   */
  static removeItem(key) {
    try {
      // Crear backup antes de eliminar datos críticos
      if (key.startsWith('inventory_')) {
        JsonStorageService.createBackup(key);
      }

      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing item from storage:', error);
      return false;
    }
  }

  /**
   * Limpiar storage con confirmación para datos críticos
   * @param {boolean} includeInventoryData - Si incluir datos de inventario
   * @returns {boolean} Éxito de la operación
   */
  static clear(includeInventoryData = false) {
    try {
      if (includeInventoryData) {
        const confirmation = confirm(
          '⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos?\n\n' +
          'Esta acción eliminará:\n' +
          '• Todos los productos\n' +
          '• Todas las categorías\n' +
          '• Todos los movimientos\n' +
          '• Todos los usuarios\n\n' +
          'Se crearán backups antes de la eliminación.'
        );

        if (!confirmation) {
          return false;
        }

        // Crear backups de seguridad
        const inventoryKeys = [
          'inventory_users',
          'inventory_categories',
          'inventory_products',
          'inventory_movements'
        ];

        inventoryKeys.forEach(key => {
          JsonStorageService.createBackup(key);
        });

        localStorage.clear();
        console.log('🗑️ Todos los datos eliminados (backups creados)');
      } else {
        // Solo limpiar datos no críticos
        const keysToKeep = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('inventory_')) {
            keysToKeep.push({
              key,
              value: localStorage.getItem(key)
            });
          }
        }

        localStorage.clear();

        // Restaurar datos de inventario
        keysToKeep.forEach(({ key, value }) => {
          localStorage.setItem(key, value);
        });

        console.log('🧹 Storage limpiado (datos de inventario preservados)');
      }

      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Programar sincronización automática con JSON
   */
  static scheduleSyncToJson() {
    // Cancelar timer anterior si existe
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    // Programar nueva sincronización
    this.syncTimer = setTimeout(() => {
      this.syncToJson();
    }, this.SYNC_INTERVAL);
  }

  /**
   * Sincronizar datos con JSON
   * @returns {boolean} Éxito de la sincronización
   */
  static syncToJson() {
    try {
      const allData = {
        users: this.getItem('inventory_users') || [],
        categories: this.getItem('inventory_categories') || [],
        products: this.getItem('inventory_products') || [],
        movements: this.getItem('inventory_movements') || []
      };

      const success = JsonStorageService.syncToJson(allData);
      
      if (success) {
        localStorage.setItem('lastSync', new Date().toISOString());
        console.log('✅ Sincronización automática completada');
      }

      return success;
    } catch (error) {
      console.error('❌ Error en sincronización automática:', error);
      return false;
    }
  }

  /**
   * Limpiar storage para liberar espacio
   */
  static cleanupStorage() {
    try {
      // Limpiar backups antiguos
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('backup_')) {
          keysToRemove.push(key);
        }
      }

      // Ordenar backups por timestamp y mantener solo los 3 más recientes por tipo
      const backupGroups = {};
      keysToRemove.forEach(key => {
        const parts = key.split('_');
        if (parts.length >= 3) {
          const groupKey = parts.slice(0, -1).join('_'); // Todo excepto el timestamp
          if (!backupGroups[groupKey]) {
            backupGroups[groupKey] = [];
          }
          backupGroups[groupKey].push(key);
        }
      });

      // Eliminar backups antiguos (mantener solo 3 por grupo)
      Object.values(backupGroups).forEach(group => {
        const sortedGroup = group.sort((a, b) => {
          const timestampA = parseInt(a.split('_').pop());
          const timestampB = parseInt(b.split('_').pop());
          return timestampB - timestampA; // Más reciente primero
        });

        // Eliminar todos excepto los 3 más recientes
        if (sortedGroup.length > 3) {
          const toDelete = sortedGroup.slice(3);
          toDelete.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ Backup antiguo eliminado: ${key}`);
          });
        }
      });

      console.log('🧹 Limpieza de storage completada');
    } catch (error) {
      console.error('Error limpiando storage:', error);
    }
  }

  /**
   * Obtener información del uso de storage
   * @returns {Object} Información de uso
   */
  static getStorageInfo() {
    try {
      let totalSize = 0;
      let inventorySize = 0;
      let backupSize = 0;
      let otherSize = 0;
      
      const itemCounts = {
        inventory: 0,
        backups: 0,
        other: 0
      };

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = (key.length + value.length) * 2; // Aproximación en bytes

        totalSize += size;

        if (key.startsWith('inventory_')) {
          inventorySize += size;
          itemCounts.inventory++;
        } else if (key.startsWith('backup_')) {
          backupSize += size;
          itemCounts.backups++;
        } else {
          otherSize += size;
          itemCounts.other++;
        }
      }

      // Convertir a unidades más legibles
      const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      return {
        total: {
          size: formatSize(totalSize),
          bytes: totalSize,
          items: localStorage.length
        },
        inventory: {
          size: formatSize(inventorySize),
          bytes: inventorySize,
          items: itemCounts.inventory
        },
        backups: {
          size: formatSize(backupSize),
          bytes: backupSize,
          items: itemCounts.backups
        },
        other: {
          size: formatSize(otherSize),
          bytes: otherSize,
          items: itemCounts.other
        },
        quota: {
          // Estimación del límite de localStorage (generalmente 5-10MB)
          estimated: '5-10 MB',
          usage: `${((totalSize / (5 * 1024 * 1024)) * 100).toFixed(1)}%`
        }
      };
    } catch (error) {
      console.error('Error obteniendo información de storage:', error);
      return null;
    }
  }

  /**
   * Verificar salud del storage
   * @returns {Object} Estado de salud
   */
  static checkStorageHealth() {
    try {
      const health = {
        status: 'healthy',
        issues: [],
        recommendations: []
      };

      const storageInfo = this.getStorageInfo();
      
      // Verificar uso de espacio
      if (storageInfo.total.bytes > 4 * 1024 * 1024) { // > 4MB
        health.status = 'warning';
        health.issues.push('Alto uso de almacenamiento');
        health.recommendations.push('Considerar limpiar backups antiguos');
      }

      // Verificar cantidad de backups
      if (storageInfo.backups.items > 20) {
        health.status = 'warning';
        health.issues.push('Muchos backups almacenados');
        health.recommendations.push('Ejecutar limpieza de storage');
      }

      // Verificar integridad de datos
      const inventoryKeys = [
        'inventory_users',
        'inventory_categories',
        'inventory_products',
        'inventory_movements'
      ];

      inventoryKeys.forEach(key => {
        try {
          const data = this.getItem(key);
          if (!Array.isArray(data)) {
            health.status = 'error';
            health.issues.push(`Datos corruptos en ${key}`);
            health.recommendations.push(`Restaurar ${key} desde backup`);
          }
        } catch (error) {
          health.status = 'error';
          health.issues.push(`Error accediendo a ${key}`);
          health.recommendations.push(`Verificar y restaurar ${key}`);
        }
      });

      return health;
    } catch (error) {
      console.error('Error verificando salud del storage:', error);
      return {
        status: 'error',
        issues: ['Error interno verificando storage'],
        recommendations: ['Contactar soporte técnico']
      };
    }
  }

  /**
   * Exportar todos los datos para respaldo externo
   * @returns {Object} Datos exportables
   */
  static exportAllData() {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        data: {
          users: this.getItem('inventory_users') || [],
          categories: this.getItem('inventory_categories') || [],
          products: this.getItem('inventory_products') || [],
          movements: this.getItem('inventory_movements') || []
        },
        metadata: {
          storageInfo: this.getStorageInfo(),
          lastSync: localStorage.getItem('lastSync'),
          totalRecords: 0
        }
      };

      // Calcular total de registros
      exportData.metadata.totalRecords = Object.values(exportData.data)
        .reduce((total, array) => total + array.length, 0);

      return exportData;
    } catch (error) {
      console.error('Error exportando datos:', error);
      throw error;
    }
  }

  /**
   * Importar datos desde respaldo externo
   * @param {Object} importData - Datos a importar
   * @returns {boolean} Éxito de la importación 
   */
  static importData(importData) {
    try {
      if (!importData.data || typeof importData.data !== 'object') {
        throw new Error('Formato de datos inválido');
      }

      const confirmation = confirm(
        '⚠️ ¿Importar datos externos?\n\n' +
        'Esta acción:\n' +
        '• Creará backups de los datos actuales\n' +
        '• Reemplazará todos los datos existentes\n' +
        '• No se puede deshacer fácilmente\n\n' +
        '¿Continuar?'
      );

      if (!confirmation) {
        return false;
      }

      // Crear backups de seguridad
      Object.keys(importData.data).forEach(dataKey => {
        const storageKey = `inventory_${dataKey}`;
        JsonStorageService.createBackup(storageKey);
      });

      // Importar datos
      Object.entries(importData.data).forEach(([dataKey, data]) => {
        const storageKey = `inventory_${dataKey}`;
        this.setItem(storageKey, data);
      });

      console.log('✅ Datos importados correctamente');
      
      // Recargar página para reflejar cambios
      if (confirm('Datos importados. ¿Recargar la página para ver los cambios?')) {
        window.location.reload();
      }

      return true;
    } catch (error) {
      console.error('Error importando datos:', error);
      alert(`Error importando datos: ${error.message}`);
      return false;
    }
  }
}