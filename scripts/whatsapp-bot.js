const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Groq = require('groq-sdk');
const { toFile } = require('groq-sdk');
const { createClient } = require('@supabase/supabase-js');
const { PDFParse } = require('pdf-parse');
const http = require('http');
const path = require('path');
const fs = require('fs');

// 1. Muat environment variables dari .env.local atau .env
const envFiles = ['.env.local', '.env'];
let envLoaded = false;
for (const envFile of envFiles) {
  const envPath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    try {
      const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
      for (const k in envConfig) {
        if (!process.env[k]) {
          process.env[k] = envConfig[k];
        }
      }
      console.log(`✅ Berhasil memuat konfigurasi dari ${envFile}`);
      envLoaded = true;
      break;
    } catch (e) {
      console.warn(`⚠️ Gagal membaca ${envFile}:`, e.message);
    }
  }
}

if (!envLoaded) {
  console.log('⚠️ File .env.local tidak ditemukan. Pastikan API Key diatur di system environment.');
}

// 2. Inisialisasi Groq SDK
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 3. Inisialisasi Supabase (Untuk Membaca PDF Dokumen Knowledge Base)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'documents';
const SUPABASE_PDF_FILENAME = process.env.SUPABASE_PDF_FILENAME || '';
let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log(`🗄️ Supabase terhubung: ${SUPABASE_URL} (Bucket: ${SUPABASE_STORAGE_BUCKET})`);
}

let pdfKnowledgeBase = '';
let loadedFilesList = [];

/**
 * Mengunduh dan mengekstrak teks file PDF dari Supabase Storage
 */
async function loadKnowledgeFromSupabase() {
  if (!supabase) return;

  console.log('\n📥 Memeriksa dan memuat file PDF dari database Supabase...');
  let combinedText = '';
  const loadedFiles = [];

  try {
    const { data: fileList, error: listError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } });

    if (listError) {
      console.warn(`⚠️ Catatan storage bucket "${SUPABASE_STORAGE_BUCKET}": ${listError.message}`);
    } else if (fileList && fileList.length > 0) {
      const pdfFiles = fileList.filter(f => {
        if (!f.name) return false;
        if (SUPABASE_PDF_FILENAME) {
          return f.name.toLowerCase() === SUPABASE_PDF_FILENAME.toLowerCase();
        }
        return f.name.toLowerCase().endsWith('.pdf');
      });

      console.log(`📄 Ditemukan ${pdfFiles.length} file PDF di Supabase Storage:`, pdfFiles.map(f => f.name));

      for (const file of pdfFiles) {
        try {
          console.log(`⬇️ Mengunduh "${file.name}" dari Supabase Storage...`);
          const { data: blob, error: downloadError } = await supabase.storage
            .from(SUPABASE_STORAGE_BUCKET)
            .download(file.name);

          if (downloadError) {
            console.error(`❌ Gagal unduh ${file.name}:`, downloadError.message);
            continue;
          }

          const arrayBuffer = await blob.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const parser = new PDFParse({ data: buffer });
          const parsedPdf = await parser.getText();
          await parser.destroy();

          const cleanText = parsedPdf.text ? parsedPdf.text.trim() : '';
          const numPages = parsedPdf.total || 1;
          if (cleanText.length > 0) {
            combinedText += `\n\n--- DOKUMEN: ${file.name} (Halaman: ${numPages}) ---\n${cleanText}\n`;
            loadedFiles.push({ name: file.name, pages: numPages, charCount: cleanText.length });
            console.log(`✅ Berhasil mengekstrak ${file.name} (${numPages} hal, ${cleanText.length} karakter)`);
          }
        } catch (pdfErr) {
          console.error(`❌ Gagal memproses PDF ${file.name}:`, pdfErr.message);
        }
      }
    }

    if (combinedText.trim().length > 0) {
      pdfKnowledgeBase = combinedText.trim();
      loadedFilesList = loadedFiles;
      console.log(`🎉 Total Dokumen PDF Supabase Aktif: ${loadedFiles.length} file (${pdfKnowledgeBase.length} karakter)\n`);
    } else {
      console.log('ℹ️ Belum ada file PDF di bucket Supabase. Bot siap dengan data menu JALA.');
    }
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat membaca PDF dari Supabase:', err.message);
  }
}

// 4. Inisialisasi WhatsApp Web Client
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.join(process.cwd(), '.wwebjs_auth')
  }),
  puppeteer: {
    handleSIGINT: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  }
});

client.on('loading_screen', (percent, message) => {
  console.log(`⏳ Memuat WhatsApp Web: ${percent}% - ${message || 'Sinkronisasi'}`);
});

client.on('authenticated', () => {
  console.log('🔑 Terotentikasi! Sesi WhatsApp aktif.');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Gagal otentikasi WhatsApp:', msg);
});

client.on('disconnected', (reason) => {
  console.warn('⚠️ WhatsApp terputus:', reason);
  setTimeout(() => client.initialize(), 5000);
});

client.on('qr', (qr) => {
  console.log('\n--- SCAN QR CODE DI BAWAH DENGAN WHATSAPP ANDA ---');
  qrcode.generate(qr, { small: true });
  console.log('--------------------------------------------------\n');
});

client.on('ready', () => {
  console.log('🚀 Kak Admin JALA Siap Melayani Pelanggan dengan Ramah & Manusiawi!');
});

