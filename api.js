const express = require('express');
const app = express();
app.use(express.json());

const sock = global.sock; // pakai global supaya bisa akses dari mana saja

app.post('/send', async (req, res) => {
    const { number, message } = req.body;
    const jid = number.includes('@s.whatsapp.net') ? number : number + '@s.whatsapp.net';

    try {
        await sock.sendMessage(jid, { text: message });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.toString() });
    }
});

app.listen(3000, () => console.log('✅ API listening on port 3000'));
