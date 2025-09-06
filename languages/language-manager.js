// languages/language-manager.js
const LanguageManager = {
    currentLanguage: 'my',
    
    init: function() {
        this.loadLanguage();
        this.bindLanguageEvents();
    },
    
    loadLanguage: function() {
        // Get saved language preference or default to Burmese
        const savedLanguage = localStorage.getItem('preferredLanguage') || 'my';
        this.setLanguage(savedLanguage);
    },
    
    setLanguage: function(languageCode) {
        fetch(`languages/${languageCode}.json`)
            .then(response => response.json())
            .then(translations => {
                this.applyTranslations(translations);
                this.currentLanguage = languageCode;
                localStorage.setItem('preferredLanguage', languageCode);
                
                // Update UI to reflect current language
                this.updateLanguageSelector();
            })
            .catch(error => {
                console.error('Error loading language file:', error);
            });
    },
    
    applyTranslations: function(translations) {
        // Find all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                if (element.tagName === 'INPUT' && element.placeholder) {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });
        
        // Update page title
        if (translations['pageTitle']) {
            document.title = translations['pageTitle'];
        }
        
        // Dispatch event for other components to know language changed
        document.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLanguage }
        }));
    },
    
    bindLanguageEvents: function() {
        // Language selector change event
        const languageSelector = document.getElementById('languageSelector');
        if (languageSelector) {
            languageSelector.addEventListener('change', (event) => {
                this.setLanguage(event.target.value);
            });
        }
        
        // Language switch buttons
        document.querySelectorAll('.language-switch').forEach(button => {
            button.addEventListener('click', (event) => {
                const lang = event.target.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });
    },
    
    updateLanguageSelector: function() {
        // Update language selector to show current language
        const selector = document.getElementById('languageSelector');
        if (selector) {
            selector.value = this.currentLanguage;
        }
        
        // Update active language buttons
        document.querySelectorAll('.language-switch').forEach(button => {
            if (button.getAttribute('data-lang') === this.currentLanguage) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    },
    
    translate: function(key) {
        // Get translation for a specific key (for use in JavaScript)
        // This would need to be implemented with a preloaded translations object
        return this.translations ? this.translations[key] || key : key;
    }
};

// Initialize language manager
document.addEventListener('DOMContentLoaded', function() {
    LanguageManager.init();
});
