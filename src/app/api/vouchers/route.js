import { NextResponse } from 'next/server';

let localVouchers = [
  { id: 'VOUCH-01', code: 'JALAHEMAT2', discountType: 'Nominal', discountVal: 2000, minOrder: 15000, quota: 30, used: 12, validUntil: '2026-12-31', isActive: true, note: 'Potongan Rp2.000 untuk pembelian bundling' },
  { id: 'VOUCH-02', code: 'JALAGURU10', discountType: 'Persen', discountVal: 10, minOrder: 25000, quota: 20, used: 8, validUntil: '2026-12-31', isActive: true, note: 'Khusus bapak/ibu guru & staf TU SMAN 1 Batam' },
  { id: 'VOUCH-03', code: 'JALABERDUA5K', discountType: 'Nominal', discountVal: 5000, minOrder: 30000, quota: 25, used: 11, validUntil: '2026-12-31', isActive: true, note: 'Promo makan berdua bareng bestie' }
];

export async function GET() {
  return NextResponse.json({ vouchers: localVouchers });
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Check if validating a voucher
    if (body.action === 'VALIDATE') {
      const { code, cartTotal } = body;
      const cleanCode = (code || '').trim().toUpperCase();
      const voucher = localVouchers.find(v => v.code.toUpperCase() === cleanCode);

      if (!voucher) {
        return NextResponse.json({ valid: false, message: 'Kode voucher tidak ditemukan.' });
      }
      if (!voucher.isActive) {
        return NextResponse.json({ valid: false, message: 'Voucher sedang tidak aktif.' });
      }
      if (voucher.quota && voucher.used >= voucher.quota) {
        return NextResponse.json({ valid: false, message: 'Kuota voucher telah habis terpakai.' });
      }
      if (voucher.validUntil && new Date(voucher.validUntil) < new Date(new Date().toDateString())) {
        return NextResponse.json({ valid: false, message: 'Voucher telah melewati masa berlaku.' });
      }
      if (cartTotal < (voucher.minOrder || 0)) {
        return NextResponse.json({
          valid: false,
          message: `Minimal belanja Rp${(voucher.minOrder || 0).toLocaleString('id-ID')} untuk menggunakan voucher ini.`
        });
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (voucher.discountType === 'Persen') {
        discountAmount = Math.round((cartTotal * voucher.discountVal) / 100);
      } else {
        discountAmount = voucher.discountVal;
      }
      discountAmount = Math.min(discountAmount, cartTotal);

      return NextResponse.json({
        valid: true,
        voucher,
        discountAmount,
        message: `Voucher ${voucher.code} berhasil diterapkan! Hemat Rp${discountAmount.toLocaleString('id-ID')}`
      });
    }

    // Creating a new voucher
    const newVoucher = {
      id: `VOUCH-${Math.floor(10 + Math.random() * 90)}`,
      quota: 20,
      used: 0,
      isActive: true,
      ...body
    };
    localVouchers.unshift(newVoucher);
    return NextResponse.json({ success: true, voucher: newVoucher });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memproses voucher' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, code, action, isActive } = await req.json();
    const voucher = localVouchers.find(v => v.id === id || (code && v.code.toUpperCase() === code.toUpperCase()));
    
    if (!voucher) {
      return NextResponse.json({ error: 'Voucher tidak ditemukan' }, { status: 404 });
    }

    if (action === 'INCREMENT_USED') {
      voucher.used = (voucher.used || 0) + 1;
    } else if (typeof isActive === 'boolean') {
      voucher.isActive = isActive;
    }

    return NextResponse.json({ success: true, voucher });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memperbarui voucher' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    localVouchers = localVouchers.filter(v => v.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal menghapus voucher' }, { status: 500 });
  }
}
