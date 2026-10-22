const Groq = require('groq-sdk');
require('dotenv').config({ path: '.env.local' });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function check() {
  const text = 'Saya mau pesan roti jala berinti kentang kari 1, josua sitinjak, perumahan taman lestari';
  const draft = { items: [], customerName: null, address: null, paymentMethod: 'COD', total: 0 };
  const history = [
    { role: 'user', content: 'Halo' },
    { role: 'assistant', content: 'Halo Kak! Selamat datang di JALA...' },
    { role: 'user', content: 'Mau pesan langsung via wa' },
    { role: 'assistant', content: '🛍️ PANDUAN PEMESANAN LANGSUNG VIA WHATSAPP...' }
  ];

  const parseCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `Kamu adalah asisten kasir pintar JALA. Tugasmu mengumpulkan dan memperbarui data pesanan pelanggan.
Draft pesanan yang sudah terkumpul sejauh ini:
${JSON.stringify(draft)}

Riwayat percakapan sebelumnya:
${history.map(h => `${h.role}: ${h.content}`).join('\n')}

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
  console.log('PARSED RESULT:', JSON.stringify(parsed, null, 2));
}
check().catch(console.error);
