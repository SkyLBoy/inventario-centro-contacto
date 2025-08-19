import databaseData from '../data/database.json';

class DatabaseService {
  constructor() {
    this.data = this.loadFromLocalStorage() || databaseData;
    this.saveToLocalStorage();
    if (!this.data.activities){
      this.data.activities = [];
    }
    this.saveToLocalStorage();
  }

  // Métodos de persistencia local
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('inventario_database');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return null;
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('inventario_database', JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Método para generar IDs únicos
  generateId(tableName) {
    const table = this.data[tableName];
    if (!table || table.length === 0) return 1;
    return Math.max(...table.map(item => item.id)) + 1;
  }

  // CRUD GENÉRICO
  async getAll(tableName) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.data[tableName] || []);
      }, 100); // Simula latencia de red
    });
  }

  async getById(tableName, id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = this.data[tableName]?.find(item => item.id === parseInt(id));
        resolve(item || null);
      }, 50);
    });
  }

  async create(tableName, newItem) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const id = this.generateId(tableName);
          const itemWithId = {
            ...newItem,
            id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          this.data[tableName].push(itemWithId);
          this.saveToLocalStorage();
          resolve(itemWithId);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  async update(tableName, id, updates) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const index = this.data[tableName].findIndex(item => item.id === parseInt(id));
          if (index === -1) {
            reject(new Error(`Item with id ${id} not found`));
            return;
          }

          this.data[tableName][index] = {
            ...this.data[tableName][index],
            ...updates,
            updatedAt: new Date().toISOString()
          };

          this.saveToLocalStorage();
          resolve(this.data[tableName][index]);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  async delete(tableName, id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const index = this.data[tableName].findIndex(item => item.id === parseInt(id));
          if (index === -1) {
            reject(new Error(`Item with id ${id} not found`));
            return;
          }

          const deletedItem = this.data[tableName].splice(index, 1)[0];
          this.saveToLocalStorage();
          resolve(deletedItem);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  // MÉTODOS ESPECÍFICOS PARA PRODUCTOS
  async getProductsWithCategory() {
    const products = await this.getAll('products');
    const categories = await this.getAll('categories');
    
    return products.map(product => ({
      ...product,
      category: categories.find(cat => cat.id === product.categoryId)
    }));
  }

  async getProductsByCategory(categoryId) {
    const products = await this.getAll('products');
    return products.filter(product => product.categoryId === parseInt(categoryId));
  }

  async getLowStockProducts() {
    const products = await this.getAll('products');
    return products.filter(product => product.quantity <= product.minStock);
  }

  // MÉTODOS ESPECÍFICOS PARA MOVIMIENTOS
  async getMovementsWithDetails() {
    const movements = await this.getAll('movements');
    const products = await this.getAll('products');
    const users = await this.getAll('users');

    return movements.map(movement => ({
      ...movement,
      product: products.find(p => p.id === movement.productId),
      user: users.find(u => u.id === movement.userId)
    }));
  }

  async createMovement(movementData) {
    // Crear el movimiento
    const movement = await this.create('movements', movementData);
    
    // Actualizar stock del producto
    const product = await this.getById('products', movementData.productId);
    if (product) {
      let newQuantity = product.quantity;
      if (movementData.type === 'entrada') {
        newQuantity += movementData.quantity;
      } else if (movementData.type === 'salida') {
        newQuantity -= movementData.quantity;
      }
      
      await this.update('products', product.id, { quantity: Math.max(0, newQuantity) });
    }

    return movement;
  }

  // MÉTODOS ESPECÍFICOS PARA USUARIOS
  async authenticateUser(username, password) {
    const users = await this.getAll('users');
    return users.find(user => 
      (user.username === username || user.email === username) && 
      user.password === password && 
      user.isActive
    );
  }

  // MÉTODOS PARA REPORTES Y ESTADÍSTICAS
  async getDashboardStats() {
    const products = await this.getAll('products');
    const movements = await this.getAll('movements');
    const categories = await this.getAll('categories');

    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const lowStockItems = products.filter(p => p.quantity <= p.minStock).length;
    const totalCategories = categories.filter(c => c.isActive).length;

    // Movimientos recientes (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentMovements = movements.filter(m => new Date(m.createdAt) >= sevenDaysAgo);

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      totalCategories,
      recentMovements: recentMovements.length,
      lastUpdated: new Date().toISOString()
    };
  }

  // Método para resetear la base de datos
  async resetDatabase() {
    this.data = { ...databaseData };
    this.saveToLocalStorage();
    return this.data;
  }

  // Método para exportar datos
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  // Método para importar datos
  async importData(jsonData) {
    try {
      const parsedData = JSON.parse(jsonData);
      this.data = parsedData;
      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
  // MÉTODOS ESPECÍFICOS PARA ACTIVIDADES
async getActivities() {
  // Usa el genérico y ordénalas descendente por fecha de creación
  const list = await this.getAll('activities');
  return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async createActivity({ action, item, user }) {
  // Guarda con el mismo shape que ya usa tu UI (action, item, time)
  const activity = await this.create('activities', {
    action,
    item,
    user, // nombre completo del usuario
    time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    // createdAt/updatedAt los agrega this.create()
  });

  // Limitar a las últimas 20
  this.data.activities = [...this.data.activities]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);

  this.saveToLocalStorage();
  return activity;
}

}

// Crear instancia singleton
const databaseService = new DatabaseService();
export default databaseService;