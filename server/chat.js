// server/chat.js - Chat functionality
const express = require('express');
const router = express.Router();
const db = require('./database');

// Store active conversations in memory (in production, use Redis or similar)
const activeConversations = new Map();

// Start a new chat session
router.post('/start', async (req, res) => {
    try {
        const { userId } = req.body;
        const conversationId = generateId();
        
        const newConversation = {
            id: conversationId,
            userId,
            startedAt: new Date(),
            messages: [],
            status: 'active'
        };
        
        activeConversations.set(conversationId, newConversation);
        
        res.json({
            success: true,
            conversationId,
            message: 'Chat session started'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start chat session' });
    }
});

// Send a message
router.post('/:conversationId/message', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { message, userId } = req.body;
        
        const conversation = activeConversations.get(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        
        // Add user message
        const userMessage = {
            id: generateId(),
            type: 'user',
            content: message,
            timestamp: new Date()
        };
        
        conversation.messages.push(userMessage);
        
        // Generate AI response (simplified)
        const aiResponse = await generateAIResponse(message, conversation);
        
        // Add AI message
        const aiMessage = {
            id: generateId(),
            type: 'ai',
            content: aiResponse,
            timestamp: new Date()
        };
        
        conversation.messages.push(aiMessage);
        
        // Save to history
        await db.addHistoryItem({
            userId,
            type: 'chat',
            conversationId,
            message: message,
            response: aiResponse,
            timestamp: new Date().getTime()
        });
        
        res.json({
            success: true,
            messages: [userMessage, aiMessage]
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get conversation history
router.get('/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const conversation = activeConversations.get(conversationId);
        
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        
        res.json({
            success: true,
            conversation
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});

// End conversation
router.delete('/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const conversation = activeConversations.get(conversationId);
        
        if (conversation) {
            conversation.status = 'ended';
            conversation.endedAt = new Date();
            
            // Archive conversation (in a real app, save to database)
            activeConversations.delete(conversationId);
        }
        
        res.json({
            success: true,
            message: 'Conversation ended'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to end conversation' });
    }
});

// Helper functions
function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

async function generateAIResponse(message, conversation) {
    // Simplified AI response generation
    // In a real application, this would call an AI API
    
    const responses = {
        'hello': 'Hello! How can I assist you today?',
        'help': 'I can help you with various tasks. What do you need assistance with?',
        'thank': 'You\'re welcome! Is there anything else I can help with?'
    };
    
    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }
    
    return "I'm not sure how to respond to that. Can you please rephrase or ask something else?";
}

module.exports = router;