// Helper format pesan rapi untuk WhatsApp
function formatForWhatsApp(text) {
  if (!text) return '';
  let formatted = text;

  // 1. Ubah tabel Markdown jadi list rapi WhatsApp
  if (formatted.includes('|')) {
    const lines = formatted.split('\n');
    let inTable = false;
    let headers = [];
    let convertedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
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
          if (cols.length >= 2) {
            convertedLines.push(`▫️ *${cols[0]}* : ${cols.slice(1).join(' — ')}`);
          } else if (cols.length === 1) {
            convertedLines.push(`▫️ ${cols[0]}`);
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

  // 2. Heading ### Heading -> 📌 *Heading*
  formatted = formatted.replace(/^#{1,4}\s+(.+)$/gm, '📌 *$1*');

  // 3. Bold **tebal** -> *tebal* (standar WhatsApp)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '*$1*');

  // 4. Link [Label](URL) -> Label (URL)
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');

  // 5. Garis horizontal
  formatted = formatted.replace(/^[\-_*]{3,}$/gm, '──────────────');

  // 6. Rapikan baris kosong berlebih
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  return formatted.trim();
}

const API_BASE_URL = process.env.LIVE_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Helper lacak pesanan dari sistem
async function trackOrder(orderIdOrQuery) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`);
    const data = await res.json();
    const orders = data && Array.isArray(data.orders) ? data.orders : [];
    const cleanQuery = (orderIdOrQuery || '').trim().toUpperCase();

    const found = orders.find(o => 
      (o.id && o.id.toUpperCase() === cleanQuery) ||
      (o.customerName && o.customerName.toUpperCase().includes(cleanQuery))
    );

    if (found) {
      return `✨ *Kabar Pesanan Kak ${found.customerName}* ✨\n\nPesanan dengan kode *${found.id}* saat ini statusnya:\n📌 Status: *[ ${found.status.toUpperCase()} ]*\n📍 Diantar ke: *${found.address}*\n💰 Total: *Rp${found.total.toLocaleString('id-ID')}*\n💳 Pembayaran: *${found.paymentMethod}* (${found.paymentStatus || 'Tercatat'})\n\nPesanan Kakak sedang kami siapkan hangat-hangat oleh tim dapur ya. Nanti begitu siap langsung segera kami antarkan! Terima kasih banyak Kak! 😊🛵`;
    } else {
      return `Maaf ya Kak, nomor pesanan *${cleanQuery}* belum kami temukan di sistem dapur kami. Boleh tolong dicek kembali kode pesanannya (contoh: *JALA-1001*) atau kasih tahu nama pemesannya biar kami bantu cekkan? 🙏`;
    }
  } catch (err) {
    console.error('Error tracking order:', err);
    return 'Aduh maaf ya Kak, sistem pencatatan kami sedang sinkronisasi sebentar. Boleh ditunggu 1-2 menit lagi ya Kak!';
  }
}

// Helper buat pesanan ke database Next.js
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

// Helper batalkan pesanan di database Next.js / API
async function cancelOrderInDatabase(orderId) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: 'Dibatalkan' })
    });
    const data = await res.json();
    return data && data.success;
  } catch (err) {
    console.error('Error cancelling order via API:', err);
    return false;
  }
}

// Helper cari pesanan aktif berdasarkan nama atau query
async function getActiveOrder(orderIdOrName) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`);
    const data = await res.json();
    const orders = data && Array.isArray(data.orders) ? data.orders : [];
    if (!orderIdOrName) return null;
    const clean = orderIdOrName.trim().toUpperCase();
    return orders.find(o => 
      o.status !== 'Dibatalkan' && 
      ((o.id && o.id.toUpperCase() === clean) || 
       (o.customerName && o.customerName.toUpperCase().includes(clean)))
    );
  } catch (e) {
    return null;
  }
}

// ============================================================================
// SISTEM NOTIFIKASI OTOMATIS: KIRIM PESAN WHATSAPP SAAT STATUS PESANAN DIUPDATE
// ============================================================================

const notifiedOrderStatuses = new Map(); // orderId -> lastNotifiedStatus

