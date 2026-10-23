# WARTEGKASET — Racik Nasi Bungkus ala Kaset Pita

Hari ke-14 "30 Days of Code" (2026-10-23). Satu halaman web: seluruh situs adalah
**satu kaset fisik raksasa**. SIDE A = 16 lauk sebagai track yang bisa di-PLAY
(zoom masuk lewat lubang spul). SIDE B = studio rekam: racik nasi bungkus,
tekan REKAM, pesanan jadi track baru + struk thermal siap salin ke WA.

Persona: **"Mas Kaset"** — abang warteg kolektor kaset, ceplas-ceplos, semua
copy (termasuk error & empty state) pakai suaranya.

## Fitur

- **Racik bungkus**: porsi nasi (1x/1,5x/2x) + N lauk + level pedas + dibungkus/makan sini
- **Total odometer live** (aria-live) — semua harga berlabel **contoh**, bukan harga beneran
- **REKAM** → tersimpan di `localStorage` (`warteg-kaset-v1`, berversi + validasi skema)
- **Struk thermal** + cap "DIREKAM" tulisan tangan
- **Ekspor**: salin ringkasan WA (dengan fallback), unduh JSON, salin tautan deep-link `?bungkus=<base64url>`
- **Deep-link**: buka tautan → racikan termuat otomatis (dengan validasi)
- **Arsip rekaman**: muat ulang / hapus per rekaman
- **Easter egg**: ketik `rewind` di mana saja
- **Gerak A–E**: kamera terbang scroll (scale+translate+rotate), marquee vertikal 2 band
  (ikut velocity scroll + tombol jeda), headline outline-terisi, tilt 3D kartu,
  zoom-through lingkaran spul (clip-path)
- **Aksesibilitas**: skip link, `prefers-reduced-motion` → layout statis,
  toggle "Gerak: nyala/mati", keyboard penuh (Tab/panah/Enter/Esc), aria-live
  untuk total & status, mode ringan otomatis (CPU/RAM kentang atau FPS < 40)

## Teknologi

- Tanpa build step: `index.html` + `styles.css` + `app.js` (vanilla)
- GSAP 3.12.5 + ScrollTrigger **self-host** di `vendor/` (CDN diblokir di lingkungan QA)
- Font self-host di `fonts/`: Angkor (display), Cousine 400/700 (body), Alex Brush (aksen)
- 16 ikon lauk SVG duotone digambar sendiri + 3 ikon custom (kaset, spul bergigi,
  bungkus nasi); ikon UI dari Tabler Icons (MIT)
- Grain: overlay `feTurbulence` SVG (constraint seed, wajib)

## Skor

- `tools/qa.js`: **exit 0** di Chromium dan WebKit (overflow, console, tap target,
  label, h1, reduced-motion semua lolos)
- FPS dengan CPU throttle 4x (Chromium): **50** (syarat ≥ 45)
- Lighthouse: **[BELUM TERUKUR]** — Chrome/Lighthouse tidak tersedia di VM ini;
  angka tidak dikarang. Budget file: JS ~31KB, CSS ~21KB, font ~77KB, GSAP ~115KB
  (total jauh di bawah budget 250KB gzip JS / 250KB font)

## Cara menjalankan

```sh
cd site
python3 -m http.server 8080
# buka http://localhost:8080
```

Deploy: folder `site/` siap upload apa adanya ke GitHub Pages / Netlify / Vercel
(tanpa build step).

## Kredit

- Ikon UI: [Tabler Icons](https://tabler.io/icons) (MIT)
- Font: Angkor, Cousine, Alex Brush via [Fontsource](https://fontsource.org) (OFL),
  di-self-host sebagai woff2 latin
- Gerak: [GSAP](https://gsap.com) 3.12.5 + ScrollTrigger (di-self-host, pin versi)
- Ilustrasi 16 lauk + kaset + spul + bungkus nasi: SVG digambar sendiri untuk build ini
