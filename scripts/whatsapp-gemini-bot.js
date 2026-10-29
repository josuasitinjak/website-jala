/**
 * WhatsApp Bot Otomatis dengan AI Gemini & Knowledge Base PDF dari Supabase
 *
 * Fitur:
 * 1. Menghubungkan ke Supabase (Storage Bucket / Table) untuk mengunduh file PDF yang sudah di-upload.
 * 2. Mengekstrak teks dari seluruh file PDF menggunakan pdf-parse.
 * 3. Menghubungkan ke Google Gemini AI (gemini-1.5-flash / gemini-2.0-flash) dengan konteks PDF sebagai sumber pengetahuan (Grounding).
 * 4. WhatsApp Web bot (whatsapp-web.js) otomatis merespon pertanyaan user secara interaktif dan cerdas.
 * 5. Formatting khusus WhatsApp (teks rapi, bullet point, emoji, tebal satu bintang).
 * 6. Multi-turn conversation memory (ingat konteks percakapan tiap user).
 * 7. Perintah admin: ketik "!sync" atau "!reload" di WhatsApp untuk memperbarui data PDF dari Supabase secara real-time.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const pdfParse = require('pdf-parse');
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
      console.log(`✅ Berhasil memuat konfigurasi environment dari ${envFile}`);
      envLoaded = true;
      break;
    } catch (e) {
      console.warn(`⚠️ Gagal mem-parse ${envFile}:`, e.message);
    }
  }
}

if (!envLoaded) {
  console.log('⚠️ File .env.local tidak ditemukan. Pastikan variabel sistem sudah diatur.');
}

// Konfigurasi Kunci & API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'documents';
const SUPABASE_PDF_FILENAME = process.env.SUPABASE_PDF_FILENAME || ''; // kosongkan jika ingin baca semua PDF di bucket

// Inisialisasi Google Gemini AI
let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log(`🤖 Google Gemini AI terkonfigurasi (Model: ${GEMINI_MODEL})`);
} else {
  console.warn('⚠️ GEMINI_API_KEY belum diisi di .env.local! Bot tidak dapat memanggil AI sebelum API Key diisi.');
}

// Inisialisasi Supabase Client
let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log(`🗄️ Supabase Client terhubung ke: ${SUPABASE_URL}`);
} else {
  console.warn('⚠️ SUPABASE_URL atau SUPABASE_KEY belum diisi di .env.local!');
}

// Memory Pengetahuan PDF dari Supabase
let pdfKnowledgeBase = '';
let loadedFilesList = [];

/**
 * Mengunduh dan mengekstrak teks dari file PDF yang ada di Supabase
 */
