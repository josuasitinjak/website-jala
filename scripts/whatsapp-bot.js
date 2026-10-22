const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Groq = require('groq-sdk');
const path = require('path');
const fs = require('fs');

// Load environment variables from Next.js .env.local file
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
  console.log('✅ Berhasil memuat konfigurasi dari .env.local');
} else {
  console.log('⚠️ File .env.local tidak ditemukan. Pastikan API Key diatur di system environment.');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.join(process.cwd(), '.wwebjs_auth') // Save session locally
  }),
  puppeteer: {
    handleSIGINT: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('loading_screen', (percent, message) => {
  console.log(`⏳ Memuat WhatsApp Web: ${percent}% - ${message || 'Sinkronisasi data'}`);
});

client.on('authenticated', () => {
  console.log('🔑 Terotentikasi! Sesi WhatsApp berhasil dipulihkan.');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Gagal otentikasi sesi WhatsApp:', msg);
});

client.on('disconnected', (reason) => {
  console.warn('⚠️ WhatsApp terputus:', reason);
  console.log('🔄 Mencoba menghubungkan kembali...');
  setTimeout(() => client.initialize(), 5000);
});

// Show QR Code in Terminal
client.on('qr', (qr) => {
  console.log('\n--- SCAN QR CODE DI BAWAH DENGAN WHATSAPP ANDA ---');
  qrcode.generate(qr, { small: true });
  console.log('--------------------------------------------------\n');
});

client.on('ready', () => {
  console.log('🚀 AI Customer Service JALA Siap Melayani!');
});

// Helper to track order directly from localhost Next.js API
async function trackOrder(orderId) {
  const localApiUrl = 'http://localhost:3000/api/orders';
  
  try {
    const res = await fetch(localApiUrl);
    const data = await res.json();
    const orders = data && Array.isArray(data.orders) ? data.orders : [];
    const cleanId = orderId.trim().toUpperCase();
    const found = orders.find(o => o.id && o.id.toUpperCase() === cleanId);
    
    if (found) {
      return `Halo Kak! Pesanan *${found.id}* atas nama *${found.customerName}* saat ini berstatus: *[ ${found.status} ]*.\n\nDetail:\n📍 Tujuan: ${found.address}\n💰 Total: Rp${found.total.toLocaleString('id-ID')}\n💳 Pembayaran: ${found.paymentMethod}\n\nTerima kasih sudah memesan di JALA!`;
    } else {
      return `Maaf Kak, nomor resi pesanan *${cleanId}* tidak ditemukan di database kami. Silakan periksa kembali nomor resi Anda ya!`;
    }
  } catch (err) {
    console.error('Error tracking order from local API:', err);
    return 'Aduh maaf Kak, website utama (localhost:3000) sedang tidak aktif atau tidak dapat dijangkau, sehingga bot belum bisa membaca data pesanan saat ini.';
  }
}

// Helper: safely send a reply, fallback to chat.sendMessage if reply fails (handles @lid safely)
async function safeSend(msg, text) {
  // 1. Coba reply biasa
  try {
    await msg.reply(text);
    console.log('✅ Balasan terkirim via msg.reply()');
    return;
  } catch (replyErr) {
    console.warn('⚠️ reply() gagal, mencoba chat.sendMessage():', replyErr.message);
  }

  // 2. Coba via chat instance langsung (sangat handal untuk WhatsApp format baru @lid)
  try {
    const chat = await msg.getChat();
    await chat.sendMessage(text);
    console.log('✅ Balasan terkirim via chat.sendMessage()');
    return;
  } catch (chatErr) {
    console.warn('⚠️ chat.sendMessage() gagal, mencoba client.sendMessage():', chatErr.message);
  }

  // 3. Fallback terakhir: kirim ke sender ID
  try {
    await client.sendMessage(msg.from, text);
    console.log('✅ Balasan terkirim via client.sendMessage() ke:', msg.from);
  } catch (sendErr) {
    console.error('❌ Seluruh metode pengiriman pesan gagal:', sendErr.message);
  }
}

// Unified message handler
async function handleIncomingMessage(msg) {
  // Prevent reply in group chats
  if (msg.from && msg.from.includes('@g.us')) return;

  // Jika pesan dari akun bot sendiri
  if (msg.fromMe) {
    // Hanya proses jika dikirim ke diri sendiri (chat to self / testing)
    const myId = client.info?.wid?._serialized;
    if (msg.to !== myId) return;
  }

  const text = msg.body?.trim();
  if (!text) return; // ignore empty messages

  console.log(`💬 Pesan dari ${msg.from}: "${text}"`);

  // 1. Check if user is asking to track an order (supports JALA-1001, JALA1001, JALA 1001, CAP-1001)
  const trackingRegex = /(JALA|CAP)[- ]?(\d{4})/i;
  const match = text.match(trackingRegex);
  
  if (match) {
    const normalizedOrderId = `${match[1].toUpperCase()}-${match[2]}`;
    console.log(`🔍 Melacak pesanan: ${normalizedOrderId} untuk ${msg.from}`);
    const trackingResult = await trackOrder(normalizedOrderId);
    await safeSend(msg, trackingResult);
    return;
  }
  
  // 2. Default: AI response for inquiries
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Kamu adalah AI Customer Service resmi dari "JALA" — brand Contemporary Malay Heritage Culinary (projek PKWU siswa SMAN 1 Batam, Kelas X / Hang Lekir 9).
Tagline: "Warisan Melayu Kepri, Sentuhan Modern Praktis"

LINI PRODUK & HARGA RESMI JALA:

1. Menu Satuan:
a. Roti Kirai Berinti — Kari Kentang (Rp12.000 / porsi 4 buah)
   - Isian kentang dadu bumbu kari Melayu meresap, dibungkus jala kunyit lembut. Kering, harum, gurih klasik.
b. Roti Kirai Berinti — Ayam Suwir (Rp12.000 / porsi 4 buah)
   - Suwiran daging ayam berbumbu rempah gurih manis yang dimasak kering, padat, dan mengenyangkan.
c. Roti Kirai Berinti — Keju (Rp12.000 / porsi 4 buah)
   - Keju leleh gurih dan creamy yang lumer di mulut. Camilan modern favorit.
d. Es Telang Lemonade (Rp5.000 / cup)
   - Air rebusan bunga telang biru alami dipadu es & perasan jeruk lemon segar yang berubah warna menjadi keunguan alami. Penyeimbang rasa gurih.

2. Paket Bundling (Lebih Hemat):
a. Paket Hemat (Rp10.000)
   - Isi: 3 buah Roti Kirai Berinti. Pas untuk ganjal lapar praktis.
b. Paket Lengkap (Rp15.000 — Harga normal Rp17.000, hemat Rp2.000)
   - Isi: 1 porsi Roti Kirai (4 buah) + 1 cup Es Telang Lemonade.
c. Paket Berdua (Rp30.000 — Harga normal Rp34.000, hemat Rp4.000)
   - Isi: 2 porsi makanan (8 buah Roti Kirai) + 2 cup Es Telang Lemonade.
d. Paket Puas (Rp42.000 — Harga normal Rp46.000, hemat Rp4.000)
   - Isi: 3 porsi makanan (12 buah Roti Kirai) + 2 cup Es Telang Lemonade. Cocok untuk makan bareng!

STRUKTUR TIM MANAJEMEN (4 ORANG):
1. Josua Sitinjak — Chief Executive Officer (CEO) — Technology, Finance & Strategy
2. Gabriel — Chief Operating & Commercial Officer (COO)
3. Haura — Chief Product & Creative Officer (CPCO)
4. Letty — Chief Marketing & Customer Officer (CMCO)

NADA & GAYA KOMUNIKASI:
- Ramah, antusias, santun, menghargai nilai budaya lokal Melayu Kepri. Selalu panggil pelanggan dengan "Kak" (misal "Halo Kak! 👋"). Gunakan emoji secukupnya.
- Arahkan pemesanan via website resmi: http://localhost:3000
- Jika menanyakan resi, minta mengetikkan kode resi (contoh: JALA-1001).

BATASAN KEAMANAN INFORMASI:
- JANGAN sentuh atau berspekulasi mengenai hal-hal yang belum ditentukan secara resmi (seperti detail perhitungan HPP atau modal internal). Jawab dengan sopan bahwa data tersebut bersifat internal tim manajemen.`
        },
        { role: 'user', content: text }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.6,
      max_tokens: 300,
    });
    
    const aiResponse = chatCompletion.choices[0]?.message?.content || 'Maaf Kak, sistem AI kami sedang tidak merespon. Boleh diulang pertanyaannya?';
    console.log(`🤖 AI Response: "${aiResponse.slice(0, 60)}..."`);
    await safeSend(msg, aiResponse);
  } catch (error) {
    console.error('❌ Groq AI API Error:', error.message);
    await safeSend(msg, 'Duh, mohon maaf Kak, jaringan AI kami sedang kurang stabil. Mohon hubungi admin kami secara manual atau coba lagi nanti ya!');
  }
}

// Dengarkan pesan masuk dari orang lain
client.on('message', handleIncomingMessage);

// Dengarkan pesan dari akun bot sendiri (berguna saat user mengetes dengan mengirim pesan ke diri sendiri)
client.on('message_create', (msg) => {
  if (msg.fromMe) {
    handleIncomingMessage(msg);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down bot...');
  await client.destroy();
  process.exit(0);
});

client.initialize();
