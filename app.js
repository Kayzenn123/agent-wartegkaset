/* WARTEGKASET — app.js (tanpa build step, vanilla + GSAP self-host) */
'use strict';

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const rp = n => 'Rp' + n.toLocaleString('id-ID');
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const svgUse = (id, cls) => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('class', cls || 'ic'); s.setAttribute('aria-hidden', 'true');
  const u = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  u.setAttribute('href', '#' + id); s.appendChild(u); return s;
};

/* ================= DATA (semua harga = CONTOH) ================= */
const NASI = { '1x': 5000, '1.5x': 7500, '2x': 10000 };
const LAUK = [
  { id: 'ayam-goreng',  nama: 'Ayam Goreng',  harga: 7000,  ikon: 'i-ayam',      durasi: '3:12', deskripsi: 'Kulitnya krispi, dalemnya juicy. Track wajib di setiap kaset warteg.' },
  { id: 'ayam-bakar',   nama: 'Ayam Bakar',   harga: 8000,  ikon: 'i-ayambakar', durasi: '4:05', deskripsi: 'Dibakar sampai bumbunya meresap. Asapnya aja udah bikin laper.' },
  { id: 'lele-goreng',  nama: 'Lele Goreng',  harga: 6000,  ikon: 'i-lele',      durasi: '2:58', deskripsi: 'Garing di luar, lembut di dalam. Lauk sejuta umat kaki lima.' },
  { id: 'telur-balado', nama: 'Telur Balado', harga: 4000,  ikon: 'i-telur',     durasi: '3:33', deskripsi: 'Telur rebus diselimuti sambal balado. Pedasnya sopan, nggak nyolot.' },
  { id: 'tempe-orek',   nama: 'Tempe Orek',   harga: 3000,  ikon: 'i-tempe',     durasi: '2:41', deskripsi: 'Tempe diiris tipis, digoreng kering, dibumbuin manis gurih. Kriuknya konsisten.' },
  { id: 'tahu-isi',     nama: 'Tahu Isi',     harga: 3000,  ikon: 'i-tahu',      durasi: '2:57', deskripsi: 'Tahu goreng isi sayur. Sekali gigit, isiannya tumpah-tumpah.' },
  { id: 'sayur-asem',   nama: 'Sayur Asem',   harga: 4000,  ikon: 'i-asem',      durasi: '3:08', deskripsi: 'Seger asemnya pas. Temen setia lauk goreng-gorengan.' },
  { id: 'sayur-sop',    nama: 'Sayur Sop',    harga: 4000,  ikon: 'i-sop',       durasi: '3:21', deskripsi: 'Kuah bening hangat, isinya macem-macem. Comfort food sejati.' },
  { id: 'rendang',      nama: 'Rendang',      harga: 10000, ikon: 'i-rendang',   durasi: '5:02', deskripsi: 'Dimasak lama sampai bumbunya nempel semua. Track premium di kaset ini.' },
  { id: 'bandeng-presto', nama: 'Bandeng Presto', harga: 9000, ikon: 'i-bandeng', durasi: '4:44', deskripsi: 'Durinya lunak semua, tinggal hap. Presto beneran, bukan presto-prestoan.' },
  { id: 'cumi-asin',    nama: 'Cumi Asin',    harga: 9000,  ikon: 'i-cumi',      durasi: '3:47', deskripsi: 'Asinnya nendang, cocok buat yang suka rasa berani. Nasinya nambah sendiri.' },
  { id: 'perkedel',     nama: 'Perkedel',     harga: 2500,  ikon: 'i-perkedel',  durasi: '2:22', deskripsi: 'Kentang tumbuk digoreng keemasan. Kecil-kecil cabe rawit.' },
  { id: 'kerupuk',      nama: 'Kerupuk',      harga: 1000,  ikon: 'i-kerupuk',   durasi: '1:58', deskripsi: 'Wajib ada. Nasi bungkus tanpa kerupuk itu kayak kaset tanpa pita.' },
  { id: 'es-teh-manis', nama: 'Es Teh Manis', harga: 4000,  ikon: 'i-esteh',     durasi: '3:15', deskripsi: 'Teh manis dingin, es batunya banyak. Penutup yang nggak pernah salah.' },
  { id: 'teh-hangat',   nama: 'Teh Hangat',   harga: 3000,  ikon: 'i-teh',       durasi: '2:49', deskripsi: 'Buat yang tenggorokannya butuh dipeluk. Manisnya bisa diatur... sama abangnya.' },
  { id: 'sambal',       nama: 'Sambal',       harga: 2000,  ikon: 'i-sambal',    durasi: '2:31', deskripsi: 'Sambal dadakan ulek tangan. Level pedasnya bikin melek.' },
];
const laukById = id => LAUK.find(l => l.id === id);
const PEDAS_LABEL = ['Level 0 — tim aman', 'Level 1 — santai', 'Level 2 — berani', 'Level 3 — lidah kebakaran'];

