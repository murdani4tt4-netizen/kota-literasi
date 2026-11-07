import type { ZoneDef } from "./types";

// ============================================================
// GAME METADATA & LEARNING CONTENT (Bahasa Indonesia — Fase F)
// Catatan: CP/TP di bawah adalah salinan dari formulir permintaan
// dan perlu dicocokkan ulang dengan dokumen resmi sekolah.
// ============================================================

export const GAME_INFO = {
  title: "EKSPEDISI LITERASI",
  subtitle: "KOTA INFORMASI",
  subject: "Bahasa Indonesia",
  grade: "SMA Kelas XII",
  phase: "Fase F",
  semester: "1",
  curriculum: "Kurikulum Merdeka",
  developer: "MURDANI",
  school: "SMAN 10 PINRANG",
  year: "2026",
  cp: "Mengevaluasi informasi berupa gagasan, perasaan, pandangan, arahan, dan/atau pesan dari berbagai tipe teks berwujud teks visual dan/atau audiovisual untuk menemukan makna yang tersurat dan tersirat berdasarkan kaidah logika berpikir.",
  tp: "Mempresentasikan gagasan, perasaan, pandangan, arahan, pesan, dan/atau kreativitas berbahasa dalam berbagai tipe teks berbentuk monolog, dialog, dan/atau gelar wicara serta menyusun naskahnya secara logis, sistematis, kritis, dan kreatif sesuai dengan norma kesopanan dan budaya Indonesia.",
  mainMaterial:
    "Poster/teks persuasif serta materi Bahasa Indonesia lain yang relevan dengan CP, TP, dan ATP yang digunakan.",
  subMaterials: [
    "Unsur, jenis, dan pembuatan poster",
    "Analisis informasi: fakta, opini, klaim, dan bukti",
    "Penafsiran makna tersurat dan tersirat",
    "Evaluasi gagasan, pandangan, dan pesan dalam teks visual/audiovisual",
    "Penyusunan naskah presentasi, monolog, dan dialog",
    "Pelaksanaan presentasi, diskusi, dan gelar wicara sesuai norma kesopanan",
  ],
  disclaimer:
    "Materi tambahan di luar poster/teks persuasif merupakan rancangan pembelajaran yang perlu diverifikasi guru terhadap ATP/modul ajar yang benar-benar digunakan.",
  tech: "HTML5 · CSS3 · JavaScript (TypeScript) · WebGL · Three.js · Web Audio API · Pointer Events · Fullscreen API · localStorage",
};

export const SCORE_RULES = {
  orb: 10,
  task: 20,
  simulation: 30,
  level: 50,
  allMissions: 100,
};

export const STAR_RULES = [
  "1 bintang — misi selesai dengan banyak bantuan (≥ 3 petunjuk atau banyak kesalahan).",
  "2 bintang — misi selesai dengan sedikit bantuan (1–2 petunjuk, sedikit kesalahan).",
  "3 bintang — misi selesai mandiri tanpa bantuan dan dengan hasil baik.",
];

// ---------------- Pengetahuan tersebar di dunia (orbs) ----------------
export const ORBS: { id: string; title: string; note: string; zone: string }[] = [
  { id: "orb-1", title: "Gagasan Utama", note: "Gagasan utama adalah inti pembicaraan/paragraf; pada poster biasanya terletak pada judul yang paling mencolok.", zone: "gerbang" },
  { id: "orb-2", title: "Makna Tersurat", note: "Makna tersurat (denotatif) adalah makna yang langsung tertulis/ditampilkan pada teks visual.", zone: "gerbang" },
  { id: "orb-3", title: "Makna Tersirat", note: "Makna tersirat (konotatif) adalah pesan yang tidak langsung ditulis, tetapi dapat disimpulkan dari gambar, warna, dan konteks.", zone: "kota" },
  { id: "orb-4", title: "Klaim & Bukti", note: "Klaim adalah pernyataan yang perlu pembuktian. Klaim kuat didukung bukti data, sumber kredibel, dan dapat diverifikasi.", zone: "kota" },
  { id: "orb-5", title: "Unsur Poster", note: "Unsur poster: judul, ilustrasi/gambar, teks persuasif (slogan), informasi penting, dan identitas penerbit.", zone: "galeri" },
  { id: "orb-6", title: "Tujuan Komunikasi", note: "Poster bertujuan menginformasikan, mengajak/mempersuasi, mendidik, atau memengaruhi pandangan pembaca.", zone: "galeri" },
  { id: "orb-7", title: "Diksi Persuasif", note: "Diksi persuasif memilih kata yang jelas, sopan, positif, dan sesuai sasaran pembaca.", zone: "studio" },
  { id: "orb-8", title: "Kesantunan Berbahasa", note: "Kesantunan berbahasa ditunjukkan lewat salam, sapaan, pilihan kata halus, intonasi, dan penghargaan pada lawan bicara.", zone: "arena" },
];

// ---------------- NPC ----------------
export const NPCS: {
  id: string;
  name: string;
  role: string;
  color: number;
  shirt: number;
  lines: string[];
  zone: string;
}[] = [
  {
    id: "npc-pustakawati",
    name: "Bu Ratna",
    role: "Pustakawati Kota Informasi",
    color: 0xd9a276,
    shirt: 0x2f6f8f,
    zone: "gerbang",
    lines: [
      "Selamat datang di Kota Informasi, Penjelajah Literasi!",
      "Belakangan ini kabar di kota bercampur: ada fakta, ada opini, bahkan ada kabar yang belum jelas sumbernya.",
      "Mulailah dari Gerbang Literasi. Kumpulkan pecahan petunjuk, lalu urutkan tahapan mencari informasi yang benar.",
    ],
  },
  {
    id: "npc-wartawan",
    name: "Pak Darmawan",
    role: "Redaktur Kantor Berita",
    color: 0xc08a5a,
    shirt: 0x8a3f3f,
    zone: "kota",
    lines: [
      "Di kantor berita, setiap kabar harus lolos uji: siapa sumbernya, apa buktinya, kapan kejadiannya.",
      "Ingat, pernyataan berisi angka dan dapat diverifikasi umumnya fakta. Pernyataan berisi penilaian pribadi itulah opini.",
      "Bantu saya memilah berita ini. Salakan yang fakta, yang opini, dan pasangkan klaim dengan buktinya.",
    ],
  },
  {
    id: "npc-kurator",
    name: "Mbak Ayu",
    role: "Kurator Galeri Multimedia",
    color: 0xe0b48c,
    shirt: 0x6a4b8f,
    zone: "galeri",
    lines: [
      "Poster berbicara lewat dua bahasa: teks dan gambar. Keduanya harus saling menguatkan.",
      "Perhatikan judul, ilustrasi, slogan, informasi penting, dan identitas penerbit pada tiap poster.",
      "Setelah mengamati, nilailah poster mana yang paling efektif menyampaikan pesannya.",
    ],
  },
  {
    id: "npc-desainer",
    name: "Kak Reza",
    role: "Desainer Studio Kreasi Bahasa",
    color: 0xb87a52,
    shirt: 0x2f7a5c,
    zone: "studio",
    lines: [
      "Poster yang baik itu sederhana, terbaca dari jauh, dan punya satu pesan utama.",
      "Susun unsurnya dulu: judul, ilustrasi, slogan, informasi penting, lalu identitas penerbit.",
      "Setelah itu pilihlah diksi yang sopan dan menggugah. Ayo rakit poster kampanyemu di meja kerja!",
    ],
  },
  {
    id: "npc-moderator",
    name: "Bu Halimah",
    role: "Moderator Arena Komomunikasi",
    color: 0xcf9a6a,
    shirt: 0x8f6f2f,
    zone: "arena",
    lines: [
      "Di Arena Komunikasi, gagasan yang bagus tetap perlu disampaikan dengan santun.",
      "Buka dengan salam, perkenalkan diri, sampaikan isi secara runtut, lalu tutup dengan ucapan terima kasih.",
      "Saat gelar wicara berlangsung, hargai pembicara lain dan gunakan bahasa yang menghargai penonton.",
    ],
  },
  {
    id: "npc-arsitek",
    name: "Pak Murdani",
    role: "Arsitek Literasi Kota",
    color: 0xa97550,
    shirt: 0x33456b,
    zone: "pusat",
    lines: [
      "Kota Informasi akan pulih bila warganya mampu menimbang informasi dan menyampaikan gagasan dengan jelas.",
      "Misi final menyatukan semuanya: investigasi, analisis bukti, penyusunan naskah, dan presentasi.",
      "Tunjukkan bahwa kamu penjelajah literasi sejati. Kota menantukan!",
    ],
  },
];

