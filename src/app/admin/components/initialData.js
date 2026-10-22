// Data awal komprehensif untuk Portal Manajemen JALA (Contemporary Malay Heritage Culinary)

export const initialProducts = [
  {
    id: 'PROD-01',
    name: 'Roti Kirai Berinti — Kari Kentang',
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
    name: 'Roti Kirai Berinti — Ayam Suwir',
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
    name: 'Roti Kirai Berinti — Keju',
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

export const initialInventory = [
  { id: 'INV-01', name: 'Tepung Terigu Segitiga Biru', category: 'Bahan Utama', stock: 4.5, unit: 'Kg', minStock: 2, costPerUnit: 13000, supplier: 'Toko Bahan Kue Batam', status: 'Aman' },
  { id: 'INV-02', name: 'Daging Dada Ayam Fillet', category: 'Bahan Isian', stock: 1.2, unit: 'Kg', minStock: 1.5, costPerUnit: 38000, supplier: 'Pasar Mitra Raya', status: 'Menipis' },
  { id: 'INV-03', name: 'Kentang Dieng', category: 'Bahan Isian', stock: 3.0, unit: 'Kg', minStock: 2, costPerUnit: 18000, supplier: 'Pasar Mitra Raya', status: 'Aman' },
  { id: 'INV-04', name: 'Keju Cheddar Olahan', category: 'Bahan Isian', stock: 0.8, unit: 'Kg', minStock: 1, costPerUnit: 52000, supplier: 'Toko Bahan Kue Batam', status: 'Menipis' },
  { id: 'INV-05', name: 'Bumbu Kari Kering Melayu', category: 'Bumbu & Rempah', stock: 0.5, unit: 'Kg', minStock: 0.3, costPerUnit: 45000, supplier: 'Gilingan Bumbu Pasar', status: 'Aman' },
  { id: 'INV-06', name: 'Bunga Telang Kering Organik', category: 'Bahan Minuman', stock: 0.25, unit: 'Kg', minStock: 0.2, costPerUnit: 110000, supplier: 'Kebun Herbal Kepri', status: 'Aman' },
  { id: 'INV-07', name: 'Jeruk Lemon Segar', category: 'Bahan Minuman', stock: 1.5, unit: 'Kg', minStock: 1, costPerUnit: 28000, supplier: 'Pasar Buah Batam Center', status: 'Aman' },
  { id: 'INV-08', name: 'Kotak Kemasan Box Kraft Food Grade', category: 'Kemasan', stock: 18, unit: 'Pcs', minStock: 30, costPerUnit: 1200, supplier: 'Percetakan Kemasan Batam', status: 'Kritis' },
  { id: 'INV-09', name: 'Cup Minuman 16oz + Tutup Seal', category: 'Kemasan', stock: 45, unit: 'Pcs', minStock: 25, costPerUnit: 850, supplier: 'Plastik Grosir Batam', status: 'Aman' },
  { id: 'INV-10', name: 'Minyak Goreng SunCo 2L', category: 'Operasional', stock: 2, unit: 'Pouch', minStock: 1, costPerUnit: 36000, supplier: 'Supermarket Top100', status: 'Aman' }
];

export const initialTransactions = [
  { id: 'TRX-001', date: '2026-10-14', type: 'Pemasukan', category: 'Penjualan Menu', amount: 145000, note: 'Penjualan sesi istirahat pertama', paymentMethod: 'QRIS' },
  { id: 'TRX-002', date: '2026-10-14', type: 'Pengeluaran', category: 'Belanja Bahan Baku', amount: 85000, note: 'Beli ayam fillet & kentang tambahan', paymentMethod: 'Tunai' },
  { id: 'TRX-003', date: '2026-10-14', type: 'Pemasukan', category: 'Penjualan Menu', amount: 98000, note: 'Pesanan antar ruang guru', paymentMethod: 'COD / Tunai' },
  { id: 'TRX-004', date: '2026-10-13', type: 'Pengeluaran', category: 'Kemasan & Packaging', amount: 60000, note: 'Restock 50 pcs box kraft JALA', paymentMethod: 'Transfer' },
  { id: 'TRX-005', date: '2026-10-13', type: 'Pemasukan', category: 'Penjualan Menu', amount: 210000, note: 'Penjualan bazaar mini sekolah', paymentMethod: 'QRIS' },
  { id: 'TRX-006', date: '2026-10-12', type: 'Pengeluaran', category: 'Bahan Baku', amount: 120000, note: 'Belanja mingguan tepung, telur, rempah kari', paymentMethod: 'Tunai' },
  { id: 'TRX-007', date: '2026-10-12', type: 'Pengeluaran', category: 'Operasional & Gas', amount: 24000, note: 'Refill gas elpiji 3kg dapur produksi', paymentMethod: 'Tunai' },
  { id: 'TRX-008', date: '2026-10-12', type: 'Pemasukan', category: 'Penjualan Menu', amount: 185000, note: 'Pre-order Paket Berdua & Lengkap', paymentMethod: 'QRIS' }
];

export const initialCustomers = [
  { id: 'CUST-01', name: 'Rafi Ramadhan', phone: '081234567890', classLocation: 'Kelas X - Hang Lekir 9', totalOrders: 4, totalSpent: 72000, lastOrder: '2026-10-14', tier: 'VIP Pelanggan' },
  { id: 'CUST-02', name: 'Bu Siti Rahayu, S.Pd', phone: '082198765432', classLocation: 'Ruang Guru Lantai 2', totalOrders: 5, totalSpent: 125000, lastOrder: '2026-10-14', tier: 'VIP Pelanggan' },
  { id: 'CUST-03', name: 'Daffa Pratama', phone: '085278901234', classLocation: 'Kelas XI - IPA 3', totalOrders: 2, totalSpent: 30000, lastOrder: '2026-10-13', tier: 'Regular' },
  { id: 'CUST-04', name: 'Aisyah Putri', phone: '081345678912', classLocation: 'Kelas X - Hang Tuah 4', totalOrders: 1, totalSpent: 15000, lastOrder: '2026-10-14', tier: 'Pelanggan Baru' },
  { id: 'CUST-05', name: 'Pak Hendra Kurniawan', phone: '081123456789', classLocation: 'Ruang Tata Usaha', totalOrders: 3, totalSpent: 90000, lastOrder: '2026-10-12', tier: 'Regular' }
];

export const initialVouchers = [
  { id: 'VOUCH-01', code: 'JALAHEMAT2', discountType: 'Nominal', discountVal: 2000, minOrder: 15000, quota: 30, used: 12, validUntil: '2026-10-31', isActive: true, note: 'Potongan Rp2.000 untuk pembelian bundling' },
  { id: 'VOUCH-02', code: 'JALAGURU10', discountType: 'Persen', discountVal: 10, minOrder: 25000, quota: 20, used: 8, validUntil: '2026-11-15', isActive: true, note: 'Khusus bapak/ibu guru & staf TU SMAN 1 Batam' },
  { id: 'VOUCH-03', code: 'JALABERDUA5K', discountType: 'Nominal', discountVal: 5000, minOrder: 30000, quota: 15, used: 11, validUntil: '2026-10-25', isActive: true, note: 'Promo makan berdua bareng bestie' }
];

export const initialTeam = [
  { id: 'TEAM-01', name: 'Josua Sitinjak', role: 'Chief Executive Officer (CEO)', division: 'Technology, Finance & Strategy', email: 'josua@jalakuliner.com', phone: '08217601738', accessLevel: 'Super Admin', dutyShift: 'Senin & Kamis', avatarBg: 'bg-red-600' },
  { id: 'TEAM-02', name: 'Gabriel', role: 'Chief Operating Officer (COO)', division: 'Operations & Commercial', email: 'gabriel@jalakuliner.com', phone: '081277112233', accessLevel: 'Dapur & Logistik', dutyShift: 'Selasa & Jumat', avatarBg: 'bg-blue-600' },
  { id: 'TEAM-03', name: 'Haura', role: 'Chief Product & Creative Officer (CPCO)', division: 'Product Innovation & Branding', email: 'haura@jalakuliner.com', phone: '081399887766', accessLevel: 'Produk & Quality', dutyShift: 'Rabu & Sabtu', avatarBg: 'bg-emerald-600' },
  { id: 'TEAM-04', name: 'Letty', role: 'Chief Marketing Officer (CMCO)', division: 'Marketing & Customer Experience', email: 'letty@jalakuliner.com', phone: '085266554433', accessLevel: 'Marketing & CRM', dutyShift: 'Senin & Rabu', avatarBg: 'bg-purple-600' }
];

export const initialSettings = {
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