async function loadKnowledgeFromSupabase() {
  if (!supabase) {
    console.warn('⚠️ Supabase belum diinisialisasi. Melewati pengambilan PDF.');
    return;
  }

  console.log('\n📥 Memulai sinkronisasi file PDF dari Supabase...');
  let combinedText = '';
  const loadedFiles = [];

  try {
    // 1. Coba ambil dari Supabase Storage Bucket
    console.log(`🔍 Memeriksa Storage Bucket: "${SUPABASE_STORAGE_BUCKET}"...`);
    const { data: fileList, error: listError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } });

    if (listError) {
      console.warn(`⚠️ Catatan Bucket Storage "${SUPABASE_STORAGE_BUCKET}": ${listError.message}`);
    } else if (fileList && fileList.length > 0) {
      // Filter hanya file PDF
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
          console.log(`⬇️ Mengunduh file "${file.name}" dari Supabase Storage...`);
          const { data: blob, error: downloadError } = await supabase.storage
            .from(SUPABASE_STORAGE_BUCKET)
            .download(file.name);

          if (downloadError) {
            console.error(`❌ Gagal mengunduh ${file.name}:`, downloadError.message);
            continue;
          }

          const arrayBuffer = await blob.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const parsedPdf = await pdfParse(buffer);

          const cleanText = parsedPdf.text ? parsedPdf.text.trim() : '';
          if (cleanText.length > 0) {
            combinedText += `\n\n--- DOKUMEN: ${file.name} (Halaman: ${parsedPdf.numpages}) ---\n${cleanText}\n`;
            loadedFiles.push({ name: file.name, pages: parsedPdf.numpages, charCount: cleanText.length });
            console.log(`✅ Berhasil mengekstrak ${file.name} (${parsedPdf.numpages} halaman, ${cleanText.length} karakter)`);
          }
        } catch (pdfErr) {
          console.error(`❌ Gagal membaca PDF ${file.name}:`, pdfErr.message);
        }
      }
    }

    // 2. Jika tidak ada file di storage atau pengguna menyimpan link/isi di Database Table
    if (combinedText.length === 0) {
      console.log('ℹ️ Mencoba memeriksa tabel database Supabase (jika ada data PDF/dokumen)...');
      const tableNames = ['documents', 'knowledge_base', 'pdf_documents', 'files'];
      for (const table of tableNames) {
        try {
          const { data: rows, error: tableErr } = await supabase
            .from(table)
            .select('*')
            .limit(20);

          if (!tableErr && rows && rows.length > 0) {
            console.log(`📄 Ditemukan data di tabel "${table}" (${rows.length} baris)`);
            for (const row of rows) {
              // Jika tabel memiliki konten teks langsung
              const textContent = row.content || row.text || row.extracted_text || row.description;
              const fileName = row.file_name || row.filename || row.title || `Row-${row.id}`;
              
              if (textContent && typeof textContent === 'string' && textContent.length > 30) {
                combinedText += `\n\n--- DOKUMEN TABEL: ${fileName} ---\n${textContent.trim()}\n`;
                loadedFiles.push({ name: fileName, pages: 1, charCount: textContent.length });
              } else if (row.file_url || row.url) {
                // Jika menyimpan URL download file PDF
                const fileUrl = row.file_url || row.url;
                console.log(`⬇️ Mengunduh PDF dari URL tabel: ${fileUrl}`);
                const response = await fetch(fileUrl);
                const arrayBuffer = await response.arrayBuffer();
                const parsed = await pdfParse(Buffer.from(arrayBuffer));
                if (parsed.text) {
                  combinedText += `\n\n--- DOKUMEN: ${fileName} ---\n${parsed.text.trim()}\n`;
                  loadedFiles.push({ name: fileName, pages: parsed.numpages, charCount: parsed.text.length });
                }
              }
            }
            if (combinedText.length > 0) break;
          }
        } catch (e) {
          // Lewati tabel jika tidak ada
        }
      }
    }

    if (combinedText.trim().length > 0) {
      pdfKnowledgeBase = combinedText.trim();
      loadedFilesList = loadedFiles;
      console.log(`🎉 Total Pengetahuan PDF Terbaca: ${loadedFiles.length} file, ${pdfKnowledgeBase.length} karakter siap digunakan oleh AI Gemini!\n`);
    } else {
      console.warn('⚠️ Belum ada teks PDF yang berhasil diekstrak dari Supabase.');
      console.warn('💡 Saran: Pastikan Anda sudah membuat bucket (misal: "documents") di Supabase Storage dan mengupload file .pdf ke dalamnya.');
    }
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat memuat data dari Supabase:', err.message);
  }
}