function generateStatusUpdateMessage(order, newStatus) {
  const name = order.customerName || 'Pelanggan JALA';
  const id = order.id || 'JALA';
  const address = order.address || 'Lokasi pemesan';
  const total = order.total ? `Rp${Number(order.total).toLocaleString('id-ID')}` : '';

  let header = '✨ *KABAR STATUS PESANAN JALA* ✨';
  let body = '';

  const cleanStatus = (newStatus || '').trim().toLowerCase();

  if (cleanStatus.includes('proses') || cleanStatus.includes('dapur')) {
    header = '🍳 *PESANAN JALA SEDANG DIPROSES* 🍳';
    body = `Halo Kak *${name}*! Pesanan Kakak (*${id}*) saat ini statusnya telah diperbarui:\n\n📌 *Status:* *[ DIPROSES DAPUR ]*\n📍 *Tujuan Antar:* ${address}\n💰 *Total:* *${total}*\n\nTim dapur kami sedang menyiapkan Roti Kirai hangat Kakak dengan sepenuh hati. Mohon ditunggu ya Kak! 🛵💨`;
  } else if (cleanStatus.includes('antar') || cleanStatus.includes('kirim') || cleanStatus.includes('jalan')) {
    header = '🛵💨 *PESANAN JALA SEDANG DIANTAR* 🛵💨';
    body = `Halo Kak *${name}*! Kabar gembira, pesanan Kakak (*${id}*) sudah selesai disiapkan hangat-hangat dan *saat ini sedang dalam perjalanan diantar* menuju:\n\n📍 *Lokasi:* *${address}*\n💰 *Total Tagihan:* *${total}*\n\nKurir kami segera tiba di lokasi ya Kak. Mohon bersiap ya! Terima kasih banyak Kak! 😊`;
  } else if (cleanStatus.includes('selesai') || cleanStatus.includes('terima') || cleanStatus.includes('sampai')) {
    header = '🎉 *PESANAN JALA SELESAI* 🎉';
    body = `Halo Kak *${name}*! Pesanan Kakak (*${id}*) telah *selesai diantarkan*.\n\nSelamat menikmati kelezatan Roti Kirai khas Melayu JALA ya Kak! Semoga cocok di lidah dan berkah selalu. Jika ada masukan atau ingin pesan lagi, kabari kami di sini ya Kak! Terima kasih banyak! 🙏✨`;
  } else if (cleanStatus.includes('batal') || cleanStatus.includes('cancel')) {
    header = '⚠️ *PESANAN JALA DIBATALKAN* ⚠️';
    body = `Halo Kak *${name}*, kami menginformasikan bahwa pesanan Kakak (*${id}*) telah resmi *dibatalkan* di sistem dapur kami.\n\nJika ada kekeliruan atau ingin memesan kembali di lain waktu, jangan sungkan hubungi kami ya Kak. Terima kasih! 🙏`;
  } else {
    body = `Halo Kak *${name}*! Status pesanan Kakak (*${id}*) saat ini telah diperbarui menjadi:\n\n📌 *Status:* *[ ${newStatus.toUpperCase()} ]*\n📍 *Tujuan:* ${address}\n\nTerima kasih atas kesabaran Kakak! Segera kami kabari bila ada perkembangan terbaru ya. 😊`;
  }

  return `${header}\n\n${body}`;
}

async function sendOrderStatusNotification(order, newStatus) {
  if (!order || !order.id || !newStatus) return;

  // Cegah pengiriman notifikasi ganda untuk status yang sama
  const lastNotified = notifiedOrderStatuses.get(order.id);
  if (lastNotified === newStatus) return;
  notifiedOrderStatuses.set(order.id, newStatus);

  const formattedMsg = formatForWhatsApp(generateStatusUpdateMessage(order, newStatus));

  // Tentukan nomor penerima:
  let targetChatId = order.chatId;

  if (!targetChatId && (order.customerPhone || order.phone)) {
    const rawPhone = (order.customerPhone || order.phone).replace(/[^0-9]/g, '');
    let formattedPhone = rawPhone;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }
    if (formattedPhone.length >= 10) {
      targetChatId = `${formattedPhone}@c.us`;
    }
  }

  // Jika order tidak punya nomor WA, kirim ke chat nomor bot sendiri agar admin tetap menerima notifikasi
  if (!targetChatId) {
    const myWid = client.info?.wid?._serialized;
    if (myWid) targetChatId = myWid;
  }

  if (targetChatId) {
    try {
      console.log(`📤 Mengirim pesan update status pesanan ${order.id} ke ${targetChatId}...`);
      await client.sendMessage(targetChatId, formattedMsg);
      console.log(`✅ Pesan update status pesanan ${order.id} berhasil terkirim ke WhatsApp!`);
    } catch (err) {
      console.error(`❌ Gagal kirim notifikasi status pesanan ${order.id}:`, err.message);
    }
  }
}

// Server internal untuk menerima trigger update status dari website Admin (port 3005)
const NOTIFICATION_PORT = 3005;
const notificationServer = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/notify-status') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        if (payload.order && payload.newStatus) {
          await sendOrderStatusNotification(payload.order, payload.newStatus);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

notificationServer.listen(NOTIFICATION_PORT, () => {
  console.log(`📡 WhatsApp Status Notification Listener aktif di http://localhost:${NOTIFICATION_PORT}`);
});

