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

// Helper to format AI responses perfectly for WhatsApp (no broken tables, correct single-asterisk bold, clean emojis)
function formatForWhatsApp(text) {
  if (!text) return '';
  let formatted = text;

  // 1. Convert Markdown tables (| ... |) into beautiful WhatsApp list cards
  if (formatted.includes('|')) {
    const lines = formatted.split('\n');
    let inTable = false;
    let headers = [];
    let convertedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        // Table separator row like |---|---|
        if (line.match(/^\|[\s\-:|]+\|$/)) {
          inTable = true;
          continue;
        }
        const cols = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
        if (!inTable) {
          headers = cols;
          inTable = true;
          if (headers.length > 0) {
            convertedLines.push(`📋 *${headers.join(' • ')}*`);
          }
        } else {
          if (cols.length > 0) {
            if (cols.length >= 2) {
              convertedLines.push(`▫️ *${cols[0]}* : ${cols.slice(1).join(' — ')}`);
            } else {
              convertedLines.push(`▫️ ${cols[0]}`);
            }
          }
        }
      } else {
        inTable = false;
        headers = [];
        convertedLines.push(lines[i]);
      }
    }
    formatted = convertedLines.join('\n');
  }

  // 2. Convert markdown headers: ### Heading -> 📌 *Heading*
  formatted = formatted.replace(/^#{1,4}\s+(.+)$/gm, '📌 *$1*');

  // 3. Convert **bold** (double asterisk) to *bold* (single asterisk for WhatsApp bold)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '*$1*');

  // 4. Convert markdown links [Label](URL) -> Label (URL)
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');

  // 5. Convert horizontal rules like --- or ___ to clean line break
  formatted = formatted.replace(/^[\-_*]{3,}$/gm, '──────────────');

  // 6. Clean up triple or more empty lines into double lines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  return formatted.trim();
}

