const express = require('express');
const app = express();
const PORT = process.env.PORT || 80;

process.env.PLATFORM = 'vps';
require('./whatsAsena/bot'); // ⬅️ ini langsung dijalankan
require('./api');

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

app.use(express.json());

app.post('/send', async (req, res) => {
  try {
    process.env.PLATFORM = 'vps';
    require('./whatsAsena/bot');
    require('./api');
    res.status(200).send('Bot started!');
  } catch (err) {
    console.error('Error starting bot:', err);
    res.status(500).send('Failed to start bot.');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});