/* ================= STATE + STORAGE ================= */
const LS_KEY = 'warteg-kaset-v1';
const state = { nasi: '1x', items: {}, pedas: 1, tempat: 'bungkus' };
let rekaman = [];

function storageLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (!d || d.v !== 1 || !Array.isArray(d.rekaman)) throw new Error('skema');
    rekaman = d.rekaman.filter(r =>
      r && typeof r.id === 'string' && typeof r.at === 'string' &&
      NASI[r.nasi] && typeof r.items === 'object' &&
      Object.keys(r.items).every(k => laukById(k) && Number.isInteger(r.items[k]) && r.items[k] > 0 && r.items[k] <= 20) &&
      Number.isInteger(r.pedas) && r.pedas >= 0 && r.pedas <= 3 &&
      (r.tempat === 'bungkus' || r.tempat === 'sini') && Number.isInteger(r.total));
  } catch (e) { rekaman = []; }
}
function storageSave() {
  try { localStorage.setItem(LS_KEY, JSON.stringify({ v: 1, rekaman })); }
  catch (e) { /* penyimpanan penuh/ditolak: lanjut tanpa persist */ }
}
function hitungTotal() {
  let t = NASI[state.nasi] || 0;
  for (const [id, q] of Object.entries(state.items)) { const l = laukById(id); if (l) t += l.harga * q; }
  return t;
}

/* ================= DEEP-LINK ================= */
function muatDeepLink() {
  const q = new URLSearchParams(location.search).get('bungkus');
  if (!q) return false;
  try {
    const b64 = q.replace(/-/g, '+').replace(/_/g, '/');
    const d = JSON.parse(decodeURIComponent(escape(atob(b64))));
    if (!d || !NASI[d.nasi] || typeof d.items !== 'object') throw new Error('skema');
    for (const [id, qty] of Object.entries(d.items)) {
      if (!laukById(id) || !Number.isInteger(qty) || qty < 1 || qty > 20) throw new Error('skema');
    }
    state.nasi = d.nasi; state.items = d.items;
    state.pedas = (Number.isInteger(d.pedas) && d.pedas >= 0 && d.pedas <= 3) ? d.pedas : 1;
    state.tempat = (d.tempat === 'sini') ? 'sini' : 'bungkus';
    return true;
  } catch (e) { return 'rusak'; }
}
function buatDeepLink() {
  const d = { nasi: state.nasi, items: state.items, pedas: state.pedas, tempat: state.tempat };
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(d)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return location.origin + location.pathname + '?bungkus=' + b64;
}

/* ================= RENDER: daftar track SIDE A ================= */
function renderTracks() {
  const ol = $('#daftar-track'); ol.textContent = '';
  LAUK.forEach((l, i) => {
    const li = el('li', 'track reveal-awal');
    li.dataset.id = l.id;
    const nomor = el('span', 'track-nomor', String(i + 1).padStart(2, '0'));
    const ikon = svgUse(l.ikon, 'track-ikon-kecil ic');
    const tengah = el('div', 'track-tengah');
    tengah.appendChild(el('span', 'track-nama', l.nama));
    tengah.appendChild(el('span', 'track-durasi', 'TRACK ' + String(i + 1).padStart(2, '0') + ' · ' + l.durasi));
    const kanan = el('div', 'track-kanan');
    const harga = el('span', 'track-harga', rp(l.harga));
    const ct = el('span', 'ct', 'contoh');
    const play = el('button', 'btn-track-play'); play.type = 'button';
    play.setAttribute('aria-label', 'Putar track ' + l.nama);
    play.appendChild(svgUse('i-play'));
    play.addEventListener('click', () => bukaScene(l.id, play));
    const tambah = el('button', 'btn-track-tambah', '+ MASUK BUNGKUS'); tambah.type = 'button';
    tambah.setAttribute('aria-label', 'Tambah ' + l.nama + ' ke bungkusan');
    tambah.addEventListener('click', () => { tambahLauk(l.id, 1); });
    kanan.append(harga, ct, play, tambah);
    li.append(nomor, ikon, tengah, kanan);
    ol.appendChild(li);
  });
}

