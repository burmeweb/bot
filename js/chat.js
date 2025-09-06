// chat.js - Burme Mark AI Chat Functionality with Cloudflare Worker Integration

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const chatSidebar = document.getElementById('chatSidebar');
    const messageInput = document.getElementById('messageInput');
    const sendMessage = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');
    const newChatBtn = document.getElementById('newChatBtn');
    const navButtons = document.querySelectorAll('.nav-btn');
    const chatTab = document.getElementById('chatTab');
    const textTab = document.getElementById('textTab');
    const imageTab = document.getElementById('imageTab');
    const coderTab = document.getElementById('coderTab');
    
    // Voice recognition elements
    const voiceModal = document.getElementById('voiceModal');
    const recordBtn = document.getElementById('recordBtn');
    const voiceBtn = document.querySelector('.voice-btn');
    
    // Text generation elements
    const generateText = document.getElementById('generateText');
    const textPrompt = document.getElementById('textPrompt');
    const textOutput = document.getElementById('textOutput');
    
    // Image generation elements
    const generateImage = document.getElementById('generateImage');
    const imagePrompt = document.getElementById('imagePrompt');
    const imageOutput = document.getElementById('imageOutput');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageUpload = document.getElementById('imageUpload');
    
    // Code generation elements
    const generateCode = document.getElementById('generateCode');
    const codeInput = document.getElementById('codeInput');
    const runCode = document.getElementById('runCode');
    const copyCode = document.getElementById('copyCode');
    const refreshPreview = document.getElementById('refreshPreview');
    const previewFrame = document.getElementById('previewFrame');
    
    // Variables
    let isRecording = false;
    let recognition = null;
    let currentChat = [];
    let audioContext = null;
    
    // Cloudflare Worker endpoint
    const CLOUDFLARE_WORKER_URL = 'https://burmemark.workers.dev';
    
    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.lang = 'my-MM'; // Burmese language
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript;
            closeModal('voiceModal');
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            closeModal('voiceModal');
        };
        
        recognition.onend = function() {
            isRecording = false;
            updateRecordingUI();
        };
    } else {
        // Browser doesn't support speech recognition
        voiceBtn.style.display = 'none';
    }
    
    // Event Listeners
    menuToggle.addEventListener('click', toggleSidebar);
    closeSidebar.addEventListener('click', toggleSidebar);
    newChatBtn.addEventListener('click', startNewChat);
    sendMessage.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
    
    // Navigation tabs
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            switchTab(type);
        });
    });
    
    // Voice recognition
    voiceBtn.addEventListener('click', openVoiceModal);
    recordBtn.addEventListener('click', toggleRecording);
    
    // Text generation
    generateText.addEventListener('click', generateTextContent);
    
    // Image generation
    generateImage.addEventListener('click', generateImageContent);
    imageUploadArea.addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', handleImageUpload);
    
    // Code generation
    generateCode.addEventListener('click', generateCodeContent);
    runCode.addEventListener('click', runCodePreview);
    copyCode.addEventListener('click', copyCodeToClipboard);
    refreshPreview.addEventListener('click', refreshCodePreview);
    
    // Functions
    function toggleSidebar() {
        chatSidebar.classList.toggle('active');
    }
    
    function switchTab(type) {
        // Remove active class from all tabs and interfaces
        navButtons.forEach(btn => btn.classList.remove('active'));
        chatTab.classList.remove('active');
        textTab.classList.remove('active');
        imageTab.classList.remove('active');
        coderTab.classList.remove('active');
        
        // Add active class to selected tab and interface
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
        document.getElementById(`${type}Tab`).classList.add('active');
    }
    
    async function handleSendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            addMessageToChat(message, 'user');
            messageInput.value = '';
            
            // Show loading indicator
            const loadingElement = document.createElement('div');
            loadingElement.classList.add('message', 'ai-message', 'loading');
            loadingElement.innerHTML = `
                <div class="message-avatar">
                    <img src="../assets/ai-avatar.png" alt="AI avatar">
                </div>
                <div class="message-content">
                    <div class="message-text">စဉ်းစားနေပါတယ်...</div>
                </div>
            `;
            chatMessages.appendChild(loadingElement);
            scrollToBottom();
            
            try {
                // Call Cloudflare Worker for AI response
                const response = await fetch(CLOUDFLARE_WORKER_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        type: "chat", 
                        model: "gpt-4", 
                        input: message,
                        language: "my" // Burmese language
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Remove loading indicator
                chatMessages.removeChild(loadingElement);
                
                // Add AI response to chat
                addMessageToChat(data.response || data.message, 'ai');
                scrollToBottom();
                
            } catch (error) {
                console.error('Error fetching AI response:', error);
                
                // Remove loading indicator
                chatMessages.removeChild(loadingElement);
                
                // Fallback to simulated response if API fails
                const aiResponse = generateAIResponse(message);
                addMessageToChat(aiResponse, 'ai');
                scrollToBottom();
            }
        }
    }
    
    function addMessageToChat(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('my-MM', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageElement.innerHTML = `
            <div class="message-avatar">
                <img src="../assets/${sender === 'ai' ? 'ai-avatar.png' : 'user-avatar.png'}" alt="${sender} avatar">
            </div>
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">${timeString}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
        scrollToBottom();
        
        // Save to current chat
        currentChat.push({
            sender,
            message,
            time: now
        });
    }
    
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function generateAIResponse(userMessage) {
        // Fallback responses if API fails
        const responses = [
            "ဒီမေးခွန်းအတွက် ကျေးဇူးတင်ပါတယ်။ ကျွန်တော် ကူညီပေးနိုင်ဖို့ ကြိုးစားပါမယ်။",
            "ဟုတ်ကဲ့၊ ဒီအကြောင်းအရာကို ကျွန်တော် ရှင်းပြပေးပါမယ်။",
            "ဒီမေးခွန်းက စိတ်ဝင်စားဖို့ကောင်းပါတယ်။ ကျွန်တော် ရှာဖွေကြည့်ပါမယ်။",
            "ကျေးဇူးပြု၍ နည်းနည်းလေးစောင့်ပေးပါ၊ ကျွန်တော် စဉ်းစားကြည့်ပါမယ်။",
            "ဒီအကြောင်းအရာနဲ့ ပတ်သက်ပြီး ကျွန်တော် သိသလောက် ပြောပြပေးပါမယ်။"
        ];
        
        // Check for specific keywords
        if (userMessage.includes('နာမည်') || userMessage.includes('အမည်')) {
            return "ကျွန်တော့်နာမည်က Burme Mark AI ပါ။ AI အကူအညီပေးစနစ် တစ်ခုဖြစ်ပါတယ်။";
        } else if (userMessage.includes('အချိန်') || userMessage.includes('နာရီ')) {
            return `လက်ရှိအချိန်က ${new Date().toLocaleTimeString('my-MM')} ဖြစ်ပါတယ်။`;
        } else if (userMessage.includes('ဘယ်သူ')) {
            return "ကျွန်တော်က AI အကူအညီပေးစနစ် တစ်ခုဖြစ်ပြီး၊ သင့်ရဲ့မေးခွန်းတွေကို ဖြေဆိုဖို့နဲ့ အကူအညီပေးဖို့ ဒီဇိုင်းဆွဲထားတာပါ။";
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    function startNewChat() {
        if (currentChat.length > 0) {
            const confirm = window.confirm('စကားပြောခန်းအသစ်စဖွင့်မည်။ သေချာပါသလား?');
            if (confirm) {
                chatMessages.innerHTML = '';
                currentChat = [];
                
                // Add welcome message
                addMessageToChat("မင်္ဂလာပါ! ကျွန်တော့်ကို Burme Mark AI လို့ခေါ်တယ်။ ဘယ်လိုအကူအညီတွေလိုအပ်လဲ?", 'ai');
            }
        }
    }
    
    function openVoiceModal() {
        if (!recognition) {
            alert('သင့်ဘရောက်ဇာက အသံအသိအမှတ်ပြုမှုကို မပံ့ပိုးပါ။');
            return;
        }
        voiceModal.style.display = 'block';
    }
    
    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        if (isRecording) {
            recognition.stop();
            isRecording = false;
            updateRecordingUI();
        }
    }
    
    function toggleRecording() {
        if (isRecording) {
            recognition.stop();
            isRecording = false;
        } else {
            recognition.start();
            isRecording = true;
        }
        updateRecordingUI();
    }
    
    function updateRecordingUI() {
        const status = document.querySelector('.recording-status');
        if (isRecording) {
            recordBtn.innerHTML = '<i class="fas fa-stop"></i><span>ရပ်ရန်</span>';
            recordBtn.classList.add('recording');
            status.textContent = 'မှတ်တမ်းတင်နေပါသည်...';
        } else {
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i><span>စဖမ်းရန်</span>';
            recordBtn.classList.remove('recording');
            status.textContent = 'မှတ်တမ်းတင်ခြင်း မစတင်ရသေးပါ';
        }
    }
    
    async function generateTextContent() {
        const prompt = textPrompt.value.trim();
        const style = document.getElementById('textStyle').value;
        const length = document.getElementById('textLength').value;
        
        if (!prompt) {
            alert('စာသားဖန်တီးရန် prompt ထည့်သွင်းပေးပါ။');
            return;
        }
        
        // Show loading
        textOutput.innerHTML = '<div class="loading">စာသားများ ထုတ်လုပ်နေပါသည်...</div>';
        
        try {
            // Call Cloudflare Worker for text generation
            const response = await fetch(CLOUDFLARE_WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    type: "chat", 
                    model: "gpt-4", 
                    input: `${prompt}. Please generate ${style} style text in Burmese with about ${length} characters.`,
                    language: "my"
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            textOutput.innerHTML = `<div class="generated-text">${data.response || data.message}</div>`;
            
        } catch (error) {
            console.error('Error generating text:', error);
            // Fallback to simulated text generation
            const generatedText = simulateTextGeneration(prompt, style, length);
            textOutput.innerHTML = `<div class="generated-text">${generatedText}</div>`;
        }
    }
    
    function simulateTextGeneration(prompt, style, length) {
        // Fallback text generation if API fails
        const texts = {
            general: `"${prompt}" အကြောင်းကို သာမန်စာသားဖြင့် ရေးသားထားပါသည်။ ဤသည်မှာ အချို့သော နမူနာစာသားများဖြစ်ပြီး အမှန်တကယ် AI မှ ထုတ်လုပ်ပေးသော စာသားများနှင့် ကွဲပြားနိုင်ပါသည်။`,
            formal: `"${prompt}" နှင့်ပတ်သက်၍ တရားဝင်စာသားဖြင့် ရေးသားထားခြင်း ဖြစ်ပါသည်။ ဤစာသားသည် အချက်အလက်များနှင့် ပြည့်စုံစွာ ဖော်ပြထားပြီး တရားဝင်စာရွက်စာတမ်းများတွင် အသုံးပြုနိုင်သော ပုံစံဖြင့် ရေးသားထားပါသည်။`,
            casual: `ဟေ့... "${prompt}" အကြောင်း ပြောကြရအောင်လား။ ဒါက တကယ်ကို စိတ်ဝင်စားစရာကောင်းတဲ့ အကြောင်းအရာတစ်ခုပဲ။ ငါသိသလောက်ကတော့ ဒီလိုမျိုးပေါ့...`,
            poem: `ကဗျာလေးတစ်ပုဒ် ရေးကြည့်မယ်\n"${prompt}" အကြောင်းလေးပေါ့\n\nညနေခင်းလေတွေ လှုပ်ခတ်ရင်\nသူ့အကြောင်းတွေး မျှော်လင့်မိတယ်\nဘဝခရီးရဲ့ လမ်းအဆုံး\nသူနဲ့အတူ ရောက်ချင်မိတယ်...`,
            story: `တစ်ခါတုန်းက "${prompt}" ဆိုတဲ့ ဇာတ်လမ်းလေးတစ်ခု ရှိခဲ့တယ်။ အဲဒီဇာတ်လမ်းက စတင်ခဲ့တာက...`
        };
        
        return texts[style] || texts.general;
    }
    
    async function generateImageContent() {
        const prompt = imagePrompt.value.trim();
        const style = document.getElementById('imageStyle').value;
        const size = document.getElementById('imageSize').value;
        
        if (!prompt) {
            alert('ပုံဖန်တီးရန် prompt ထည့်သွင်းပေးပါ။');
            return;
        }
        
        // Show loading
        imageOutput.innerHTML = '<div class="loading">ပုံများ ထုတ်လုပ်နေပါသည်...</div>';
        
        try {
            // Call Cloudflare Worker for image generation
            const response = await fetch(CLOUDFLARE_WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    type: "image", 
                    input: `${prompt} in ${style} style` 
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.data && data.data[0] && data.data[0].b64_json) {
                // Display the generated image
                imageOutput.innerHTML = `
                    <div class="image-result">
                        <img src="data:image/png;base64,${data.data[0].b64_json}" alt="Generated image" class="generated-image">
                    </div>
                `;
            } else {
                throw new Error('Invalid image data received');
            }
            
        } catch (error) {
            console.error('Error generating image:', error);
            // Fallback message
            imageOutput.innerHTML = `
                <div class="image-result">
                    <p>"${prompt}" အတွက် ပုံများ ထုတ်လုပ်ပြီးပါပြီ။</p>
                    <p>တကယ့် application တွင် AI-generated images များ ပြသမည်ဖြစ်ပါသည်။</p>
                    <div class="placeholder-image">
                        <i class="fas fa-image"></i>
                        <p>AI Generated Image Preview</p>
                    </div>
                </div>
            `;
        }
    }
    
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imageUploadArea.innerHTML = `
                    <img src="${e.target.result}" alt="Uploaded image" class="uploaded-image">
                    <p>ပုံအားအပ်လိုက်ပါပြီ။ ပုံပြင်ဆင်ခြင်းအတွက် ရွေးချယ်စရာများ ထည့်သွင်းနိုင်ပါသည်။</p>
                `;
            };
            reader.readAsDataURL(file);
        }
    }
    
    async function generateCodeContent() {
        const prompt = codeInput.value.trim();
        const language = document.getElementById('codeLanguage').value;
        
        if (!prompt) {
            alert('ကုဒ်ရေးသားရန် prompt ထည့်သွင်းပေးပါ။');
            return;
        }
        
        try {
            // Call Cloudflare Worker for code generation
            const response = await fetch(CLOUDFLARE_WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    type: "chat", 
                    model: "gpt-4", 
                    input: `Write ${language} code for: ${prompt}. Provide only the code without explanations.`,
                    language: "en" // Use English for code generation
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            codeInput.value = data.response || data.message;
            
        } catch (error) {
            console.error('Error generating code:', error);
            // Fallback to simulated code generation
            const code = simulateCodeGeneration(prompt, language);
            codeInput.value = code;
        }
    }
    
    function simulateCodeGeneration(prompt, language) {
        // Fallback code generation if API fails
        const codeSnippets = {
            javascript: `// ${prompt} - JavaScript Code\nfunction example() {\n  console.log("Hello, ${prompt}");\n  return true;\n}`,
            python: `# ${prompt} - Python Code\ndef example():\n    print("Hello, ${prompt}")\n    return True`,
            html: `<!-- ${prompt} - HTML Code -->\n<div class="container">\n  <h1>${prompt}</h1>\n  <p>This is an example HTML code.</p>\n</div>`,
            java: `// ${prompt} - Java Code\npublic class Example {\n  public static void main(String[] args) {\n    System.out.println("Hello, ${prompt}");\n  }\n}`,
            php: `<?php\n// ${prompt} - PHP Code\nfunction example() {\n  echo "Hello, ${prompt}";\n  return true;\n}\n?>`,
            csharp: `// ${prompt} - C# Code\npublic class Example {\n  public static void Main() {\n    Console.WriteLine("Hello, ${prompt}");\n  }\n}`
        };
        
        return codeSnippets[language] || codeSnippets.javascript;
    }
    
    function runCodePreview() {
        const code = codeInput.value;
        const isHTML = document.getElementById('codeLanguage').value === 'html';
        
        if (!code) {
            alert('စမ်းသပ်ရန် ကုဒ်ထည့်သွင်းပေးပါ။');
            return;
        }
        
        if (isHTML) {
            // For HTML, directly render in iframe
            const previewDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
            previewDoc.open();
            previewDoc.write(code);
            previewDoc.close();
        } else {
            // For other languages, show a message
            previewFrame.contentDocument.body.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h3>ကုဒ်စမ်းသပ်ခြင်း</h3>
                    <p>ဤ programming language အတွက် စမ်းသပ်မှုကို ပံ့ပိုးမထားပါ။</p>
                    <p>HTML/CSS code များကိုသာ တိုက်ရိုက်ကြည့်ရှုနိုင်ပါသည်။</p>
                </div>
            `;
        }
    }
    
    function copyCodeToClipboard() {
        const code = codeInput.value;
        if (!code) {
            alert('ကုဒ်ကူးယူရန် ကုဒ်မရှိပါ။');
            return;
        }
        
        navigator.clipboard.writeText(code)
            .then(() => {
                // Show copied feedback
                const originalHtml = copyCode.innerHTML;
                copyCode.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyCode.innerHTML = originalHtml;
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                alert('ကုဒ်ကူးယူရာတွင် အမှားတစ်ခုဖြစ်နေပါသည်။');
            });
    }
    
    function refreshCodePreview() {
        runCodePreview();
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
    
    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target === voiceModal) {
            closeModal('voiceModal');
        }
    };
    
    // Initialize
    scrollToBottom();
});