// Background Poller: Cadangan untuk memastikan update status selalu terdeteksi jika webhook terlewat
let isInitialPollDone = false;
setInterval(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`);
    const data = await res.json();
    const orders = data && Array.isArray(data.orders) ? data.orders : [];

    if (!isInitialPollDone) {
      for (const o of orders) {
        if (o.id && o.status) {
          notifiedOrderStatuses.set(o.id, o.status);
        }
      }
      isInitialPollDone = true;
      return;
    }

    for (const o of orders) {
      if (o.id && o.status) {
        const previousStatus = notifiedOrderStatuses.get(o.id);
        if (previousStatus && previousStatus !== o.status) {
          console.log(`🔄 Terdeteksi perubahan status pesanan ${o.id}: "${previousStatus}" -> "${o.status}" via poller`);
          await sendOrderStatusNotification(o, o.status);
        } else if (!previousStatus) {
          notifiedOrderStatuses.set(o.id, o.status);
        }
      }
    }
  } catch (e) {
    // Non-blocking
  }
}, 4000);

const botSentMessageIds = new Set();
const processedMessageIds = new Set();

async function safeSend(msg, text) {
  const formattedText = formatForWhatsApp(text);
  const targetChatId = msg.id?.remote || msg.from;

  try {
    const sent = await client.sendMessage(targetChatId, formattedText);
    if (sent?.id?._serialized) botSentMessageIds.add(sent.id._serialized);
    console.log(`✅ Pesan terkirim ke: ${targetChatId}`);
    return;
  } catch (sendErr) {
    try {
      const sent = await msg.reply(formattedText);
      if (sent?.id?._serialized) botSentMessageIds.add(sent.id._serialized);
      console.log('✅ Pesan terkirim via msg.reply()');
      return;
    } catch (replyErr) {
      console.error('❌ Gagal kirim pesan:', replyErr.message);
    }
  }
}

// 📥 Pengunduhan Media WhatsApp dengan Retry Otomatis (Mengatasi latency sinkronisasi browser)
async function downloadMediaWithRetry(msg, maxAttempts = 5, delayMs = 1200) {
  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`📥 Mengunduh media audio (${attempt}/${maxAttempts})...`);
      const media = await msg.downloadMedia();
      if (media && media.data && media.data.length > 0) {
        console.log(`✅ Media audio berhasil diunduh (${Math.round(media.data.length * 0.75)} bytes, mime: ${media.mimetype})`);
        return media;
      }
    } catch (err) {
      lastErr = err;
      console.warn(`⚠️ Percobaan ${attempt} gagal unduh:`, err.message);
    }
    // Beri jeda agar WhatsApp Web selesai sinkronisasi media blob
    await new Promise(r => setTimeout(r, delayMs));
  }
  if (lastErr) {
    console.error(`❌ Gagal unduh media setelah ${maxAttempts} percobaan:`, lastErr.message);
  }
  return null;
}

// 🎙️ Transkripsi Audio / Voice Note menggunakan Groq Whisper AI (Super Cepat & Akurat)
async function transcribeAudio(media) {
  if (!media || !media.data) return '';
  const buffer = Buffer.from(media.data, 'base64');
  console.log(`🎙️ Memproses audio buffer: ${buffer.length} bytes, mimetype: ${media.mimetype}`);

  if (buffer.length < 300) {
    console.warn('⚠️ Ukuran buffer audio terlalu kecil (<300 bytes), audio kemungkinan kosong.');
    return '';
  }

  const mime = media.mimetype || 'audio/ogg';
  const cleanMime = mime.split(';')[0].trim() || 'audio/ogg';
  const ext = cleanMime.includes('mp4') || cleanMime.includes('m4a') ? 'm4a' : 'ogg';
  const filename = `voice_${Date.now()}.${ext}`;

  // 1. Coba model Whisper Large V3 Turbo
  try {
    const file = await toFile(buffer, filename, { type: cleanMime });
    const res = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3-turbo',
      language: 'id',
      response_format: 'json',
      temperature: 0.0,
    });
    const text = res?.text?.trim() || '';
    if (text) return text;
  } catch (err) {
    console.warn('⚠️ Model whisper-large-v3-turbo gagal:', err.message);
  }

  // 2. Fallback: Coba model Whisper Large V3 standar
  try {
    const fallbackFile = await toFile(buffer, filename, { type: cleanMime });
    const res = await groq.audio.transcriptions.create({
      file: fallbackFile,
      model: 'whisper-large-v3',
      language: 'id',
      response_format: 'json',
      temperature: 0.0,
    });
    const text = res?.text?.trim() || '';
    if (text) return text;
  } catch (err2) {
    console.warn('⚠️ Model whisper-large-v3 gagal:', err2.message);
  }

  // 3. Fallback: Auto-detect bahasa
  try {
    const autoFile = await toFile(buffer, filename, { type: cleanMime });
    const res = await groq.audio.transcriptions.create({
      file: autoFile,
      model: 'whisper-large-v3-turbo',
      response_format: 'json',
    });
    return res?.text?.trim() || '';
  } catch (err3) {
    console.error('❌ Seluruh percobaan transkripsi gagal:', err3.message);
    throw err3;
  }
}

// Pemanggilan Groq
async function callGroqWithFallback(params) {
  const models = ['openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
  let lastError = null;
  for (const model of models) {
    try {
      return await groq.chat.completions.create({
        ...params,
        model
      });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// Memory percakapan pengguna
const userSessions = new Map();

function getSession(senderId) {
  if (!userSessions.has(senderId)) {
    userSessions.set(senderId, {
      history: [],
      orderDraft: null,
      lastOrderId: null,
      customerName: null,
      lastActive: Date.now()
    });
  }
  const session = userSessions.get(senderId);
  session.lastActive = Date.now();
  return session;
}

setInterval(() => {
  const now = Date.now();
  for (const [id, sess] of userSessions.entries()) {
    if (now - sess.lastActive > 2 * 60 * 60 * 1000) {
      userSessions.delete(id);
    }
  }
}, 30 * 60 * 1000);

function isSelfTestChat(msg) {
  if (!msg.fromMe) return false;
  if (botSentMessageIds.has(msg.id?._serialized)) return false;

  const myUser = client.info?.wid?.user;
  if (!myUser) return false;

  const toUser = (msg.to || '').split('@')[0].split(':')[0];
  const fromUser = (msg.from || '').split('@')[0].split(':')[0];

  return toUser === myUser && (fromUser === myUser || msg.from?.includes(myUser));
}

// Unified Message Handler: Berperilaku Layaknya Kak Admin Manusia yang Ramah & Menyenangkan
async function handleIncomingMessage(msg) {
  if (msg.from && (msg.from.includes('@g.us') || msg.from.includes('status@broadcast') || msg.from === 'status@broadcast')) return;

  const msgId = msg.id?._serialized;
  if (msgId) {
    if (processedMessageIds.has(msgId)) return;
    processedMessageIds.add(msgId);
    if (processedMessageIds.size > 2000) {
      const first = processedMessageIds.values().next().value;
      processedMessageIds.delete(first);
    }
  }

  if (msg.fromMe) {
    if (botSentMessageIds.has(msgId)) return;
    if (!isSelfTestChat(msg)) return;
  }

  let text = msg.body?.trim() || '';
  let isVoiceNote = false;

  // 🎙️ Deteksi & Transkripsi Cerdas jika pesan berupa Voice Note (PTT) atau Audio
  if (msg.hasMedia && (msg.type === 'ptt' || msg.type === 'audio')) {
    isVoiceNote = true;
    console.log(`🎙️ Menerima pesan suara / Voice Note (${msg.type}) dari ${msg.from}... Mendengarkan audio dengan Groq Whisper...`);
    try {
      // Gunakan downloadMediaWithRetry dengan jeda waktu agar WhatsApp Web sempat mengunduh dan mendekripsi blob audio
      const media = await downloadMediaWithRetry(msg, 5, 1200);
      if (media && media.data) {
        text = await transcribeAudio(media);
        console.log(`🎙️ Hasil Transkripsi Suara (${msg.from}): "${text}"`);
      } else {
        console.warn(`⚠️ Tidak berhasil mengunduh payload audio dari pesan.`);
      }
    } catch (err) {
      console.error('❌ Gagal transkripsi Voice Note:', err.message);
    }

    if (!text || text.trim().length === 0) {
      await safeSend(msg, 'Mohon maaf Kak, rekaman suara (Voice Note) belum terdengar jelas atau masih dalam proses muat. Boleh tolong dikirimkan ulang atau diketik ya Kak? Kami siap membantu 😊🙏');
      return;
    }
  }

  if (!text) return;

  const session = getSession(msg.from);
  console.log(`💬 Pesan dari ${msg.from}: "${text}"${isVoiceNote ? ' [Via Voice Note]' : ''}`);

  const saveTurn = (userText, botText) => {
    session.history.push({ role: 'user', content: userText });
    session.history.push({ role: 'assistant', content: botText });
    if (session.history.length > 14) {
      session.history = session.history.slice(-14);
    }
  };

  const reply = async (botText) => {
    saveTurn(text, botText);
    const finalMsg = (isVoiceNote ? `🎙️ *(Mendengar)*: _"${text}"_\n\n` : '') + botText;
    await safeSend(msg, finalMsg);
  };

  const lowerText = text.toLowerCase().trim();

  // Perintah Admin Khusus (Bekerja di latar belakang tanpa mengganggu alur manusia)
  if (lowerText === '!sync' || lowerText === '!reload' || lowerText === 'sinkronkan data') {
    await safeSend(msg, 'Baik, sedang menyinkronkan ulang data dokumen PDF dari Supabase... Sebentar ya.');
    await loadKnowledgeFromSupabase();
    await safeSend(msg, `Sinkronisasi berhasil! Data dokumen PDF Supabase telah diperbarui (${loadedFilesList.length} file terbaca). Saya siap menjawab dengan informasi terbaru! ✨`);
    return;
  }

  // 1. Pembatalan Pesanan (Mendukung Pembatalan Draft Maupun Pesanan Nyata di Sistem Dapur)
  const cancelKeywords = /(batal|cancel|gak jadi|nggak jadi|ga jadi|batalin|batalkan|cancelkan|batal pesanan|cancel order)/i;
  if (cancelKeywords.test(lowerText)) {
    console.log(`🛑 Permintaan pembatalan dari ${msg.from}: "${text}"`);

    // A. Jika ada kode pesanan spesifik di dalam pesan (misal: "batalkan JALA-1001" atau "cancel JALA-1002")
    const orderCodeMatch = text.match(/(JALA|CAP)[- ]?(\d{4})/i);
    if (orderCodeMatch) {
      const targetId = `${orderCodeMatch[1].toUpperCase()}-${orderCodeMatch[2]}`;
      await cancelOrderInDatabase(targetId);
      session.orderDraft = null;
      if (session.lastOrderId === targetId) session.lastOrderId = null;

      const cancelReply = `Baik Kak, pesanan dengan nomor *${targetId}* telah berhasil kami batalkan di sistem dapur JALA ya. Terima kasih sudah mengabari kami lebih awal Kak! Kalau nanti ingin pesan kembali, jangan sungkan ya 😊🙏`;
      await reply(cancelReply);
      return;
    }

    // B. Jika pelanggan sedang mengetik draft pesanan (belum tuntas)
    if (session.orderDraft) {
      session.orderDraft = null;
      const cancelDraftReply = "Baik Kak, catatan pesanan yang sedang Kakak buat sudah kami batalkan ya. Santai saja Kak, kalau nanti mau pesan lagi atau tanya-tanya menu tinggal kabari kami ya! 😊";
      await reply(cancelDraftReply);
      return;
    }

    // C. Jika pelanggan baru saja menyelesaikan pesanan di sesi ini (memiliki lastOrderId aktif)
    if (session.lastOrderId) {
      const targetId = session.lastOrderId;
      await cancelOrderInDatabase(targetId);
      session.lastOrderId = null;

      const cancelSuccessReply = `Baik Kak, pesanan Kakak dengan nomor *${targetId}* sudah resmi kami batalkan di sistem dapur ya. Terima kasih sudah mengabari kami lebih awal ya Kak! Jika ada hal lain yang bisa kami bantu, kabari saja ya Kak 😊🙏`;
      await reply(cancelSuccessReply);
      return;
    }

    // D. Coba cek apakah ada pesanan aktif atas nama pelanggan di sesi ini
    if (session.customerName) {
      const activeOrder = await getActiveOrder(session.customerName);
      if (activeOrder) {
        await cancelOrderInDatabase(activeOrder.id);
        const cancelCustomerReply = `Baik Kak *${activeOrder.customerName}*, pesanan Kakak (*${activeOrder.id}*) sebesar Rp${activeOrder.total.toLocaleString('id-ID')} sudah berhasil kami batalkan di sistem dapur ya. Terima kasih sudah mengabari kami! 😊🙏`;
        await reply(cancelCustomerReply);
        return;
      }
    }

    // E. Jika tidak ada pesanan aktif yang terdeteksi, tanyakan dengan ramah
    const askCancelReply = "Baik Kak, Kakak ingin membatalkan pesanan yang mana ya? Boleh tolong sebutkan nomor pesanannya (contoh: *JALA-1001*) atau nama pemesan agar langsung kami bantu batalkan di sistem dapur kami ya Kak? 😊";
    await reply(askCancelReply);
    return;
  }

  // 2. Deteksi Cek Resi / Lacak Pesanan secara natural
  const trackingRegex = /(JALA|CAP)[- ]?(\d{4})/i;
  const trackingMatch = text.match(trackingRegex);
  if (trackingMatch) {
    const normalizedOrderId = `${trackingMatch[1].toUpperCase()}-${trackingMatch[2]}`;
    console.log(`🔍 Melacak pesanan: ${normalizedOrderId} untuk ${msg.from}`);
    const trackingResult = await trackOrder(normalizedOrderId);
    await reply(trackingResult);
    return;
  }

  // 3. Parsing Pesanan Alami (Natural Order Flow)
  const orderKeywords = /(pesan|order|beli|mau beli|mau pesan|bungkus|paket|roti|telang|lemonade|kari|keju|ayam|kirai)/i;
  const isOrdering = !!session.orderDraft || orderKeywords.test(text);

  if (isOrdering) {
    try {
      const parseCompletion = await callGroqWithFallback({
        messages: [
          {
            role: 'system',
            content: `Kamu adalah asisten kasir cerdas JALA. Tugasmu mengumpulkan dan memperbarui data pesanan pelanggan secara alami.
Draft pesanan saat ini:
${JSON.stringify(session.orderDraft || { items: [], customerName: null, address: null, paymentMethod: 'COD' })}

Riwayat percakapan:
${session.history.slice(-4).map(h => `${h.role}: ${h.content}`).join('\n')}

Pesan pelanggan: "${text}"

ATURAN:
1. Jika pelanggan menyebutkan nama, simpan di customerName.
2. Jika menyebutkan tempat/kelas/ruangan (misal: "di ruang guru", "kelas X HJ 5", "taman lestari"), simpan di address.
3. Jika menyebutkan menu atau jumlah, simpan di items.
4. "isComplete" bernilai true HANYA JIKA: items minimal 1 (quantity > 0), customerName ada, dan address ada.
5. "isOrder": true jika pelanggan memang sedang bermaksud memesan makanan/minuman.
6. "replyMessage": Respon sopan, hangat, dan alami seperti ADMIN MANUSIA (JANGAN ada kata 'Ketik', JANGAN kaku). Sebutkan apa yang sudah dicatat dan tanyakan detail yang masih kurang dengan ramah.

Katalog Resmi:
- Roti Kirai Berinti — Kari Kentang (Rp12000)
- Roti Kirai Berinti — Ayam Suwir (Rp12000)
- Roti Kirai Berinti — Keju (Rp12000)
- Es Telang Lemonade (Rp5000)
- Paket Hemat (Rp10000)
- Paket Lengkap (Rp15000)
- Paket Berdua (Rp30000)
- Paket Puas (Rp42000)

Output HANYA JSON:
{
  "isOrder": boolean,
  "isComplete": boolean,
  "customerName": string atau null,
  "address": string atau null,
  "paymentMethod": "COD" atau "QRIS",
  "items": [{"name": string resmi, "quantity": number, "price": number}],
  "total": number,
  "replyMessage": string
}`
          },
          { role: 'user', content: text }
        ],
        response_format: { type: 'json_object' }
      });

      const parsed = JSON.parse(parseCompletion.choices[0]?.message?.content || '{}');

      if (parsed.isOrder) {
        if (parsed.isComplete && parsed.items && parsed.items.length > 0 && parsed.customerName && parsed.address) {
          const orderPayload = {
            customerName: parsed.customerName,
            address: parsed.address,
            items: parsed.items,
            total: parsed.total || parsed.items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
            paymentMethod: parsed.paymentMethod || 'COD',
            paymentStatus: parsed.paymentMethod === 'QRIS' ? 'Menunggu QRIS' : 'Bayar di Tempat (COD)',
            orderSource: 'WhatsApp',
            chatId: msg.from,
            customerPhone: msg.from.split('@')[0].replace(/[^0-9]/g, '')
          };

          const createdOrder = await createOrderFromWhatsApp(orderPayload);
          session.orderDraft = null;

          if (createdOrder) {
            session.lastOrderId = createdOrder.id;
            session.customerName = createdOrder.customerName;

            const itemLines = createdOrder.items.map(i => `▫️ *${i.quantity}x ${i.name}* — Rp${(i.quantity * i.price).toLocaleString('id-ID')}`).join('\n');
            let receipt = `Terima kasih banyak! Pesanan Kak *${createdOrder.customerName}* sudah resmi kami catat dan langsung masuk ke dapur JALA ya! 🛵💨\n\n📋 *Rincian Pesanan:*\n${itemLines}\n────────────────────────\n💰 *Total:* *Rp${createdOrder.total.toLocaleString('id-ID')}*\n💳 *Pembayaran:* *${createdOrder.paymentMethod}* (${createdOrder.paymentStatus})\n📍 *Tujuan Antar:* *${createdOrder.address}*\n🔖 *Nomor Pesanan:* *${createdOrder.id}*\n\nPesanan Kakak sedang disiapkan hangat-hangat oleh tim kami. Nanti kalau mau cek kabar pesanannya atau ada perubahan, tinggal tanyakan ke saya ya Kak. Terima kasih banyak Kak *${createdOrder.customerName}*! 😊🙏`;

            if (createdOrder.paymentMethod === 'QRIS') {
              receipt += `\n\n📱 *Pembayaran QRIS:*\nUntuk transfer QRIS, silakan transfer sebesar *Rp${createdOrder.total.toLocaleString('id-ID')}* ke QRIS resmi JALA di website atau infokan ke saya bila butuh bantuan ya Kak!`;
            }

            await reply(receipt);
            return;
          }
        } else {
          session.orderDraft = {
            items: parsed.items && parsed.items.length > 0 ? parsed.items : (session.orderDraft?.items || []),
            customerName: parsed.customerName || session.orderDraft?.customerName || null,
            address: parsed.address || session.orderDraft?.address || null,
            paymentMethod: parsed.paymentMethod || session.orderDraft?.paymentMethod || 'COD',
            total: parsed.total || session.orderDraft?.total || 0
          };

          const missingReply = parsed.replyMessage || "Siap Kak! Mau tolong dibantu nama pemesan, lokasi pengantaran (ruangan/kelas), dan metode pembayarannya (COD atau QRIS) ya Kak, biar langsung kami catatkan ke tim dapur 😊";
          await reply(missingReply);
          return;
        }
      }
    } catch (parseErr) {
      console.warn('Order parsing error:', parseErr.message);
    }
  }

  // 4. Percakapan Utama: Admin Manusia yang Cerdas, Luwes, dan Hangat (Tanpa Kode-Kode Kaku & Tanpa Promo)
  try {
    const systemPrompt = {
      role: 'system',
      content: `Kamu adalah Kak Admin resmi dari "JALA" (brand kuliner khas Melayu kontemporer karya siswa SMAN 1 Batam, Kelas X Hang Jebat 5).
Produk unggulan: Roti Kirai Berinti lezat (Kari Kentang, Ayam Suwir, Keju Melt) dan Es Telang Lemonade segar alami.

INSTRUKSI UTAMA GAYA KOMUNIKASI (SANGAT PENTING):
1. BICARALAH SEPERTI ADMIN MANUSIA ASLI yang ramah, sopan, luwes, cerdas, dan hangat di WhatsApp!
2. JANGAN PERNAH MENYEBUTKAN KODE KAKU seperti: "Ketik 1 untuk...", "Ketik 2 untuk...", "Ketik nomor...", atau meminta format formulir kaku. Bicaralah mengalir secara alami.
3. Selalu panggil pelanggan dengan sebutan santun: "Kak" atau "Kakak".
4. Jika pelanggan baru menyapa ("halo", "hai", "p", "pagi", "siang", "sore"), sambut hangat dan tawarkan bantuan secara luwes (misal: "Halo Kak! Selamat datang di JALA 😊 Senang bisa menyapa Kakak. Ada yang bisa kami bantu hari ini? Mau cobain Roti Kirai hangat kami atau mau lihat pilihan menunya dulu, Kak?").
5. Jika pelanggan menanyakan menu, ceritakan menu dengan menarik, menyebutkan harga dan kelezatannya dengan rapi.
6. PENTING TENTANG PROMO/DISKON: Saat ini JALA BELUM MENYEDIAKAN voucher promo atau diskon. Jika ada pelanggan menanyakan promo atau voucher diskon, sampaikan dengan ramah bahwa saat ini belum ada promo, namun harga menu JALA sudah sangat terjangkau, terutama paket bundling hemat (Paket Lengkap Rp15.000 sudah hemat Rp2.000).
7. JANGAN PERNAH membuat tabel Markdown dengan garis pipa (|). Gunakan bullet point emoji manis (🍛, 🥤, 📦, 💰, ✨, 📍, 🛵) agar mudah dibaca di ponsel.
8. Selalu akhiri percakapan dengan kalimat penutup yang manis, perhatian, dan mengundang percakapan lanjutan.
9. BAHASA NETRAL & UNIVERSAL (SANGAT PENTING): JANGAN PERNAH menggunakan kata, sapaan, atau ungkapan keagamaan (seperti Alhamdulillah, Bismillah, Assalamualaikum, Insya Allah, Barakallah, Puji Tuhan, dll). Gunakan bahasa yang sopan, ramah, profesional, netral, universal, dan inklusif untuk semua pelanggan (seperti Halo Kak, Selamat pagi/siang/sore, Senang menyapa Kakak, Terima kasih banyak Kak).
10. TELEPON & VOICE NOTE: Jika pelanggan bertanya apakah bisa telepon, jelaskan dengan ramah bahwa panggilan telepon langsung belum didukung oleh WhatsApp bot, namun pelanggan SANGAT BISA berbicara langsung lewat Voice Note (VN) atau mengetik di chat teks WhatsApp.

${pdfKnowledgeBase ? `DOKUMEN KNOWLEDGE BASE SUPABASE (Gunakan fakta dari sini bila ditanyakan):
${pdfKnowledgeBase}\n` : ''}

INFORMASI PRODUK & HARGA:
- Roti Kirai Berinti — Kari Kentang: Rp12.000 / porsi (isi 4 gulung kunyit lembut, kentang dadu bumbu rempah kari Melayu harum gurih)
- Roti Kirai Berinti — Ayam Suwir: Rp12.000 / porsi (isi 4 buah, daging ayam suwir gurih manis mengenyangkan)
- Roti Kirai Berinti — Keju: Rp12.000 / porsi (isi 4 buah, keju leleh creamy lumer gurih)
- Es Telang Lemonade: Rp5.000 / cup (seduhan bunga telang biru asli dipadu perasan lemon segar penyeimbang gurih)
- Paket Bundling:
  ▫️ Paket Hemat (Rp10.000) — 3 buah Roti Kirai
  ▫️ Paket Lengkap (Rp15.000) — 1 porsi (4 buah) + 1 cup Es Telang (Hemat Rp2.000)
  ▫️ Paket Berdua (Rp30.000) — 2 porsi makanan + 2 cup Es Telang (Hemat Rp4.000)
  ▫️ Paket Puas (Rp42.000) — 3 porsi makanan + 2 cup Es Telang (Hemat Rp4.000)`
    };

    const contextMessages = [
      systemPrompt,
      ...session.history.slice(-8),
      { role: 'user', content: text }
    ];

    const chatCompletion = await callGroqWithFallback({
      messages: contextMessages,
      temperature: 0.65,
      max_tokens: 420,
    });

    const rawAiResponse = chatCompletion.choices[0]?.message?.content || 'Halo Kak! Ada yang bisa kami bantu seputar menu lezat JALA hari ini? 😊';
    const aiResponse = formatForWhatsApp(rawAiResponse);
    console.log(`🤖 AI Response: "${aiResponse.slice(0, 70)}..."`);
    await reply(aiResponse);
  } catch (error) {
    console.error('❌ Groq AI API Error:', error.message);
    const fallbackResponse = `Halo Kak! Maaf ya tadi sempat agak lambat sedikit. Ada yang bisa kami bantu seputar menu lezat Roti Kirai atau Es Telang JALA hari ini? Mau pesan atau tanya-tanya dulu Kak? 😊`;
    await reply(fallbackResponse);
  }
}

// 📞 Anti-spam debounce untuk panggilan telepon
const recentCallers = new Map();

// Tangani panggilan telepon / video call masuk di WhatsApp
client.on('call', async (call) => {
  const callerId = call.from;
  console.log(`\n📞 [PANGGILAN MASUK] dari: ${callerId} (Video: ${call.isVideo ? 'Ya' : 'Tidak'}, Group: ${call.isGroup ? 'Ya' : 'Tidak'})`);

  if (call.isGroup) return;

  // 1. Tolak panggilan secara santun otomatis (karena protokol bot WhatsApp Web tidak mendukung streaming audio telepon 2 arah)
  try {
    await call.reject();
    console.log(`✅ Panggilan dari ${callerId} berhasil ditolak otomatis.`);
  } catch (err) {
    console.warn(`⚠️ Catatan saat menolak panggilan:`, err.message);
  }

  // Cek agar tidak mengirim pesan ganda jika panggilan beruntun dalam 45 detik
  const now = Date.now();
  if (recentCallers.has(callerId) && (now - recentCallers.get(callerId) < 45000)) {
    return;
  }
  recentCallers.set(callerId, now);

  // 2. Kirim pesan edukatif dan ramah ke nomor penelpon
  try {
    const callNotice = `Halo Kak! 🙏 Terima kasih banyak sudah menghubungi *JALA Kuliner Melayu*.\n\n` +
      `Mohon maaf ya Kak, sistem WhatsApp bot otomatis *belum mendukung penerimaan panggilan telepon suara langsung*.\n\n` +
      `🎙️ *Namun Kakak Tetap Bisa Berbicara Lewat Voice Note (VN)!*\n` +
      `Silakan kirimkan rekaman suara/Voice Note sekarang apa yang ingin Kakak tanyakan atau pesan. AI kami sudah dilengkapi pendengaran otomatis dan akan langsung merespons ucapan Kakak!\n\n` +
      `Atau Kakak juga bisa langsung mengetik pesanan di sini ya. Terima kasih banyak Kak! 😊✨`;

    await client.sendMessage(callerId, callNotice);
    console.log(`📤 Pesan edukasi panggilan berhasil dikirim ke penelpon: ${callerId}`);
  } catch (sendErr) {
    console.error(`❌ Gagal mengirim pesan ke penelpon:`, sendErr.message);
  }
});

// Dengarkan pesan masuk
client.on('message', handleIncomingMessage);

// Dengarkan pesan dari nomor sendiri (untuk testing Note to Self)
client.on('message_create', (msg) => {
  if (msg.fromMe && isSelfTestChat(msg)) {
    handleIncomingMessage(msg);
  }
});

process.on('SIGINT', async () => {
  console.log('\nShutting down bot...');
  try { notificationServer.close(); } catch (_) {}
  await client.destroy();
  process.exit(0);
});

// Mulai bot
(async () => {
  console.log('🚀 Memulai WhatsApp Customer Service JALA...');
  await loadKnowledgeFromSupabase();
  client.initialize();
})();
