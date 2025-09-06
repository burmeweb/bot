// user_profile.js - User profile management functionality
class UserProfile {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
    }

    loadUserData() {
        // Load user data from localStorage or API
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.populateProfileForm();
        }
    }

    populateProfileForm() {
        if (!this.currentUser) return;
        
        document.getElementById('profile-name').value = this.currentUser.name || '';
        document.getElementById('profile-email').value = this.currentUser.email || '';
        document.getElementById('profile-phone').value = this.currentUser.phone || '';
        
        if (this.currentUser.avatar) {
            document.getElementById('profile-avatar').src = this.currentUser.avatar;
        }
    }

    setupEventListeners() {
        // Profile form submission
        document.getElementById('profile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateProfile();
        });

        // Avatar upload
        document.getElementById('avatar-upload').addEventListener('change', (e) => {
            this.uploadAvatar(e.target.files[0]);
        });
    }

    updateProfile() {
        const formData = {
            name: document.getElementById('profile-name').value,
            email: document.getElementById('profile-email').value,
            phone: document.getElementById('profile-phone').value
        };

        // Simulate API call
        console.log('Updating profile:', formData);
        
        // Update local storage
        this.currentUser = {...this.currentUser, ...formData};
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Show success message
        this.showNotification('Profile updated successfully', 'success');
    }

    uploadAvatar(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentUser.avatar = e.target.result;
            document.getElementById('profile-avatar').src = e.target.result;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.showNotification('Avatar updated successfully', 'success');
        };
        reader.readAsDataURL(file);
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UserProfile();
});
