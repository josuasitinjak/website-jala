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

// User session memory: stores multi-turn chat history & active order drafts per sender
const userSessions = new Map();

function getSession(senderId) {
  if (!userSessions.has(senderId)) {
    userSessions.set(senderId, {
      history: [], // [{ role: 'user' | 'assistant', content: string }]
      orderDraft: null, // { items, customerName, address, paymentMethod, total }
      lastActive: Date.now()
    });
  }
  const session = userSessions.get(senderId);
  session.lastActive = Date.now();
  return session;
}

// Clean up stale sessions after 2 hours
setInterval(() => {
  const now = Date.now();
  for (const [id, sess] of userSessions.entries()) {
    if (now - sess.lastActive > 2 * 60 * 60 * 1000) {
      userSessions.delete(id);
    }
  }
}, 30 * 60 * 1000);

function getMenuText() {
  return `🍛 *DAFTAR LENGKAP MENU RESMI JALA* 🍛
_Warisan Melayu Kepri, Sentuhan Modern Praktis_

*MENU UTAMA (Roti Kirai Berinti):*
▫️ *Roti Kirai — Kari Kentang*
💰 *Harga:* Rp12.000 / porsi (isi 4 buah)
✨ *Cita Rasa:* Isian kentang dadu bumbu rempah kari Melayu harum & gurih klasik dalam gulungan jala kunyit lembut.

▫️ *Roti Kirai — Ayam Suwir*
💰 *Harga:* Rp12.000 / porsi (isi 4 buah)
✨ *Cita Rasa:* Daging ayam suwir bumbu gurih manis meresap, padat, dan mengenyangkan.

▫️ *Roti Kirai — Keju*
💰 *Harga:* Rp12.000 / porsi (isi 4 buah)
✨ *Cita Rasa:* Keju leleh gurih dan creamy lumer di mulut. Favorit kekinian!

*MINUMAN SEGAR:*
▫️ *Es Telang Lemonade*
💰 *Harga:* Rp5.000 / cup
✨ *Cita Rasa:* Rebusan bunga telang biru alami dipadu perasan lemon segar & es batu. Asam manis segar penyeimbang gurih!

*PAKET BUNDLING HEMAT:*
📦 *Paket Hemat* (Rp10.000) — 3 buah Roti Kirai
📦 *Paket Lengkap* (Rp15.000) — 1 porsi (4 buah) + 1 cup Es Telang (Hemat Rp2.000)
📦 *Paket Berdua* (Rp30.000) — 2 porsi makanan + 2 cup Es Telang (Hemat Rp4.000)
📦 *Paket Puas* (Rp42.000) — 3 porsi makanan + 2 cup Es Telang (Hemat Rp4.000)

*KODE VOUCHER PROMO:*
🎁 *JALABATAM* : Potongan Rp3.000 (Min. Rp20.000)
🎁 *SMANSAHEMAT* : Diskon 10% (Min. Rp25.000)

──────────────
_Ketik *2* atau sebutkan pesanan Kakak untuk langsung memesan di sini! 😊_`;
}

function getPromoText() {
  return `🎁 *KODE VOUCHER PROMO JALA* 🎁\n\n▫️ *JALABATAM* : Potongan Rp3.000 (Min. belanja Rp20.000)\n▫️ *SMANSAHEMAT* : Diskon 10% (Min. belanja Rp25.000)\n\nKakak bisa sebutkan kode voucher ini saat memesan di WhatsApp ini atau masukkan saat checkout di website kami di http://localhost:3000 ya! ✨\n\nMau langsung pesan sekarang, Kak? Ketik *2* atau sebutkan menu favorit Kakak! 😊`;
}

