// server/option.js - Options/settings management
const express = require('express');
const router = express.Router();
const db = require('./database');

// Get user options
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const options = await db.getSettings(userId);
        res.json(options);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch options' });
    }
});

// Update user options
router.put('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const updates = req.body;
        
        // Get current settings
        const currentSettings = await db.getSettings(userId);
        const newSettings = { ...currentSettings, ...updates, userId };
        
        // Save updated settings
        await db.saveSettings(newSettings);
        
        res.json({ 
            success: true, 
            message: 'Options updated successfully',
            options: newSettings
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update options' });
    }
});

// Reset options to default
router.delete('/:userId/reset', async (req, res) => {
    try {
        const userId = req.params.userId;
        const defaultSettings = {
            userId,
            theme: 'light',
            language: 'en',
            notifications: true,
            fontSize: 'medium',
            autoSave: true
        };
        
        await db.saveSettings(defaultSettings);
        res.json({ 
            success: true, 
            message: 'Options reset to default',
            options: defaultSettings
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset options' });
    }
});

module.exports = router;
