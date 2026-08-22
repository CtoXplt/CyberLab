---
title: CyberLab
emoji: 🛡️
colorFrom: green
colorTo: red
sdk: docker
app_port: 7860
pinned: false
---

# Cyber Security Lab — File Upload Vulnerability Challenge

Platform edukasi keamanan siber berbasis web untuk pembelajaran praktis (hands-on) tentang **Metadata Analysis** dan **Unrestricted File Upload Vulnerability**.

> **⚠️ PERINGATAN:** Platform ini mengandung kerentanan yang DISENGAJA untuk tujuan edukasi. JANGAN deploy di jaringan production atau publik.

---

## Fitur Utama

- 🔍 **Metadata Analysis Challenge** — Peserta belajar mengekstrak flag tersembunyi dari metadata EXIF file gambar
- 📤 **File Upload Vulnerability** — Peserta mempelajari bagaimana kerentanan upload tanpa validasi dapat dieksploitasi
- 🎓 **UI Modern & Accessible** — Interface profesional yang ramah pemula
- 🔄 **Restore Functionality** — Instruktur dapat mengembalikan homepage ke kondisi awal

---

## Prerequisites

- **PHP 8.1+** dengan ekstensi: `pdo_mysql`, `mbstring`, `gd`, `session`
- **MySQL 5.7+** atau MariaDB 10.3+
- **Node.js 18+** dan npm
- **Browser** modern (Chrome, Firefox, Edge)

---

## Cara Menjalankan Program

Lab ini butuh **2 service** jalan bersamaan: **PHP backend** (port `8080`) dan **React frontend** (port `5173`). Frontend otomatis mem-proxy request `/api` dan `/uploads` ke backend.

### Ringkasan URL

| Service | URL | Keterangan |
|---------|-----|------------|
| Frontend (UI) | http://localhost:5173 | Halaman utama, CTF, login |
| Backend API | http://localhost:8080/api/home | API langsung (opsional, untuk cek) |
| Admin Login | http://localhost:5173/admin/login | Dashboard admin/participant |
| CTF Challenge | http://localhost:5173/ctf | Halaman tantangan |

### Setup Awal (Hanya Sekali)

Jalankan dari **root folder project** (`CyberSecurityLab/`).

**1. Install dependency frontend**

```bash
cd frontend
npm install
cd ..
```

**2. Setup database MySQL**

Pastikan MySQL/MariaDB sudah berjalan (default XAMPP: user `root`, password kosong).

```bash
# Windows (XAMPP) — jika php belum ada di PATH
"C:\xampp\php\php.exe" backend/database/setup.php

# Linux / macOS / Git Bash (php sudah di PATH)
php backend/database/setup.php
```

**3. Inject metadata ke kartu CTF**

Wajib dijalankan agar payload Base64 ada di `card_k.png`:

```bash
# Windows (XAMPP)
"C:\xampp\php\php.exe" backend/scripts/inject_metadata.php

# Linux / macOS / Git Bash
php backend/scripts/inject_metadata.php
```

### Menjalankan (Setiap Sesi Lab)

Buka **2 terminal terpisah** — backend dan frontend harus jalan bersamaan.

**Terminal 1 — Backend PHP**

```bash
cd c:\Kuliah\Cybersecurity\CyberSecurityLab

# Windows (XAMPP)
"C:\xampp\php\php.exe" -S localhost:8080 -t backend/public backend/router.php

# Linux / macOS / Git Bash
php -S localhost:8080 -t backend/public backend/router.php
```

Biarkan terminal ini **tetap terbuka**. Jika sukses, backend mendengarkan di `http://localhost:8080`.

**Terminal 2 — Frontend React**

```bash
cd c:\Kuliah\Cybersecurity\CyberSecurityLab\frontend
npm run dev
```

Biarkan terminal ini **tetap terbuka**. Vite akan menampilkan URL, biasanya:

```
  ➜  Local:   http://localhost:5173/
```

**Buka browser** → http://localhost:5173

### Build Production (Opsional)

Untuk build static frontend (tanpa hot reload):

```bash
cd frontend
npm run build
npm run preview
```

> Untuk lab edukasi, cukup pakai `npm run dev` + PHP built-in server seperti di atas.

### Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `php: command not found` | Pakai path penuh PHP XAMPP (Windows) atau install PHP 8.1+ |
| Database connection failed | Pastikan MySQL jalan, lalu ulangi `setup.php` |
| API error / CORS | Pastikan backend (`8080`) sudah jalan sebelum buka frontend |
| Flag selalu salah | Jalankan ulang `inject_metadata.php` dan `setup.php` |
| Upload file gagal | Cek folder `backend/public/uploads/` ada dan writable |
| Port sudah dipakai | Ganti port backend (`8081`) lalu sesuaikan proxy di `frontend/vite.config.js` |

**Reset database & password ke default:**

```bash
php backend/database/setup.php
```

---

## Quick Start

