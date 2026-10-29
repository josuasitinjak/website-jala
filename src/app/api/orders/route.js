import { NextResponse } from 'next/server';

// Live orders: starts empty, populated by real web and WhatsApp orders
let localOrders = [];

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
      const oldStatus = order.status;
      order.status = status;
      order.updatedAt = new Date().toISOString();

      // Trigger notifikasi instan ke WhatsApp Bot (port 3005)
      fetch('http://localhost:3005/notify-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order,
          oldStatus,
          newStatus: status
        })
      }).catch(() => {
        // Abaikan jika bot sedang loading, polling bot akan menangkap perubahannya
      });

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
