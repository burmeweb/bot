// server/auth.js (Client-side helper functions)
const Auth = {
    isAuthenticated: false,
    user: null,
    
    init: function() {
        this.checkAuthStatus();
    },
    
    checkAuthStatus: function() {
        // Check if user is logged in by verifying token
        const token = localStorage.getItem('authToken');
        
        if (token) {
            // Verify token with server
            fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Token invalid');
            })
            .then(userData => {
                this.isAuthenticated = true;
                this.user = userData;
                this.onAuthStateChange(true);
            })
            .catch(error => {
                console.error('Auth verification failed:', error);
                this.logout();
            });
        } else {
            this.onAuthStateChange(false);
        }
    },
    
    login: function(email, password) {
        return fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(data => {
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                this.isAuthenticated = true;
                this.user = data.user;
                this.onAuthStateChange(true);
            }
            return data;
        });
    },
    
    register: function(userData) {
        return fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Registration failed');
            }
            return response.json();
        })
        .then(data => {
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                this.isAuthenticated = true;
                this.user = data.user;
                this.onAuthStateChange(true);
            }
            return data;
        });
    },
    
    logout: function() {
        localStorage.removeItem('authToken');
        this.isAuthenticated = false;
        this.user = null;
        this.onAuthStateChange(false);
        
        // Redirect to login page
        window.location.href = '/user/login.html';
    },
    
    onAuthStateChange: function(isAuthenticated) {
        // Update UI based on authentication state
        const authElements = document.querySelectorAll('[data-auth]');
        
        authElements.forEach(element => {
            const authState = element.getAttribute('data-auth');
            
            if (authState === 'authenticated') {
                element.style.display = isAuthenticated ? '' : 'none';
            } else if (authState === 'unauthenticated') {
                element.style.display = isAuthenticated ? 'none' : '';
            }
        });
        
        // Update user info if authenticated
        if (isAuthenticated && this.user) {
            this.updateUserInfo();
        }
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('authStateChange', {
            detail: { isAuthenticated, user: this.user }
        }));
    },
    
    updateUserInfo: function() {
        // Update user-related UI elements
        const userElements = document.querySelectorAll('[data-user]');
        
        userElements.forEach(element => {
            const property = element.getAttribute('data-user');
            
            if (property && this.user[property]) {
                if (element.tagName === 'IMG') {
                    element.src = this.user[property];
                } else {
                    element.textContent = this.user[property];
                }
            }
        });
    },
    
    getToken: function() {
        return localStorage.getItem('authToken');
    }
};

// Initialize auth system
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
});
