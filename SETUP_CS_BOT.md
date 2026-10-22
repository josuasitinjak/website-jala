# Panduan Menjalankan WhatsApp AI Bot Secara Lokal (100% Praktis & Tanpa Setup Database)

Bot WhatsApp ini dikonfigurasi untuk berjalan **100% secara lokal** di laptop Anda. Bot akan langsung terhubung dengan data pesanan di website utama Anda yang sedang berjalan di `localhost:3000`.

---

## 💡 Cara Kerja Sistem Lokal
1. Pelanggan memesan makanan di website JALA (`localhost:3000`).
2. Pesanan disimpan di database / memori website lokal.
3. Saat ada chat masuk di WhatsApp menanyakan status pesanan (contoh: *"Lacak JALA-1001"*), bot WhatsApp akan langsung mengambil data dari website lokal Anda (`localhost:3000/api/orders`), mencocokkan nomor resi, dan membalas status terbarunya ke pelanggan.

---

## Langkah 1: Persiapan Dependensi
Sebelum menjalankan bot untuk pertama kali, pastikan dependensi sudah terpasang:
1. Buka terminal proyek Anda.
2. Jalankan perintah berikut:
   ```bash
   npm install
   ```

---

## Langkah 2: Menjalankan Website & Bot

Agar bot dapat membaca status pesanan di website Anda, jalankan keduanya:

### 1. Jalankan Website Utama
Di terminal pertama, jalankan perintah untuk memulai website:
```bash
npm run dev
```
*(Website berjalan di alamat http://localhost:3000)*

### 2. Jalankan Bot WhatsApp (Opsional jika ingin CS Bot WhatsApp)
Buka terminal kedua di folder proyek yang sama, lalu jalankan:
```bash
npm run bot
```
*(Atau gunakan `npm run dev:all` jika ingin menjalankan keduanya sekaligus dalam 1 terminal)*

---

## Langkah 3: Scan QR Code WhatsApp
1. Tunggu beberapa detik di terminal bot sampai **QR Code** berbasis teks muncul.
2. Buka aplikasi WhatsApp di HP Anda.
3. Masuk ke **Linked Devices / Perangkat Tertaut** > **Link a Device / Tautkan Perangkat**.
4. Arahkan kamera HP Anda untuk men-scan QR Code yang ada di terminal laptop tersebut.
5. Selesai! Bot sekarang aktif di latar belakang laptop Anda.

---

## 🎯 Cara Menguji Fitur
1. Buka `http://localhost:3000` di browser Anda, buat pesanan baru.
2. Di halaman sukses, Anda akan mendapatkan nomor resi (contoh: `JALA-1001`).
3. Coba kirim pesan ke nomor WhatsApp yang terhubung dengan bot: *"Tolong lacak pesanan saya JALA-1001"*.
4. Bot akan otomatis membalas dengan status pesanan Anda saat ini!
5. Coba buka `http://localhost:3000/admin` (Gunakan username `adminjala` & password `adminjala2026`). Ubah status pesanan `JALA-1001` menjadi **"Sedang Diantar"**.
6. Chat kembali bot WhatsApp Anda: *"Lacak JALA-1001"*. Status yang dibalas oleh bot akan otomatis terupdate menjadi **"Sedang Diantar"** secara instan!
