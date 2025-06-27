const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1388197670891294931/OW78wRq5df6Vs6YrEkjASR6KEM5vWZV5zrVKQ8mgLoOB4t_yCiwxYDhiPWTedibRLiBk'; // ใส่ webhook ของคุณ

app.post('/notify-discord', async (req, res) => {
  const { roomId, playerId, username, ip } = req.body;
  const time = new Date().toISOString();
  const message = `🟢 มีผู้เล่นใหม่เข้าเกม!\nRoom: ${roomId}\nPlayerID: ${playerId}\nUsername: ${username}\nIP: ${ip}\nเวลา: ${time}`;
  try {
    await axios.post(DISCORD_WEBHOOK_URL, { content: message });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server started on port', PORT));