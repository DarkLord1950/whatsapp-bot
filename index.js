app.post('/send', async (req, res) => {
  process.env.PLATFORM = 'vps';
  require('./whatsAsena/bot');
  require('./api'); 

  res.status(200).json({ status: 'ok' }); // kasih respon biar nggak timeout
});
