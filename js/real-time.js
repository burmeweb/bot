// Real-time chat with Pusher integration
const realTimeChat = {
    init: function() {
        this.setupPusher();
        this.bindEvents();
    },
    
    setupPusher: function() {
        // Pusher configuration
        this.pusher = new Pusher('', {
        app_id = "2046604" 
        key = "acb4c45202e622c0a0db"
        secret = "a30b0eb577d698f73456"
        cluster = "ap1"
        });
        
        this.channel = this.pusher.subscribe('burmemarkai-chat');
    },
    
    bindEvents: function() {
        // Listen for new messages
        this.channel.bind('new-message', function(data) {
            this.displayMessage(data.message, data.sender);
        }.bind(this));
        
        // Listen for typing indicators
        this.channel.bind('user-typing', function(data) {
            this.showTypingIndicator(data.userId);
        }.bind(this));
        
        // Listen for message updates
        this.channel.bind('message-updated', function(data) {
            this.updateMessage(data.messageId, data.content);
        }.bind(this));
    },
    
    sendMessage: function(message) {
        // Send message to server
        fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: message,
                channel: 'main'
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Message sent successfully:', data);
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
    },
    
    displayMessage: function(message, sender) {
        // Display message in chat
        const messageElement = this.createMessageElement(message, sender);
        document.getElementById('chatMessages').appendChild(messageElement);
        
        // Scroll to bottom
        this.scrollToBottom();
    },
    
    createMessageElement: function(message, sender) {
        // Create message DOM element
        const div = document.createElement('div');
        div.className = `message ${sender}-message`;
        
        div.innerHTML = `
            <div class="message-content">
                <div class="message-text">${this.escapeHtml(message)}</div>
                <div class="message-time">${this.getCurrentTime()}</div>
            </div>
        `;
        
        return div;
    },
    
    showTypingIndicator: function(userId) {
        // Show typing indicator for specific user
        const indicator = document.getElementById('typingIndicator');
        indicator.style.display = 'flex';
        indicator.querySelector('span').textContent = `${userId} is typing...`;
        
        // Hide after 3 seconds
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            indicator.style.display = 'none';
        }, 3000);
    },
    
    updateMessage: function(messageId, content) {
        // Update existing message
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.querySelector('.message-text').textContent = content;
        }
    },
    
    scrollToBottom: function() {
        const container = document.getElementById('chatMessages');
        container.scrollTop = container.scrollHeight;
    },
    
    escapeHtml: function(text) {
        // Escape HTML to prevent XSS
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    getCurrentTime: function() {
        const now = new Date();
        return `ယနေ့ ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    realTimeChat.init();
});
