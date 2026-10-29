import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';
import Groq from 'groq-sdk';

export const dynamic = 'force-dynamic';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Cache teks PDF Supabase agar response cepat
let cachedPdfKnowledge = '';
let lastFetchTime = 0;

async function getSupabasePdfKnowledge(forceRefresh = false) {
  const now = Date.now();
  // Cache valid selama 5 menit kecuali diminta forceRefresh
  if (!forceRefresh && cachedPdfKnowledge && (now - lastFetchTime < 5 * 60 * 1000)) {
    return cachedPdfKnowledge;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'documents';

  if (!supabaseUrl || !supabaseKey) {
    return cachedPdfKnowledge || '';
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: fileList, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });

    if (listError || !fileList) return cachedPdfKnowledge || '';

    const pdfFiles = fileList.filter(f => f.name && f.name.toLowerCase().endsWith('.pdf'));
    let combined = '';

    for (const f of pdfFiles) {
      try {
        const { data: blob, error: downloadError } = await supabase.storage
          .from(bucketName)
          .download(f.name);

        if (!downloadError && blob) {
          const arrayBuffer = await blob.arrayBuffer();
          const parser = new PDFParse({ data: Buffer.from(arrayBuffer) });
          const parsed = await parser.getText();
          await parser.destroy();
          if (parsed?.text) {
            combined += `\n\n--- DOKUMEN SUPABASE: ${f.name} (${parsed.total || 1} hal) ---\n${parsed.text.trim()}\n`;
          }
        }
      } catch (err) {
        console.warn(`Error reading PDF ${f.name}:`, err.message);
      }
    }

    if (combined) {
      cachedPdfKnowledge = combined.trim();
      lastFetchTime = now;
    }
    return cachedPdfKnowledge;
  } catch (e) {
    console.error('Error fetching Supabase PDF knowledge:', e);
    return cachedPdfKnowledge || '';
  }
}

