# Mini Clinic Information System

Aplikasi berbasis web untuk membantu proses administrasi dan pelayanan pasien klinik pratama
secara terintegrasi — mencakup pengelolaan data pasien, pendaftaran kunjungan, antrean, dan
pencatatan hasil pemeriksaan dokter (SOAP).

Dikembangkan sebagai Technical Assignment posisi **Programmer**.

## Teknologi

| Komponen        | Teknologi                      |
| --------------- | ------------------------------ |
| Frontend        | React.js (Vite) + React Router |
| Backend         | Node.js + Express.js           |
| Database        | PostgreSQL                     |
| Authentication  | JSON Web Token (JWT)           |
| Version Control | Git                            |

## Struktur Project

```
mini-clinic-system/
├── backend/
│   ├── src/
│   │   ├── config/        # koneksi database
│   │   ├── controllers/   # logika bisnis tiap modul
│   │   ├── middlewares/   # auth, validasi, error handler
│   │   ├── routes/        # definisi endpoint REST API
│   │   ├── validators/    # aturan validasi input (express-validator)
│   │   ├── utils/         # helper (response format, generate kode, dsb)
│   │   ├── app.js         # setup express app
│   │   └── seed.js        # script seeding akun default
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/         # halaman: Login, Dashboard, Pasien, Pendaftaran, Antrean, Pemeriksaan
│   │   ├── components/    # Layout/sidebar
│   │   ├── context/       # AuthContext (JWT & role)
│   │   ├── routes/        # ProtectedRoute (role-based)
│   │   ├── services/      # axios instance (api.js)
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
├── database.sql            # schema + seed master data (poli)
├── ERD.md                  # entity relationship diagram (mermaid)
├── postman_collection.json # koleksi Postman seluruh endpoint
└── README.md
```

## Fitur yang Diimplementasikan

1. **Authentication** — Login/Logout dengan JWT, otorisasi berbasis role
   (`administrator`, `dokter`, `petugas_pendaftaran`).
2. **Master Data Pasien** — CRUD pasien, No. Rekam Medis auto-generate
   (`RM-2026-000001`), validasi NIK unik, pencarian, dan pagination.
3. **Pendaftaran Pasien** — Registrasi kunjungan (pasien, dokter, poli, tanggal,
   jenis pembayaran, keluhan awal) dengan status kunjungan
   (`Menunggu → Check In → Pemeriksaan → Selesai`). Setiap pendaftaran otomatis
   membuat nomor antrean.
4. **Modul Antrean** — Generate nomor antrean otomatis per poli (format `A001`,
   reset harian), tampilan daftar antrean, panggil antrean berikutnya, ubah status.
5. **Modul Pemeriksaan Dokter (SOAP)** — Subjective, Objective (tensi, suhu, BB,
   TB), Assessment (diagnosa), Plan (rencana terapi), input tindakan medis,
   input resep obat, dan riwayat pemeriksaan pasien.
6. **Dashboard** — Total pasien, total pasien hari ini, total antrean hari ini,
   total pasien menunggu, total pasien selesai dilayani.

## Cara Instalasi

### 1. Prasyarat

- Node.js ≥ 18
- PostgreSQL ≥ 13
- npm

### 2. Clone Repository

```bash
git clone <repository-url>
cd mini-clinic-system
```

### 3. Setup Database

Buat database baru, lalu jalankan schema:

```bash
createdb mini_clinic
psql -U postgres -d mini_clinic -f database.sql
```

> Jika menggunakan MySQL: sesuaikan tipe data (`SERIAL` → `AUTO_INCREMENT`,
> `TIMESTAMP DEFAULT NOW()` → `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`, dan hapus
> klausa `CHECK` bila versi MySQL yang digunakan belum mendukungnya). Driver
> backend saat ini menggunakan `pg` (node-postgres); untuk MySQL ganti dengan
> `mysql2` pada `backend/src/config/db.js`.

### 4. Setup Backend

```bash
cd backend
cp .env.example .env
# edit .env sesuai konfigurasi database & JWT secret Anda
npm install
npm run seed     # membuat akun login default (password ter-hash dengan bcrypt)
npm run dev       # menjalankan di http://localhost:5000
```

### 5. Setup Frontend

```bash
cd ../frontend
cp .env.example .env
# pastikan VITE_API_BASE_URL mengarah ke backend (default http://localhost:5000/api)
npm install
npm run dev        # menjalankan di http://localhost:3000
```

Buka `http://localhost:3000` di browser.

## Akun Login (Default)

Dibuat melalui `npm run seed` di backend. Password sama untuk semua akun:

| Username | Password    | Role                |
| -------- | ----------- | ------------------- |
| admin    | password123 | Administrator       |
| drbudi   | password123 | Dokter              |
| petugas1 | password123 | Petugas Pendaftaran |

> Password di-hash menggunakan bcrypt saat seeding — tidak ada hash yang di-hardcode
> di file SQL/source code.

## Konfigurasi File `.env`

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_NAME=mini_clinic

JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=8h
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Kedua file `.env.example` sudah disertakan pada masing-masing folder sebagai
referensi. **File `.env` yang berisi kredensial asli tidak disertakan dalam
repository** (lihat `.gitignore`).

## Cara Migrasi Database

Project ini menggunakan file `database.sql` sebagai single-source schema
(tanpa tool migration terpisah) agar setup sesederhana mungkin untuk take-home
test. Untuk menjalankan ulang dari awal:

```bash
dropdb mini_clinic   # jika perlu reset
createdb mini_clinic
psql -U postgres -d mini_clinic -f database.sql
cd backend && npm run seed
```

## Dokumentasi API

### Format Response

**Success**

```json
{ "success": true, "message": "Success", "data": {} }
```

**Error**

```json
{ "success": false, "message": "Validation Error", "errors": {} }
```

### Daftar Endpoint

| Method | Endpoint                          | Deskripsi                                    | Role                                       |
| ------ | --------------------------------- | -------------------------------------------- | ------------------------------------------ |
| POST   | `/api/login`                      | Login, mengembalikan JWT                     | Publik                                     |
| POST   | `/api/logout`                     | Logout                                       | Semua role                                 |
| GET    | `/api/me`                         | Data user yang sedang login                  | Semua role                                 |
| GET    | `/api/patients`                   | List pasien (search, pagination)             | Semua role                                 |
| GET    | `/api/patients/:id`               | Detail pasien                                | Semua role                                 |
| POST   | `/api/patients`                   | Tambah pasien                                | Administrator, Petugas Pendaftaran         |
| PUT    | `/api/patients/:id`               | Ubah pasien                                  | Administrator, Petugas Pendaftaran         |
| DELETE | `/api/patients/:id`               | Hapus pasien                                 | Administrator                              |
| GET    | `/api/registrations`              | List pendaftaran (filter tanggal/status)     | Semua role                                 |
| POST   | `/api/registrations`              | Buat pendaftaran + auto-generate antrean     | Administrator, Petugas Pendaftaran         |
| PUT    | `/api/registrations/:id`          | Ubah data/status pendaftaran                 | Administrator, Petugas Pendaftaran, Dokter |
| GET    | `/api/queues`                     | List antrean (filter tanggal/poli/status)    | Semua role                                 |
| POST   | `/api/queues`                     | Buat antrean manual                          | Administrator, Petugas Pendaftaran         |
| PUT    | `/api/queues/:id/call`            | Panggil antrean                              | Administrator, Petugas Pendaftaran, Dokter |
| PUT    | `/api/queues/:id/status`          | Ubah status antrean                          | Administrator, Petugas Pendaftaran, Dokter |
| POST   | `/api/medical-records`            | Simpan rekam medis (SOAP + tindakan + resep) | Dokter                                     |
| GET    | `/api/medical-records/:patientId` | Riwayat pemeriksaan pasien                   | Semua role                                 |
| POST   | `/api/prescriptions`              | Tambah resep ke rekam medis                  | Dokter                                     |
| GET    | `/api/prescriptions/:id`          | Resep berdasarkan rekam medis                | Semua role                                 |
| GET    | `/api/master/polis`               | List poli                                    | Semua role                                 |
| GET    | `/api/master/doctors`             | List dokter aktif                            | Semua role                                 |
| GET    | `/api/dashboard`                  | Statistik dashboard                          | Semua role                                 |

Koleksi Postman lengkap tersedia di `postman_collection.json` (sudah termasuk
script otomatis menyimpan `token`, `patient_id`, `registration_id`, dll ke
collection variables setelah request terkait berhasil).

## Asumsi & Penyederhanaan

- Endpoint `POST /logout` bersifat stateless (client menghapus token dari
  localStorage) — tidak ada token blacklist/refresh-token, karena di luar
  cakupan minimum yang diminta.
- Satu pendaftaran menghasilkan tepat satu nomor antrean (dibuat otomatis
  dalam transaksi yang sama) sehingga tidak perlu memanggil endpoint
  `POST /queues` secara terpisah pada alur normal; endpoint tersebut tetap
  disediakan untuk kasus pembuatan antrean manual/ulang.
- Nomor antrean di-reset setiap hari per poli (`queue_date` + `poli_id`),
  sesuai contoh `A001, A002, A003...` pada dokumen soal.
- Role `dokter` diasumsikan hanya menangani pasien dengan status pendaftaran
  `Check In` pada poli/hari berjalan; pemindahan status ke `Pemeriksaan` dapat
  dilakukan melalui `PUT /registrations/:id` sebelum submit SOAP.
- Data "Tindakan Medis" dan "Resep Obat" disimpan sebagai baris terpisah
  (tabel `medical_actions` dan `prescriptions`) yang berelasi ke satu rekam
  medis, agar mendukung banyak tindakan/obat sekaligus dalam satu kunjungan.
- Validasi nomor telepon menggunakan format umum Indonesia; validasi ini
  dijalankan di sisi backend (express-validator) dan direplikasi secara
  sederhana di sisi frontend (atribut `required`, tipe input).
- Tidak ada modul "Master Dokter/Poli" dengan CRUD penuh di frontend
  (hanya endpoint `GET` untuk kebutuhan dropdown) karena tidak termasuk
  ruang lingkup wajib pada dokumen soal; dapat dikembangkan lebih lanjut
  bila diperlukan.

## Git Commit History

Riwayat commit pengembangan aplikasi ini dapat dilihat pada repository Git
yang disertakan bersama submission (lihat tautan repository pada dokumen
pengumpulan). Commit dipecah per modul/tahapan pengembangan sesuai praktik
yang diminta pada dokumen soal (tidak hanya satu commit akhir).

## Video Demonstrasi

Tautan video demonstrasi aplikasi (maks. 10 menit) disertakan terpisah pada
dokumen pengumpulan submission.