/* ================= RENDER: marquee band ================= */
function renderBands() {
  const kiri = $('#band-kiri'), kanan = $('#band-kanan');
  const buat = (wadah, teks) => {
    wadah.textContent = '';
    for (let r = 0; r < 4; r++) teks.forEach(t => wadah.appendChild(el('span', 'band-item', t)));
  };
  buat(kiri, LAUK.map(l => l.nama.toUpperCase()));
  buat(kanan, LAUK.map(l => rp(l.harga) + ' · CONTOH'));
}

/* ================= RENDER: racikan SIDE B ================= */
let totalTampil = 0;
function renderRacik(anim = true) {
  const ul = $('#racik-list'); ul.textContent = '';
  const ids = Object.keys(state.items);
  $('#racik-kosong').hidden = ids.length > 0;
  ids.forEach(id => {
    const l = laukById(id); if (!l) return;
    const qty = state.items[id];
    const li = el('li', 'racik-item');
    const kiri = el('div');
    kiri.appendChild(el('div', 'nm', l.nama + ' × ' + qty));
    const hg = el('div', 'hg', rp(l.harga) + ' × ' + qty + ' = ' + rp(l.harga * qty) + ' ');
    hg.appendChild(el('span', 'ct', 'contoh'));
    kiri.appendChild(hg);
    const kanan = el('div', 'stepper');
    kanan.setAttribute('role', 'group'); kanan.setAttribute('aria-label', 'Jumlah ' + l.nama);
    const kurang = el('button', 'tbtn'); kurang.type = 'button'; kurang.setAttribute('aria-label', 'Kurangi ' + l.nama);
    kurang.appendChild(svgUse('i-minus'));
    kurang.addEventListener('click', () => tambahLauk(id, -1));
    const nilai = el('span', 'stepper-nilai', String(qty));
    const tambah = el('button', 'tbtn'); tambah.type = 'button'; tambah.setAttribute('aria-label', 'Tambah ' + l.nama);
    tambah.appendChild(svgUse('i-plus'));
    tambah.addEventListener('click', () => tambahLauk(id, 1));
    const hapus = el('button', 'tbtn'); hapus.type = 'button'; hapus.setAttribute('aria-label', 'Hapus ' + l.nama + ' dari bungkusan');
    hapus.appendChild(svgUse('i-trash'));
    hapus.addEventListener('click', () => { delete state.items[id]; renderRacik(); });
    kanan.append(kurang, nilai, tambah, hapus);
    li.append(kiri, kanan);
    ul.appendChild(li);
  });
  const target = hitungTotal();
  const tampil = $('#total-nilai');
  if (anim && window.gsap && motionOn && !reducedMotion && Math.abs(target - totalTampil) > 0) {
    const obj = { v: totalTampil };
    gsap.to(obj, { v: target, duration: 0.45, ease: 'power2.out',
      onUpdate: () => tampil.textContent = rp(Math.round(obj.v)) });
  } else {
    tampil.textContent = rp(target);
  }
  totalTampil = target;
  tampil.setAttribute('aria-label', 'Total ' + rp(target) + ', harga contoh');
}
function tambahLauk(id, delta) {
  const l = laukById(id); if (!l) return;
  const q = (state.items[id] || 0) + delta;
  if (q <= 0) delete state.items[id];
  else if (q <= 20) state.items[id] = q;
  else { statusAksi('Mas Kaset: "' + l.nama + '" maksimal 20 porsi, Bos. Wartegnya bisa kehabisan stok.'); return; }
  renderRacik();
}

