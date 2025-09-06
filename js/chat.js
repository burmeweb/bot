// chat.js - Chat functionality for Burme Mark AI
function initChatSystem() {
    console.log('Chat system initialized');
    
    // DOM Elements
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    const clearChatBtn = document.querySelector('[title="ရှင်းလင်းရန်"]');
    
    // API Configuration
    const API_ENDPOINT = 'https://burmemark-worker.mysvm.workers.dev';
    
    // Send message function
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // Add user message to chat
            addMessageToChat(message, 'user');
            
            // Clear input
            messageInput.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            try {
                // Send message to API
                const response = await fetchToAPI(message, 'chat');
                
                // Add AI response to chat
                addMessageToChat(response, 'ai');
            } catch (error) {
                console.error('Error:', error);
                addMessageToChat('တောင်းပန်ပါတယ်၊ အမှားတစ်ခုဖြစ်နေပါတယ်။ နောက်မှထပ်ကြိုးစားပါ။', 'ai');
            } finally {
                // Hide typing indicator
                hideTypingIndicator();
            }
        }
    }
    
    // Fetch to API endpoint
    async function fetchToAPI(message, type = 'chat', options = {}) {
        const requestBody = {
            type: type,
            input: message,
            ...options
        };
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.response || data.text || 'မှားယွင်းမှုတစ်ခုဖြစ်နေပါတယ်';
    }
    
    // Add message to chat
    function addMessageToChat(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        
        // Check if text contains HTML or is plain text
        if (text.includes('<') && text.includes('>')) {
            messageText.innerHTML = text;
        } else {
            messageText.textContent = text;
        }
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = formatTime();
        
        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Save to local storage
        saveChatToLocalStorage();
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
    }
    
    // Clear chat
    function clearChat() {
        if (confirm('စကားပြောခွင်အားလုံးကို ရှင်းလင်းမှာသေချာပါသလား?')) {
            chatMessages.innerHTML = '';
            localStorage.removeItem('burmemark_chat');
            addMessageToChat("မင်္ဂလာပါ! ကျွန်တော့်ကို Burme Mark AI လို့ခေါ်တယ်။ ဘယ်လိုအကူအညီတွေလိုအပ်လဲ?", 'ai');
        }
    }
    
    // Save chat to local storage
    function saveChatToLocalStorage() {
        const messages = [];
        document.querySelectorAll('.message').forEach(msg => {
            const sender = msg.classList.contains('user-message') ? 'user' : 'ai';
            const text = msg.querySelector('.message-text').textContent;
            const time = msg.querySelector('.message-time').textContent;
            
            messages.push({ sender, text, time });
        });
        
        localStorage.setItem('burmemark_chat', JSON.stringify(messages));
    }
    
    // Load chat from local storage
    function loadChatFromLocalStorage() {
        const savedChat = localStorage.getItem('burmemark_chat');
        if (savedChat) {
            const messages = JSON.parse(savedChat);
            messages.forEach(msg => {
                addMessageToChat(msg.text, msg.sender);
            });
        } else {
            // Initialize with welcome message if no saved chat
            addMessageToChat("မင်္ဂလာပါ! ကျွန်တော့်ကို Burme Mark AI လို့ခေါ်တယ်။ ဘယ်လိုအကူအညီတွေလိုအပ်လဲ?", 'ai');
        }
    }
    
    // Quick action handlers
    function setupQuickActions() {
        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', function() {
                const title = this.querySelector('h3').textContent;
                const prompt = this.querySelector('p').textContent;
                
                // Different prompts based on action type
                let message = '';
                
                switch(title) {
                    case 'အကြံဉာဏ်ရယူပါ':
                        message = 'လက်ရှိလုပ်ဆောင်နေတဲ့အရာနဲ့ပတ်သက်ပြီး အကြံဉာဏ်တွေပေးပါ';
                        break;
                    case 'ဘာသာပြန်ဆိုရန်':
                        message = 'အင်္ဂလိပ်စာကြောင်းတွေကို မြန်မာဘာသာပြန်ပေးပါ';
                        break;
                    case 'စာတမ်းရေးသားရန်':
                        message = 'အစီရင်ခံစာတစ်စောင်ရေးသားပေးပါ';
                        break;
                    case 'ကုဒ်ရေးသားရန်':
                        message = 'JavaScript ကုဒ်ဥပမာတစ်ခုရေးပေးပါ';
                        break;
                    default:
                        message = `${title} - ${prompt}`;
                }
                
                // Add prompt to input
                messageInput.value = message;
                messageInput.focus();
            });
        });
    }
    
    // Event listeners
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', clearChat);
    }
    
    // Voice recording functionality (if available)
    setupVoiceRecording();
    
    // Load saved chat
    loadChatFromLocalStorage();
    
    // Setup quick actions
    setupQuickActions();
}

// Voice recording setup
function setupVoiceRecording() {
    const voiceBtn = document.querySelector('[title="အသံဖွင့်ရန်"]');
    const muteBtn = document.querySelector('[title="အသံပိတ်ရန်"]');
    
    if (!voiceBtn || !muteBtn) return;
    
    let isRecording = false;
    let mediaRecorder;
    let audioChunks = [];
    
    voiceBtn.addEventListener('click', async function() {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                
                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };
                
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    
                    // Convert to base64 for API
                    const base64Audio = await blobToBase64(audioBlob);
                    
                    // Send to STT API
                    try {
                        showTypingIndicator();
                        const transcribedText = await fetchToAPI(base64Audio, 'stt');
                        addMessageToChat(transcribedText, 'user');
                        
                        // Get AI response
                        const aiResponse = await fetchToAPI(transcribedText, 'chat');
                        addMessageToChat(aiResponse, 'ai');
                    } catch (error) {
                        console.error('STT Error:', error);
                        addMessageToChat('အသံဖမ်းယူရာတွင် အမှားတစ်ခုဖြစ်နေပါတယ်', 'ai');
                    } finally {
                        hideTypingIndicator();
                    }
                    
                    audioChunks = [];
                };
                
                mediaRecorder.start();
                isRecording = true;
                voiceBtn.classList.add('recording');
                
            } catch (error) {
                console.error('Microphone access error:', error);
                alert('မိုက်ကရိုဖုန်းကို အသုံးပြုခွင့် လိုအပ်ပါတယ်');
            }
        }
    });
    
    muteBtn.addEventListener('click', function() {
        if (isRecording && mediaRecorder) {
            mediaRecorder.stop();
            isRecording = false;
            voiceBtn.classList.remove('recording');
        }
    });
}

// Utility function to convert blob to base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Format time for messages
function formatTime(date = new Date()) {
    return `ယနေ့ ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initChatSystem };
              }