// Format jawaban Gemini agar tampil rapi dan estetik di WhatsApp
function formatForWhatsApp(text) {
  if (!text) return '';
  let formatted = text;

  // 1. Ubah format tabel Markdown (| ... |) menjadi daftar rapi untuk tampilan HP
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

  // 2. Format judul Markdown (### Judul) jadi 📌 *Judul*
  formatted = formatted.replace(/^#{1,4}\s+(.+)$/gm, '📌 *$1*');

  // 3. Format markdown bold (**tebal** -> *tebal* khas WhatsApp)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '*$1*');

  // 4. Format link [Teks](URL) -> Teks (URL)
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');

  // 5. Garis pembatas estetik
  formatted = formatted.replace(/^[\-_*]{3,}$/gm, '──────────────');

  // 6. Rapikan baris kosong berlebih
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  return formatted.trim();
}

// Memory sesi percakapan per pengguna (Multi-turn chat)
const userSessions = new Map();
function getSession(senderId) {
  if (!userSessions.has(senderId)) {
    userSessions.set(senderId, {
      history: [], // [{ role: 'user' | 'model', parts: [{ text }] }]
      lastActive: Date.now()
    });
  }
  const session = userSessions.get(senderId);
  session.lastActive = Date.now();
  return session;
}

// Bersihkan memori sesi yang sudah tidak aktif lebih dari 3 jam
setInterval(() => {
  const now = Date.now();
  for (const [id, sess] of userSessions.entries()) {
    if (now - sess.lastActive > 3 * 60 * 60 * 1000) {
      userSessions.delete(id);
    }
  }
}, 30 * 60 * 1000);

/**
 * Panggil AI Gemini dengan Grounding Dokumen PDF
 */
async function askGemini(promptText, senderId) {
  if (!genAI) {
    return 'Halo! Mohon maaf, AI Gemini saat ini belum dapat dihubungi karena API Key belum dikonfigurasikan di sistem server.';
  }

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: {
      parts: [
        {
          text: `Kamu adalah Asisten Cerdas WhatsApp yang bertugas menjawab pertanyaan pengguna secara ramah, sopan, akurat, dan jelas.

SUMBER INFORMASI UTAMA (GROUNDING KNOWLEDGE BASE DARI DOKUMEN PDF DATABASE SUPABASE):
${pdfKnowledgeBase ? pdfKnowledgeBase : '(Catatan: Belum ada dokumen PDF yang dimuat dari Supabase. Jawablah sesuai pengetahuan umum dengan ramah dan beri tahu user bila ada informasi spesifik yang belum tersedia).'}

ATURAN MENJAWAB:
1. Prioritaskan dan gunakan informasi yang ada di dalam DOKUMEN PDF di atas untuk menjawab pertanyaan pengguna.
2. Jawab dengan gaya bahasa yang ramah, sopan, solutif, dan profesional (gunakan sapaan ramah seperti "Halo Kak! 😊").
3. Format teks menggunakan aturan WhatsApp:
   - Gunakan SATU bintang (*tebal*) untuk teks tebal. JANGAN gunakan dua bintang (**teks**).
   - Gunakan bullet point atau emoji estetik (📌, ▫️, ✨, 💡, 📞, dsb) agar mudah dibaca di layar HP.
   - JANGAN membuat format tabel Markdown baris pipa (|), buatlah list per baris.
4. Jika informasi yang ditanyakan pengguna sama sekali tidak terdapat di dalam dokumen PDF maupun konteks yang diberikan, jelaskan dengan santun bahwa informasi tersebut belum tercantum di dalam dokumen resmi, dan tawarkan bantuan lain yang terkait.`
        }
      ]
    }
  });

  const session = getSession(senderId);

  // Buat sesi chat multi-turn
  const chat = model.startChat({
    history: session.history.slice(-8) // Pertahankan 8 percakapan terakhir
  });

  const result = await chat.sendMessage(promptText);
  const responseText = result.response.text();

  // Simpan ke riwayat sesi
  session.history.push({ role: 'user', parts: [{ text: promptText }] });
  session.history.push({ role: 'model', parts: [{ text: responseText }] });

  if (session.history.length > 16) {
    session.history = session.history.slice(-16);
  }

  return responseText;
}

