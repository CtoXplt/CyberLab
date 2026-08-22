# 🛡️ CyberSecLab — CTF Web Security Lab

**Platform lab keamanan siber berbasis web** untuk simulasi *File Upload Vulnerability*, analisis metadata, dan tantangan kriptografi. Dirancang untuk keperluan edukasi dan kompetisi **Capture The Flag (CTF)**.

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|-------|-----------|
| 🔐 Multi-Role Auth | Login Admin & Participant dengan sesi terpisah |
| 📂 File Upload Lab | Simulasi kerentanan unrestricted file upload |
| 🃏 Card Metadata CTF | Analisis metadata gambar (EXIF/PNG) untuk mendapatkan flag |
| 💰 Bounty Challenge | Tantangan final: dekripsi cipher di Kartu S untuk klaim hadiah |
| 📱 QR DANA Reward | Admin upload QR barcode DANA — muncul setelah peserta selesai |
| 🖥️ Admin Dashboard | CRUD lengkap: upload history, bounty config, re-inject metadata |
| 🌐 Real-time Deface | Peserta dapat mengubah tampilan homepage melalui file upload |

---

## 🗂️ Struktur Proyek

```
CyberSecurityLab/
├── backend/                  # PHP backend (tanpa framework)
│   ├── config/               # Konfigurasi CTF & database
│   ├── public/               # Entry point & file upload area
│   ├── src/
│   │   ├── controllers/      # Auth, Admin, Flag, Bounty, Challenge
│   │   ├── helpers/          # MetadataInjector, Response
│   │   └── config/           # Database (MySQL/SQLite auto-detect)
│   ├── challenges/cards/     # Kartu CTF: J, Q, K, A, S (PNG)
│   └── scripts/              # Metadata injection scripts
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── pages/            # Login, Dashboard, CTF Guide
│       └── components/       # UI: SpotlightCard, GlowButton, FlipCard
├── Dockerfile                # Production container
└── render.yaml               # Deploy config (Render.com)
```

---

## 🚀 Menjalankan Secara Lokal

### Prasyarat
- PHP 8.0+ dengan ekstensi PDO
- Node.js 18+ dan npm
- MySQL (opsional — fallback ke SQLite otomatis)

### Backend
```bash
# Dari root direktori proyek
php -S localhost:8080 -t backend/public backend/router.php
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → Buka http://localhost:5173
```

---

## 🐳 Deploy dengan Docker

```bash
docker build -t cyberseclab .
docker run -p 8080:8080 \
  -e DB_HOST=your_mysql_host \
  -e DB_NAME=cyberseclab \
  -e DB_USER=your_user \
  -e DB_PASS=your_password \
  cyberseclab
```

---

## ⚙️ Environment Variables

Buat file `.env` di root (tidak di-push ke GitHub):

```env
DB_HOST=127.0.0.1
DB_NAME=cyberseclab
DB_USER=root
DB_PASS=
DB_DRIVER=mysql    # atau: sqlite (untuk fallback otomatis)
```

> **Catatan**: Jika MySQL tidak tersedia, backend otomatis fallback ke SQLite.

---

## 🎮 Alur Tantangan CTF

```
[START]
   │
   ▼
📋 Registrasi / Login sebagai Participant
   │
   ▼
🃏 Tahap 1 — Analisis Metadata Kartu
   Download kartu (J, Q, K, A) dari halaman CTF Guide
   Gunakan: exiftool -Comment card_k.png
   → Temukan payload tersembunyi di metadata
   → Submit flag → Dapatkan kredensial login peserta
   │
   ▼
💻 Tahap 2 — File Upload Vulnerability
   Login sebagai participant
   Upload file PHP/HTML deface ke server
   → Akses file yang diupload untuk melihat hasilnya
   │
   ▼
🃏 Tahap 3 — Bounty Challenge (Kartu S)
   Tab Bounty terbuka otomatis setelah upload berhasil
   Download card_s.png → Analisis metadata cipher
   Gunakan tool: exiftool, strings, CyberChef, Python
   → Dekripsi ciphertext → Submit flag Kartu S
   → 🎉 Barcode QR DANA muncul untuk klaim hadiah!
```

---

## 🛠️ Tools yang Direkomendasikan untuk Peserta

| Tool | Kegunaan |
|------|---------|
| [ExifTool](https://exiftool.org/) | Baca metadata EXIF/PNG pada file gambar |
| [CyberChef](https://cyberchef.io/) | Decode Base64, XOR, ROT13, Hex, dll |
| [strings](https://linux.die.net/man/1/strings) | Cari teks tersembunyi dalam file binary |
| Python 3 | Script dekripsi XOR/cipher kustom |
| Burp Suite | Intercept & modifikasi HTTP request upload |

---

## 🔐 Catatan Keamanan

> [!WARNING]
> Platform ini **hanya untuk tujuan edukasi** dalam lingkungan lab yang terkontrol.
> - Jangan deploy ke server publik tanpa pengamanan tambahan
> - File upload dibatasi dan divalidasi server-side
> - Semua shell/deface yang diupload peserta dapat dihapus admin kapan saja
> - Seluruh sesi dikelola menggunakan cookie `HttpOnly` + `SameSite=Strict`

---

## 📡 Deploy di Render.com

1. Fork/clone repo ini ke GitHub Anda
2. Buat Web Service baru di [Render.com](https://render.com)
3. Set **Build Command**: `cd frontend && npm install && npm run build`
4. Set **Start Command**: `php -S 0.0.0.0:8080 -t backend/public backend/router.php`
5. Tambahkan Environment Variables: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`

---

## 👨‍💻 Teknologi

![PHP](https://img.shields.io/badge/PHP-8.0+-777BB4?logo=php&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)

---

*Dibuat untuk keperluan lab mata kuliah Keamanan Siber* 🎓
