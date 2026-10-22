import { NextResponse } from 'next/server';

// Server-side in-memory store with default fallback
let localSettings = {
  storeOpen: true,
  storeName: 'JALA — Contemporary Malay Heritage Culinary',
  tagline: 'Warisan Melayu Kepri, Sentuhan Modern Praktis',
  schoolLocation: 'SMAN 1 Batam, Jl. Kolonel Soegiono, Batam Kota',
  deliveryCoverage: 'Seluruh Ruang Kelas, Lab, Ruang Guru & Area Sekolah SMAN 1 Batam',
  kitchenHours: '07.30 - 15.30 WIB (Hari Efektif Sekolah)',
  whatsappContact: '08217601738',
  dailyTargets: {
    kariQuota: 15,
    ayamQuota: 15,
    kejuQuota: 15,
    telangQuota: 20,
    dailyRevenueTarget: 300000
  },
  qrisPayment: {
    isActive: true,
    qrisHolder: 'JALA PKWU SMAN 1 BATAM',
    qrisNmid: 'ID1020260012349',
    qrisImage: '/images/assets/qris.png'
  }
};

export async function GET() {
  return NextResponse.json(localSettings);
}

export async function POST(req) {
  try {
    const data = await req.json();
    localSettings = { ...localSettings, ...data };
    return NextResponse.json({ success: true, settings: localSettings });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memperbarui pengaturan' }, { status: 500 });
  }
}
