import { NextResponse } from 'next/server';

let localProducts = [
  {
    id: 'PROD-01',
    productId: 1,
    name: 'Roti Kirai Berinti Kari Kentang',
    category: 'Menu Satuan',
    price: 12000,
    hpp: 6500,
    portion: 'Porsi (4 pcs)',
    stock: 15,
    isAvailable: true,
    description: 'Isian kentang dadu bumbu kari Melayu meresap, dibungkus jala kunyit lembut.'
  },
  {
    id: 'PROD-02',
    productId: 2,
    name: 'Roti Kirai Berinti Ayam Suwir',
    category: 'Menu Satuan',
    price: 12000,
    hpp: 7200,
    portion: 'Porsi (4 pcs)',
    stock: 15,
    isAvailable: true,
    description: 'Suwiran daging ayam berbumbu rempah gurih manis yang dimasak kering dan padat.'
  },
  {
    id: 'PROD-03',
    productId: 3,
    name: 'Roti Kirai Berinti Keju',
    category: 'Menu Satuan',
    price: 12000,
    hpp: 7000,
    portion: 'Porsi (4 pcs)',
    stock: 15,
    isAvailable: true,
    description: 'Keju leleh gurih dan creamy yang lumer di mulut. Camilan modern favorit.'
  },
  {
    id: 'PROD-04',
    productId: 4,
    name: 'Es Telang Lemonade',
    category: 'Minuman',
    price: 5000,
    hpp: 2300,
    portion: 'Cup (16 oz)',
    stock: 20,
    isAvailable: true,
    description: 'Air rebusan bunga telang biru alami dipadu es & perasan jeruk lemon segar.'
  },
  {
    id: 'PROD-05',
    productId: 5,
    name: 'Paket Hemat',
    category: 'Paket Bundling',
    price: 10000,
    hpp: 5500,
    portion: 'Paket (3 pcs)',
    stock: 20,
    isAvailable: true,
    description: 'Isi: 3 buah Roti Kirai Berinti. Pas untuk ganjal lapar praktis.'
  },
  {
    id: 'PROD-06',
    productId: 6,
    name: 'Paket Lengkap',
    category: 'Paket Bundling',
    price: 15000,
    hpp: 8800,
    portion: '1 Porsi Makanan + 1 Minuman',
    stock: 25,
    isAvailable: true,
    description: 'Isi: 1 porsi Roti Kirai (4 buah) + 1 cup Es Telang Lemonade.'
  },
  {
    id: 'PROD-07',
    productId: 7,
    name: 'Paket Berdua',
    category: 'Paket Bundling',
    price: 30000,
    hpp: 17600,
    portion: '2 Porsi Makanan + 2 Minuman',
    stock: 15,
    isAvailable: true,
    description: 'Isi: 2 porsi makanan (8 buah) + 2 cup Es Telang Lemonade.'
  },
  {
    id: 'PROD-08',
    productId: 8,
    name: 'Paket Puas',
    category: 'Paket Bundling',
    price: 42000,
    hpp: 25000,
    portion: '3 Porsi Makanan + 2 Minuman',
    stock: 10,
    isAvailable: true,
    description: 'Isi: 3 porsi makanan (12 buah) + 2 cup Es Telang Lemonade.'
  }
];

export async function GET() {
  return NextResponse.json({ products: localProducts });
}

export async function PATCH(req) {
  try {
    const data = await req.json();
    const { id, isAvailable, price, hpp, name, portion, description } = data;

    const prod = localProducts.find(p => p.id === id || p.productId === id);
    if (!prod) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    if (typeof isAvailable === 'boolean') prod.isAvailable = isAvailable;
    if (typeof price === 'number') prod.price = price;
    if (typeof hpp === 'number') prod.hpp = hpp;
    if (name) prod.name = name;
    if (portion) prod.portion = portion;
    if (description) prod.description = description;

    return NextResponse.json({ success: true, product: prod });
  } catch (err) {
    return NextResponse.json({ error: 'Gagal memperbarui produk' }, { status: 500 });
  }
}
