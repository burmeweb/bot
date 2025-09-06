// Main functionality for the Burme Mark AI interface
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    
    // Sample AI responses in Burmese
    const aiResponses = [
        "ဟုတ်ကဲ့၊ ကျွန်တော် ကူညီပေးနိုင်တဲ့ အကြောင်းအရာတွေ ရှိပါတယ်။",
        "ဒီမေးခွန်းအတွက် အဖြေကို ရှာဖွေပေးနေပါတယ်...",
        "ကျေးဇူးပြု၍ နည်းနည်းလေး စောင့်ပေးပါ။",
        "ဒီအကြောင်းအရာနဲ့ ပတ်သက်ပြီး ကျွန်တော့်မှာ အချက်အလက်တွေ ရှိပါတယ်။",
        "ဒီလို မေးခွန်းမျိုးအတွက် ကျွန်တော် ပျော်ရွှင်ပါတယ်။"
    ];
    
    // Send message function
    function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // Add user message to chat
            addMessageToChat(message, 'user');
            
            // Clear input
            messageInput.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Simulate AI response after a delay
            setTimeout(() => {
                hideTypingIndicator();
                const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
                addMessageToChat(randomResponse, 'ai');
            }, 2000);
        }
    }
    
    // Add message to chat
    function addMessageToChat(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = text;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = getCurrentTime();
        
        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Get current time for message timestamp
    function getCurrentTime() {
        const now = new Date();
        return `ယနေ့ ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        typingIndicator.style.display = 'flex';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Quick action cards
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            const prompt = this.querySelector('p').textContent;
            
            // Add prompt to input
            messageInput.value = `${title} - ${prompt}`;
            messageInput.focus();
        });
    });
    
    // Initialize with a welcome message if chat is empty
    if (chatMessages.children.length === 0) {
        addMessageToChat("မင်္ဂလာပါ! ကျွန်တော့်ကို Burme Mark AI လို့ခေါ်တယ်။ ဘယ်လိုအကူအညီတွေလိုအပ်လဲ?", 'ai');
    }
});
