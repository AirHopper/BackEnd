# ✈️ AirHopper Backend API

AirHopper adalah API pemesanan tiket pesawat online yang dirancang untuk memberikan pengalaman perjalanan yang mudah dan nyaman. Dengan dukungan teknologi modern seperti Express, Prisma, dan Swagger, kami menyediakan layanan backend yang cepat, aman, dan dapat diandalkan.

## 🌟 Fitur Utama

- **Otentikasi Aman**: Menggunakan JSON Web Token (JWT) dan hashing password dengan bcrypt.
- **Pencarian Rute**: Algoritma efisien untuk pencarian penerbangan, termasuk opsi transit.
- **Manajemen Data**: CRUD untuk pengguna, penerbangan, dan pemesanan tiket.
- **Pembayaran Online**: Integrasi dengan Midtrans untuk proses pembayaran yang lancar.
- **Dokumentasi API**: Swagger untuk eksplorasi dan pengujian endpoint API.
- **Email Notifikasi**: Otomatisasi email dengan Nodemailer untuk konfirmasi pemesanan.
- **Upload Media**: Dukungan untuk upload file dengan Multer dan integrasi ImageKit.
- **Error Tracking**: Pemantauan kesalahan dengan Sentry.

## 🛠️ Teknologi yang Digunakan

- **Express.js** sebagai framework utama.
- **Prisma** untuk ORM yang kuat dan mudah digunakan.
- **Swagger & Postman** untuk dokumentasi dan pengujian API.
- **Midtrans** untuk gateway pembayaran.
- **Zod** untuk validasi data.
- **Sentry** untuk pemantauan performa aplikasi.

## 🚀 Cara Menggunakan

### Ikuti langkah-langkah berikut untuk menjalankan proyek ini di lokal:

### Prasyarat

1. Node.js versi terbaru (minimal 16.x).
2. Database PostgreSQL atau yang kompatibel.
3. Alat pengelola API (Postman atau sejenisnya).

### Langkah Instalasi

1. Clone repositori ini:
   ```bash
   git clone hhttps://github.com/AirHopper/BackEnd.git
   ```
2. Instal semua dependensi:
   ```bash
   npm install
   ```
3. Konfigurasikan file lingkungan .env:

   ```bash
        # Database
        DATABASE_URL="your-database-url"
        DIRECT_URL="your-database-url"

        # Mailer
        MAILER_USER="your-email-address"
        MAILER_PASSWORD="your-email-password"

        # Image Kit
        IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
        IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
        IMAGEKIT_URL_ENDPOINT="your-imagekit-url-endpoint"

        # sentry
        SENTRY_DSN="your-sentry-dsn"

        JWT_SECRET="secret"
        APP_URL="your-app-url"
        NODE_ENV=development/production
        PORT=3000
   ```

4. Migrasi database dengan Prisma:
   ```bash
   npx prisma migrate dev
   ```
5. alankan server:
   ```bash
   npm run dev
   ```
6. Akses dokumentasi API di:
   ```bash
   http://localhost:3000/api-docs
   ```

## 👥 Tim AirHopper

Kami adalah kolaborasi antara developer Backend dan Fullstack dari program Studi Independen Kampus Merdeka - Binar Academy.

- **Backend :**
  - **Muhamad Royhan Fadhli**
  - **Juan Verrel Tanuwijaya**
  - **Ahmad Subhan Daryhadi**
  - **Bima Rizqy Ramadhan**
- **Fullstack :**
  - **Ridhwan Tsalasah Putra**
  - **Ryan Nicholas Purba**
  - **M. Zaky Pria Maulana**
  - **Joe Ferdinan**

## 🖥️ API Documentation

1 **Postman :**

```bash
https://documenter.getpostman.com/view/33280373/2sAYBbf9a7
```

2 **Swagger**

```bash
https://airhopper-304285428031.asia-southeast1.run.app/api-docs
```