/* ================= RENDER: arsip rekaman ================= */
function renderArsip() {
  const ol = $('#arsip-list'); ol.textContent = '';
  $('#arsip-kosong').hidden = rekaman.length > 0;
  rekaman.forEach((r, i) => {
    const li = el('li', 'arsip-item');
    const t = el('span', 't', 'RB-' + String(i + 1).padStart(2, '0'));
    const d = el('span', 'd', Object.entries(r.items).map(([id, q]) => q + '× ' + laukById(id).nama).join(', ')
      + ' · nasi ' + r.nasi + ' · ' + rp(r.total) + ' (contoh) · '
      + new Date(r.at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }));
    const muat = el('button', 'btn-track-tambah', 'MUAT LAGI'); muat.type = 'button';
    muat.addEventListener('click', () => {
      state.nasi = r.nasi; state.items = Object.assign({}, r.items);
      state.pedas = r.pedas; state.tempat = r.tempat;
      sinkronForm(); renderRacik();
      document.querySelector('[data-goto="side-b"]').click();
      statusAksi('Bungkusan RB-' + String(i + 1).padStart(2, '0') + ' dimuat ulang ke Side B.');
    });
    const hapus = el('button', 'tbtn'); hapus.type = 'button'; hapus.setAttribute('aria-label', 'Hapus rekaman RB-' + String(i + 1).padStart(2, '0'));
    hapus.appendChild(svgUse('i-trash'));
    hapus.addEventListener('click', () => { rekaman.splice(i, 1); storageSave(); renderArsip(); });
    li.append(t, d, muat, hapus);
    ol.appendChild(li);
  });
}