// Inisialisasi WhatsApp Web Client
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.join(process.cwd(), '.wwebjs_auth') // Menyimpan sesi login WhatsApp agar tidak perlu scan ulang setiap saat
  }),
  puppeteer: {
    handleSIGINT: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

const botSentMessageIds = new Set();
const processedMessageIds = new Set();

// Kirim balasan dengan fallback aman
async function safeSend(msg, text) {
  const formattedText = formatForWhatsApp(text);
  const targetChatId = msg.id?.remote || msg.from;

  try {
    const sent = await client.sendMessage(targetChatId, formattedText);
    if (sent?.id?._serialized) botSentMessageIds.add(sent.id._serialized);
    console.log(`✅ Pesan terkirim ke ${targetChatId}`);
    return;
  } catch (err1) {
    try {
      const sent = await msg.reply(formattedText);
      if (sent?.id?._serialized) botSentMessageIds.add(sent.id._serialized);
      console.log('✅ Pesan terkirim via msg.reply()');
      return;
    } catch (err2) {
      console.error('❌ Gagal mengirim pesan ke WhatsApp:', err2.message);
    }
  }
}

// Event handler saat QR Code muncul
client.on('qr', (qr) => {
  console.log('\n======================================================');
  console.log('📱 SCAN QR CODE BERIKUT DENGAN APLIKASI WHATSAPP ANDA:');
  console.log('======================================================\n');
  qrcode.generate(qr, { small: true });
  console.log('\n(Buka WhatsApp di HP > Perangkat Tertaut / Linked Devices > Tautkan Perangkat)\n');
});

client.on('loading_screen', (percent, message) => {
  console.log(`⏳ Memuat WhatsApp Web: ${percent}% - ${message || 'Sinkronisasi'}`);
});

client.on('authenticated', () => {
  console.log('🔑 Terotentikasi! Sesi WhatsApp berhasil terhubung.');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Gagal otentikasi WhatsApp:', msg);
});

client.on('ready', async () => {
  console.log('\n======================================================');
  console.log('🚀 WHATSAPP BOT GEMINI + SUPABASE TELAH AKTIF & SIAP!');
  console.log('======================================================');
  console.log(`🤖 Model AI : ${GEMINI_MODEL}`);
  console.log(`🗄️ Supabase : ${SUPABASE_URL || 'Belum diatur'}`);
  console.log(`📄 Dokumen  : ${loadedFilesList.length} PDF termuat (${pdfKnowledgeBase.length} karakter)`);
  console.log('======================================================\n');
});

// Penanganan Pesan Masuk
client.on('message_create', async (msg) => {
  // Abaikan broadcast status dan pesan grup jika ingin bot fokus di private chat
  if (msg.from && (msg.from.includes('status@broadcast') || msg.from === 'status@broadcast')) return;

  const msgId = msg.id?._serialized;
  if (msgId) {
    if (processedMessageIds.has(msgId)) return;
    processedMessageIds.add(msgId);
    if (processedMessageIds.size > 2000) {
      const first = processedMessageIds.values().next().value;
      processedMessageIds.delete(first);
    }
  }

  // Jika pesan dari akun bot sendiri (fromMe)
  if (msg.fromMe) {
    if (botSentMessageIds.has(msgId)) return;
    // Hanya proses jika bot owner mengirim pesan ke nomornya sendiri untuk testing
    const myUser = client.info?.wid?.user;
    const toUser = (msg.to || '').split('@')[0].split(':')[0];
    const fromUser = (msg.from || '').split('@')[0].split(':')[0];
    const isSelfTest = myUser && toUser === myUser && (fromUser === myUser || msg.from?.includes(myUser));
    if (!isSelfTest) return;
  }

  const text = msg.body?.trim();
  if (!text) return;

  console.log(`\n💬 [Pesan Masuk] dari ${msg.from}: "${text}"`);

  // Fitur Admin: Sinkronisasi Ulang PDF dari Supabase secara langsung tanpa restart bot
  const lowerText = text.toLowerCase().trim();
  if (lowerText === '!sync' || lowerText === '!reload' || lowerText === '!updatesupabase') {
    await safeSend(msg, '⏳ Sedang mengunduh dan menyinkronkan ulang file PDF dari Supabase... Mohon tunggu sebentar.');
    await loadKnowledgeFromSupabase();
    const syncStatus = `✅ *Sinkronisasi Supabase Selesai!*\n\n📄 *Total Dokumen:* ${loadedFilesList.length} file PDF\n${loadedFilesList.map((f, i) => `${i + 1}. *${f.name}* (${f.pages} hal)`).join('\n') || 'Tidak ada file'}\n📊 *Total Karakter Pengetahuan:* ${pdfKnowledgeBase.length}\n\nSekarang AI Gemini telah siap menjawab dengan data terbaru! ✨`;
    await safeSend(msg, syncStatus);
    return;
  }

  if (lowerText === '!status' || lowerText === '!info') {
    const statusText = `ℹ️ *STATUS WHATSAPP BOT GEMINI + SUPABASE*\n\n🤖 *Model AI:* ${GEMINI_MODEL}\n🗄️ *Supabase Storage:* ${SUPABASE_STORAGE_BUCKET}\n📄 *Dokumen Terbaca:* ${loadedFilesList.length} file PDF\n${loadedFilesList.map((f, i) => `▫️ ${f.name} (${f.pages} hal)`).join('\n') || '▫️ Belum ada file'}\n\n_Ketik *!sync* untuk memperbarui file PDF dari Supabase._`;
    await safeSend(msg, statusText);
    return;
  }

  // Respon otomatis menggunakan AI Gemini + Grounding Dokumen PDF
  try {
    console.log(`🤖 Mengirim pertanyaan ke Gemini AI (Model: ${GEMINI_MODEL})...`);
    const aiResponse = await askGemini(text, msg.from);
    console.log(`✨ Jawaban Gemini berhasil diperoleh (${aiResponse.length} karakter).`);
    await safeSend(msg, aiResponse);
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat memproses jawaban AI Gemini:', error.message);
    await safeSend(
      msg,
      'Halo Kak! Mohon maaf, saat ini sistem AI kami sedang mengalami sedikit kendala koneksi. Silakan coba tanyakan kembali beberapa saat lagi ya! 🙏'
    );
  }
});

// Menangani penutupan aplikasi dengan aman
process.on('SIGINT', async () => {
  console.log('\n🛑 Menghentikan WhatsApp bot...');
  await client.destroy();
  process.exit(0);
});

// Jalankan Bot: Muat PDF dari Supabase terlebih dahulu, lalu inisialisasi WhatsApp
(async () => {
  console.log('🚀 Memulai inisialisasi WhatsApp Bot Gemini + Supabase...');
  await loadKnowledgeFromSupabase();
  client.initialize();
})();
