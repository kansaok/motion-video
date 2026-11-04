/* Ekspresi detik untuk config JSON: "C.Hasil + 0.5", "P[7] - 0.35", "max(E[4], P[5]) + 0.1".

   Config proyek lokal ditulis sebagai modul JS, dan `cue` di sana adalah fungsi. Di server
   bersama itu sama dengan menjalankan kode siapa pun yang berlangganan — jadi config dari MCP
   berupa JSON, dan detiknya ditulis sebagai ekspresi kecil yang dievaluasi di sini, tanpa
   `eval`. Yang dikenal hanya angka, + - * / dan kurung, min/max, serta nama:
     C.<scene>  mulai scene      S.<scene>  durasi scene
     P[n]       awal VO ke-n     E[n]       akhir VO ke-n      total  durasi video
   Nama scene yang memuat spasi ditulis C['Nama Scene']. */

const FUNGSI = {min: Math.min, max: Math.max};
/** @type {Set<string | number>} */
const PETA = new Set(['C', 'P', 'E', 'S']);

function token(s) {
  const t = [];
  const re = /\s*(?:(\d+(?:\.\d+)?|\.\d+)|([A-Za-z_]\w*)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|([-+*/()[\].,]))/y;
  let i = 0;
  while (i < s.length) {
    if (/^\s*$/.test(s.slice(i))) break;
    re.lastIndex = i;
    const m = re.exec(s);
    if (!m) throw new Error(`karakter tidak dikenal di "${s}" posisi ${i}`);
    if (m[1] !== undefined) t.push({k: 'angka', v: Number(m[1])});
    else if (m[2] !== undefined) t.push({k: 'nama', v: m[2]});
    else if (m[3] !== undefined) t.push({k: 'teks', v: m[3].slice(1, -1).replace(/\\(.)/g, '$1')});
    else t.push({k: 'op', v: m[4]});
    i = re.lastIndex;
  }
  return t;
}

export function hitung(teks, ling) {
  if (typeof teks === 'number') return teks;
  if (typeof teks !== 'string') throw new Error(`ekspresi harus angka atau teks, bukan ${typeof teks}`);
  const t = token(teks);
  let i = 0;
  const lihat = () => t[i];
  const makan = (v) => {
    const x = t[i];
    if (!x || x.v !== v) throw new Error(`"${teks}": butuh "${v}"`);
    i++;
  };

  const primer = () => {
    const x = t[i++];
    if (!x) throw new Error(`"${teks}": ekspresi terpotong`);
    if (x.k === 'angka') return x.v;
    if (x.k === 'op' && x.v === '(') { const v = jumlah(); makan(')'); return v; }
    if (x.k === 'op' && x.v === '-') return -primer();
    if (x.k === 'op' && x.v === '+') return primer();
    if (x.k === 'nama') {
      if (x.v === 'total') return ling.total;
      if (FUNGSI[x.v]) {
        makan('(');
        const arg = [jumlah()];
        while (lihat()?.v === ',') { i++; arg.push(jumlah()); }
        makan(')');
        return FUNGSI[x.v](...arg);
      }
      if (PETA.has(x.v)) {
        const peta = ling[x.v];
        let kunci;
        if (lihat()?.v === '.') { i++; const n = t[i++]; if (n?.k !== 'nama') throw new Error(`"${teks}": nama sesudah "${x.v}."`); kunci = n.v; }
        else if (lihat()?.v === '[') { i++; const n = t[i++]; if (!n || (n.k !== 'angka' && n.k !== 'teks')) throw new Error(`"${teks}": indeks ${x.v}[…]`); kunci = n.v; makan(']'); }
        else throw new Error(`"${teks}": ${x.v} harus diikuti .nama atau [indeks]`);
        const v = peta?.[kunci];
        if (typeof v !== 'number' || Number.isNaN(v)) {
          const ada = Object.keys(peta || {}).join(', ');
          throw new Error(`"${teks}": ${x.v}[${JSON.stringify(kunci)}] tidak ada (yang ada: ${ada})`);
        }
        return v;
      }
      throw new Error(`"${teks}": nama "${x.v}" tidak dikenal (pakai C, P, E, S, total, min, max)`);
    }
    throw new Error(`"${teks}": "${x.v}" tidak terduga`);
  };
  const kali = () => {
    let v = primer();
    while (lihat()?.v === '*' || lihat()?.v === '/') { const o = t[i++].v; const r = primer(); v = o === '*' ? v * r : v / r; }
    return v;
  };
  const jumlah = () => {
    let v = kali();
    while (lihat()?.v === '+' || lihat()?.v === '-') { const o = t[i++].v; const r = kali(); v = o === '+' ? v + r : v - r; }
    return v;
  };

  const v = jumlah();
  if (i < t.length) throw new Error(`"${teks}": sisa "${t.slice(i).map((x) => x.v).join(' ')}"`);
  if (!Number.isFinite(v)) throw new Error(`"${teks}" menghasilkan ${v}`);
  return v;
}
