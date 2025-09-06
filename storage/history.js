// storage/history.js - History storage
class HistoryStorage {
    constructor() {
        this.storageKey = 'appHistory';
        this.maxHistoryItems = 100;
        this.history = [];
        this.init();
    }

    init() {
        this.loadHistory();
        this.setupCleanupInterval();
    }

    loadHistory() {
        try {
            const storedHistory = localStorage.getItem(this.storageKey);
            if (storedHistory) {
                this.history = JSON.parse(storedHistory);
                this.emitEvent('historyLoaded', this.history);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            this.emitEvent('loadError', error);
        }
    }

    saveHistory() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.history));
            this.emitEvent('historySaved', this.history);
            return true;
        } catch (error) {
            console.error('Failed to save history:', error);
            this.emitEvent('saveError', error);
            return false;
        }
    }

    addHistoryItem(item) {
        const historyItem = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            type: item.type || 'general',
            ...item
        };

        // Add to beginning of array (newest first)
        this.history.unshift(historyItem);

        // Limit history size
        if (this.history.length > this.maxHistoryItems) {
            this.history = this.history.slice(0, this.maxHistoryItems);
        }

        this.saveHistory();
        this.emitEvent('historyItemAdded', historyItem);

        return historyItem;
    }

    getHistory(filter = {}) {
        let filteredHistory = this.history;

        // Filter by type
        if (filter.type) {
            filteredHistory = filteredHistory.filter(item => item.type === filter.type);
        }

        // Filter by date range
        if (filter.startDate || filter.endDate) {
            filteredHistory = filteredHistory.filter(item => {
                const itemDate = new Date(item.timestamp);
                if (filter.startDate && itemDate < new Date(filter.startDate)) {
                    return false;
                }
                if (filter.endDate && itemDate > new Date(filter.endDate)) {
                    return false;
                }
                return true;
            });
        }

        // Filter by search term
        if (filter.search) {
            const searchTerm = filter.search.toLowerCase();
            filteredHistory = filteredHistory.filter(item =>
                JSON.stringify(item).toLowerCase().includes(searchTerm)
            );
        }

        // Sort (newest first by default)
        if (filter.sort) {
            filteredHistory.sort((a, b) => {
                const aValue = a[filter.sort.field];
                const bValue = b[filter.sort.field];
                
                if (filter.sort.order === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
        }

        // Pagination
        if (filter.page && filter.limit) {
            const start = (filter.page - 1) * filter.limit;
            filteredHistory = filteredHistory.slice(start, start + filter.limit);
        }

        return filteredHistory;
    }

    getHistoryItem(id) {
        return this.history.find(item => item.id === id);
    }

    updateHistoryItem(id, updates) {
        const index = this.history.findIndex(item => item.id === id);
        if (index !== -1) {
            this.history[index] = {...this.history[index], ...updates};
            this.saveHistory();
            this.emitEvent('historyItemUpdated', this.history[index]);
            return true;
        }
        return false;
    }

    deleteHistoryItem(id) {
        const index = this.history.findIndex(item => item.id === id);
        if (index !== -1) {
            const deletedItem = this.history.splice(index, 1)[0];
            this.saveHistory();
            this.emitEvent('historyItemDeleted', deletedItem);
            return true;
        }
        return false;
    }

    clearHistory(filter = {}) {
        if (Object.keys(filter).length === 0) {
            // Clear all history
            this.history = [];
        } else {
            // Clear filtered history
            this.history = this.history.filter(item => {
                if (filter.type && item.type !== filter.type) {
                    return true;
                }
                if (filter.startDate && new Date(item.timestamp) < new Date(filter.startDate)) {
                    return true;
                }
                if (filter.endDate && new Date(item.timestamp) > new Date(filter.endDate)) {
                    return true;
                }
                return false;
            });
        }

        this.saveHistory();
        this.emitEvent('historyCleared', filter);
        return true;
    }

    exportHistory(format = 'json') {
        if (this.history.length === 0) {
            return null;
        }

        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(this.history, null, 2);
            
            case 'csv':
                return this.convertToCSV(this.history);
            
            case 'text':
                return this.convertToText(this.history);
            
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    convertToCSV(history) {
        if (history.length === 0) return '';
        
        const headers = Object.keys(history[0]).join(',');
        const rows = history.map(item => 
            Object.values(item).map(value => 
                typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
            ).join(',')
        );
        
        return `${headers}\n${rows.join('\n')}`;
    }

    convertToText(history) {
        return history.map(item => 
            Object.entries(item)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')
        ).join('\n\n');
    }

    getStats() {
        const stats = {
            total: this.history.length,
            byType: {},
            byDate: {},
            lastUpdated: this.history.length > 0 ? this.history[0].timestamp : null
        };

        // Count by type
        this.history.forEach(item => {
            stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
        });

        // Count by date
        this.history.forEach(item => {
            const date = item.timestamp.split('T')[0];
            stats.byDate[date] = (stats.byDate[date] || 0) + 1;
        });

        return stats;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    setupCleanupInterval() {
        // Clean up old items daily
        setInterval(() => {
            this.cleanupOldItems();
        }, 24 * 60 * 60 * 1000); // 24 hours
    }

    cleanupOldItems() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const initialLength = this.history.length;
        this.history = this.history.filter(item => 
            new Date(item.timestamp) > thirtyDaysAgo
        );

        if (this.history.length < initialLength) {
            this.saveHistory();
            this.emitEvent('historyCleanedUp', initialLength - this.history.length);
        }
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
const historyStorage = new HistoryStorage();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = historyStorage;
}
