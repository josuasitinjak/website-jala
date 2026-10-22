import { NextResponse } from 'next/server';

// Realistic initial orders for SMAN 1 Batam PKWU Project
let localOrders = [
  { 
    id: 'JALA-1001', 
    customerName: 'Bu Siti Rahayu, S.Pd', 
    address: 'Ruang Guru Lantai 2', 
    items: [
      { name: 'Paket Lengkap (Kari + Telang)', quantity: 2, price: 15000 }
    ], 
    total: 30000, 
    status: 'Selesai', 
    time: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas QRIS'
  },
  { 
    id: 'JALA-1002', 
    customerName: 'Rafi Ramadhan', 
    address: 'Kelas X - Hang Lekir 9', 
    items: [
      { name: 'Roti Kirai Berinti — Kari Kentang', quantity: 1, price: 12000 },
      { name: 'Roti Kirai Berinti — Keju', quantity: 1, price: 12000 }
    ], 
    total: 24000, 
    status: 'Selesai', 
    time: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    paymentMethod: 'COD',
    paymentStatus: 'Bayar di Tempat'
  },
  { 
    id: 'JALA-1003', 
    customerName: 'Daffa Pratama', 
    address: 'Kelas XI - MIPA 3', 
    items: [
      { name: 'Paket Berdua (8 pcs + 2 Es Telang)', quantity: 1, price: 30000 }
    ], 
    total: 30000, 
    status: 'Selesai', 
    time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas QRIS'
  },
  { 
    id: 'JALA-1004', 
    customerName: 'Aisyah Putri', 
    address: 'Kelas X - Hang Tuah 4', 
    items: [
      { name: 'Roti Kirai Berinti — Ayam Suwir', quantity: 1, price: 12000 },
      { name: 'Es Telang Lemonade', quantity: 1, price: 5000 }
    ], 
    total: 17000, 
    status: 'Selesai', 
    time: new Date(Date.now() - 1.8 * 3600 * 1000).toISOString(),
    paymentMethod: 'COD',
    paymentStatus: 'Bayar di Tempat'
  },
  { 
    id: 'JALA-1005', 
    customerName: 'Pak Hendra Kurniawan', 
    address: 'Ruang Tata Usaha (TU)', 
    items: [
      { name: 'Paket Puas (12 pcs + 2 Es Telang)', quantity: 1, price: 42000 }
    ], 
    total: 42000, 
    status: 'Selesai', 
    time: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas QRIS'
  },
  { 
    id: 'JALA-1006', 
    customerName: 'Kevin Sanjaya', 
    address: 'Kelas XII - IPS 1', 
    items: [
      { name: 'Paket Hemat (3 pcs)', quantity: 2, price: 10000 }
    ], 
    total: 20000, 
    status: 'Sedang Diantar', 
    time: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    paymentMethod: 'COD',
    paymentStatus: 'Bayar di Tempat'
  },
  { 
    id: 'JALA-1007', 
    customerName: 'Nabila Khairunnisa', 
    address: 'Kelas XI - Bahasa', 
    items: [
      { name: 'Roti Kirai Berinti — Keju', quantity: 1, price: 12000 },
      { name: 'Es Telang Lemonade', quantity: 2, price: 5000 }
    ], 
    total: 22000, 
    status: 'Sedang Diproses', 
    time: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas QRIS'
  },
  { 
    id: 'JALA-1008', 
    customerName: 'Bu Maya Wulandari, M.Pd', 
    address: 'Laboratorium Biologi', 
    items: [
      { name: 'Paket Lengkap (Kari + Telang)', quantity: 1, price: 15000 }
    ], 
    total: 15000, 
    status: 'Sedang Diproses', 
    time: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas QRIS'
  },
  { 
    id: 'JALA-1009', 
    customerName: 'Dimas Anggara', 
    address: 'Kelas X - Hang Lekir 2', 
    items: [
      { name: 'Roti Kirai Berinti — Ayam Suwir', quantity: 2, price: 12000 }
    ], 
    total: 24000, 
    status: 'Pesanan Diterima', 
    time: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    paymentMethod: 'COD',
    paymentStatus: 'Bayar di Tempat'
  },
  { 
    id: 'JALA-1010', 
    customerName: 'Zahra Amalia', 
    address: 'Perpustakaan Sekolah', 
    items: [
      { name: 'Paket Berdua (8 pcs + 2 Es Telang)', quantity: 1, price: 30000 }
    ], 
    total: 30000, 
    status: 'Pesanan Diterima', 
    time: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas QRIS'
  }
];

// Helper to make requests to Google Sheet Apps Script
async function fetchSheet(method, payload = null) {
  if (!process.env.SHEET_API_URL) return null;
  
  const options = {
    method: method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (payload) {
    options.body = JSON.stringify(payload);
  }
  
  try {
    const res = await fetch(process.env.SHEET_API_URL, options);
    return await res.json();
  } catch (error) {
    console.error("Google Sheet API error:", error);
    return null;
  }
}

export async function GET() {
  if (process.env.SHEET_API_URL) {
    const data = await fetchSheet('GET');
    if (data && data.orders) {
      // Return newest first
      return NextResponse.json({ orders: [...data.orders].reverse() });
    }
  }
  return NextResponse.json({ orders: [...localOrders].reverse() });
}

export async function POST(req) {
  try {
    const data = await req.json();
    const newOrder = {
      id: `JALA-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pesanan Diterima',
      time: new Date().toISOString(),
      ...data
    };
    
    if (process.env.SHEET_API_URL) {
      await fetchSheet('POST', { action: 'CREATE', order: newOrder });
    }
    
    localOrders.push(newOrder);

    // If voucher was used, inform vouchers endpoint to increment usage
    if (data.voucherCode) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vouchers`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: data.voucherCode, action: 'INCREMENT_USED' })
        });
      } catch (e) {
        // non-blocking
      }
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    return NextResponse.json({ error: "Gagal membuat pesanan" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, status } = await req.json();
    
    if (process.env.SHEET_API_URL) {
      await fetchSheet('POST', { action: 'UPDATE', id, status });
    }
    
    const order = localOrders.find(o => o.id === id);
    if (order) {
      order.status = status;
      return NextResponse.json({ success: true, order });
    }
    
    return NextResponse.json({ success: true }); // Return true even if not found in local memory when Sheet API is active
  } catch (error) {
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (process.env.SHEET_API_URL) {
      await fetchSheet('POST', { action: 'DELETE', id });
    }
    
    const currLen = localOrders.length;
    localOrders = localOrders.filter(o => o.id !== id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus pesanan" }, { status: 500 });
  }
}
