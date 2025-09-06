// Simulate loading process
document.addEventListener('DOMContentLoaded', function() {
    const loader = document.querySelector('.loader');
    const progress = document.querySelector('.progress');
    
    // Simulate loading progress
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            // Hide loader with a slight delay after reaching 100%
            setTimeout(() => {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
            }, 500);
        } else {
            width += Math.random() * 15;
            if (width > 100) width = 100;
            progress.style.width = width + '%';
        }
    }, 300);
});
