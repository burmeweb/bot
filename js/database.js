// database.js - Database connection and operations
class Database {
    constructor() {
        this.dbName = 'burmeMarkDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => {
                reject(new Error('Database failed to open'));
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (e) => {
                this.db = e.target.result;
                this.createObjectStores();
            };
        });
    }

    createObjectStores() {
        // Create users store
        if (!this.db.objectStoreNames.contains('users')) {
            const usersStore = this.db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            usersStore.createIndex('email', 'email', { unique: true });
        }
        
        // Create history store
        if (!this.db.objectStoreNames.contains('history')) {
            const historyStore = this.db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
            historyStore.createIndex('userId', 'userId', { unique: false });
            historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Create settings store
        if (!this.db.objectStoreNames.contains('settings')) {
            this.db.createObjectStore('settings', { keyPath: 'userId' });
        }
    }

    // User operations
    async addUser(user) {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        return store.add(user);
    }

    async getUser(id) {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        return store.get(id);
    }

    async getUserByEmail(email) {
        const transaction = this.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const index = store.index('email');
        return index.get(email);
    }

    async updateUser(id, updates) {
        const transaction = this.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const user = await store.get(id);
        if (user) {
            const updatedUser = { ...user, ...updates };
            return store.put(updatedUser);
        }
        return null;
    }

    // History operations
    async addHistoryItem(item) {
        const transaction = this.db.transaction(['history'], 'readwrite');
        const store = transaction.objectStore('history');
        return store.add({
            ...item,
            timestamp: new Date().getTime()
        });
    }

    async getHistory(userId, limit = 50) {
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['history'], 'readonly');
            const store = transaction.objectStore('history');
            const index = store.index('userId');
            const request = index.getAll(userId);
            
            request.onsuccess = () => {
                let results = request.result;
                // Sort by timestamp descending and limit results
                results.sort((a, b) => b.timestamp - a.timestamp);
                resolve(results.slice(0, limit));
            };
            
            request.onerror = () => {
                resolve([]);
            };
        });
    }

    // Settings operations
    async getSettings(userId) {
        const transaction = this.db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const settings = await store.get(userId);
        return settings || { userId, theme: 'light', language: 'en' };
    }

    async saveSettings(settings) {
        const transaction = this.db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        return store.put(settings);
    }
}

// Create a singleton instance
const dbInstance = new Database();

// Initialize database when loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await dbInstance.init();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
});

export default dbInstance;
