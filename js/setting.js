// js/setting.js
const Settings = {
    currentSettings: {},
    
    init: function() {
        this.loadSettings();
        this.bindSettingsEvents();
    },
    
    loadSettings: function() {
        // Load settings from localStorage or use defaults
        const savedSettings = localStorage.getItem('appSettings');
        
        if (savedSettings) {
            this.currentSettings = JSON.parse(savedSettings);
        } else {
            // Default settings
            this.currentSettings = {
                theme: 'light',
                notifications: true,
                sound: true,
                autoSave: true,
                fontSize: 'medium',
                language: 'my',
                reduceMotion: false
            };
        }
        
        this.applySettings();
    },
    
    saveSettings: function() {
        localStorage.setItem('appSettings', JSON.stringify(this.currentSettings));
        this.applySettings();
        
        // Notify other components
        document.dispatchEvent(new CustomEvent('settingsChanged', {
            detail: { settings: this.currentSettings }
        }));
    },
    
    applySettings: function() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.currentSettings.theme);
        
        // Apply font size
        document.documentElement.style.fontSize = this.getFontSizeValue(this.currentSettings.fontSize);
        
        // Apply reduced motion if needed
        if (this.currentSettings.reduceMotion) {
            document.documentElement.classList.add('reduce-motion');
        } else {
            document.documentElement.classList.remove('reduce-motion');
        }
        
        // Update settings form
        this.updateSettingsForm();
    },
    
    getFontSizeValue: function(size) {
        const sizes = {
            'small': '14px',
            'medium': '16px',
            'large': '18px',
            'x-large': '20px'
        };
        
        return sizes[size] || sizes.medium;
    },
    
    bindSettingsEvents: function() {
        // Settings form submission
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (event) => {
                event.preventDefault();
                this.saveSettingsFromForm(settingsForm);
            });
        }
        
        // Real-time updates for some settings
        document.querySelectorAll('[data-setting]').forEach(element => {
            if (element.type === 'checkbox') {
                element.addEventListener('change', (event) => {
                    this.currentSettings[event.target.name] = event.target.checked;
                    this.saveSettings();
                });
            } else if (element.type === 'radio' || element.tagName === 'SELECT') {
                element.addEventListener('change', (event) => {
                    this.currentSettings[event.target.name] = event.target.value;
                    this.saveSettings();
                });
            }
        });
    },
    
    saveSettingsFromForm: function(form) {
        const formData = new FormData(form);
        
        for (const [key, value] of formData.entries()) {
            if (form.elements[key].type === 'checkbox') {
                this.currentSettings[key] = form.elements[key].checked;
            } else {
                this.currentSettings[key] = value;
            }
        }
        
        this.saveSettings();
        
        // Show success message
        this.showSaveSuccess();
    },
    
    updateSettingsForm: function() {
        // Update form elements to reflect current settings
        for (const [key, value] of Object.entries(this.currentSettings)) {
            const element = document.querySelector(`[name="${key}"]`);
            
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'radio') {
                    document.querySelector(`[name="${key}"][value="${value}"]`).checked = true;
                } else {
                    element.value = value;
                }
            }
        }
    },
    
    showSaveSuccess: function() {
        // Show a success message when settings are saved
        const message = document.createElement('div');
        message.className = 'settings-save-message';
        message.textContent = 'Settings saved successfully';
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(message);
            }, 300);
        }, 3000);
    },
    
    resetToDefaults: function() {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            localStorage.removeItem('appSettings');
            this.loadSettings();
        }
    },
    
    exportSettings: function() {
        const dataStr = JSON.stringify(this.currentSettings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'burmemarkai-settings.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    },
    
    importSettings: function(file) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const settings = JSON.parse(event.target.result);
                this.currentSettings = { ...this.currentSettings, ...settings };
                this.saveSettings();
                alert('Settings imported successfully');
            } catch (error) {
                alert('Error importing settings: Invalid file format');
            }
        };
        
        reader.readAsText(file);
    }
};

// Initialize settings
document.addEventListener('DOMContentLoaded', function() {
    Settings.init();
});
