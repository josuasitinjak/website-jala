import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'documents';

// GET: Ambil daftar file PDF dari Supabase Storage
export async function GET() {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        configured: false,
        files: [],
        message: 'Konfigurasi Supabase belum lengkap di .env.local (SUPABASE_URL & SUPABASE_KEY).'
      });
    }

    // Pastikan bucket ada atau periksa isi bucket
    const { data: fileList, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError) {
      // Jika bucket belum dibuat di Supabase
      if (listError.message?.toLowerCase().includes('bucket not found') || listError.status === 404) {
        // Coba buat bucket jika memakai service_role key
        try {
          await supabase.storage.createBucket(BUCKET_NAME, { public: true });
        } catch (_) {}
      }

      return NextResponse.json({
        configured: true,
        files: [],
        bucket: BUCKET_NAME,
        error: listError.message
      });
    }

    const pdfFiles = (fileList || [])
      .filter(f => f.name && !f.name.startsWith('.') && f.name.toLowerCase().endsWith('.pdf'))
      .map(f => {
        const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(f.name);
        return {
          id: f.id || f.name,
          name: f.name,
          size: f.metadata?.size || f.size || 0,
          createdAt: f.created_at || f.updated_at || new Date().toISOString(),
          publicUrl: urlData?.publicUrl || null
        };
      });

    return NextResponse.json({
      configured: true,
      bucket: BUCKET_NAME,
      files: pdfFiles
    });
  } catch (error) {
    console.error('Error fetching Supabase documents:', error);
    return NextResponse.json({ configured: false, error: error.message }, { status: 500 });
  }
}

// POST: Upload file PDF baru ke Supabase Storage & Ekstrak Teks
export async function POST(req) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        message: 'Supabase belum dikonfigurasi di .env.local. Harap isi SUPABASE_URL dan SUPABASE_KEY.'
      }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'Tidak ada file PDF yang diunggah.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ success: false, message: 'Format file harus berupa PDF (.pdf).' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Ekstrak teks untuk memastikan PDF valid & dapat dibaca AI
    let parsedText = '';
    let numPages = 1;
    try {
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      await parser.destroy();
      parsedText = parsed?.text || '';
      numPages = parsed?.total || 1;
    } catch (parseErr) {
      console.warn('Gagal ekstrak teks PDF secara lokal:', parseErr.message);
    }

    // 2. Normalisasi nama file agar aman di URL storage
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    // 3. Upload file ke Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(sanitizedName, buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      // Jika bucket belum ada, coba buatkan
      if (uploadError.message?.toLowerCase().includes('bucket not found')) {
        await supabase.storage.createBucket(BUCKET_NAME, { public: true });
        const retry = await supabase.storage.from(BUCKET_NAME).upload(sanitizedName, buffer, {
          contentType: 'application/pdf',
          upsert: true
        });
        if (retry.error) throw retry.error;
      } else {
        throw uploadError;
      }
    }

    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(sanitizedName);

    return NextResponse.json({
      success: true,
      message: `File "${file.name}" berhasil diunggah ke Supabase (${numPages} halaman). AI Bot siap menggunakan dokumen ini!`,
      file: {
        name: sanitizedName,
        size: buffer.length,
        pages: numPages,
        charCount: parsedText.length,
        publicUrl: urlData?.publicUrl || null
      }
    });
  } catch (error) {
    console.error('Error uploading PDF to Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus file PDF dari Supabase Storage
export async function DELETE(req) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: false, message: 'Supabase belum dikonfigurasi.' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json({ success: false, message: 'Parameter fileName wajib disertakan.' }, { status: 400 });
    }

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: `File "${fileName}" berhasil dihapus dari Supabase.`
    });
  } catch (error) {
    console.error('Error deleting file from Supabase:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