const API_BASE_URL = process.env.LIVE_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Helper to track order directly from local/live Next.js API
async function trackOrder(orderId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`);
    const data = await res.json();
    const orders = data && Array.isArray(data.orders) ? data.orders : [];
    const cleanId = orderId.trim().toUpperCase();
    const found = orders.find(o => o.id && o.id.toUpperCase() === cleanId);
    
    if (found) {
      return `✨ *STATUS PESANAN JALA* ✨\n\nHalo Kak! Pesanan *${found.id}* atas nama *${found.customerName}* saat ini:\n\n📌 *Status:* *[ ${found.status.toUpperCase()} ]*\n📍 *Tujuan Antar:* ${found.address}\n💰 *Total Belanja:* *Rp${found.total.toLocaleString('id-ID')}*\n💳 *Pembayaran:* *${found.paymentMethod}* (${found.paymentStatus || 'Tercatat'})\n🛵 *Sumber Pesanan:* ${found.orderSource === 'WhatsApp' ? 'WhatsApp Langsung' : 'Website JALA'}\n\nTerima kasih sudah memesan di JALA! Pesanan Kakak segera kami proses dengan sepenuh hati. 🛵💨`;
    } else {
      return `Maaf Kak, nomor resi pesanan *${cleanId}* belum ditemukan di sistem kami.\n\nSilakan pastikan kembali kode resi Kakak (contoh: *JALA-1001*) atau hubungi tim pengurus bila ada kendala ya! 😊`;
    }
  } catch (err) {
    console.error('Error tracking order from API:', err);
    return 'Aduh maaf Kak, website utama JALA sedang tidak aktif atau tidak dapat dijangkau, sehingga bot belum bisa membaca data pesanan saat ini.';
  }
}

// Helper to create order directly into Next.js database from WhatsApp
async function createOrderFromWhatsApp(orderData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const data = await res.json();
    return data.success ? data.order : null;
  } catch (err) {
    console.error('Error creating order via API:', err);
    return null;
  }
}

// Helper: safely send a reply, fallback to chat.sendMessage if reply fails (handles @lid safely)
async function safeSend(msg, text) {
  const formattedText = formatForWhatsApp(text);

  // 1. Coba reply biasa
  try {
    await msg.reply(formattedText);
    console.log('✅ Balasan terkirim via msg.reply()');
    return;
  } catch (replyErr) {
    console.warn('⚠️ reply() gagal, mencoba chat.sendMessage():', replyErr.message);
  }

  // 2. Coba via chat instance langsung (sangat handal untuk WhatsApp format baru @lid)
  try {
    const chat = await msg.getChat();
    await chat.sendMessage(formattedText);
    console.log('✅ Balasan terkirim via chat.sendMessage()');
    return;
  } catch (chatErr) {
    console.warn('⚠️ chat.sendMessage() gagal, mencoba client.sendMessage():', chatErr.message);
  }

  // 3. Fallback terakhir: kirim ke sender ID
  try {
    await client.sendMessage(msg.from, formattedText);
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

  // 2. Format Pemesanan Cepat
  const formatRegex = /^(FORMAT|CARA PESAN|FORMAT PESAN|FORMAT ORDER|CARA ORDER)/i;
  if (formatRegex.test(text)) {
    const formatGuide = `📋 *FORMAT CEPAT PEMESANAN VIA WHATSAPP JALA* 📋\n\nKakak bisa salin & lengkapi format di bawah ini ya:\n\n*PESAN JALA*\n👤 *Nama:* [Nama Lengkap Kakak]\n📍 *Lokasi/Kelas:* [Contoh: Ruang Guru / Kelas X MIPA 1]\n🍛 *Pesanan:* [Contoh: 2 Paket Lengkap, 1 Roti Keju]\n💳 *Metode Bayar:* [COD / QRIS]\n\n_Kirimkan ke chat ini, dan pesanan Kakak akan langsung otomatis masuk ke sistem dapur & Admin Dashboard JALA! ✨_`;
    await safeSend(msg, formatGuide);
    return;
  }
  
  // 3. Deteksi Niat Pemesanan (Pintu WhatsApp Langsung)
  const orderKeywords = /(pesan|order|beli|mau beli|mau pesan|pesan jala)/i;
  const isPotentialOrder = orderKeywords.test(text);

  if (isPotentialOrder) {
    try {
      console.log(`🛒 Memproses analisis pesanan otomatis via WhatsApp...`);
      const parseCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Kamu adalah asisten kasir pintar JALA. Tugasmu menganalisis apakah pesan pelanggan berisi niat memesan makanan JALA dan mengekstrak rinciannya.
Katalog Resmi & Harga:
- Roti Kirai Berinti — Kari Kentang (Rp12000)
- Roti Kirai Berinti — Ayam Suwir (Rp12000)
- Roti Kirai Berinti — Keju (Rp12000)
- Es Telang Lemonade (Rp5000)
- Paket Hemat (Rp10000)
- Paket Lengkap (Rp15000)
- Paket Berdua (Rp30000)
- Paket Puas (Rp42000)

Aturan:
1. Jika pelanggan menyebutkan item pesanan dan nama/alamat (lokasi antar), buat "isOrder": true.
2. Hitung total harga dengan tepat.
3. Jika info belum lengkap (misal: belum ada nama, alamat kelas/ruang pengantaran, atau item spesifik), set "isComplete": false dan berikan "replyMessage" yang menanyakan kelengkapannya dengan ramah.
4. Output HANYA JSON Object valid tanpa markdown:
{
  "isOrder": boolean,
  "isComplete": boolean,
  "customerName": string atau null,
  "address": string atau null,
  "paymentMethod": "COD" atau "QRIS",
  "items": [{"name": string resmi, "quantity": number, "price": number}],
  "total": number,
  "replyMessage": string ramah khas Melayu
}`
          },
          { role: 'user', content: text }
        ],
        model: 'openai/gpt-oss-20b',
        response_format: { type: 'json_object' }
      });

      const parsed = JSON.parse(parseCompletion.choices[0]?.message?.content || '{}');

      if (parsed.isOrder && parsed.isComplete && parsed.items && parsed.items.length > 0) {
        // Pemesanan Lengkap -> Kirim langsung ke API Backend
        const orderPayload = {
          customerName: parsed.customerName || 'Pelanggan WhatsApp',
          address: parsed.address || 'SMAN 1 Batam',
          items: parsed.items,
          total: parsed.total || parsed.items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
          paymentMethod: parsed.paymentMethod || 'COD',
          paymentStatus: parsed.paymentMethod === 'QRIS' ? 'Menunggu QRIS' : 'Bayar di Tempat (COD)',
          orderSource: 'WhatsApp'
        };

        const createdOrder = await createOrderFromWhatsApp(orderPayload);

        if (createdOrder) {
          const itemLines = createdOrder.items.map(i => `▫️ *${i.quantity}x ${i.name}* — Rp${(i.quantity * i.price).toLocaleString('id-ID')}`).join('\n');

          let receipt = `🎉 *PESANAN JALA RESMI BERHASIL DIBUAT!* 🎉\n\nHalo Kak *${createdOrder.customerName}*! Pesanan Kakak telah resmi tercatat di sistem dapur JALA:\n\n🔖 *Nomor Resi / ID Pesanan:*\n👉 *${createdOrder.id}*\n\n📋 *Rincian Menu:*\n${itemLines}\n────────────────────────\n💰 *Total Tagihan:* *Rp${createdOrder.total.toLocaleString('id-ID')}*\n💳 *Metode Pembayaran:* *${createdOrder.paymentMethod}*\n📍 *Lokasi Pengantaran:* ${createdOrder.address}\n\n🛵 *Status:* Pesanan Diterima Dapur\n\nKakak bisa cek status pesanan kapan saja langsung di WhatsApp ini dengan mengetik:\n👉 *LACAK ${createdOrder.id}*\n\n_(Data pesanan ini sudah otomatis tersinkronisasi 2 arah ke Admin Dashboard & Website JALA)_ ✨`;

          if (createdOrder.paymentMethod === 'QRIS') {
            receipt += `\n\n📱 *Pembayaran QRIS:*\nSilakan transfer sesuai nominal *Rp${createdOrder.total.toLocaleString('id-ID')}* ke QRIS resmi JALA di website atau hubungi kasir kami ya Kak!`;
          }

          await safeSend(msg, receipt);
          return;
        }
      } else if (parsed.isOrder && !parsed.isComplete) {
        // Pesanan terdeteksi tapi belum lengkap -> minta info yang kurang
        await safeSend(msg, parsed.replyMessage || "Wah siap Kak! Mau tolong dilengkapi Nama Pemesan, Lokasi Pengantaran (Kelas/Ruangan), dan Metode Bayar (COD/QRIS) agar langsung kami proses ya! 😊");
        return;
      }
    } catch (parseErr) {
      console.warn('Order parser fallback to regular chat:', parseErr.message);
    }
  }
  
  // 4. Default: AI Customer Service response with rich WhatsApp formatting
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Kamu adalah AI Customer Service resmi dari "JALA" — brand Contemporary Malay Heritage Culinary (projek PKWU siswa SMAN 1 Batam, Kelas X Hang Lekir 9).
Tagline: "Warisan Melayu Kepri, Sentuhan Modern Praktis"