/* ================= STRUK ================= */
function renderStruk(r) {
  const isi = $('#struk-isi'); isi.textContent = '';
  const judul = el('div', 's-judul', 'WARTEGKASET');
  const tengah1 = el('div', 's-tengah', '*** STRUK BUNGKUSAN ***');
  const tengah2 = el('div', 's-tengah', 'RB-' + String(rekaman.length).padStart(2, '0') + ' · ' +
    new Date(r.at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
  const garis1 = el('div', 's-garis');
  const tabel = el('table');
  const tambahBaris = (nama, nilai, total) => {
    const tr = el('tr');
    const td1 = el('td', null, nama);
    const td2 = el('td', 'r', nilai);
    tr.append(td1, td2); tabel.appendChild(tr);
    if (total) tr.className = 's-total';
  };
  tambahBaris('Nasi ' + r.nasi, rp(NASI[r.nasi]));
  Object.entries(r.items).forEach(([id, q]) => {
    const l = laukById(id);
    tambahBaris(q + '× ' + l.nama, rp(l.harga * q));
  });
  tambahBaris('Pedas: ' + PEDAS_LABEL[r.pedas], r.tempat === 'bungkus' ? 'dibungkus' : 'makan sini');
  tambahBaris('TOTAL', rp(r.total), true);
  const garis2 = el('div', 's-garis');
  const cat = el('div', 's-tengah', 'Semua harga di struk ini CONTOH, bukan harga beneran.');
  const terima = el('div', 's-tengah', 'Matur nuwun, Mas/Mbak!');
  isi.append(judul, tengah1, tengah2, garis1, tabel, garis2, cat, terima);
  $('#struk-kertas').hidden = false;
  $('#struk-aksi').hidden = false;
  $('#struk-desc').textContent = 'Rekaman terakhir terekam rapi. Salin ke WA atau unduh buktinya.';
}

function ringkasanWA(r) {
  const baris = ['*WARTEGKASET — Struk Bungkus ' + r.id.toUpperCase() + '*', ''];
  baris.push('Nasi ' + r.nasi + ' ..... ' + rp(NASI[r.nasi]));
  Object.entries(r.items).forEach(([id, q]) => {
    const l = laukById(id);
    baris.push(q + 'x ' + l.nama + ' ..... ' + rp(l.harga * q));
  });
  baris.push('Pedas: ' + PEDAS_LABEL[r.pedas] + ' · ' + (r.tempat === 'bungkus' ? 'Dibungkus' : 'Makan sini'));
  baris.push('');
  baris.push('*Total: ' + rp(r.total) + '*');
  baris.push('_harga contoh, bukan harga beneran_');
  return baris.join('\n');
}

function statusAksi(pesan) {
  const s = $('#aksi-status'); s.textContent = pesan;
  clearTimeout(statusAksi._t);
  statusAksi._t = setTimeout(() => { s.textContent = ''; }, 6000);
}

async function salinTeks(teks, sukses) {
  try {
    await navigator.clipboard.writeText(teks);
    statusAksi(sukses);
    return;
  } catch (e) { /* lanjut ke fallback */ }
  try {
    const ta = el('textarea'); ta.value = teks;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    statusAksi(ok ? sukses : 'Mas Kaset: "Spul nyangkut! Salin manual aja, Bos — teksnya udah disiapin di bawah."');
  } catch (e2) {
    statusAksi('Mas Kaset: "Spul nyangkut! Clipboard ditolak browser. Coba lagi atau salin manual."');
  }
}

/* ================= GERAK: deteksi & mode ================= */
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let ringan = ((navigator.hardwareConcurrency || 8) <= 4) ||
            ((navigator.deviceMemory || 8) <= 4) ||
            (navigator.connection && navigator.connection.saveData === true);
let motionOn = !reducedMotion;
const punyaGSAP = typeof window.gsap !== 'undefined';
if (punyaGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* ================= GERAK B: marquee vertikal 2 band ================= */
const marquee = { kiri: { el: null, y: 0, dir: 1 }, kanan: { el: null, y: 0, dir: -1 }, jeda: false, vel: 0, lastY: -1 };
function initMarquee() {
  marquee.kiri.el = $('#band-kiri'); marquee.kanan.el = $('#band-kanan');
  if (ringan) { marquee.kanan.el.closest('.band').style.display = 'none'; }
  if (reducedMotion) { marquee.jeda = true; $('#btn-marquee').setAttribute('aria-pressed', 'true'); }
  const io = new IntersectionObserver(es => es.forEach(e => { e.target._tampil = e.isIntersecting; }), { threshold: 0 });
  io.observe(marquee.kiri.el); io.observe(marquee.kanan.el);
  let last = performance.now();
  const loop = now => {
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (marquee.lastY >= 0) {
      const dy = window.scrollY - marquee.lastY;
      marquee.vel += ((dy / Math.max(dt, 0.001)) - marquee.vel) * 0.08;
    }
    marquee.lastY = window.scrollY;
    const aktif = motionOn && !marquee.jeda && !document.hidden;
    [marquee.kiri, marquee.kanan].forEach(b => {
      if (!b.el || b.el.closest('.band').style.display === 'none') return;
      if (aktif && b.el._tampil !== false) {
        const speed = 26 + Math.min(Math.abs(marquee.vel) * 0.045, 260);
        b.y += b.dir * speed * dt;
        const setengah = b.el.scrollHeight / 2;
        if (setengah > 0) { b.y = ((b.y % setengah) + setengah) % setengah; if (b.dir < 0) b.y -= setengah; }
        const skew = Math.max(-14, Math.min(14, marquee.vel * 0.004));
        b.el.style.transform = 'translateY(' + b.y + 'px) skewY(' + (skew * b.dir) + 'deg)';
      }
    });
    if (Math.abs(marquee.vel) < 2) marquee.vel = 0;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  $('#btn-marquee').addEventListener('click', () => {
    marquee.jeda = !marquee.jeda;
    $('#btn-marquee').setAttribute('aria-pressed', String(marquee.jeda));
    $('#btn-marquee').setAttribute('aria-label', marquee.jeda ? 'Jalankan marquee' : 'Jeda marquee');
  });
}

/* ================= GERAK A: kamera terbang (scroll scrub) ================= */
let scrubbers = [];
function initKamera() {
  if (!punyaGSAP || !window.ScrollTrigger || !motionOn) return;
  document.documentElement.classList.add('js-gerak');
  const scenes = $$('.scene');
  scenes.forEach((s, i) => {
    const rot = ringan ? 0 : (i % 2 ? 3 : -3);
    const tw = gsap.fromTo(s,
      { scale: 1, y: 70, rotation: rot },
      { scale: 1.06, y: -50, rotation: 0, ease: 'none',
        scrollTrigger: { trigger: s, start: 'top bottom', end: 'top top', scrub: 1 } });
    scrubbers.push(tw);
  });
  const kaset = $('#kaset');
  if (kaset) {
    const tw = gsap.to(kaset, { scale: 1.18, rotation: ringan ? 0 : -2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    scrubbers.push(tw);
  }
  $$('.outline[data-fill]').forEach(o => {
    const tw = gsap.fromTo(o, { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', ease: 'none',
      scrollTrigger: { trigger: o, start: 'top 85%', end: 'top 35%', scrub: 0.6 } });
    scrubbers.push(tw);
  });
  $$('.reveal-awal').forEach((elm, i) => {
    gsap.set(elm, { y: 24 });
    const tw = gsap.to(elm, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
      scrollTrigger: { trigger: elm, start: 'top 92%', once: true } });
    scrubbers.push(tw);
  });
  ScrollTrigger.refresh();
}
function matikanGerak() {
  scrubbers.forEach(tw => { try { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); } catch (e) {} });
  scrubbers = [];
  $$('.scene, #kaset').forEach(s => gsap && gsap.set(s, { clearProps: 'all' }));
  $$('.reveal-awal').forEach(elm => { elm.style.opacity = ''; elm.style.transform = ''; });
  $$('.outline[data-fill]').forEach(o => { if (window.gsap) gsap.set(o, { clearProps: 'backgroundSize' }); });
}

/* ================= GERAK C: scramble harga ================= */
const SCRAMBLE_CHARS = '█▓▒░<>/\\|01#$%&';
function scramble(elm, teksAkhir, dur = 650) {
  if (reducedMotion || !motionOn) { elm.textContent = teksAkhir; return; }
  const mulai = performance.now();
  const tick = now => {
    const p = Math.min((now - mulai) / dur, 1);
    const n = Math.floor(p * teksAkhir.length);
    let acak = '';
    for (let i = n; i < teksAkhir.length; i++) acak += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    elm.textContent = teksAkhir.slice(0, n) + acak;
    if (p < 1) requestAnimationFrame(tick); else elm.textContent = teksAkhir;
  };
  requestAnimationFrame(tick);
}

/* ================= GERAK D: tilt 3D pointer ================= */
function initTilt() {
  if (reducedMotion || ringan || !motionOn || !matchMedia('(pointer: fine)').matches) return;
  const batas = 9;
  $$('.track, #kaset').forEach(kartu => {
    let raf = null;
    kartu.addEventListener('pointermove', e => {
      if (!motionOn) return;
      const r = kartu.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        kartu.style.transform = 'perspective(900px) rotateX(' + (-py * batas).toFixed(2) + 'deg) rotateY(' + (px * batas).toFixed(2) + 'deg)';
      });
    });
    kartu.addEventListener('pointerleave', () => {
      if (raf) cancelAnimationFrame(raf);
      kartu.style.transform = '';
    });
  });
}

/* ================= GERAK E: zoom-through lingkaran spul ================= */
let sceneTerbuka = null, sceneQty = 1, pembukaScene = null;
function bukaScene(id, tombol) {
  const l = laukById(id); if (!l) return;
  sceneTerbuka = id; sceneQty = 1; pembukaScene = tombol || null;
  const idx = LAUK.indexOf(l);
  $('#track-nomor').textContent = String(idx + 1).padStart(2, '0');
  $('#track-durasi').textContent = l.durasi;
  const nama = $('#track-nama'); nama.textContent = '';
  $('#track-ikon-use').setAttribute('href', '#' + l.ikon);
  $('#track-deskripsi').textContent = l.deskripsi;
  $('#track-jumlah').textContent = '1';
  const overlay = $('#track-scene');
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  const r = (tombol || $('#kaset')).getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  scramble(nama, l.nama);
  scramble($('#track-harga'), rp(l.harga));
  const kartu = $('.scene-kartu', overlay);
  if (punyaGSAP && motionOn && !reducedMotion) {
    gsap.fromTo(overlay,
      { clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)' },
      { clipPath: 'circle(' + (Math.hypot(innerWidth, innerHeight)) + 'px at ' + x + 'px ' + y + 'px)',
        duration: 0.7, ease: 'power3.inOut' });
    gsap.fromTo(kartu, { scale: 0.85, rotation: -4 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'power3.out' });
  }
  $('#h-track').focus({ preventScroll: true });
}
function tutupScene() {
  if (!sceneTerbuka) return;
  const overlay = $('#track-scene');
  const selesai = () => {
    overlay.hidden = true;
    document.body.style.overflow = '';
    sceneTerbuka = null;
    if (pembukaScene) pembukaScene.focus({ preventScroll: true });
  };
  if (punyaGSAP && motionOn && !reducedMotion) {
    const r = overlay.getBoundingClientRect();
    gsap.to(overlay, { clipPath: 'circle(0px at ' + (r.width / 2) + 'px ' + (r.height / 2) + 'px)',
      duration: 0.55, ease: 'power3.inOut', onComplete: selesai });
  } else selesai();
}

/* ================= REKAM ================= */
let rekamTerakhir = null;
function initRekam() {
  $('#form-racik').addEventListener('submit', e => {
    e.preventDefault();
    const err = $('#form-error');
    const ids = Object.keys(state.items);
    if (ids.length === 0) {
      err.hidden = false;
      err.textContent = 'Mas Kaset: "Lauknya mana, Bos? Kaset kosong nggak bisa diputer. Tambah minimal satu lauk dulu."';
      err.setAttribute('tabindex', '-1'); err.focus();
      return;
    }
    err.hidden = true;
    const r = {
      id: 'rb' + Date.now().toString(36),
      at: new Date().toISOString(),
      nasi: state.nasi, items: Object.assign({}, state.items),
      pedas: state.pedas, tempat: state.tempat, total: hitungTotal()
    };
    rekaman.unshift(r); storageSave(); renderArsip();
    rekamTerakhir = r;
    renderStruk(r);
    statusAksi('Terekam! Pesananmu jadi track baru di Side B plus struk thermal. Matur nuwun, Mas/Mbak!');
    const tujuan = $('#struk');
    tujuan.scrollIntoView({ behavior: (motionOn && !reducedMotion) ? 'smooth' : 'auto', block: 'start' });
    $('#h-struk').focus({ preventScroll: true });
  });
}

/* ================= EKSPOR ================= */
function initEkspor() {
  $('#btn-wa').addEventListener('click', () => {
    if (!rekamTerakhir) return;
    salinTeks(ringkasanWA(rekamTerakhir), 'Ringkasan tersalin! Tempel langsung di chat WA abang wartegnya.');
  });
  $('#btn-json').addEventListener('click', () => {
    if (!rekamTerakhir) return;
    const blob = new Blob([JSON.stringify({ v: 1, contoh: true, rekaman: rekamTerakhir }, null, 2)], { type: 'application/json' });
    const a = el('a'); a.href = URL.createObjectURL(blob);
    a.download = 'wartegkaset-' + rekamTerakhir.id + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    statusAksi('JSON terunduh. Isinya racikan terakhirmu.');
  });
  $('#btn-tautan').addEventListener('click', () => {
    salinTeks(buatDeepLink(), 'Tautan bungkusan tersalin! Siapa pun yang buka link itu lihat racikan yang sama.');
  });
}

/* ================= EASTER EGG: ketik "rewind" ================= */
function initEasterEgg() {
  let buf = '';
  const flash = (() => {
    const f = el('div', 'rewind-flash'); f.hidden = true;
    const p = el('p', 'rewind-pesan', 'Spul muter balik! Semua kembali ke awal — kayak kaset diputer ulang. — Mas Kaset');
    f.appendChild(p); document.body.appendChild(f); return f;
  })();
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey) return;
    if (/^[a-z]$/.test(e.key)) {
      buf = (buf + e.key).slice(-6);
      if (buf === 'rewind') {
        buf = '';
        flash.hidden = false;
        const dari = window.scrollY, mulai = performance.now(), dur = 1400;
        const anim = now => {
          const p = Math.min((now - mulai) / dur, 1);
          const e2 = 1 - Math.pow(1 - p, 3);
          window.scrollTo(0, dari * (1 - e2));
          if (p < 1) requestAnimationFrame(anim);
          else setTimeout(() => { flash.hidden = true; }, 1600);
        };
        requestAnimationFrame(anim);
      }
    } else if (e.key === 'Escape' && sceneTerbuka) tutupScene();
  });
}

