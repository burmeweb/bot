// chat.js

// ----------------------
// Helper Functions
// ----------------------
async function callAPI(payload, isBlob = false) {
    const res = await fetch("https://burmemark.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });
    return isBlob ? res.blob() : res.json();
}

function appendMessage(sender, text) {
    const chatMessages = document.getElementById("chatMessages");
    const msg = document.createElement("div");
    msg.className = `message ${sender}-message`;
    msg.innerHTML = `
        <div class="message-avatar">
            <img src="../assets/${sender === "ai" ? "ai-avatar.png" : "user-avatar.png"}" alt="${sender}">
        </div>
        <div class="message-content">
            <div class="message-text">${text}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        </div>`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ----------------------
// Chat Section
// ----------------------
document.getElementById("sendMessage").addEventListener("click", async () => {
    const input = document.getElementById("messageInput");
    const userText = input.value.trim();
    if (!userText) return;

    appendMessage("user", userText);
    input.value = "";

    const data = await callAPI({
        type: "chat",
        model: "gpt-5",
        input: userText
    });

    appendMessage("ai", data.output || "မအောင်မြင်ပါ");
});

// ----------------------
// Text Generation Section
// ----------------------
document.getElementById("generateText").addEventListener("click", async () => {
    const prompt = document.getElementById("textPrompt").value;
    const style = document.getElementById("textStyle").value;
    const length = parseInt(document.getElementById("textLength").value, 10);

    const data = await callAPI({
        type: "chat",
        model: "gpt-5",
        input: `${style} style, length ${length}: ${prompt}`
    });

    document.getElementById("textOutput").innerText = data.output || "မအောင်မြင်ပါ";
});

// ----------------------
// Image Generation Section
// ----------------------
document.getElementById("generateImage").addEventListener("click", async () => {
    const prompt = document.getElementById("imagePrompt").value;
    const style = document.getElementById("imageStyle").value;
    const size = document.getElementById("imageSize").value;

    const data = await callAPI({
        type: "image",
        input: `${style} style, ${prompt}`,
        size
    });

    const img = document.createElement("img");
    img.src = `data:image/png;base64,${data.data[0].b64_json}`;
    img.className = "generated-image";
    const output = document.getElementById("imageOutput");
    output.innerHTML = "";
    output.appendChild(img);
});

// ----------------------
// Code Generation Section
// ----------------------
document.getElementById("generateCode").addEventListener("click", async () => {
    const prompt = document.getElementById("codeInput").value;
    const lang = document.getElementById("codeLanguage").value;

    const data = await callAPI({
        type: "chat",
        model: "gpt-5",
        input: `Write ${lang} code for: ${prompt}`
    });

    document.getElementById("codeInput").value = data.output || "";
});

// Copy Code
document.getElementById("copyCode").addEventListener("click", () => {
    const code = document.getElementById("codeInput").value;
    navigator.clipboard.writeText(code);
    alert("Code copied!");
});

// Run Code (preview)
document.getElementById("runCode").addEventListener("click", () => {
    const code = document.getElementById("codeInput").value;
    const frame = document.getElementById("previewFrame");
    frame.srcdoc = code;
});

// ----------------------
// TTS (Text to Speech)
// ----------------------
async function speak(text) {
    const blob = await callAPI({
        type: "tts",
        input: text,
        voice: "alloy"
    }, true);

    const audioUrl = URL.createObjectURL(blob);
    new Audio(audioUrl).play();
}

// Example: speak("Burme Mark AI is awesome!");
// You can hook this to a button if you want.

// ----------------------
// STT (Speech to Text)
// ----------------------
async function sttFromAudio(audioBlob) {
    const base64Audio = await blobToBase64(audioBlob);

    const data = await callAPI({
        type: "stt",
        input: base64Audio,
        language: "en"
    });

    return data.text;
}

function blobToBase64(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(blob);
    });
        }
