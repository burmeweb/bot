// Button interactions and effects
document.addEventListener('DOMContentLoaded', function() {
    // Ripple effect for buttons
    function createRipple(event) {
        const button = event.currentTarget;
        
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
    
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('.action-btn, .send-btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // Touch feedback for mobile devices
    document.querySelectorAll('.nav-item a, .action-card').forEach(element => {
        element.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });
        
        element.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        });
    });
    
    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            const sideNav = document.getElementById('sideNav');
            sideNav.classList.toggle('nav-open');
            
            if (sideNav.classList.contains('nav-open')) {
                this.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                this.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // Add touch-specific styles
    const style = document.createElement('style');
    style.textContent = `
        .touch-active {
            transform: scale(0.95) !important;
            opacity: 0.8 !important;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple 0.6s linear;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