/* ================= NAVIGASI transport ================= */
function initNavigasi() {
  $$('[data-goto]').forEach(b => b.addEventListener('click', () => {
    const t = document.getElementById(b.dataset.goto);
    if (t) t.scrollIntoView({ behavior: (motionOn && !reducedMotion) ? 'smooth' : 'auto', block: 'start' });
    if (b.id === 'btn-play-hero' || (b.dataset.goto === 'side-a' && b.classList.contains('tbtn-play'))) {
      setTimeout(() => $('#h-side-a').focus({ preventScroll: true }), 600);
    }
  }));
  $('#btn-play-hero').addEventListener('click', () => {
    const t = $('#side-a');
    t.scrollIntoView({ behavior: (motionOn && !reducedMotion) ? 'smooth' : 'auto', block: 'start' });
    setTimeout(() => $('#h-side-a').focus({ preventScroll: true }), 600);
  });
}

/* ================= TOGGLE GERAK ================= */
function initToggleGerak() {
  const btn = $('#btn-gerak'), label = $('#gerak-label');
  const terapkan = () => {
    label.textContent = 'Gerak: ' + (motionOn ? 'nyala' : 'mati');
    btn.setAttribute('aria-pressed', String(motionOn));
    if (!motionOn) matikanGerak();
    else { initKamera(); }
  };
  if (reducedMotion) { motionOn = false; }
  btn.addEventListener('click', () => {
    if (reducedMotion) return;
    motionOn = !motionOn;
    terapkan();
  });
  terapkan();
}