SISTEM PEMESANAN DUA PINTU:
1. Pelanggan bisa memesan lewat WEBSITE (http://localhost:3000) ATAU langsung lewat CHAT WHATSAPP ini!
2. Jika pelanggan ingin memesan lewat WhatsApp, mereka cukup sebutkan:
   - Nama
   - Lokasi / Kelas di SMAN 1 Batam
   - Menu yang dipesan
   - Metode Bayar (COD atau QRIS)
   Atau ketik *FORMAT* untuk template praktis!

ATURAN FORMAT TAMPILAN WHATSAPP (SANGAT KRUSIAL):
1. JANGAN PERNAH membuat tabel Markdown (| kolom 1 | kolom 2 |) atau garis horizontal (---)! Di WhatsApp HP tabel TIDAK BISA dibaca dan tampak hancur dengan garis-garis pipa (|).
2. Gunakan HANYA format teks WhatsApp native yang bersih, rapi, dan mudah dibaca:
   - Gunakan SATU bintang (*tebal*) untuk bold judul & poin penting. JANGAN gunakan dua bintang (**).
   - Gunakan bullet point emoji yang estetik dan ramah (🍛, 🥤, 📦, 💰, ✨, 📍, 👉, 🛵).
   - Berikan spasi satu baris kosong antar menu agar tampilan chat lega dan tidak menumpuk padat.
3. SELALU buat jawaban INTERAKTIF & MENARIK:
   - Sambut dengan hangat, sopan, dan santun khas Melayu (panggil pelanggan "Kak" atau "Kakak").
   - Akhiri jawaban dengan pertanyaan interaktif atau opsi tindakan, contoh:
     "Kira-kira Kakak mau coba rasa gurih kari atau yang creamy keju nih? 😊
     Bisa langsung pesan di chat ini atau lewat website kami di http://localhost:3000 ya!"
   - Jika pelanggan baru menyapa ("halo", "hai", "p"), tawarkan menu panduan cepat:
     1️⃣ Ketik *MENU* untuk daftar menu & paket hemat
     2️⃣ Ketik *PESAN* untuk panduan pesan via WhatsApp
     3️⃣ Ketik *PROMO* untuk voucher diskon aktif
     4️⃣ Ketik *LACAK (No Resi)* untuk cek status pesanan

LINI PRODUK & HARGA RESMI JALA:

1. Menu Satuan (Roti Kirai Berinti):
🍛 *Roti Kirai Berinti — Kari Kentang*
💰 *Harga:* Rp12.000 / porsi (isi 4 buah)
✨ *Cita Rasa:* Kentang dadu bumbu rempah kari Melayu harum & gurih klasik dalam gulungan jala kunyit lembut.

🍛 *Roti Kirai Berinti — Ayam Suwir*
💰 *Harga:* Rp12.000 / porsi (isi 4 buah)
✨ *Cita Rasa:* Daging ayam suwir bumbu gurih manis meresap, padat, dan mengenyangkan.

🍛 *Roti Kirai Berinti — Keju*
💰 *Harga:* Rp12.000 / porsi (isi 4 buah)
✨ *Cita Rasa:* Keju leleh gurih dan creamy lumer di mulut. Favorit kekinian!

2. Minuman Segar:
🥤 *Es Telang Lemonade*
💰 *Harga:* Rp5.000 / cup
✨ *Cita Rasa:* Rebusan bunga telang biru alami dipadu perasan lemon segar & es batu. Asam manis segar penyeimbang gurih!

3. Paket Bundling (Pilihan Paling Hemat):
📦 *Paket Hemat* (Rp10.000)
👉 Isi: 3 buah Roti Kirai Berinti pilihanmu. Praktis untuk ganjal lapar!

📦 *Paket Lengkap* (Rp15.000 — Hemat Rp2.000)
👉 Isi: 1 porsi Roti Kirai (4 buah) + 1 cup Es Telang Lemonade. Paling favorit!

📦 *Paket Berdua* (Rp30.000 — Hemat Rp4.000)
👉 Isi: 2 porsi makanan (8 buah Roti Kirai) + 2 cup Es Telang Lemonade.

📦 *Paket Puas* (Rp42.000 — Hemat Rp4.000)
👉 Isi: 3 porsi makanan (12 buah Roti Kirai) + 2 cup Es Telang Lemonade. Cocok buat nongkrong rame-rame!

KODE PROMO / VOUCHER AKTIF DI WEB:
🎁 *JALABATAM* : Potongan Rp3.000 (Min. belanja Rp20.000)
🎁 *SMANSAHEMAT* : Diskon 10% (Min. belanja Rp25.000)

STRUKTUR PENGURUS TIM JALA (SMAN 1 BATAM):
1. Josua Sitinjak — Chief Executive Officer (CEO) — Technology, Finance & Strategy
2. Gabriel — Chief Operating & Commercial Officer (COO)
3. Haura — Chief Product & Creative Officer (CPCO)
4. Letty — Chief Marketing & Customer Officer (CMCO)

KEAMANAN:
- Data HPP modal internal bersifat rahasia manajemen. Jawab dengan sopan bahwa data tersebut bersifat internal tim.`
        },
        { role: 'user', content: text }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.6,
      max_tokens: 380,
    });
    
    const rawAiResponse = chatCompletion.choices[0]?.message?.content || 'Halo Kak! Ada yang bisa kami bantu seputar menu lezat JALA hari ini? 😊';
    const aiResponse = formatForWhatsApp(rawAiResponse);
    console.log(`🤖 AI Response: "${aiResponse.slice(0, 70)}..."`);
    await safeSend(msg, aiResponse);
  } catch (error) {
    console.error('❌ Groq AI API Error:', error.message);
    await safeSend(msg, 'Duh, mohon maaf Kak, jaringan asisten AI kami sedang kurang stabil. Mohon hubungi admin kami secara manual atau coba kembali beberapa saat lagi ya! 🙏');
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