> Panduan lengkap ada di bagian **[Cara Menjalankan Program](#cara-menjalankan-program)** di atas.

### 1. Clone / Download Project

```bash
cd c:\Kuliah\Cybersecurity\CyberSecurityLab
```

### 2. Setup Database

Pastikan MySQL sudah berjalan, lalu:

```bash
php backend/database/setup.php
```

Script ini akan:
- Membuat database `cyberseclab`
- Membuat 5 tabel (users, flags, submissions, uploads, site_content)
- Seed data awal (admin user, participant user, flag, default content)

### 3. Inject Metadata Kartu

```bash
php backend/scripts/inject_metadata.php
```

### 4. Start PHP Backend

```bash
php -S localhost:8080 -t backend/public backend/router.php
```

### 5. Start React Frontend

```bash
cd frontend
npm install
npm run dev
```

### 6. Buka Browser

Navigasi ke: **http://localhost:5173**

---

## Credentials

| Role | Username | Password | Cara Akses |
|------|----------|----------|------------|
| Admin / Instructor | `admin` | `admin_cs_lab_2026` | Login langsung di /admin/login |
| Participant | `participant` | `upl04d_ch4ll3ng3_2026` | Setelah menyelesaikan flag challenge |

### Solusi CTF (Instructor & Panduan Peserta)

#### 🃏 Tahap 1: Analisis Metadata Kartu (J, Q, K, A)
| Langkah | Detail |
|---------|--------|
| Kartu | 4 kartu awal: J, Q, K, A |
| Metadata | `card_k.png` → field `Comment` berisi Base64 |
| Payload | `bWRfNG40bHlzMXNfMXNfazN5X3QwXzFuZjBybTR0MTBu` |
| Decode | `md_4n4lys1s_1s_k3y_t0_1nf0rm4t10n` |
| Flag | `CTF{md_4n4lys1s_1s_k3y_t0_1nf0rm4t10n}` |
| Setelah submit | Kredensial peserta (`participant` / `upl04d_ch4ll3ng3_2026`) |

#### 💰 Tahap 3: Final Bounty Challenge — Kartu S (Stream Cipher)
| Langkah | Detail |
|---------|--------|
| Kartu | Kartu Spade / Secret `card_s.png` (dibuka setelah upload file) |
| Metadata | `card_s.png` → field `Comment` berisi XOR Stream Cipher |
| Default Key | `SPADE2026` |
| Metode Decode | Hex stream di-XOR dengan key `SPADE2026` (via CyberChef atau script Python) |
| Default Flag | `CTF{sp4d3_m4st3r_b0unty_x0r_c1ph3r_2026}` |
| Hadiah | **Barcode QR DANA** muncul di layar setelah submit flag Kartu S berhasil |

#### 🛠️ Cara Analisis Metadata Menggunakan ExifTool & CyberChef
```bash
# Baca metadata Kartu S
exiftool -Comment card_s.png
```

##### Cara Decode XOR Cipher (Python):
```python
cipher_hex = "..." # dari comment card_s
key = "SPADE2026"
raw = bytes.fromhex(cipher_hex)
flag = "".join(chr(b ^ ord(key[i % len(key)])) for i, b in enumerate(raw))
print(flag)
```

---

## User Journey

1. **Buka Homepage & CTF Page** → Download kartu (J, Q, K, A)
2. **Analisis metadata kartu K** → Decode Base64 → Flag Tahap 1
3. **Login Peserta** → Akses dashboard peserta
4. **Tahap 2: File Upload** → Upload file shell/deface ke homepage
5. **Tahap 3: Final Bounty (Kartu S)** → Terbuka setelah upload
6. **Analisis Metadata Kartu S** → Pecahkan Stream XOR Cipher dengan key
7. **Submit Flag Kartu S** → **Barcode QR DANA** muncul untuk klaim hadiah uang!
8. **Admin Panel** → Admin dapat mengelola QR DANA, edit flag, dan edit command/cipher metadata kapan saja.


---

## Arsitektur

```
CyberSecurityLab/
├── backend/                    # PHP Backend (vanilla, no framework)
│   ├── public/                 # Web root
│   │   ├── index.php           # Entry point + router
│   │   └── uploads/            # File upload directory
│   ├── src/
│   │   ├── config/             # Database config
│   │   ├── controllers/        # 6 controllers
│   │   ├── middleware/         # Auth + rate limiter
│   │   └── helpers/            # Response helper
│   ├── challenges/cards/       # 4 card image files (J, Q, K, A)
│   ├── config/                 # CTF constants (flag, passwords)
│   ├── database/               # SQL schema + seed + setup
│   └── storage/                # Default content + rate limit data
├── frontend/                   # React (Vite) SPA
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # 4 page components
│   │   └── services/           # API service layer
│   └── vite.config.js          # Proxy config
└── README.md
```

---

## Tools untuk Analisis Metadata

Peserta dapat menggunakan salah satu tool berikut:

```bash
# ExifTool (CLI)
exiftool card_k.png

# strings — cari payload Base64
strings card_k.png | findstr bWRf

# Decode Base64 (Git Bash / Linux)
echo bWRfNG40bHlzMXNfMXNfazN5X3QwXzFuZjBybTR0MTBu | base64 -d

# Python
from PIL import Image
img = Image.open('card_k.png')
print(img.info)
```

Atau gunakan online EXIF viewer seperti [exif.regex.info](http://exif.regex.info/exif.cgi).

---

## Keamanan

Platform ini **sengaja** mengandung kerentanan:

| Kerentanan | Lokasi | Tujuan Edukasi |
|------------|--------|----------------|
| Unrestricted File Upload | `POST /api/admin/upload` | Memahami dampak upload tanpa validasi |
| Executable File Serving | `/uploads/` directory | Memahami web defacement |
| Metadata Information Disclosure | Card image EXIF | Memahami analisis metadata |

### Mitigasi untuk Deployment Lab

- Deploy hanya di jaringan terisolasi
- Gunakan virtual machine atau container
- Jangan gunakan data nyata
- Reset environment setelah setiap sesi

---

## License

Untuk keperluan edukasi. Tidak untuk penggunaan komersial atau production.