// Unified message handler with multi-turn memory & state machine
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

  const session = getSession(msg.from);
  console.log(`💬 Pesan dari ${msg.from}: "${text}" (Ada Draft: ${!!session.orderDraft})`);

  // Helper untuk menyimpan riwayat chat dua arah
  const saveTurn = (userText, botText) => {
    session.history.push({ role: 'user', content: userText });
    session.history.push({ role: 'assistant', content: botText });
    if (session.history.length > 10) {
      session.history = session.history.slice(-10);
    }
  };

  const lowerText = text.toLowerCase().trim();

  // 1. Pembatalan Pesanan Aktif
  if (lowerText === 'batal' || lowerText === 'cancel' || lowerText === 'batal pesan') {
    if (session.orderDraft) {
      session.orderDraft = null;
      const cancelReply = "Pesanan Kakak sebelumnya telah dibatalkan. Ada yang ingin Kakak tanyakan atau pesan kembali? Ketik *1* untuk melihat menu ya! 😊";
      saveTurn(text, cancelReply);
      await safeSend(msg, cancelReply);
      return;
    }
  }

  // 2. Menu Pintasan Cepat Berdasarkan Angka ("1", "2", "3", "4")
  if (lowerText === '1' || lowerText === 'menu' || lowerText === 'daftar menu' || lowerText === 'list menu') {
    const menuMsg = getMenuText();
    saveTurn(text, menuMsg);
    await safeSend(msg, menuMsg);
    return;
  }

  if (lowerText === '2' && !session.orderDraft) {
    session.orderDraft = { items: [], customerName: null, address: null, paymentMethod: 'COD' };
    const orderPrompt = `🛍️ *PANDUAN PEMESANAN LANGSUNG VIA WHATSAPP* 🛍️\n\nKakak mau pesan menu apa dan berapa porsi nih?\nContoh:\n👉 *"Pesan 2 Paket Lengkap dan 1 Roti Keju"*\n\nAtau jika mau langsung lengkap dalam 1 pesan, salin format ini ya:\n\n*PESAN JALA*\n👤 *Nama:* [Nama Lengkap]\n📍 *Lokasi/Kelas:* [Contoh: Ruang Guru / Kelas X MIPA 1]\n🍛 *Pesanan:* [Contoh: 2 Paket Lengkap]\n💳 *Metode Bayar:* [COD / QRIS]`;
    saveTurn(text, orderPrompt);
    await safeSend(msg, orderPrompt);
    return;
  }

  if (lowerText === '3' || lowerText === 'promo' || lowerText === 'voucher' || lowerText === 'diskon') {
    const promoMsg = getPromoText();
    saveTurn(text, promoMsg);
    await safeSend(msg, promoMsg);
    return;
  }

  if (lowerText === '4' && !/(JALA|CAP)[- ]?(\d{4})/i.test(text)) {
    const lacakMsg = `🔍 *LACAK STATUS PESANAN JALA* 🔍\n\nSilakan ketik nomor resi pesanan Kakak ya!\nContoh: *LACAK JALA-1001* atau langsung ketik *JALA-1001* ✨\n\nStatus pesanan akan langsung ditampilkan secara real-time dari dapur JALA! 🛵`;
    saveTurn(text, lacakMsg);
    await safeSend(msg, lacakMsg);
    return;
  }

  // 3. Check if user is asking to track an order (supports JALA-1001, JALA1001, JALA 1001, CAP-1001)
  const trackingRegex = /(JALA|CAP)[- ]?(\d{4})/i;
  const trackingMatch = text.match(trackingRegex);
  
  if (trackingMatch) {
    const normalizedOrderId = `${trackingMatch[1].toUpperCase()}-${trackingMatch[2]}`;
    console.log(`🔍 Melacak pesanan: ${normalizedOrderId} untuk ${msg.from}`);
    const trackingResult = await trackOrder(normalizedOrderId);
    saveTurn(text, trackingResult);
    await safeSend(msg, trackingResult);
    return;
  }

  // 4. Format Pemesanan Cepat
  const formatRegex = /^(FORMAT|CARA PESAN|FORMAT PESAN|FORMAT ORDER|CARA ORDER)/i;
  if (formatRegex.test(text)) {
    const formatGuide = `📋 *FORMAT CEPAT PEMESANAN VIA WHATSAPP JALA* 📋\n\nKakak bisa salin & lengkapi format di bawah ini ya:\n\n*PESAN JALA*\n👤 *Nama:* [Nama Lengkap Kakak]\n📍 *Lokasi/Kelas:* [Contoh: Ruang Guru / Kelas X MIPA 1]\n🍛 *Pesanan:* [Contoh: 2 Paket Lengkap, 1 Roti Keju]\n💳 *Metode Bayar:* [COD / QRIS]\n\n_Kirimkan ke chat ini, dan pesanan Kakak akan langsung otomatis masuk ke sistem dapur & Admin Dashboard JALA! ✨_`;
    saveTurn(text, formatGuide);
    await safeSend(msg, formatGuide);
    return;
  }

  // 5. State Machine Pemesanan Dua Pintu (Mendukung Multi-Turn):
  // Aktif jika ada draft berjalan ATAU pesan menyebutkan pemesanan / nama menu
  const orderKeywords = /(pesan|order|beli|mau beli|mau pesan|paket|roti|telang|kari|keju|ayam|kirai)/i;
  const isOrderContext = !!session.orderDraft || orderKeywords.test(text);

  if (isOrderContext) {
    try {
      console.log(`🛒 Memproses analisis pesanan multi-turn (Draft saat ini: ${JSON.stringify(session.orderDraft)})...`);
      
      const parseCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Kamu adalah asisten kasir pintar JALA. Tugasmu mengumpulkan dan memperbarui data pesanan pelanggan.
Draft pesanan yang sudah terkumpul sejauh ini:
${JSON.stringify(session.orderDraft || { items: [], customerName: null, address: null, paymentMethod: 'COD' })}

Riwayat percakapan sebelumnya:
${session.history.slice(-4).map(h => `${h.role}: ${h.content}`).join('\n')}

Pesan terbaru dari pelanggan: "${text}"

ATURAN PARSING:
1. Perbarui data yang sudah ada dengan informasi baru dari pesan pelanggan.
2. Jika pelanggan menyebutkan nama (misal: "Josua", "atas nama Budi"), masukkan ke customerName. JANGAN anggap nama tersebut sebagai pertanyaan tentang tim manajemen jika pelanggan sedang memesan!
3. Jika pelanggan menyebutkan kelas/ruangan/alamat (misal: "Kelas X Hang Lekir 9", "Ruang Guru", "tes"), masukkan ke address.
4. Jika pelanggan menyebutkan menu atau paket, masukkan/tambahkan ke items sesuai daftar resmi.
5. "isComplete" HANYA bernilai true jika:
   - items minimal ada 1 (quantity > 0)
   - customerName BUKAN null (sudah terisi)
   - address BUKAN null (sudah terisi)
6. Jika belum lengkap, berikan "replyMessage" yang menyebutkan apa yang sudah dicatat dan menanyakan field apa yang masih kurang dengan sopan & ramah.

Katalog Resmi & Harga:
- Roti Kirai Berinti — Kari Kentang (Rp12000)
- Roti Kirai Berinti — Ayam Suwir (Rp12000)
- Roti Kirai Berinti — Keju (Rp12000)
- Es Telang Lemonade (Rp5000)
- Paket Hemat (Rp10000)
- Paket Lengkap (Rp15000)
- Paket Berdua (Rp30000)
- Paket Puas (Rp42000)

Output HANYA JSON Object valid:
{
  "isOrder": boolean,
  "isComplete": boolean,
  "customerName": string atau null,
  "address": string atau null,
  "paymentMethod": "COD" atau "QRIS",
  "items": [{"name": string resmi, "quantity": number, "price": number}],
  "total": number,
  "replyMessage": string ramah
}`
          },
          { role: 'user', content: text }
        ],
        model: 'openai/gpt-oss-20b',
        response_format: { type: 'json_object' }
      });

      const parsed = JSON.parse(parseCompletion.choices[0]?.message?.content || '{}');

      if (parsed.isOrder) {
        if (parsed.isComplete && parsed.items && parsed.items.length > 0 && parsed.customerName && parsed.address) {
          // Seluruh data lengkap! Buat pesanan ke API
          const orderPayload = {
            customerName: parsed.customerName,
            address: parsed.address,
            items: parsed.items,
            total: parsed.total || parsed.items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
            paymentMethod: parsed.paymentMethod || 'COD',
            paymentStatus: parsed.paymentMethod === 'QRIS' ? 'Menunggu QRIS' : 'Bayar di Tempat (COD)',
            orderSource: 'WhatsApp'
          };

          const createdOrder = await createOrderFromWhatsApp(orderPayload);

          if (createdOrder) {
            // Hapus draft karena pesanan telah sukses
            session.orderDraft = null;

            const itemLines = createdOrder.items.map(i => `▫️ *${i.quantity}x ${i.name}* — Rp${(i.quantity * i.price).toLocaleString('id-ID')}`).join('\n');

            let receipt = `🎉 *PESANAN JALA RESMI BERHASIL DIBUAT!* 🎉\n\nHalo Kak *${createdOrder.customerName}*! Pesanan Kakak telah resmi tercatat di sistem dapur JALA SMAN 1 Batam:\n\n🔖 *Nomor Resi / ID Pesanan:*\n👉 *${createdOrder.id}*\n\n📋 *Rincian Menu:*\n${itemLines}\n────────────────────────\n💰 *Total Tagihan:* *Rp${createdOrder.total.toLocaleString('id-ID')}*\n💳 *Metode Pembayaran:* *${createdOrder.paymentMethod}*\n📍 *Lokasi Pengantaran:* ${createdOrder.address}\n\n🛵 *Status:* Pesanan Diterima Dapur\n\nKakak bisa cek status pesanan kapan saja langsung di WhatsApp ini dengan mengetik:\n👉 *LACAK ${createdOrder.id}*\n\n_(Data pesanan ini sudah otomatis tersinkronisasi 2 arah ke Admin Dashboard & Website JALA)_ ✨`;

            if (createdOrder.paymentMethod === 'QRIS') {
              receipt += `\n\n📱 *Pembayaran QRIS:*\nSilakan transfer sesuai nominal *Rp${createdOrder.total.toLocaleString('id-ID')}* ke QRIS resmi JALA di website atau hubungi kasir kami ya Kak!`;
            }

            saveTurn(text, receipt);
            await safeSend(msg, receipt);
            return;
          }
        } else {
          // Pesanan sedang berjalan tapi belum lengkap -> SIMPAN DRAFT KE SESSION!
          session.orderDraft = {
            items: parsed.items || session.orderDraft?.items || [],
            customerName: parsed.customerName || session.orderDraft?.customerName || null,
            address: parsed.address || session.orderDraft?.address || null,
            paymentMethod: parsed.paymentMethod || session.orderDraft?.paymentMethod || 'COD',
            total: parsed.total || session.orderDraft?.total || 0
          };

          const missingPrompt = parsed.replyMessage || "Wah siap Kak! Mau tolong dilengkapi Nama Pemesan, Lokasi Pengantaran (Kelas/Ruangan), dan Metode Bayar (COD/QRIS) agar langsung kami proses ya! 😊";
          saveTurn(text, missingPrompt);
          await safeSend(msg, missingPrompt);
          return;
        }
      }
    } catch (parseErr) {
      console.warn('Order state machine error:', parseErr.message);
    }
  }

  // 6. Default: Multi-Turn Conversational AI Customer Service
  try {
    const systemPrompt = {
      role: 'system',
      content: `Kamu adalah AI Customer Service resmi dari "JALA" — brand Contemporary Malay Heritage Culinary (projek PKWU siswa SMAN 1 Batam, Kelas X Hang Lekir 9).
Tagline: "Warisan Melayu Kepri, Sentuhan Modern Praktis"

SISTEM PEMESANAN DUA PINTU:
1. Pelanggan bisa memesan lewat WEBSITE (http://localhost:3000) ATAU langsung lewat CHAT WHATSAPP ini!
2. Jika pelanggan ingin memesan lewat WhatsApp, mereka cukup sebutkan menu, nama, lokasi kelas, dan metode bayar (COD/QRIS).

ATURAN FORMAT TAMPILAN WHATSAPP (SANGAT KRUSIAL):
1. JANGAN PERNAH membuat tabel Markdown (| kolom 1 | kolom 2 |) atau garis horizontal (---)!
2. Gunakan SATU bintang (*tebal*) untuk bold. JANGAN gunakan dua bintang (**).
3. Gunakan bullet point emoji yang estetik dan ramah (🍛, 🥤, 📦, 💰, ✨, 📍, 👉, 🛵).
4. Berikan spasi satu baris kosong antar menu agar chat nyaman dibaca di layar HP.
5. SELALU buat jawaban INTERAKTIF & MENARIK:
   - Sambut dengan hangat, sopan, dan santun khas Melayu (panggil pelanggan "Kak" atau "Kakak").
   - Jika pelanggan baru menyapa ("halo", "hai", "p"), tawarkan menu panduan cepat:
     1️⃣ Ketik *1* untuk melihat Daftar Menu
     2️⃣ Ketik *2* untuk Pesan langsung via WhatsApp
     3️⃣ Ketik *3* untuk Voucher Promo Diskon
     4️⃣ Ketik *4* untuk Cek Status Pesanan (Resi)`
    };

    // Sertakan riwayat percakapan sebelumnya agar AI punya memori percakapan penuh!
    const contextMessages = [
      systemPrompt,
      ...session.history.slice(-6),
      { role: 'user', content: text }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: contextMessages,
      model: 'openai/gpt-oss-20b',
      temperature: 0.6,
      max_tokens: 380,
    });

    const rawAiResponse = chatCompletion.choices[0]?.message?.content || 'Halo Kak! Ada yang bisa kami bantu seputar menu lezat JALA hari ini? 😊';
    const aiResponse = formatForWhatsApp(rawAiResponse);
    saveTurn(text, aiResponse);
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
