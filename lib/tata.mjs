/* Menempatkan baris VO di timeline, lalu menurunkan durasi scene dari hasilnya.
   Dua mode, dan memilih yang salah adalah kesalahan paling mahal di seluruh rantai.

   'jangkar' — detik di brief dipakai sebagai BATAS BAWAH: baris tidak boleh mulai sebelum
     gambarnya muncul, tetapi boleh mundur. Scene hanya boleh memanjang.
     Pakai kalau brief-nya ditulis bersama komposisinya dan angkanya benar-benar cocok.

   'alir'    — baris mengalir berurutan dengan jeda kecil tetap; hanya beat yang punya fungsi
     dramatis yang diberi jeda panjang lewat tabel. Durasi scene diturunkan penuh dari hasil,
     jadi scene boleh MEMENDEK.
     Pakai kalau detik di brief ditulis untuk pembaca manusia. Dipakai mentah, suaranya
     menunggu batas scene dan videonya penuh diam. */

export function tempatkan(vo, C, o = {}) {
  const mode = o.mode || 'jangkar';
  const biasa = o.jeda ?? 0.15;
  const tabel = o.jedaKhusus || {};
  let cur = 0;
  for (const l of vo) {
    l.jeda = tabel[l.no] ?? biasa;
    const alir = cur + l.jeda;
    l.pos = mode === 'alir' ? alir : Math.max(C[l.sc] + l.off, alir);
    cur = l.pos + l.dur;
  }
  return cur;
}

/* Durasi scene. Diulang sampai konvergen karena mengubah satu scene menggeser semua
   jangkar sesudahnya. Batas scene ditaruh sedikit SESUDAH kalimat terakhir scene
   sebelumnya, dan diturunkan dari awal yang sudah dibulatkan — bukan dibulatkan satu per
   satu. Dibulatkan per durasi, selisih 0,05 detik menumpuk sampai batas scene jatuh di
   tengah kata dan suara menembus jendela hening. */
export function rencana(vo, scenes, o = {}) {
  const mode = o.mode || 'jangkar';
  const asli = Object.fromEntries(scenes.map((s) => [s.name, s.dur]));
  const ekor = o.ekor || {};
  const geser = o.geserAwal || {};
  const ekorBiasa = o.ekorBiasa ?? 0.6;
  const C = {};
  const hitung = () => { let a = 0; for (const s of scenes) { C[s.name] = a; a += s.dur; } return a; };
  hitung();

  if (mode === 'alir') {
    tempatkan(vo, C, o);
    const awal = {};
    for (const l of vo) awal[l.sc] ??= l.pos - (geser[l.sc] ?? l.jeda) + 0.04;
    const urut = scenes.map((s) => s.name);
    const A = urut.map((n, i) => (i === 0 ? 0 : Math.round(awal[n] * 100) / 100));
    const habis = vo.at(-1).pos + vo.at(-1).dur;
    urut.forEach((n, i) => {
      const batas = i + 1 < urut.length ? A[i + 1] : habis + (ekor[n] ?? ekorBiasa);
      scenes[i].dur = Number((batas - A[i]).toFixed(2));
    });
  } else {
    for (let it = 0; it < 24; it++) {
      tempatkan(vo, C, o);
      const perlu = {};
      for (const l of vo) perlu[l.sc] = Math.max(perlu[l.sc] || 0, l.pos - C[l.sc] + l.dur + (ekor[l.sc] ?? ekorBiasa));
      let ubah = false;
      for (const s of scenes) {
        const d = Math.max(asli[s.name], Math.ceil((perlu[s.name] || 0) * 20) / 20);
        if (Math.abs(d - s.dur) > 0.001) { s.dur = d; ubah = true; }
      }
      hitung();
      if (!ubah) break;
    }
  }
  const total = hitung();
  tempatkan(vo, C, o);
  periksaBatas(vo, scenes, C);
  return {C, total, asli};
}

// Batas scene tidak boleh jatuh di dalam rentang satu baris VO: di situ latar berganti
// warna dan hentakan berbunyi tepat di tengah kata.
function periksaBatas(vo, scenes, C) {
  const batas = scenes.map((s) => C[s.name]);
  for (const l of vo) {
    const b = batas.find((x) => x > l.pos + 0.01 && x < l.pos + l.dur - 0.01);
    if (b !== undefined) throw new Error(`batas scene ${b.toFixed(2)}s memotong VO-${l.no} "${l.text.slice(0, 40)}"`);
  }
}

export function laporan(scenes, asli, vo, total) {
  const bicara = vo.reduce((a, l) => a + l.dur, 0);
  const baris = [`  ${'scene'.padEnd(12)} ${'brief'.padStart(7)} ${'final'.padStart(7)}`];
  for (const s of scenes) {
    const d = s.dur - asli[s.name];
    baris.push(`  ${s.name.padEnd(12)} ${asli[s.name].toFixed(1).padStart(6)}s ${s.dur.toFixed(2).padStart(6)}s  ${Math.abs(d) > 0.005 ? (d > 0 ? '+' : '') + d.toFixed(2) : ''}`);
  }
  const awal = Object.values(asli).reduce((a, b) => a + b, 0);
  baris.push(`  TOTAL ${awal.toFixed(1)}s -> ${total.toFixed(1)}s · bicara ${bicara.toFixed(1)}s · diam ${(total - bicara).toFixed(1)}s`);
  return baris.join('\n');
}