/* ================= FORM sinkron ================= */
function sinkronForm() {
  $$('input[name="nasi"]').forEach(r => { r.checked = r.value === state.nasi; });
  $$('input[name="tempat"]').forEach(r => { r.checked = r.value === state.tempat; });
  $('#pedas').value = state.pedas;
  $('#pedas-label').textContent = PEDAS_LABEL[state.pedas];
}
function initForm() {
  $$('input[name="nasi"]').forEach(r => r.addEventListener('change', () => { state.nasi = r.value; renderRacik(); }));
  $$('input[name="tempat"]').forEach(r => r.addEventListener('change', () => { state.tempat = r.value; renderRacik(false); }));
  $('#pedas').addEventListener('input', e => {
    state.pedas = parseInt(e.target.value, 10);
    $('#pedas-label').textContent = PEDAS_LABEL[state.pedas];
  });
  $('#track-kurang').addEventListener('click', () => {
    sceneQty = Math.max(1, sceneQty - 1);
    $('#track-jumlah').textContent = String(sceneQty);
  });
  $('#track-tambah').addEventListener('click', () => {
    sceneQty = Math.min(20, sceneQty + 1);
    $('#track-jumlah').textContent = String(sceneQty);
  });
  $('#track-masuk').addEventListener('click', () => {
    if (!sceneTerbuka) return;
    const l = laukById(sceneTerbuka);
    tambahLauk(sceneTerbuka, sceneQty);
    statusAksi(sceneQty + '× ' + l.nama + ' masuk bungkus! Cek Side B buat tekan REKAM.');
    tutupScene();
  });
  $('#track-rewind').addEventListener('click', tutupScene);
}

