// docs.js - Documentation functionality
class Documentation {
    constructor() {
        this.currentPage = 'introduction';
        this.init();
    }

    init() {
        this.loadDocumentation();
        this.setupNavigation();
        this.setupSearch();
    }

    loadDocumentation() {
        // Load documentation content based on current page
        this.fetchDocumentationContent(this.currentPage)
            .then(content => {
                this.renderContent(content);
            })
            .catch(error => {
                console.error('Error loading documentation:', error);
                this.renderError();
            });
    }

    async fetchDocumentationContent(page) {
        // Simulate API call to fetch documentation
        return new Promise((resolve) => {
            setTimeout(() => {
                const content = {
                    'introduction': '# Introduction\nWelcome to the documentation...',
                    'getting-started': '# Getting Started\nFollow these steps to begin...',
                    'api-reference': '# API Reference\nComplete API documentation...'
                };
                resolve(content[page] || '# Page Not Found');
            }, 300);
        });
    }

    renderContent(content) {
        // Convert markdown to HTML (simplified)
        const htmlContent = this.markdownToHTML(content);
        document.getElementById('docs-content').innerHTML = htmlContent;
        
        // Update active navigation
        this.updateActiveNav();
    }

    markdownToHTML(markdown) {
        // Simple markdown parser
        return markdown
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n/gim, '<br>');
    }

    renderError() {
        document.getElementById('docs-content').innerHTML = `
            <div class="error-message">
                <h2>Error Loading Documentation</h2>
                <p>Please try again later or contact support.</p>
            </div>
        `;
    }

    setupNavigation() {
        // Handle navigation clicks
        document.querySelectorAll('.docs-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.navigateTo(page);
            });
        });
    }

    navigateTo(page) {
        this.currentPage = page;
        this.loadDocumentation();
        
        // Update URL
        window.history.pushState({}, '', `docs.html?page=${page}`);
    }

    updateActiveNav() {
        // Update active state in navigation
        document.querySelectorAll('.docs-nav a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === this.currentPage) {
                link.classList.add('active');
            }
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('docs-search');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            this.searchDocumentation(e.target.value);
        });
    }

    searchDocumentation(query) {
        // Simple search implementation
        if (query.length < 2) return;
        
        console.log('Searching for:', query);
        // In a real implementation, this would search through documentation content
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Documentation();
});
