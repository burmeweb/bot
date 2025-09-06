// server/index.js - Main server file
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./auth');
const optionRoutes = require('./option');
const chatRoutes = require('./chat');
const apiRoutes = require('./api_call');
const generatorRoutes = require('./generator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Routes
app.use('/auth', authRoutes);
app.use('/options', optionRoutes);
app.use('/chat', chatRoutes);
app.use('/api', apiRoutes);
app.use('/generate', generatorRoutes);

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Serve other pages
app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, `../pages/${page}.html`);
    
    // Check if file exists
    if (require('fs').existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).sendFile(path.join(__dirname, '../pages/error.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the application`);
});

module.exports = app;
