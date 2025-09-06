// storage/storage_permission.js - Storage permissions management
class StoragePermission {
    constructor() {
        this.permissions = {
            localStorage: false,
            indexedDB: false,
            cookies: false,
            sessionStorage: false
        };
        this.init();
    }

    async init() {
        await this.checkPermissions();
        this.setupEventListeners();
    }

    async checkPermissions() {
        // Check localStorage permission
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            this.permissions.localStorage = true;
        } catch (e) {
            this.permissions.localStorage = false;
            console.warn('LocalStorage is not available:', e.message);
        }

        // Check IndexedDB permission
        try {
            if ('indexedDB' in window) {
                const db = await this.testIndexedDB();
                this.permissions.indexedDB = true;
            } else {
                this.permissions.indexedDB = false;
            }
        } catch (e) {
            this.permissions.indexedDB = false;
            console.warn('IndexedDB is not available:', e.message);
        }

        // Check cookies permission
        try {
            document.cookie = 'test=1; SameSite=Lax';
            this.permissions.cookies = document.cookie.indexOf('test=') !== -1;
            document.cookie = 'test=1; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        } catch (e) {
            this.permissions.cookies = false;
            console.warn('Cookies are not available:', e.message);
        }

        // Check sessionStorage permission
        try {
            sessionStorage.setItem('test', 'test');
            sessionStorage.removeItem('test');
            this.permissions.sessionStorage = true;
        } catch (e) {
            this.permissions.sessionStorage = false;
            console.warn('SessionStorage is not available:', e.message);
        }

        this.updateUI();
        return this.permissions;
    }

    async testIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('permission-test', 1);
            
            request.onerror = () => reject(new Error('IndexedDB failed'));
            request.onsuccess = () => {
                const db = request.result;
                db.close();
                // Clean up
                indexedDB.deleteDatabase('permission-test');
                resolve(true);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('test')) {
                    db.createObjectStore('test');
                }
            };
        });
    }

    setupEventListeners() {
        // Request permissions button
        const requestBtn = document.getElementById('request-storage-permissions');
        if (requestBtn) {
            requestBtn.addEventListener('click', () => {
                this.requestPermissions();
            });
        }

        // Reset permissions button
        const resetBtn = document.getElementById('reset-storage-permissions');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetPermissions();
            });
        }
    }

    async requestPermissions() {
        // Show permission request dialog
        const dialog = document.createElement('div');
        dialog.className = 'permission-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>Storage Permissions Request</h3>
                <p>This application needs storage permissions to function properly.</p>
                <div class="permission-list">
                    <label>
                        <input type="checkbox" id="perm-localstorage" checked>
                        Local Storage
                    </label>
                    <label>
                        <input type="checkbox" id="perm-indexeddb" checked>
                        IndexedDB
                    </label>
                    <label>
                        <input type="checkbox" id="perm-cookies" checked>
                        Cookies
                    </label>
                    <label>
                        <input type="checkbox" id="perm-sessionstorage" checked>
                        Session Storage
                    </label>
                </div>
                <div class="dialog-buttons">
                    <button id="perm-cancel">Cancel</button>
                    <button id="perm-allow">Allow</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Handle dialog actions
        return new Promise((resolve) => {
            document.getElementById('perm-cancel').addEventListener('click', () => {
                dialog.remove();
                resolve(false);
            });

            document.getElementById('perm-allow').addEventListener('click', () => {
                const permissions = {
                    localStorage: document.getElementById('perm-localstorage').checked,
                    indexedDB: document.getElementById('perm-indexeddb').checked,
                    cookies: document.getElementById('perm-cookies').checked,
                    sessionStorage: document.getElementById('perm-sessionstorage').checked
                };

                this.savePermissionPreferences(permissions);
                dialog.remove();
                resolve(true);
            });
        });
    }

    savePermissionPreferences(permissions) {
        // Save user's permission preferences
        try {
            localStorage.setItem('storagePermissions', JSON.stringify(permissions));
            this.showNotification('Storage preferences saved', 'success');
        } catch (e) {
            console.error('Failed to save permissions:', e);
            this.showNotification('Failed to save preferences', 'error');
        }
    }

    resetPermissions() {
        // Reset to default permissions
        try {
            localStorage.removeItem('storagePermissions');
            this.checkPermissions();
            this.showNotification('Storage preferences reset', 'success');
        } catch (e) {
            console.error('Failed to reset permissions:', e);
            this.showNotification('Failed to reset preferences', 'error');
        }
    }

    updateUI() {
        // Update UI to reflect current permissions
        const permStatus = document.getElementById('storage-permission-status');
        if (permStatus) {
            const allGranted = Object.values(this.permissions).every(Boolean);
            permStatus.textContent = allGranted ? 'All permissions granted' : 'Some permissions restricted';
            permStatus.className = allGranted ? 'status-granted' : 'status-restricted';
        }

        // Update individual permission indicators
        this.updatePermissionIndicator('localstorage', this.permissions.localStorage);
        this.updatePermissionIndicator('indexeddb', this.permissions.indexedDB);
        this.updatePermissionIndicator('cookies', this.permissions.cookies);
        this.updatePermissionIndicator('sessionstorage', this.permissions.sessionStorage);
    }

    updatePermissionIndicator(type, granted) {
        const indicator = document.getElementById(`perm-status-${type}`);
        if (indicator) {
            indicator.textContent = granted ? '✓ Granted' : '✗ Restricted';
            indicator.className = granted ? 'permission-granted' : 'permission-restricted';
        }
    }

    hasPermission(type) {
        return this.permissions[type] || false;
    }

    getAllPermissions() {
        return {...this.permissions};
    }

    showNotification(message, type) {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Create global instance
const storagePermission = new StoragePermission();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = storagePermission;
}