// ---------------- POSTERS (Galeri) ----------------
export const POSTERS = [
  {
    id: "poster-lhk",
    title: "Kampanye Lingkungan",
    purpose: "Ajakan / persuasi (layanan masyarakat)",
    headline: "Selamatkan Sungai Kita",
    slogan: "Sungai bersih, hidup sehat!",
    body: "Ayo pilah sampah rumah tangga dan hentikan pembuangan limbah ke sungai mulai hari ini.",
    footer: "Dinas Lingkungan Hidup Kota Informasi",
    palette: ["#0f5e4a", "#1f9c6b", "#e9f7a3"] as [string, string, string],
    emblem: "🌊",
    analysis:
      "Poster ini berjenis layanan masyarakat (public service). Judul memakai kata kerja ajakan 'Selamatkan', slogan memakai diksi positif, dan gambar sungai yang jernih mendukung pesan.",
    explicitMeaning: "Warga diminta memilah sampah dan tidak membuang limbah ke sungai.",
    impliedMeaning:
      "Tersirat bahwa kerusakan sungai dipicah kebiasaan warga sehari-hari, sehingga perubahan dimulai dari tindakan kecil dan kolektif rumah tangga.",
    regions: [
      { id: "judul", label: "Judul", x: 50, y: 50, w: 76, h: 14, note: "Tulisan paling besar dan mencolok: inti pesan poster." },
      { id: "ilustrasi", label: "Ilustrasi", x: 50, y: 30, w: 42, h: 28, note: "Gambar utama yang membangkitkan perasaan dan menarik perhatian." },
      { id: "slogan", label: "Slogan", x: 50, y: 66, w: 80, h: 9, note: "Kalimat pendek yang mudah diingat dan menggugah." },
      { id: "info", label: "Informasi Penting", x: 50, y: 77, w: 90, h: 10, note: "Rincian ajakan/kegiatan yang perlu diketahui pembaca." },
      { id: "penerbit", label: "Identitas Penerbit", x: 50, y: 95, w: 90, h: 7, note: "Nama lembaga penanggung jawab pesan (kredibilitas)." },
    ],
  },
  {
    id: "poster-seminar",
    title: "Pengumuman Acara",
    purpose: "Menginformasikan (ajakan mengikuti kegiatan)",
    headline: "Gelar Wicara Literasi",
    slogan: "Bicara Kritis, Berbahasa Santun",
    body: "Sabtu, 18 April 2026 · 08.00–11.30 WITA · Auditorium Kota Informasi. Pemateri: praktis media & pustakawan.",
    footer: "OSIS & MPK SMAN 10 Pinrang",
    palette: ["#132c6b", "#3f6fd8", "#ffd76a"] as [string, string, string],
    emblem: "🎤",
    analysis:
      "Poster acara menonjolkan informasi penting: waktu, tempat, dan pemateri. Ketepatan data (tanggal, jam) menjadi kunci keberhasilannya.",
    explicitMeaning: "Ada gelar wicara literasi pada Sabtu, 18 April 2026 di Auditorium Kota Informasi.",
    impliedMeaning: "Tersirat ajakan agar siswa aktif berlatih berpikir kritis sekaligus menjaga kesantunan berbahasa di ruang publik.",
    regions: [
      { id: "judul", label: "Judul", x: 50, y: 50, w: 70, h: 13, note: "Nama kegiatan dibuat paling dominan." },
      { id: "ilustrasi", label: "Ilustrasi", x: 50, y: 30, w: 40, h: 26, note: "Ikon mikrofon menggambarkan kegiatan bicara." },
      { id: "slogan", label: "Slogan", x: 50, y: 64, w: 76, h: 9, note: "Tema kegiatan yang singkat dan mudah diingat." },
      { id: "info", label: "Informasi Penting", x: 50, y: 77, w: 92, h: 12, note: "Tanggal, jam, tempat, dan pemateri." },
      { id: "penerbit", label: "Identitas Penerbit", x: 50, y: 95, w: 90, h: 7, note: "Penyelenggara kegiatan." },
    ],
  },
  {
    id: "poster-kesehatan",
    title: "Layanan Kesehatan",
    purpose: "Mendidik & menginformasikan",
    headline: "Cuci Tangan Benar",
    slogan: "Dua puluh detik melindungi kita",
    body: "Gunakan air mengalir dan sabun. Basahi, gosok punggung tangan, sela jari, kuku, lalu bilas dan keringkan.",
    footer: "Puskesmas Kota Informasi",
    palette: ["#0d4f6b", "#28a0c8", "#e8fbff"] as [string, string, string],
    emblem: "🧼",
    analysis:
      "Poster edukasi memakai urutan langkah yang jelas dan kalimat perintah. Tujuannya membentuk pemahaman, bukan menjual.",
    explicitMeaning: "Pembaca diberi langkah mencuci tangan dengan air mengalir dan sabun.",
    impliedMeaning: "Tersirat bahwa kebiasaan kecil sehari-hari menentukan kesehatan bersama dan menekan penularan penyakit.",
    regions: [
      { id: "judul", label: "Judul", x: 50, y: 50, w: 66, h: 12, note: "Topik edukasi dinyatakan langsung." },
      { id: "ilustrasi", label: "Ilustrasi", x: 50, y: 30, w: 40, h: 24, note: "Gambar mendukung pemahaman langkah." },
      { id: "slogan", label: "Slogan", x: 50, y: 63, w: 70, h: 8, note: "Pengingat singkat durasi cuci tangan." },
      { id: "info", label: "Informasi Penting", x: 50, y: 76, w: 90, h: 12, note: "Uraian langkah yang harus dilakukan." },
      { id: "penerbit", label: "Identitas Penerbit", x: 50, y: 95, w: 86, h: 7, note: "Lembaga kesehatan penanggung jawab." },
    ],
  },
  {
    id: "poster-produk",
    title: "Iklan Produk",
    purpose: "Persuasi komersial",
    headline: "Tas Kanvas Literasi",
    slogan: "Gaya hemat, bumi senyum",
    body: "Bahan kanvas daur ulang, kuat, dan tahan air. Dapatkan potongan 20% untuk pembelian dua tas.",
    footer: "Toko Kreasi Kota Informasi",
    palette: ["#6b2f2f", "#c85a3f", "#ffe1a8"] as [string, string, string],
    emblem: "👜",
    analysis:
      "Poster komersial menonjolkan keunggulan produk dan penawaran (diskon). Perhatikan bahwa kata 'terbaik' tanpa data termasuk opini/pujian, bukan fakta.",
    explicitMeaning: "Tas kanvas dari bahan daur ulang dijual dengan potongan 20% untuk pembelian dua tas.",
    impliedMeaning: "Tersirat ajakan agar pembaca turut gaya hidup ramah lingkungan sambil tampil modis.",
    regions: [
      { id: "judul", label: "Judul", x: 50, y: 50, w: 68, h: 13, note: "Nama produk diposisikan mencolok." },
      { id: "ilustrasi", label: "Ilustrasi", x: 50, y: 30, w: 40, h: 24, note: "Gambar produk yang ditawarkan." },
      { id: "slogan", label: "Slogan", x: 50, y: 63, w: 66, h: 9, note: "Kalimat menarik yang mengaitkan produk dengan nilai." },
      { id: "info", label: "Informasi Penting", x: 50, y: 76, w: 92, h: 12, note: "Keunggulan produk dan penawaran khusus." },
      { id: "penerbit", label: "Identitas Penerbit", x: 50, y: 95, w: 84, h: 7, note: "Identitas penjual/produk." },
    ],
  },
];

