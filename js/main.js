// main.js - Main application functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Handle responsive navigation
    setupResponsiveNav();
    
    // Handle smooth scrolling for anchor links
    setupSmoothScrolling();
    
    // Handle animations
    setupAnimations();
});

function initApp() {
    console.log('Burme Mark AI initialized');
    
    // Remove loader when page is fully loaded
    window.addEventListener('load', function() {
        setTimeout(function() {
            const loader = document.querySelector('.loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(function() {
                    loader.style.display = 'none';
                }, 500);
            }
        }, 1500);
    });
}

function setupResponsiveNav() {
    const navToggle = document.getElementById('navToggle');
    const headerActions = document.querySelector('.header-actions');
    
    if (navToggle && window.innerWidth <= 768) {
        navToggle.style.display = 'block';
        navToggle.addEventListener('click', function() {
            headerActions.classList.toggle('show');
        });
    }
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupAnimations() {
    // Animate elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all feature cards and demo elements
    document.querySelectorAll('.feature-card, .demo-card, .auth-section').forEach(el => {
        observer.observe(el);
    });
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initApp, setupResponsiveNav, setupSmoothScrolling, setupAnimations };
}