export async function POST(req) {
  try {
    const { messages, mode, context, refreshKnowledge } = await req.json();

    const pdfKnowledge = await getSupabasePdfKnowledge(!!refreshKnowledge);

    let systemContent = '';
    const isBotMode = mode === 'bot' || mode === 'document_ai';

    if (isBotMode) {
      // Admin Live Chat dengan AI Bot (Grounding Dokumen PDF Supabase)
      systemContent = `Kamu adalah AI Assistant & Customer Service resmi dari "JALA", brand Contemporary Malay Heritage Culinary (projek PKWU siswa SMAN 1 Batam, Kelas XI Hang Jebat 5).
Saat ini kamu sedang diuji dan diajak berdiskusi langsung oleh Admin/Pengelola di dalam Admin Dashboard Website.

${pdfKnowledge ? `SUMBER PENGETAHUAN DARI DOKUMEN PDF DATABASE SUPABASE:
${pdfKnowledge}
` : '(Catatan: Belum ada file PDF yang dimuat dari Supabase. Jawablah sesuai konteks menu dan bisnis JALA).' }

PANDUAN MENJAWAB:
1. Jika pertanyaan berkaitan dengan isi dokumen PDF di atas, jelaskan secara akurat, terstruktur, dan jelas.
2. Nada bicara: Ramah, profesional, cerdas, santun, dan solutif (panggil "Kak" / "Admin").
3. Berikan jawaban yang rapi dengan poin/bullet jika menjelaskan beberapa hal.
4. Kamu siap membantu menjawab informasi produk, HPP, resep, strategi bisnis, SOP, atau pertanyaan pelanggan.`;
    } else if (mode === 'admin') {
      // Mode Konsultasi Bisnis Internal PKWU
      systemContent = `Kamu adalah Senior Culinary Business & Enterprise Advisor terpercaya untuk brand Contemporary Malay Heritage Culinary "JALA" (Projek PKWU Siswa SMAN 1 Batam, Kelas XI Hang Jebat 5).
Kamu sedang berbicara langsung dengan Josua Sitinjak (CEO) dan jajaran pengurus (Gabriel/COO, Haura/CPCO, Letty/CMCO).

${pdfKnowledge ? `DOKUMEN PENDUKUNG DARI DATABASE:
${pdfKnowledge.slice(0, 3000)}
` : ''}

INFORMASI BISNIS JALA:
- Produk Inti: Roti Kirai Berinti (Kari Kentang Rp12.000 / HPP Rp6.500, Ayam Suwir Rp12.000 / HPP Rp7.200, Keju Rp12.000 / HPP Rp7.000) dan Es Telang Lemonade (Rp5.000 / HPP Rp2.300).
- Bundling: Paket Hemat (Rp10.000), Paket Lengkap (Rp15.000), Paket Berdua (Rp30.000), Paket Puas (Rp42.000).
- Margin Kotor rata-rata: 40% - 54%.
- Target pasar: Siswa, guru, dan staf TU SMAN 1 Batam, bazaar sekolah, serta pemesanan pre-order.

SNAPSHOT STATUS OPERASIONAL:
- Total Omzet: ${context?.totalRevenue ? 'Rp' + Number(context.totalRevenue).toLocaleString('id-ID') : 'Rp234.000'}
- Total Pesanan Masuk: ${context?.totalOrders || '10'} pesanan
- Stok Kritis: ${context?.criticalStock || 'Aman'}
- Paling Laris: ${context?.topItems || 'Paket Lengkap, Roti Kirai Ayam Suwir'}

Berikan rekomendasi bisnis tajam, solutif, realistis, dan berbobot akademis/kewirausahaan.`;
    } else {
      // Mode Customer Service Publik
      systemContent = `Kamu adalah AI Customer Service resmi dari "JALA" (Contemporary Malay Heritage Culinary, Siswa SMAN 1 Batam).
${pdfKnowledge ? `DOKUMEN KNOWLEDGE BASE:
${pdfKnowledge.slice(0, 4000)}
` : ''}
Tagline: "Warisan Melayu Kepri, Sentuhan Modern Praktis". Jawab ramah, santun, netral, dan universal. JANGAN menggunakan istilah keagamaan (seperti Alhamdulillah, Bismillah, Assalamualaikum, dll).`;
    }

    // 1. Gunakan Groq AI sebagai mesin utama (Respon super cepat, luwes, interaktif)
    const apiMessages = [
      { role: 'system', content: systemContent },
      ...messages.map(msg => ({
        role: msg.sender === 'ai' || msg.sender === 'assistant' ? 'assistant' : 'user',
        content: msg.text
      }))
    ];

    const models = ['openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
    let chatCompletion = null;
    let lastErr = null;

    if (process.env.GROQ_API_KEY) {
      for (const model of models) {
        try {
          chatCompletion = await groq.chat.completions.create({
            messages: apiMessages,
            model,
            temperature: isBotMode ? 0.65 : (mode === 'admin' ? 0.7 : 0.6),
            max_tokens: 500,
          });
          if (chatCompletion?.choices?.[0]?.message?.content) break;
        } catch (err) {
          lastErr = err;
        }
      }
    }

    if (chatCompletion?.choices?.[0]?.message?.content) {
      return NextResponse.json({
        response: chatCompletion.choices[0].message.content,
        engine: 'Groq AI (Ultra Fast & Interactive)',
        hasPdfKnowledge: !!pdfKnowledge
      });
    }

    // 2. Cadangan Google Gemini AI jika Groq bermasalah
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: geminiModel,
          systemInstruction: { parts: [{ text: systemContent }] }
        });

        const geminiHistory = (messages || []).slice(0, -1).map(m => ({
          role: m.sender === 'ai' || m.sender === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }));

        const lastUserMessage = messages[messages.length - 1]?.text || 'Halo';
        const chat = model.startChat({ history: geminiHistory.slice(-8) });
        const result = await chat.sendMessage(lastUserMessage);
        const aiResponse = result.response.text();

        return NextResponse.json({
          response: aiResponse,
          engine: `Google Gemini (${geminiModel})`,
          hasPdfKnowledge: !!pdfKnowledge
        });
      } catch (geminiError) {
        console.warn('Gemini fallback error:', geminiError.message);
      }
    }

    if (!chatCompletion && lastErr) throw lastErr;

    return NextResponse.json({
      response: 'Halo! Ada yang bisa kami bantu seputar menu lezat JALA hari ini? Silakan pilih varian Roti Kirai favorit Kakak di katalog atau tanyakan seputar pemesanan! 😊',
      engine: 'Groq AI (High Performance)'
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      response: 'Halo! Mohon maaf, koneksi AI sedang sibuk. Silakan tanyakan kembali beberapa saat lagi ya. 🙏',
      error: error.message
    });
  }
}
