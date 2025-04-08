process.env.PLATFORM = 'vps';
require('./whatsAsena/bot');
require('./api'); 
app.post('/send', async (req, res) => {