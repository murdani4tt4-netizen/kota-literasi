# Ekspedisi Literasi: Kota Informasi

Game edukasi 3D berbasis browser untuk mata pelajaran **Bahasa Indonesia**, SMA Kelas XII, Fase F, Kurikulum Merdeka. Pemain menjelajahi sebuah kota 3D, mengumpulkan pengetahuan, dan menyelesaikan misi tentang poster/teks persuasif, analisis informasi (fakta, opini, klaim, bukti), makna tersurat dan tersirat, serta penyusunan dan penyampaian presentasi.

- **Pengembang:** MURDANI, SMAN 10 Pinrang (2026)
- **Mata pelajaran:** Bahasa Indonesia, Fase F, Semester 1
- **Demo:** `https://<username>.github.io/<nama-repo>/` (aktif setelah langkah deploy di bawah)

## Fitur

- Dunia 3D orang pertama/ketiga yang dirender dengan Three.js (WebGL).
- Orb pengetahuan yang tersebar di beberapa zona kota.
- Misi, tantangan, dan simulasi dengan sistem poin dan bintang (1–3 bintang, tergantung bantuan yang dipakai).
- Panel belajar, dashboard kemajuan, dan halaman hasil yang bisa dicetak.
- Efek suara dan musik dengan Web Audio API.
- Mendukung keyboard, mouse, dan layar sentuh (joystick virtual).
- Progres tersimpan otomatis di `localStorage` browser, tanpa server dan tanpa akun.

## Kontrol

| Aksi | Keyboard | Sentuh |
| --- | --- | --- |
| Bergerak | `W` `A` `S` `D` / tombol panah | Joystick virtual |
| Berlari | `Shift` | Joystick (tarik penuh) |
| Lompat | `Spasi` | Tombol lompat |
| Berinteraksi | `E` | Tombol interaksi |
| Peta | `M` | Lewat menu HUD |
| Jeda / tutup panel | `Esc` | Tombol jeda di HUD |
| Arah pandang | Mouse | Geser layar |

## Teknologi

React 19, TypeScript, Vite 7, Tailwind CSS 4, Three.js, Zustand, Web Audio API.

## Menjalankan di komputer

Prasyarat: [Node.js](https://nodejs.org) versi 20 atau lebih baru.

```bash
npm ci            # pasang dependensi
npm run dev       # server pengembangan (http://localhost:5173)
npm run build     # build produksi ke folder dist/
npm run preview   # coba hasil build secara lokal
npm run typecheck # cek tipe TypeScript
```

Build menghasilkan **satu file** `dist/index.html` (semua JS dan CSS di-inline dengan `vite-plugin-singlefile`), sehingga mudah dibagikan atau dibuka lewat hosting statis apa pun.

## Deploy ke GitHub Pages

1. Buat repositori baru di GitHub, lalu push proyek ini ke cabang `main`.
2. Di repositori, buka **Settings → Pages**.
3. Pada **Build and deployment → Source**, pilih **GitHub Actions**.
4. Push berikutnya ke `main` akan otomatis menjalankan workflow `.github/workflows/deploy.yml` (install, typecheck, build, publish).
5. Alamat situs muncul di tab **Actions** dan di **Settings → Pages**.

## Struktur proyek

```
src/
├── App.tsx            # alur utama aplikasi
├── components/        # UI: Login, HUD, Dashboard, Panel, Hasil, dll.
├── game/              # engine 3D, dunia, pemain, input, audio, tekstur, konten
│   └── content.ts     # seluruh materi, misi, dan soal (Bahasa Indonesia)
├── state/store.ts     # state global (Zustand) + penyimpanan localStorage
└── utils/
```

## Catatan untuk guru

Capaian Pembelajaran (CP) dan Tujuan Pembelajaran (TP) dalam `src/game/content.ts` adalah salinan dari formulir permintaan. Materi di luar poster/teks persuasif merupakan rancangan pembelajaran. Mohon dicocokkan dengan dokumen resmi sekolah dan ATP/modul ajar yang dipakai sebelum digunakan di kelas.

## Lisensi

[MIT](LICENSE) © 2026 MURDANI, SMAN 10 Pinrang.
