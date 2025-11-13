const express = require('express');
const path = require('path');
const open = require('open');

const app = express();
const PORT = process.env.PORT || 8001;

// Serve static files
app.use(express.static(__dirname));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Telegram mini app route
app.get('/sail', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log('🏴‍☠️ Sail of Destiny Server Started!');
    console.log(`🌊 Open your browser and go to: http://localhost:${PORT}`);
    console.log('⚓ Click "Set Sail!" to begin your pirate adventure!');
    console.log('⏹️  Press Ctrl+C to stop the server');
    console.log('');
    console.log('📱 For Telegram Mini App:');
    console.log(`   Set this URL in BotFather: http://localhost:${PORT}/sail`);
    console.log('');

    // Auto-open browser
    open(`http://localhost:${PORT}`);
});