/* ================= FPS guard → mode ringan otomatis ================= */
function initFpsGuard() {
  if (reducedMotion || ringan) return;
  let frames = 0, buruk = 0;
  const t0 = performance.now();
  const cek = () => {
    frames++;
    if (performance.now() - t0 >= 2000) {
      const fps = frames / ((performance.now() - t0) / 1000);
      if (fps < 40) { buruk++; } else { buruk = 0; }
      if (buruk >= 2 && !ringan) {
        ringan = true;
        const kanan = $('#band-kanan');
        if (kanan) kanan.closest('.band').style.display = 'none';
        statusAksi('Mas Kaset: "HP-nya ngos-ngosan, gerak disederhanain dikit ya."');
      }
      frames = 0; return performance.now();
    }
    return t0;
  };
  let awal = t0;
  const loop = () => { awal = cek(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}

/* ================= INIT ================= */
function init() {
  storageLoad();
  const dl = muatDeepLink();
  renderTracks(); renderBands(); renderArsip();
  sinkronForm(); renderRacik(false); totalTampil = hitungTotal();
  if (dl === true) {
    sinkronForm(); renderRacik(false); totalTampil = hitungTotal();
    statusAksi('Bungkusan dari tautan dimuat. Cek Side B, terus tekan REKAM kalau cocok.');
  } else if (dl === 'rusak') {
    statusAksi('Mas Kaset: "Tautannya rusak, pita kusut. Racik manual aja, gampang kok."');
  }
  initMarquee(); initKamera(); initTilt();
  initNavigasi(); initForm(); initRekam(); initEkspor(); initEasterEgg();
  initToggleGerak(); initFpsGuard();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