// ============================================================
// ZONES / LEVELS
// ============================================================
export const ZONES: ZoneDef[] = [
  // ---------------------------------------------------------- 1
  {
    id: "gerbang",
    index: 1,
    name: "Gerbang Literasi",
    levelLabel: "LEVEL 1 — THE BEGINNING",
    subtitle: "Orientasi, kontrol, dan pengumpulan petunjuk",
    position: [0, 74],
    color: "#f5b32a",
    icon: "🚪",
    story:
      "Kamu tiba di Gerbang Literasi, gerbang utama Kota Informasi. Kota sedang guncang: informasi bercampur, bukti jarang diperiksa, dan gagasan warga tidak tersampaikan dengan jelas.",
    mission: "Kumpulkan pecahan petunjuk di sekitar gerbang, lalu urutkan tahapan literasi informasi yang benar.",
    targets: [
      "Menjelaskan tujuan ekspedisi literasi",
      "Menggunakan kontrol gerak, kamera, dan interaksi",
      "Mengurutkan tahapan literasi informasi",
    ],
    tasks: [
      {
        id: "gerbang-explore",
        type: "explore",
        title: "Eksplorasi Gerbang",
        brief: "Jelajahi area gerbang dan kumpulkan 3 Pecahan Petunjuk yang bercahaya.",
        instruction:
          "Berjalanlah mendekati bola cahaya lalu tekan E (atau tombol INTERAKSI) untuk mengambil. Petunjuk akan masuk ke Jurnal.",
        points: 20,
        targetCount: 3,
        targetKind: "clue-gerbang",
      },
      {
        id: "gerbang-sequence",
        type: "sequence",
        title: "Teka-Teki Tahapan Literasi",
        brief: "Papan misi gerbang menampilkan enam tahapan literasi informasi yang teracak.",
        instruction: "Seret kartu ke urutan yang benar, lalu tekan PERIKSA.",
        points: 20,
        steps: [
          { id: "s1", text: "Menentukan kebutuhan informasi dan pertanyaan yang ingin dijawab", hint: "Semua dimulai dari pertanyaan, bukan dari sumber." },
          { id: "s2", text: "Menelusuri berbagai sumber: buku, artikel, media digital, narasumber", hint: "Cari lebih dari satu sumber agar bisa dibandingkan." },
          { id: "s3", text: "Memilih informasi yang relevan dengan kebutuhan", hint: "Banyak data, sedikit yang relevan." },
          { id: "s4", text: "Memeriksa kebenaran: membandingkan sumber dan menilai bukti", hint: "Ini inti evaluasi informasi." },
          { id: "s5", text: "Menyimpulkan makna tersurat dan tersirat", hint: "Setelah data bersih, barulah makna disimpulkan." },
          { id: "s6", text: "Menggunakan dan menyampaikan informasi secara etis dan santun", hint: "Informasi bermakna bila disampaikan dengan benar." },
        ],
      },
    ],
    theory: {
      ringkasan:
        "Literasi informasi adalah kemampuan menemukan, menilai, dan menggunakan informasi secara tepat. Pada teks visual/audiovisual, informasi hadir lewat gabungan kata, gambar, warna, dan suara sehingga penilaian harus memperhitungkan keduanya.",
      konsep: [
        { heading: "Gagasan, Perasaan, Pandangan, Arahan, Pesan", body: "Gagasan = ide dasar; perasaan = sikap penulis (simpati, kecewa, bangga); pandangan = sudut pandang terhadap isu; arahan = perintah/larangan; pesan = hal yang ingin dituju penulis pada pembaca." },
        { heading: "Tersurat vs Tersirat", body: "Tersurat (denotatif) tertulis/ditampilkan apa adanya. Tersirat (konotatif) harus disimpulkan dari konteks, gambar, pilihan kata, dan warna." },
        { heading: "Mengapa perlu logika berpikir?", body: "Penilaian informasi memakai logika: premis → bukti → kesimpulan. Kesimpulan yang tidak didukung bukti disebut lompatan logika." },
      ],
      istilah: [
        { term: "Literasi informasi", def: "Kemampuan mengenali kebutuhan informasi serta menemukan, menilai, dan memanfaatkannya." },
        { term: "Verifikasi", def: "Pemeriksaan ulang kebenaran suatu kabar dengan membandingkan sumber." },
        { term: "Denotatif", def: "Makna sebenarnya/lugas dari sebuah kata atau tanda." },
        { term: "Konotatif", def: "Makna tambahan yang timbul karena konteks atau perasaan." },
      ],
      contoh: [
        "Tersurat: 'Sungai ini kena limbah rumah tangga.' (tertulis jelas)",
        "Tersirat: gambar ikan mati di poster menunjukkan penulis kecewa pada kelalaian warga.",
        "Arahan: 'Buanglah sampah pada tempatnya.'",
      ],
      refleksi: [
        "Apa pertanyaan yang benar-benar ingin kamu jawab saat mencari informasi?",
        "Pernahkah kamu menyimpulkan sesuatu sebelum memeriksa buktinya?",
      ],
    },
    prosedur: [
      { step: "Kenali kontrol", detail: "W/A/S/D untuk bergerak, tahan Shift untuk berlari, Space untuk melompat, E untuk berinteraksi, seret layar untuk memutar kamera." },
      { step: "Jelajahi area", detail: "Cari objek bercahaya; makin dekat, makin jelas tombol interaksinya." },
      { step: "Kumpulkan petunjuk", detail: "Setiap pecahan petunjuk memberi catatan singkat pada Jurnal dan +10 poin." },
      { step: "Buka papan misi", detail: "Dekati papan lalu tekan E untuk membuka tantangan." },
      { step: "Selesaikan tantangan", detail: "Urutkan tahapan literasi informasi hingga benar." },
    ],
    lkm: {
      judul: "LKM 1 — Orientasi Ekspedisi Literasi",
      tujuan: "Peserta didik mampu menjelaskan tahapan literasi informasi dan menggunakannya sebagai kerangka kerja evaluasi informasi.",
      pemantik: [
        "Mengapa informasi harus diperiksa sebelum dipercaya?",
        "Apa bedanya pesan yang tersurat dan tersirat pada poster?",
      ],
      petunjuk: [
        "Jelajahi Gerbang Literasi dan kumpulkan minimal 3 pecahan petunjuk.",
        "Catat istilah baru yang kamu temukan.",
        "Jawab pertanyaan pemantik dengan kalimat sendiri.",
      ],
      fields: [
        { id: "lkm1-a", label: "Tuliskan enam tahapan literasi informasi dengan bahasamu sendiri.", min: 80, hint: "Gunakan kata kunci: kebutuhan, telusur, pilih, periksa, simpulkan, sampaikan." },
        { id: "lkm1-b", label: "Beri satu contoh makna tersirat yang kamu temukan di dunia game.", min: 60, hint: "Sebut objek/poster dan pesan yang tersirat." },
        { id: "lkm1-c", label: "Refleksi: kesulitan apa yang kamu alami saat mencari petunjuk?", min: 50, hint: "Jujur menulis pengalaman belajar." },
      ],
    },
  },

  // ---------------------------------------------------------- 2
  {
    id: "kota",
    index: 2,
    name: "Kota Informasi",
    levelLabel: "LEVEL 2 — KNOWLEDGE DISCOVERY",
    subtitle: "Membandingkan sumber, fakta–opini, klaim–bukti",
    position: [-72, 28],
    color: "#5ec8ff",
    icon: "🏙️",
    story:
      "Kantor Berita dan Pusat Informasi kota kebanjiran laporan. Sebagian berisi data, sebagian hanya penilaian pribadi, dan beberapa klaim belum punya bukti.",
    mission: "Bantu redaktur memilah fakta dan opini, memasangkan klaim dengan bukti, dan memisahkan makna tersurat dari tersirat.",
    targets: [
      "Membedakan fakta, opini, dan klaim yang belum terbukti",
      "Memasangkan klaim dengan bukti yang relevan",
      "Menafsirkan makna tersurat dan tersirat",
    ],
    tasks: [
      {
        id: "kota-npc",
        type: "explore",
        title: "Temui Sumber Kota",
        brief: "Bicara dengan redaktur kantor berita untuk mendapatkan konteks permasalahan kota.",
        instruction: "Dekati karakter NPC di area Kota Informasi lalu tekan E untuk berbicara.",
        points: 20,
        targetCount: 1,
        targetKind: "npc",
      },
      {
        id: "kota-sort-fakta",
        type: "sort",
        title: "Mesin Pemilah Fakta",
        brief: "Mesin pemilah kota tersumbat. Masukkan tiap pernyataan ke wadah yang tepat.",
        instruction: "Seret kartu ke wadah FAKTA, OPINI, atau KLAIM BELUM TERBUKTI, lalu tekan PERIKSA.",
        points: 20,
        bins: [
          { id: "fakta", label: "FAKTA", desc: "Dapat diverifikasi, berisi data/kejadian", accent: "#39d98a" },
          { id: "opini", label: "OPINI", desc: "Penilaian, perasaan, atau pandangan pribadi", accent: "#ffb64d" },
          { id: "klaim", label: "KLAIM BELUM TERBUKTI", desc: "Menyatakan kebenaran tetapi belum ada bukti", accent: "#ff6b6b" },
        ],
        items: [
          { id: "i1", text: "Berdasarkan data Dinas Kesehatan, 62% sampah kota berupa plastik.", bin: "fakta", note: "Ada data dan lembaga yang dapat dicek." },
          { id: "i2", text: "Menurut saya, poster kampanye itu paling menyentuh hati.", bin: "opini", note: "Ada penanda penilaian pribadi 'menurut saya'." },
          { id: "i3", text: "Katanya minum air kelapa bisa menyembuhkan semua penyakit.", bin: "klaim", note: "'Katanya' = tanpa sumber dan tanpa bukti." },
          { id: "i4", text: "Acara gelar wicara digelar Sabtu, 18 April 2026 pukul 08.00 WITA.", bin: "fakta", note: "Informasi waktu yang dapat dicek pada pengumuman resmi." },
          { id: "i5", text: "Buku literasi terbaru itu membosankan sekali.", bin: "opini", note: "Sifat 'membosankan' adalah penilaian subjektif." },
          { id: "i6", text: "Semua siswa pasti setuju kalau ujian dihapus saja.", bin: "klaim", note: "Generalisasi tanpa data — belum terbukti." },
          { id: "i7", text: "Air sungai di hilir kota tercemar logam berat sebesar 0,8 mg/l.", bin: "fakta", note: "Angka hasil pengukuran laboratorium." },
          { id: "i8", text: "Saya merasa prihatin melihat sungai yang penuh sampah.", bin: "opini", note: "Menyatakan perasaan penulis/sumber." },
        ],
      },
      {
        id: "kota-match-bukti",
        type: "match",
        title: "Meja Verifikasi Bukti",
        brief: "Pasangkan tiap klaim dengan bukti yang paling relevan untuk mengujinya.",
        instruction: "Klik satu klaim lalu klik bukti yang sesuai. Pasangan benar akan terkunci.",
        points: 20,
        pairs: [
          {
            left: { id: "c1", text: "Klaim: Sampah plastik kota meningkat dua kali lipat tahun ini." },
            right: { id: "b1", text: "Rekap timbunan TPA kota dua tahun terakhir dari Dinas Lingkungan Hiduk." },
          },
          {
            left: { id: "c2", text: "Klaim: Warga RT 04 sudah memilah sampah sejak Januari." },
            right: { id: "b2", text: "Catatan hasil kunjungan lapangan dan wawancara ketua RT 04." },
          },
          {
            left: { id: "c3", text: "Klaim: Poster kampanye 'Selamatkan Sungai Kita' efektif menaikkan kesadaran warga." },
            right: { id: "b3", text: "Survei sebelum–sesudah kampanye dengan jumlah responden yang jelas." },
          },
          {
            left: { id: "c4", text: "Klaim: Banyak siswa kesulitan membedakan kabar benar dan hoaks." },
            right: { id: "b4", text: "Hasil tes literasi informasi siswa beserta instrumen dan jumlah sampel." },
          },
        ],
      },
      {
        id: "kota-sort-makna",
        type: "sort",
        title: "Lensa Tersurat–Tersirat",
        brief: "Lensa kaca pusat informasi memisahkan dua lapis makna sebuah teks.",
        instruction: "Seret tiap pernyataan ke kolom TERSURAT atau TERSIRAT.",
        points: 20,
        bins: [
          { id: "surat", label: "TERSURAT", desc: "Tertulis/ditampilkan langsung", accent: "#5ec8ff" },
          { id: "sirat", label: "TERSIRAT", desc: "Disimpulkan dari konteks", accent: "#c77dff" },
        ],
        items: [
          { id: "m1", text: "Poster bertuliskan 'Sungai bersih, hidup sehat!'", bin: "surat", note: "Tulisan itu memang ada di poster." },
          { id: "m2", text: "Penulis poster ingin pembaca merasa ikut bertanggung jawab atas kebersihan sungai.", bin: "sirat", note: "Disimpulkan dari ajakan dan pilihan gambar." },
          { id: "m3", text: "Pengumuman menyebut acara dimulai pukul 08.00 WITA.", bin: "surat", note: "Informasi waktu tertulis jelas." },
          { id: "m4", text: "Warna hijau dan biru dominan dipilih agar terkesan segar dan menenangkan.", bin: "sirat", note: "Tidak tertulis, tetapi dapat ditafsirkan dari pilihan warna." },
          { id: "m5", text: "Penyelenggara acara adalah OSIS & MPK sekolah.", bin: "surat", note: "Terdapat pada bagian identitas penerbit." },
          { id: "m6", text: "Iklan menyiratkan bahwa membeli produk itu sama dengan peduli lingkungan.", bin: "sirat", note: "Strategi mengaitkan produk dengan nilai." },
        ],
      },
    ],
    theory: {
      ringkasan:
        "Evaluasi informasi menuntut kita memilah jenis pernyataan dan menguji kekuatan buktinya. Fakta dapat diverifikasi, opini bersifat subjektif, klaim memerlukan bukti. Makna tersurat diperoleh langsung dari teks; makna tersirat disimpulkan dengan logika dan konteks.",
      konsep: [
        { heading: "Fakta", body: "Pernyataan yang kebenarannya dapat diuji dan diverifikasi (data, kejadian, dokumen, hasil ukur)." },
        { heading: "Opini", body: "Pernyataan berupa penilaian, perasaan, atau pandangan pribadi. Biasanya ditandai kata 'menurut saya', 'sebaiknya', 'paling'." },
        { heading: "Klaim & bukti", body: "Klaim adalah pernyataan yang meminta pembuktian. Bukti kuat: relevan, cukup, berasal dari sumber kredibel, dan dapat diperiksa ulang." },
        { heading: "Sumber kredibel", body: "Ditinjau dari kewenangan (ahli/lembaga resmi), ketepatan waktu, kejelasan data, dan kemungkinan bias kepentingan." },
      ],
      istilah: [
        { term: "Bias", def: "Kecenderungan memihak yang memengaruhi penyajian informasi." },
        { term: "Verifikasi", def: "Memeriksa kebenaran kabar dengan membandingkan beberapa sumber." },
        { term: "Generalisasi tergesa-gesa", def: "Menarik kesimpulan umum dari sedikit contoh." },
        { term: "Sumber primer", def: "Sumber asli: dokumen, data langsung, saksi, hasil penelitian." },
      ],
      contoh: [
        "Fakta: 'TPA kota menerima 120 ton sampah per hari (data 2025)'.",
        "Opini: 'Program daur ulang itu tampak kurang menarik bagi remaja'.",
        "Klaim + bukti: 'Kampanye efektif' perlu didukung survei sebelum–sesudah.",
      ],
      refleksi: [
        "Bagaimana kamu memastikan sebuah angka layak dipercaya?",
        "Keputusan apa yang bisa salah bila opini diperlakukan sebagai fakta?",
      ],
    },
    prosedur: [
      { step: "Amati sumber", detail: "Bicara dengan NPC untuk mengetahui konteks permasalahan kota." },
      { step: "Identifikasi jenis pernyataan", detail: "Cari penanda: data, kata penilaian, atau 'katanya'." },
      { step: "Uji klaim", detail: "Cari bukti yang relevan, cukup, dan berasal dari sumber kredibel." },
      { step: "Bedakan lapis makna", detail: "Tulis dulu yang tersurat, lalu simpulkan yang tersirat." },
      { step: "Simpulkan", detail: "Rumuskan kesimpulan yang didukung bukti, bukan prasangka." },
    ],
    lkm: {
      judul: "LKM 2 — Analisis Informasi Kota",
      tujuan: "Peserta didik mampu membedakan fakta, opini, dan klaim serta menilai kelengkapan buktinya.",
      pemantik: [
        "Apa ciri bahasa yang membedakan fakta dan opini?",
        "Mengapa satu bukti saja kadang tidak cukup?",
      ],
      petunjuk: [
        "Selesaikan Mesin Pemilah Fakta dan Meja Verifikasi Bukti.",
        "Catat contoh yang kamu temui di dunia game.",
        "Tuliskan analisis pada kolom jawaban.",
      ],
      fields: [
        { id: "lkm2-a", label: "Tuliskan satu contoh fakta dan satu contoh opini dari tantangan, beserta alasannya.", min: 80, hint: "Sebut penanda bahasanya." },
        { id: "lkm2-b", label: "Pilih satu klaim lalu jelaskan bukti apa yang dibutuhkan agar klaim itu kuat.", min: 80, hint: "Sebut jenis data, sumber, dan cara mengujinya." },
        { id: "lkm2-c", label: "Tuliskan makna tersurat dan tersirat dari satu poster/berita yang kamu amati.", min: 80, hint: "Gunakan kalimat 'yang tertulis adalah…' dan 'yang tersirat adalah…'." },
      ],
    },
  },

  // ---------------------------------------------------------- 3
  {
    id: "galeri",
    index: 3,
    name: "Galeri Teks & Multimedia",
    levelLabel: "LEVEL 3 — INTERACTIVE CHALLENGE",
    subtitle: "Menganalisis teks visual dan audiovisual",
    position: [72, 28],
    color: "#c77dff",
    icon: "🖼️",
    story:
      "Galeri memamerkan poster, infografik, dan materi audiovisual. Setiap karya punya tujuan, pesan, dan cara membujuk pembaca yang berbeda.",
    mission: "Amati poster, temukan unsurnya, cocokkan tujuannya, dan nilai kekuatan pesannya.",
    targets: [
      "Mengidentifikasi unsur poster",
      "Menghubungkan unsur poster dengan tujuan komunikasinya",
      "Mengevaluasi keefektifan pesan poster",
    ],
    tasks: [
      {
        id: "galeri-spot",
        type: "spot",
        title: "Inspeksi Unsur Poster",
        brief: "Empat poster dipasang di dinding galeri. Temukan bagian yang diminta.",
        instruction:
          "Buka poster (tekan E di depan poster), lalu klik bagian poster yang sesuai dengan pertanyaan. Umpan balik akan muncul tiap kali kamu menunjuk bagian.",
        points: 20,
        posters: POSTERS,
        ask: "Klik bagian poster yang sesuai dengan yang diminta.",
      },
      {
        id: "galeri-match-tujuan",
        type: "match",
        title: "Rak Tujuan Komunikasi",
        brief: "Pasangkan tiap poster dengan tujuan komunikasinya.",
        instruction: "Klik poster lalu klik tujuan yang sesuai.",
        points: 20,
        pairs: [
          { left: { id: "p1", text: "Poster 'Selamatkan Sungai Kita'" }, right: { id: "t1", text: "Mempersuasi warga mengubah kebiasaan (layanan masyarakat)" } },
          { left: { id: "p2", text: "Poster 'Gelar Wicara Literasi'" }, right: { id: "t2", text: "Menginformasikan acara dan mengajak hadir" } },
          { left: { id: "p3", text: "Poster 'Cuci Tangan Benar'" }, right: { id: "t3", text: "Mendidik dengan langkah yang jelas" } },
          { left: { id: "p4", text: "Poster 'Tas Kanvas Literasi'" }, right: { id: "t4", text: "Mempersuasi untuk membeli produk (komersial)" } },
        ],
      },
      {
        id: "galeri-sort-eval",
        type: "sort",
        title: "Panel Penilaian Karya",
        brief: "Panel juri galeri menilai kualitas pesan. Susun penilaianmu.",
        instruction: "Seret pernyataan ke kolom KUAT atau LEMAH sebagai penilaian efektivitas poster.",
        points: 20,
        bins: [
          { id: "kuat", label: "PESAN KUAT", desc: "Jelas, terbaca, didukung bukti", accent: "#39d98a" },
          { id: "lemah", label: "PESAN LEMAH", desc: "Bias, kabur, atau tanpa bukti", accent: "#ff6b6b" },
        ],
        items: [
          { id: "e1", text: "Poster menyampaikan satu pesan utama dan terbaca dari jarak 5 meter.", bin: "kuat", note: "Fokus dan keterbacaan tinggi." },
          { id: "e2", text: "Judul memakai kata 'terbaik' tanpa mencantumkan data pendukung.", bin: "lemah", note: "Pujian kosong tanpa bukti." },
          { id: "e3", text: "Gambar dan teks saling menguatkan satu pesan.", bin: "kuat", note: "Keselarasan unsur visual dan verbal." },
          { id: "e4", text: "Slogan terlalu panjang sehingga sulit diingat.", bin: "lemah", note: "Slogan idealnya singkat dan menggugah." },
          { id: "e5", text: "Tanggal, tempat, dan penyelenggara dicantumkan jelas.", bin: "kuat", note: "Informasi penting lengkap dan dapat diverifikasi." },
          { id: "e6", text: "Poster tidak mencantumkan identitas penerbit.", bin: "lemah", note: "Menurunkan kredibilitas pesan." },
        ],
      },
    ],
    theory: {
      ringkasan:
        "Poster adalah teks visual persuasif yang menggabungkan unsur verbal dan nonverbal. Keefektifannya dinilai dari kejelasan pesan, keterbacaan, keselarasan gambar–teks, dan kredibilitas identitas penerbit.",
      konsep: [
        { heading: "Unsur poster", body: "Judul, ilustrasi/gambar, teks persuasif (slogan), informasi penting (tanggal/tempat/kegiatan), dan identitas penerbit." },
        { heading: "Jenis poster", body: "Poster niaga/komersial, layanan masyarakat (kampanye), pendidikan/edukasi, pengumuman acara, dan propaganda." },
        { heading: "Bahasa visual", body: "Warna, tipografi, komposisi, dan simbol membangkitkan perasaan serta mengarahkan penafsiran pembaca." },
        { heading: "Evaluasi audiovisual", body: "Pada video/iklan layanan masyarakat, periksa juga musik, suara narator, durasi, dan alur penyampaian pesan." },
      ],
      istilah: [
        { term: "Tipografi", def: "Rancangan bentuk huruf agar teks mudah dibaca dan berkesan." },
        { term: "Komposisi", def: "Penataan unsur visual untuk mengarahkan perhatian pembaca." },
        { term: "Slogan", def: "Kalimat pendek yang mudah diingat untuk memperkuat pesan." },
        { term: "Infografik", def: "Gabungan teks dan grafik untuk menyajikan data secara ringkas." },
      ],
      contoh: [
        "Poster kampanye: kata kerja ajakan + gambar dampak + identitas lembaga.",
        "Poster acara: tanggal, waktu, tempat, pemateri, dan penyelenggara wajib jelas.",
        "Poster produk: keunggulan + penawaran + identitas penjual.",
      ],
      refleksi: [
        "Poster mana yang paling meyakinkan bagimu? Mengapa?",
        "Apakah gambar yang dramatis selalu berarti informasinya benar?",
      ],
    },
    prosedur: [
      { step: "Amati keseluruhan", detail: "Lihat poster dari jauh: apa yang pertama kali terbaca?" },
      { step: "Identifikasi unsur", detail: "Temukan judul, ilustrasi, slogan, informasi penting, dan penerbit." },
      { step: "Tentukan tujuan", detail: "Tanyakan: menginformasikan, mengajak, mendidik, atau menjual?" },
      { step: "Tafsirkan pesan", detail: "Tuliskan makna tersurat, lalu simpulkan makna tersirat." },
      { step: "Nilai efektivitas", detail: "Beri penilaian berbasis kriteria: fokus, keterbacaan, keselarasan, kredibilitas." },
    ],
    lkm: {
      judul: "LKM 3 — Analisis Teks Visual",
      tujuan: "Peserta didik mampu menganalisis unsur, tujuan, dan pesan poster serta menilai efektivitasnya.",
      pemantik: [
        "Bagaimana unsur visual memengaruhi penafsiran pembaca?",
        "Siapa yang diuntungkan oleh pesan sebuah poster?",
      ],
      petunjuk: [
        "Periksa keempat poster di galeri melalui tombol interaksi.",
        "Gunakan panel penilaian sebagai kerangka menulis evaluasi.",
        "Tuliskan hasil analisis pada kolom jawaban.",
      ],
      fields: [
        { id: "lkm3-a", label: "Pilih satu poster, tuliskan unsur-unsurnya dan fungsinya masing-masing.", min: 100, hint: "Judul, ilustrasi, slogan, informasi penting, penerbit." },
        { id: "lkm3-b", label: "Tuliskan makna tersurat dan tersirat dari poster tersebut.", min: 80, hint: "Pisahkan kalimat untuk tersurat dan tersirat." },
        { id: "lkm3-c", label: "Beri penilaian efektivitas poster itu dengan alasan yang jelas.", min: 80, hint: "Gunakan kriteria: fokus, keterbacaan, keselarasan, kredibilitas." },
      ],
    },
  },

  // ---------------------------------------------------------- 4
  {
    id: "studio",
    index: 4,
    name: "Studio Kreasi Bahasa",
    levelLabel: "LEVEL 4 — REALISTIC SIMULATION",
    subtitle: "Merakit poster & menyusun naskah persuasif",
    position: [-72, -42],
    color: "#39d98a",
    icon: "🎨",
    story:
      "Studio Kreasi menyiapkan kampanye 'Kota Informasi Bebas Hoaks'. Kamu ditunjuk sebagai perancang poster dan penulis naskahnya.",
    mission: "Rakit unsur poster pada dinding kerja 3D, pilih diksi yang tepat, lalu susun naskah kampanye.",
    targets: [
      "Menempatkan unsur poster sesuai fungsinya (simulasi 3D)",
      "Memilih diksi persuasif yang santun",
      "Menyusun naskah kampanye yang logis dan sistematis",
    ],
    tasks: [
      {
        id: "studio-poster3d",
        type: "poster3d",
        title: "Simulasi Perakit Poster 3D",
        brief: "Lima unsur poster tergeletak di meja kerja. Rakit pada dinding sesuai fungsinya.",
        instruction:
          "Tekan E pada unsur di meja untuk mengangkat, dekati slot di dinding, lalu tekan E lagi untuk memasang. Penempatan benar akan bersinar hijau.",
        points: 30,
        simulation: true,
      },
      {
        id: "studio-sort-jenis",
        type: "sort",
        title: "Rak Jenis Poster",
        brief: "Rak arsip studio berisi beragam poster. Kelompokkan sesuai jenisnya.",
        instruction: "Seret tiap deskripsi ke jenis poster yang tepat.",
        points: 20,
        bins: [
          { id: "komersial", label: "KOMERSIAL", desc: "Mempromosikan produk/jasa", accent: "#ff8fab" },
          { id: "kamsos", label: "LAYANAN MASYARAKAT", desc: "Kampanye kebaikan bersama", accent: "#39d98a" },
          { id: "edukasi", label: "PENDIDIKAN", desc: "Memberi pemahaman/langkah", accent: "#5ec8ff" },
          { id: "acara", label: "PENGUMUMAN ACARA", desc: "Menginformasikan kegiatan", accent: "#ffb64d" },
        ],
        items: [
          { id: "j1", text: "Mengiklankan tas kanvas daur ulang dengan potongan harga.", bin: "komersial", note: "Ada produk dan penawaran." },
          { id: "j2", text: "Mengajak warga memilah sampah untuk mengurangi timbunan TPA.", bin: "kamsos", note: "Kampanye untuk kebaikan bersama." },
          { id: "j3", text: "Menampilkan langkah mencuci tangan yang benar.", bin: "edukasi", note: "Memberi pemahaman berurutan." },
          { id: "j4", text: "Mengumumkan gelar wicara literasi beserta tanggal dan pemateri.", bin: "acara", note: "Informasi kegiatan." },
          { id: "j5", text: "Mengajak siswa melaporkan kabar palsu ke platform cek fakta.", bin: "kamsos", note: "Kampanye antihoks." },
          { id: "j6", text: "Menawarkan jasa les privat dengan nomor kontak.", bin: "komersial", note: "Menawarkan jasa." },
          { id: "j7", text: "Menjelaskan cara membedakan fakta dan opini lewat infografik.", bin: "edukasi", note: "Menambah pemahaman konsep." },
          { id: "j8", text: "Mengumumkan lomba poster antarkelas beserta tenggat pengumpulan.", bin: "acara", note: "Pengumuman kegiatan/Perlombaan." },
        ],
      },
      {
        id: "studio-compose",
        type: "compose",
        title: "Meja Penyusun Naskah",
        brief: "Tulis naskah kampanye 'Kota Informasi Bebas Hoaks' dengan diksi yang santun.",
        instruction:
          "Lengkapi naskah. Sistem memeriksa kelengkapan isi (bukan menilai kualitas bahasa secara otomatis) — guru akan menilai kualitasnya.",
        points: 30,
        simulation: true,
        fields: [
          { id: "judul", label: "Judul poster (singkat, mencolok, max 8 kata)", min: 8, hint: "Contoh pola: kata kerja + objek." },
          { id: "slogan", label: "Slogan persuasif (5–10 kata)", min: 10, hint: "Gunakan diksi positif dan menggugah." },
          { id: "ajakan", label: "Kalimat ajakan untuk pembaca (1–2 kalimat)", min: 40, hint: "Sertakan alasan dan tindakan yang jelas." },
          { id: "info", label: "Informasi penting (tempat, waktu, atau langkah tindakan)", min: 40, hint: "Buat data yang dapat diverifikasi." },
          { id: "penerbit", label: "Identitas penerbit/komunitas", min: 10, hint: "Contoh: Komunitas Literasi SMA." },
        ],
      },
    ],
    theory: {
      ringkasan:
        "Menyusun teks persuasif berarti memilih gagasan, menyusun argumen, dan memilih diksi yang tepat agar pembaca tergerak. Poster yang baik sederhana, terbaca dari jauh, dan hanya membawa satu pesan utama.",
      konsep: [
        { heading: "Langkah membuat poster", body: "1) Tentukan tujuan dan sasaran pembaca; 2) Rumuskan satu pesan utama; 3) Pilih diksi singkat dan sopan; 4) Rancang tata letak & warna; 5) Cantumkan informasi penting dan identitas penerbit; 6) Uji keterbacaan lalu revisi." },
        { heading: "Diksi persuasif", body: "Gunakan kata kerja ajakan, konjungsi penalaran (karena, sehingga), kata konkret, dan hindari kata yang menyerang atau menakut-nakuti berlebihan." },
        { heading: "Struktur naskah", body: "Pembuka (salam & hooks) → isi (gagasan, alasan, bukti) → penutup (ajakan, harapan, terima kasih)." },
        { heading: "Etika persuasi", body: "Persuasi yang baik tidak menipu: klaim tetap didukung bukti dan menghargai kebebasan pembaca memilih." },
      ],
      istilah: [
        { term: "Persuasi", def: "Upaya mengajak orang lain dengan alasan dan bukti, bukan paksaan." },
        { term: "Diksi", def: "Pilihan kata yang disesuaikan dengan tujuan dan sasaran pembaca." },
        { term: "Konjungsi kausalitas", def: "Kata hubung sebab-akibat: karena, sebab, sehingga, akibatnya." },
        { term: "Sasaran pembaca", def: "Kelompok yang dituju teks; menentukan pilihan bahasa." },
      ],
      contoh: [
        "Slogan: 'Cek dulu, bagikan kemudian.'",
        "Ajakan: 'Luangkan dua menit untuk memeriksa sumber sebelum membagikan kabar, karena satu unggahan bisa menjangkau ribuan orang.'",
        "Informasi penting: 'Layanan cek fakta kota: 08.00–15.00, di Pusat Informasi.'",
      ],
      refleksi: [
        "Apakah kata yang kamu pilih menghargai pembaca?",
        "Bagian mana dari naskahmu yang paling meyakinkan, dan mengapa?",
      ],
    },
    prosedur: [
      { step: "Tentukan pesan utama", detail: "Satu kalimat yang menjelaskan apa yang ingin pembaca lakukan." },
      { step: "Rakit unsur poster", detail: "Di simulasi 3D, pilih unsur dan pasang pada slot sesuai fungsinya." },
      { step: "Pilih diksi", detail: "Ringkas, positif, sopan, dan sesuai sasaran pembaca." },
      { step: "Susun naskah", detail: "Ikuti struktur pembuka–isi–penutup dengan alasan/bukti." },
      { step: "Uji & revisi", detail: "Minta teman membaca 10 detik; apakah pesanmu tertangkap?" },
    ],
    lkm: {
      judul: "LKM 4 — Kreasi Teks Persuasif",
      tujuan: "Peserta didik mampu menyusun poster dan naskah persuasif secara logis, sistematis, dan kreatif sesuai norma kesopanan.",
      pemantik: [
        "Apa yang membuat ajakan terasa menghargai pembaca?",
        "Bagaimana data membuat ajakanmu lebih kuat?",
      ],
      petunjuk: [
        "Selesaikan simulasi perakit poster 3D.",
        "Salin dan sempurnakan naskah yang kamu susun di Meja Penyusun Naskah.",
        "Jelaskan alasan pemilihan diksimu.",
      ],
      fields: [
        { id: "lkm4-a", label: "Tuliskan judul, slogan, dan kalimat ajakan kampanyemu.", min: 60, hint: "Gunakan hasil simulasi studio." },
        { id: "lkm4-b", label: "Jelaskan alasan pemilihan diksi dan unsur visual pada postermu.", min: 90, hint: "Kaitkan dengan sasaran pembaca." },
        { id: "lkm4-c", label: "Tuliskan naskah presentasi 1 menit untuk kampanye tersebut (pembuka–isi–penutup).", min: 150, hint: "Gunakan salam, gagasan, dua alasan berbukti, ajakan, terima kasih." },
      ],
    },
  },

  // ---------------------------------------------------------- 5
  {
    id: "arena",
    index: 5,
    name: "Arena Komunikasi",
    levelLabel: "LEVEL 5 — KOMUNIKASI & GELAR WICARA",
    subtitle: "Presentasi, monolog, dialog, dan kesantunan",
    position: [72, -42],
    color: "#ffb64d",
    icon: "🏛️",
    story:
      "Auditorium kota siap digelar wicara. Publik menanti gagasan yang disampaikan runtut, jelas, dan santun.",
    mission: "Susun urutan naskah presentasi, latih kesantunan berbahasa, lalu ikuti simulasi gelar wicara.",
    targets: [
      "Menyusun urutan naskah presentasi",
      "Menggunakan bahasa yang santun dalam monolog dan dialog",
      "Berkomunikasi efektif dalam simulasi gelar wicara",
    ],
    tasks: [
      {
        id: "arena-sequence",
        type: "sequence",
        title: "Susunan Naskah Presentasi",
        brief: "Skrip presentasi teracak di ruang guru. Urutkan bagian naskah yang benar.",
        instruction: "Seret kartu hingga urutannya logis dan sistematis.",
        points: 20,
        steps: [
          { id: "a1", text: "Membuka dengan salam dan sapaan kepada audiens", hint: "Awali dengan kesantunan." },
          { id: "a2", text: "Memperkenalkan diri dan topik yang akan dibawakan", hint: "Audiens perlu tahu siapa dan tentang apa." },
          { id: "a3", text: "Menyampaikan gagasan utama secara ringkas", hint: "Satu kalimat inti." },
          { id: "a4", text: "Menguraikan alasan dan bukti pendukung", hint: "Gunakan data atau contoh nyata." },
          { id: "a5", text: "Memberi contoh penerapan bagi audiens", hint: "Buat abstrak jadi konkret." },
          { id: "a6", text: "Menyimpulkan dan menyampaikan ajakan", hint: "Tutup dengan pesan yang diingat." },
          { id: "a7", text: "Membuka sesi tanya jawab dan menghargai pertanyaan", hint: "Hargai penanya." },
          { id: "a8", text: "Menutup dengan ucapan terima kasih dan salam", hint: "Akhiri dengan sopan." },
        ],
      },
      {
        id: "arena-sort-santun",
        type: "sort",
        title: "Cermin Kesantunan",
        brief: "Cermin besar auditorium memantulkan beragam ucapan. Nilai kesantunannya.",
        instruction: "Seret ke kolom SANTUN atau PERLU DIPERBAIKI.",
        points: 20,
        bins: [
          { id: "santun", label: "SANTUN", desc: "Sesuai norma kesopanan", accent: "#39d98a" },
          { id: "perbaiki", label: "PERLU DIPERBAIKI", desc: "Kasar, memotong, atau merendahkan", accent: "#ff6b6b" },
        ],
        items: [
          { id: "k1", text: "Maaf mengganggu, boleh saya menambahkan pandangan sejenak?", bin: "santun", note: "Ada permisi dan sikap menghargai." },
          { id: "k2", text: "Pendapat Anda salah total, tidak ada gunanya.", bin: "perbaiki", note: "Menyerang pribadi, bukan idenya." },
          { id: "k3", text: "Terima kasih atas pertanyaannya, izinkan saya menjelaskan bagian itu.", bin: "santun", note: "Menghargai penanya." },
          { id: "k4", text: "Cepat selesaikan pertanyaanmu, waktu saya terbatas.", bin: "perbaiki", note: "Intonasi memerintah dan tidak menghargai." },
          { id: "k5", text: "Sepengetahuan saya, datanya berbeda. Boleh kita cek bersama?", bin: "santun", note: "Kritis tetapi santun." },
          { id: "k6", text: "Dasar orang kampung, tidak paham teknologi.", bin: "perbaiki", note: "Merendahkan dan diskriminatif." },
        ],
      },
      {
        id: "arena-dialogue",
        type: "dialogue",
        title: "Simulasi Gelar Wicara",
        brief: "Kamu menjadi salah satu pembicara gelar wicara 'Literasi Kota Informasi'.",
        instruction:
          "Pilih tanggapan yang paling santun dan efektif. Setiap pilihan memberi umpan balik edukatif.",
        points: 30,
        simulation: true,
        situation:
          "Gelar wicara berlangsung di Auditorium Kota Informasi. Pemateri: kamu (perwakilan siswa), Pak Darmawan (jurnalis), dan Bu Ratna (pustakawati). Moderator: Bu Halimah. Audiens: pelajar dan warga.",
        turns: [
          {
            speaker: "Bu Halimah",
            role: "Moderator",
            line: "Dipersilakan kepada perwakilan siswa untuk menyampaikan gagasan tentang literasi informasi. Waktu Anda tiga menit.",
            options: [
              { text: "Assalamualaikum warahmatullahi wabarakatuh. Yang saya hormati bapak ibu, serta teman-teman yang saya banggakan…", feedback: "Salam dan sapaan membuka komunikasi dengan sopan — audiens langsung tersanjung.", score: 3, good: true },
              { text: "Oke, langsung saja ya soal literasi informasi.", feedback: "Isi cepat masuk, tetapi pembuka terasa kurang menghargai audiens dan acara resmi.", score: 1, good: false },
              { text: "Terima kasih. Sebelum mulai, saya mau tanya dulu ke audiens, tadi bapak ibu sudah sarapan belum?", feedback: "Cair, tetapi menjauh dari tujuan dan memakan waktu presentasi.", score: 1, good: false },
            ],
          },
          {
            speaker: "Pak Darmawan",
            role: "Jurnalis",
            line: "Kamu tadi menyebut banyak kabar palsu beredar di kalangan pelajar. Bukti apa yang kamu miliki?",
            options: [
              { text: "Berdasarkan survei literasi informasi di tiga sekolah, 41% responden kesulitan membedakan fakta dan opini. Datanya bisa saya bagikan.", feedback: "Klaim dijawab dengan data dan menawarkan verifikasi — sangat kuat.", score: 3, good: true },
              { text: "Semua orang tahu begitu, Pak. Tidak perlu bukti.", feedback: "Generalisasi tanpa bukti melemahkan kredibilitasmu sebagai pembicara.", score: 0, good: false },
              { text: "Maaf, itu hanya kesan pribadi saya, Pak. Saya akan melengkapi datanya.", feedback: "Jujur dan santun. Akan lebih kuat bila disertai data sejak awal.", score: 2, good: true },
            ],
          },
          {
            speaker: "Bu Ratna",
            role: "Pustakawati",
            line: "Kalau begitu, apa langkah paling sederhana yang bisa langsung dilakukan siswa?",
            options: [
              { text: "Sebelum membagikan kabar, luangkan dua menit untuk memeriksa sumber dan membandingkan dua berita berbeda.", feedback: "Langkah konkret, mudah diingat, dan dapat dilakukan siapa saja.", score: 3, good: true },
              { text: "Hapus semua aplikasi bermedia sosial supaya aman.", feedback: "Solusi tidak proporsional dan tidak menyelesaikan masalah literasi.", score: 1, good: false },
              { text: "Tinggalkan saja kabar yang tidak jelas, biarkan orang lain menanganinya.", feedback: "Sikap pasif; tantangan literasi justru menuntut keberanian memeriksa.", score: 1, good: false },
            ],
          },
          {
            speaker: "Audiens",
            role: "Siswa lain",
            line: "Saya tidak setuju. Menurut saya, sekolah saja yang harus menyelesaikan masalah hoaks ini.",
            options: [
              { text: "Terima kasih atas pendapatnya. Menurut saya sekolah berperan besar, namun kebiasaan memeriksa kabar tetap dilakukan tiap individu.", feedback: "Menghargai perbedaan pandangan sambil menjelaskan argumen — bentuk diskusi santun.", score: 3, good: true },
              { text: "Pendapat Anda keliru, jelas sekali.", feedback: "Menolak pandangan orang lain dengan cara merendahkan.", score: 0, good: false },
              { text: "Baik, kita akhiri saja diskusinya supaya tidak berdebat.", feedback: "Menghindari diskusi; padahal perbedaan pandangan justru memperkaya analisis.", score: 1, good: false },
            ],
          },
          {
            speaker: "Bu Halimah",
            role: "Moderator",
            line: "Waktu kita sudah habis. Silakan menutup presentasi.",
            options: [
              { text: "Demikian gagasan saya. Terima kasih atas perhatian bapak ibu dan teman-teman. Wassalamualaikum warahmatullahi wabarakatuh.", feedback: "Penutup lengkap: simpulan singkat, terima kasih, dan salam.", score: 3, good: true },
              { text: "Ya sudah, cukup sekian.", feedback: "Terlalu singkat dan kurang menghargai audiens.", score: 1, good: false },
              { text: "Maaf kalau tadi saya banyak salah, jangan dihiraukan saja.", feedback: "Merendahkan diri berlebihan bukan bentuk kesantunan komunikatif.", score: 1, good: false },
            ],
          },
        ],
      },
    ],
    theory: {
      ringkasan:
        "Presentasi yang baik memuat gagasan yang jelas, alasan berbukti, dan penutup yang menguatkan. Kesantunan berbahasa menjaga hubungan dengan audiens sekaligus meningkatkan daya persuasi.",
      konsep: [
        { heading: "Jenis komunikasi lisan", body: "Monolog (pidato, presentasi), dialog (wawancara, diskusi), dan gelar wicara (talkshow) yang menggabungkan keduanya dengan moderator." },
        { heading: "Kesantunan", body: "Bentuk: sapaan/salam, kata halus, kalimat permintaan (bukan perintah), menghargai giliran bicara, menghargai perbedaan pendapat, dan intonasi." },
        { heading: "Teknik vokal", body: "Volume, tempo, jeda, dan tekanan disesuaikan dengan ruang dan audiens." },
        { heading: "Gelar wicara", body: "Peran: moderator (mengatur jalannya acara), pemateri (menyampaikan gagasan), dan audiens (bertanya). Kerja sama menjaga suasana." },
      ],
      istilah: [
        { term: "Moderator", def: "Pemimpin diskusi yang mengatur giliran dan waktu bicara." },
        { term: "Pemandangan (ice-breaking)", def: "Bagian pembuka untuk mencairkan suasana." },
        { term: "Turn-taking", def: "Pengaturan giliran berbicara dalam percakapan." },
        { term: "Nomina hormat", def: "Kata sapaan yang menghormati lawan bicara (Bapak, Ibu, Anda)." },
      ],
      contoh: [
        "Pembuka santun: 'Yang saya hormati Bapak/Ibu guru, serta teman-teman yang saya banggakan.'",
        "Menanggapi sanggahan: 'Terima kasih atas pandangannya. Izinkan saya menambahkan…'",
        "Penutup: 'Demikian yang dapat saya sampaikan. Terima kasih atas perhatiannya.'",
      ],
      refleksi: [
        "Kalimat apa yang paling sering membuat diskusi menjadi panas?",
        "Bagaimana caramu menyampaikan ketidaksetujuan tanpa menyakiti?",
      ],
    },
    prosedur: [
      { step: "Siapkan naskah", detail: "Urutkan bagian naskah sesuai struktur presentasi." },
      { step: "Latih pembukaan", detail: "Hafalkan salam, sapaan, dan kalimat gagasan utama." },
      { step: "Simulasi dialog", detail: "Ikuti simulasi gelar wicara; perhatikan umpan balik tiap pilihan." },
      { step: "Kelola sanggahan", detail: "Ucapkan terima kasih, jelaskan argumen, tawarkan verifikasi." },
      { step: "Evaluasi diri", detail: "Catat kalimat yang perlu diperbaiki untuk presentasi nyata." },
    ],
    lkm: {
      judul: "LKM 5 — Presentasi & Gelar Wicara",
      tujuan: "Peserta didik mampu menyampaikan gagasan secara lisan dengan urutan logis dan bahasa yang santun.",
      pemantik: [
        "Apa bedanya presentasi yang meyakinkan dan yang hanya menegaskan?",
        "Bagaimana menyikapi audiens yang tidak setuju?",
      ],
      petunjuk: [
        "Selesaikan susunan naskah dan simulasi gelar wicara.",
        "Catat pilihan yang kamu ambil beserta umpan baliknya.",
        "Tuliskan rencana perbaikan presentasimu.",
      ],
      fields: [
        { id: "lkm5-a", label: "Tuliskan urutan bagian naskah presentasi yang kamu susun.", min: 80, hint: "Salam → perkenalan → gagasan → alasan → contoh → simpulan → tanya jawab → penutup." },
        { id: "lkm5-b", label: "Tuliskan dua contoh kalimat santun yang kamu gunakan saat menanggapi sanggahan.", min: 60, hint: "Awali dengan terima kasih atas pandangan." },
        { id: "lkm5-c", label: "Refleksi: apa yang akan kamu perbaiki pada presentasi berikutnya?", min: 70, hint: "Sebut aspek isi, bahasa, dan sikap." },
      ],
    },
  },

  // ---------------------------------------------------------- 6
  {
    id: "pusat",
    index: 6,
    name: "Pusat Kendali: Misi Final",
    levelLabel: "LEVEL 6 — FINAL EDUCATIONAL MISSION",
    subtitle: "Integrasi investigasi, naskah, dan presentasi",
    position: [0, -12],
    color: "#ff6b6b",
    icon: "🗼",
    story:
      "Menara Pusat Kendali menyala merah. Satu kabar viral memicu kepanikan warga: 'Air sungai kota tidak layak dipakai sama sekali'. Kota membutuhkan investigasi terpadu.",
    mission: "Investigasi bukti, susun naskah presentasi akhir, sampaikan hasilnya, lalu tuliskan refleksi belajarmu.",
    targets: [
      "Mengintegrasikan analisis informasi, kreasi teks, dan keterampilan presentasi",
      "Menyusun naskah presentasi akhir secara mandiri",
      "Merefleksikan proses belajar literasi informasi",
    ],
    tasks: [
      {
        id: "pusat-match-bukti",
        type: "match",
        title: "Investigasi Bukti Final",
        brief: "Empat bukti berhasil dikumpulkan. Pasangkan dengan pertanyaan yang bisa dijawabnya.",
        instruction: "Klik pertanyaan lalu klik bukti yang menjawabnya.",
        points: 20,
        pairs: [
          { left: { id: "q1", text: "Apakah air sungai benar-benar tidak layak dipakai?" }, right: { id: "e1", text: "Hasil uji laboratorium per titik pengambilan sampel beserta tanggal uji." } },
          { left: { id: "q2", text: "Apakah kabar itu dibaca oleh banyak warga?" }, right: { id: "e2", text: "Data metrik unggahan: jumlah tayangan dan wilayah penyebaran." } },
          { left: { id: "q3", text: "Siapa sumber pertama kabar itu?" }, right: { id: "e3", text: "Telusur akun pengunggah pertama dan riwayat unggahannya." } },
          { left: { id: "q4", text: "Apa yang sebaiknya dilakukan warga?" }, right: { id: "e4", text: "Arahan resmi dinas terkait penggunaan air dan jadwal pemeriksaan lanjutan." } },
        ],
      },
      {
        id: "pusat-sequence-final",
        type: "sequence",
        title: "Naskah Presentasi Akhir",
        brief: "Susun naskah presentasi hasil investigasi untuk disampaikan kepada warga.",
        instruction: "Seret bagian naskah hingga membentuk alur yang logis dan sistematis.",
        points: 20,
        steps: [
          { id: "f1", text: "Salam dan sapaan kepada warga serta perkenalan tim investigasi", hint: "Buka dengan sopan." },
          { id: "f2", text: "Menyampaikan isi kabar viral yang beredar", hint: "Sebutkan apa yang diklaim." },
          { id: "f3", text: "Menunjukkan data hasil uji laboratorium dan keterbatasannya", hint: "Sampaikan bukti secara jujur." },
          { id: "f4", text: "Membandingkan pernyataan kabar viral dengan data yang ada", hint: "Inti evaluasi informasi." },
          { id: "f5", text: "Menjelaskan makna tersurat dan tersirat bagi warga", hint: "Dua lapis makna." },
          { id: "f6", text: "Memberi rekomendasi tindakan yang aman dan terukur", hint: "Arahan yang bermanfaat." },
          { id: "f7", text: "Menjawab pertanyaan warga dengan santun", hint: "Hargai penanya." },
          { id: "f8", text: "Menutup dengan simpulan, terima kasih, dan ajakan memeriksa informasi", hint: "Tutup dengan pesan." },
        ],
      },
      {
        id: "pusat-dialogue-final",
        type: "dialogue",
        title: "Presentasi Akhir di Menara",
        brief: "Sampaikan hasil investigasi di hadapan warga dan wartawan.",
        instruction: "Pilih tanggapan terbaik pada tiap giliran bicara.",
        points: 30,
        simulation: true,
        situation:
          "Ruang utama Menara Pusat Kendali. Hadir: warga, perwakilan dinas, dan wartawan. Kamu membawakan hasil investigasi tim literasi.",
        turns: [
          {
            speaker: "Warga",
            role: "Ibu Ros",
            line: "Jadi, benar tidak air sungai kita itu berbahaya? Anak saya tiap hari mandi di sana.",
            options: [
              { text: "Hasil uji menunjukkan dua titik melebihi ambang bakteri pada tanggal tertentu, sementara titik lain masih aman. Jadi belum bisa disebut seluruh sungai berbahaya.", feedback: "Nuansa data disampaikan jelas, tidak melebih-lebihkan — sangat kritis dan akurat.", score: 3, good: true },
              { text: "Benar, semuanya bahaya. Sebaiknya pindah rumah saja.", feedback: "Melampaui data yang ada dan menimbulkan kepanungan baru.", score: 0, good: false },
              { text: "Saya kurang tahu, mungkin tanya orang lain saja.", feedback: "Pembicara kehilangan kredibilitas bila tidak menyiapkan data.", score: 1, good: false },
            ],
          },
          {
            speaker: "Wartawan",
            role: "Pak Darmawan",
            line: "Boleh kami kutip pernyataan Anda bahwa kabar itu hoaks total?",
            options: [
              { text: "Izin koreksi, yang bisa saya sampaikan adalah sebagian isi kabar itu tidak didukung data kami. Silakan gunakan data tertulis sebagai rujukan.", feedback: "Menjaga akurasi kutipan sekaligus tetap kooperatif dengan pers.", score: 3, good: true },
              { text: "Ya, tulis saja hoaks total, biar banyak yang membaca.", feedback: "Menyesatkan pers dan mengulangi pola informasi berlebihan.", score: 0, good: false },
              { text: "Jangan dikutip sama sekali, saya tidak mau repot.", feedback: "Menutup akses informasi publik yang sah.", score: 1, good: false },
            ],
          },
          {
            speaker: "Warga",
            role: "Bapak Jafar",
            line: "Kalau begitu, kita lapor semua orang yang membagikan kabar itu ke polisi saja!",
            options: [
              { text: "Mari kita tekankan edukasi: ajak warga menghapus unggahan yang belum benar dan membagikan rujukan resmi. Hukum menjadi pilihan terakhir bila ada unsur penipuan.", feedback: "Menawarkan jalan proporsional, menjaga suasana, tetap tegas pada akurasi.", score: 3, good: true },
              { text: "Setuju, laporkan semuanya agar kapok.", feedback: "Tindakan berlebihan yang bisa menyakiti orang yang tidak bersalah.", score: 1, good: false },
              { text: "Terserah saja apa yang kalian lakukan.", feedback: "Pembicara tidak memberi arahan pada situasi yang membutuhkan kepemimpinan.", score: 1, good: false },
            ],
          },
          {
            speaker: "Warga",
            role: "Siti (pelajar)",
            line: "Kak, bagaimana caranya supaya saya tidak mudah percaya kabar seperti ini lagi?",
            options: [
              { text: "Biasakan tiga langkah: cek sumbernya, bandingkan dua media berbeda, baru putuskan. Mulai dari kabar yang kamu sendiri ingin bagikan.", feedback: "Langkah konkret, mudah diingat, dan relevan untuk pelajar.", score: 3, good: true },
              { text: "Simpel, jangan baca berita sama sekali.", feedback: "Menghindari informasi bukan solusi literasi.", score: 0, good: false },
              { text: "Kalau ragu, ikuti saja kata teman-temanmu.", feedback: "Merujuk pada otoritas yang keliru.", score: 1, good: false },
            ],
          },
          {
            speaker: "Moderator",
            role: "Bu Halimah",
            line: "Silakan sampaikan penutupan, tim literasi.",
            options: [
              { text: "Kesimpulannya, sebagian kabar itu tidak didukung data. Kami mengajak warga memeriksa sumber, membandingkan berita, dan mengikuti arahan dinas. Terima kasih atas perhatian dan kerja samanya.", feedback: "Simpulan jelas, ajakan konkret, dan penutup santun.", score: 3, good: true },
              { text: "Sekian, sudah capek saya bicara.", feedback: "Penutup tidak menghargai audiens.", score: 0, good: false },
              { text: "Nanti saya kirim berkasnya, tidak usah dijelaskan sekarang.", feedback: "Melewatkan kesempatan menyampaikan simpulan secara langsung.", score: 1, good: false },
            ],
          },
        ],
      },
      {
        id: "pusat-compose-refleksi",
        type: "compose",
        title: "Refleksi Ekspedisi",
        brief: "Tuliskan kesimpulan dan refleksi belajarmu setelah menyelesaikan ekspedisi.",
        instruction: "Isi kolom berikut. Kelengkapan akan diperiksa; kualitas bahasa dinilai gurumu.",
        points: 20,
        fields: [
          { id: "kesimpulan", label: "Kesimpulan: apa yang kamu pelajari tentang evaluasi informasi?", min: 90, hint: "Sebut tahapan dan kriteria bukti." },
          { id: "karya", label: "Gagasan/karya apa yang kamu hasilkan, dan untuk siapa?", min: 60, hint: "Sebut poster/naskah kampanye dan sasarannya." },
          { id: "tantangan", label: "Tantangan terbesar selama ekspedisi dan cara mengatasinya.", min: 60, hint: "Jelaskan strategi yang kamu coba." },
          { id: "rencana", label: "Rencana tindak lanjut literasi di sekolah/masyarakat.", min: 70, hint: "Buat rencana yang realistis." },
        ],
      },
    ],
    theory: {
      ringkasan:
        "Misi final menggabungkan seluruh keterampilan: menelusur informasi, menilai bukti, menafsirkan makna, menciptakan karya, dan menyampaikannya secara santun kepada publik.",
      konsep: [
        { heading: "Integrasi keterampilan", body: "Analisis (memilah bukti) → sintesis (menyusun naskah) → komunikasi (menyampaikan gagasan) → refleksi (menilai proses belajar)." },
        { heading: "Laporan hasil investigasi", body: "Memuat pertanyaan, metode, bukti, keterbatasan data, simpulan, dan rekomendasi." },
        { heading: "Keterbatasan data", body: "Menyatakan keterbatasan justru meningkatkan kredibilitas: sampel terbatas, waktu uji, wilayah cakupan." },
        { heading: "Refleksi belajar", body: "Menilai apa yang berhasil, apa yang sulit, dan apa yang perlu diperbaiki berikutnya." },
      ],
      istilah: [
        { term: "Investigasi", def: "Penelusuran sistematis untuk menjawab pertanyaan dengan bukti." },
        { term: "Rekomendasi", def: "Usulan tindakan berdasarkan simpulan data." },
        { term: "Kredibilitas", def: "Kualitas dapat dipercaya dari sumber atau pembicara." },
        { term: "Metakognisi", def: "Kesadaran dan pengaturan proses berpikir sendiri." },
      ],
      contoh: [
        "Menyatakan keterbatasan: 'Uji dilakukan pada tiga titik, sehingga belum mewakili seluruh aliran sungai.'",
        "Rekomendasi: 'Menambah titik sampel mingguan dan papan informasi resmi di kampung.'",
      ],
      refleksi: [
        "Keterampilan apa yang paling berkembang selama ekspedisi?",
        "Bagaimana kamu akan menerapkannya pada isu nyata di lingkunganmu?",
      ],
    },
    prosedur: [
      { step: "Rumuskan pertanyaan", detail: "Tentukan apa yang benar-benar perlu dijawab." },
      { step: "Kumpulkan bukti", detail: "Cari bukti yang relevan dan catat sumbernya." },
      { step: "Bandingkan klaim", detail: "Cocokkan isi kabar dengan data yang ada." },
      { step: "Susun naskah", detail: "Gunakan struktur presentasi yang runtut." },
      { step: "Sampaikan & refleksi", detail: "Presentasikan, jawab pertanyaan, lalu tuliskan refleksi." },
    ],
    lkm: {
      judul: "LKM 6 — Misi Final & Refleksi",
      tujuan: "Peserta didik mampu mengintegrasikan analisis informasi, penyusunan naskah, dan penyampaian gagasan secara santun.",
      pemantik: [
        "Apa bedanya menyampaikan fakta dan menyampaikan kepanikan?",
        "Bagaimana menyampaikan kabar buruk tanpa menyesatkan?",
      ],
      petunjuk: [
        "Selesaikan seluruh tantangan di Menara Pusat Kendali.",
        "Gunakan data dari simulasi sebagai bahan laporan.",
        "Tuliskan kesimpulan dan refleksi belajar.",
      ],
      fields: [
        { id: "lkm6-a", label: "Tuliskan hasil investigasi: apa yang terbukti dan apa yang belum terbukti.", min: 90, hint: "Pisahkan bagian terbukti dan belum terbukti." },
        { id: "lkm6-b", label: "Tuliskan simpulan dan rekomendasi untuk warga Kota Informasi.", min: 90, hint: "Gunakan data dan bahasa yang menenangkan." },
        { id: "lkm6-c", label: "Refleksi akhir: kompetensi apa yang berkembang dan apa yang perlu dilatih lagi?", min: 90, hint: "Sebut keterampilan analisis, kreasi, dan komunikasi." },
      ],
    },
  },
];

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z]));

export const COMPETENCIES = [
  "Menemukan makna tersurat dan tersirat pada teks visual",
  "Membedakan fakta, opini, dan klaim beserta buktinya",
  "Mengevaluasi keefektifan pesan teks visual/audiovisual",
  "Merakit unsur dan memilih diksi teks persuasif",
  "Menyusun naskah presentasi secara logis dan sistematis",
  "Menyampaikan gagasan secara santun dalam monolog, dialog, dan gelar wicara",
];

export const RECOMMENDATIONS = [
  "Latih membandingkan dua sumber berita berbeda setiap pekan.",
  "Buat satu poster kampanye sosial nyata di lingkungan sekolah.",
  "Berlatih presentasi 3 menit tanpa membaca naskah, lalu minta umpan balik teman.",
  "Ikut serta dalam diskusi/gelar wicara kelas dengan memperhatikan kesantunan berbahasa.",
  "Kembangkan LKM ini menjadi proyek literasi informasi lintas mata pelajaran.",
];
