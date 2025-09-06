// storage/user_info.js - User information storage
class UserInfoStorage {
    constructor() {
        this.storageKey = 'userData';
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupAutoSave();
    }

    loadUserData() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                this.currentUser = JSON.parse(storedData);
                this.emitEvent('userDataLoaded', this.currentUser);
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            this.emitEvent('loadError', error);
        }
    }

    saveUserData(userData) {
        try {
            // Validate user data
            if (!this.validateUserData(userData)) {
                throw new Error('Invalid user data');
            }

            // Merge with existing data if available
            const mergedData = this.currentUser ? 
                {...this.currentUser, ...userData, updatedAt: new Date().toISOString()} : 
                {...userData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()};

            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(mergedData));
            this.currentUser = mergedData;

            this.emitEvent('userDataSaved', mergedData);
            return true;
        } catch (error) {
            console.error('Failed to save user data:', error);
            this.emitEvent('saveError', error);
            return false;
        }
    }

    validateUserData(userData) {
        // Basic validation
        if (typeof userData !== 'object' || userData === null) {
            return false;
        }

        // Validate email if present
        if (userData.email && !this.isValidEmail(userData.email)) {
            return false;
        }

        // Validate phone if present
        if (userData.phone && !this.isValidPhone(userData.phone)) {
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    getUserData() {
        return {...this.currentUser};
    }

    getSpecificField(field) {
        return this.currentUser ? this.currentUser[field] : null;
    }

    updateField(field, value) {
        if (!this.currentUser) {
            this.currentUser = {};
        }

        this.currentUser[field] = value;
        this.currentUser.updatedAt = new Date().toISOString();

        return this.saveUserData({[field]: value});
    }

    deleteField(field) {
        if (!this.currentUser || !(field in this.currentUser)) {
            return false;
        }

        delete this.currentUser[field];
        this.currentUser.updatedAt = new Date().toISOString();

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.currentUser));
            this.emitEvent('userFieldDeleted', field);
            return true;
        } catch (error) {
            console.error('Failed to delete field:', error);
            return false;
        }
    }

    clearUserData() {
        try {
            localStorage.removeItem(this.storageKey);
            this.currentUser = null;
            this.emitEvent('userDataCleared');
            return true;
        } catch (error) {
            console.error('Failed to clear user data:', error);
            return false;
        }
    }

    exportUserData(format = 'json') {
        if (!this.currentUser) {
            return null;
        }

        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(this.currentUser, null, 2);
            
            case 'csv':
                return this.convertToCSV(this.currentUser);
            
            case 'text':
                return this.convertToText(this.currentUser);
            
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    convertToCSV(data) {
        const headers = Object.keys(data).join(',');
        const values = Object.values(data).map(value => 
            typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',');
        
        return `${headers}\n${values}`;
    }

    convertToText(data) {
        return Object.entries(data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
    }

    setupAutoSave() {
        // Auto-save when page is about to unload
        window.addEventListener('beforeunload', () => {
            if (this.currentUser) {
                this.saveUserData(this.currentUser);
            }
        });

        // Auto-save at regular intervals
        setInterval(() => {
            if (this.currentUser) {
                this.saveUserData(this.currentUser);
            }
        }, 30000); // Every 30 seconds
    }

    // Event system for communication with other components
    emitEvent(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }

    on(eventName, callback) {
        window.addEventListener(eventName, (event) => {
            callback(event.detail);
        });
    }
}

// Create global instance
const userInfoStorage = new UserInfoStorage();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = userInfoStorage;
}
