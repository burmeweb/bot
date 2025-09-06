// main.js - Main application functionality for Burme Mark AI
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Handle responsive navigation
    setupResponsiveNav();
    
    // Handle smooth scrolling for anchor links
    setupSmoothScrolling();
    
    // Handle animations
    setupAnimations();
    
    // Initialize chat functionality
    initChat();
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
        }, 1000);
    });
    
    // Check authentication status
    checkAuthStatus();
}

function checkAuthStatus() {
    // Check if user is logged in (you can implement actual auth check)
    const isLoggedIn = localStorage.getItem('userToken') !== null;
    
    const loginBtn = document.querySelector('.login-btn');
    const registerBtn = document.querySelector('.register-btn');
    const userSection = document.querySelector('.nav-user');
    
    if (isLoggedIn && userSection) {
        // User is logged in
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userSection) userSection.style.display = 'flex';
    } else {
        // User is not logged in
        if (userSection) userSection.style.display = 'none';
    }
}

function setupResponsiveNav() {
    const navToggle = document.getElementById('navToggle');
    const headerActions = document.querySelector('.header-actions');
    const sideNav = document.getElementById('sideNav');
    
    if (navToggle && window.innerWidth <= 768) {
        navToggle.style.display = 'block';
        navToggle.addEventListener('click', function() {
            headerActions.classList.toggle('show');
        });
    }
    
    // Mobile nav toggle for side navigation
    if (sideNav && navToggle) {
        navToggle.addEventListener('click', function() {
            sideNav.classList.toggle('active');
        });
        
        // Close nav when clicking outside
        document.addEventListener('click', function(e) {
            if (!sideNav.contains(e.target) && !navToggle.contains(e.target) && sideNav.classList.contains('active')) {
                sideNav.classList.remove('active');
            }
        });
    }
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
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

function initChat() {
    // Check if we're on a page with chat functionality
    const chatContainer = document.querySelector('.ai-chat-container');
    if (!chatContainer) return;
    
    // Import chat functionality
    if (typeof initChatSystem === 'function') {
        initChatSystem();
    } else {
        // Load chat.js if not already loaded
        loadScript('../js/chat.js');
    }
}

function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
}

// Utility functions
function formatTime(date = new Date()) {
    return `ယနေ့ ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        initApp, 
        setupResponsiveNav, 
        setupSmoothScrolling, 
        setupAnimations,
        formatTime,
        showNotification
    };
                   }
