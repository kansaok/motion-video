// Klien ElevenLabs: TTS, sound-generation, music, speech-to-text, dan pemakaian kredit.
import './env.mjs';
import {wajib} from './env.mjs';
import {EL_API} from './konstanta.mjs';

// Objek, bukan konstanta: tes mengarahkannya ke server tiruan lokal (test/el.test.mjs).
export const dasar = {url: 'https://api.elevenlabs.io'};
const kunci = () => { wajib('ELEVENLABS_API_KEY'); return process.env.ELEVENLABS_API_KEY; };

/* Galat API dengan golongannya. `kuota` menghentikan seluruh rantai: tanpa pembeda ini,
   kuota habis di baris VO ke-3 berlanjut jadi 80 kegagalan beruntun yang masing-masing
   mencoba ulang dan menunggu, lalu galat pertamanya tenggelam di log. */
export class GalatEL extends Error {
  /** @param {string} pesan @param {{status?: number, kuota?: boolean, ulang?: boolean}} [o] */
  constructor(pesan, {status = 0, kuota = false, ulang = false} = {}) {
    super(pesan);
    this.name = 'GalatEL';
    this.status = status;
    this.kuota = kuota;
    this.ulang = ulang;
  }
}

/* Kode galat dari docs ElevenLabs (resources/errors, dicek 4 Nov 2026): `quota_exceeded`
   datang sebagai 400 ATAU 401, `insufficient_credits` sebagai 402. Dua-duanya tidak akan
   membaik kalau diulang, dan 401 biasa (kunci salah) juga tidak. 429 (`rate_limit_exceeded`,
   `concurrent_limit_exceeded`, `system_busy`) dan 5xx boleh diulang.
   @param {number} status @param {string} isi */
export function golongkan(status, isi) {
  const kuota = status === 402 || /quota_exceeded|insufficient_credits/i.test(isi);
  return {kuota, ulang: !kuota && (status === 429 || status >= 500)};
}

/* Lama menunggu sebelum percobaan ke-(i+1). Retry-After boleh berupa detik atau tanggal HTTP.
   @param {string | null} header @param {number} i @param {number} [sekarang] */
export function tungguUlang(header, i, sekarang = Date.now()) {
  if (header) {
    const detik = Number(header);
    const ms = Number.isFinite(detik) ? detik * 1000 : Date.parse(header) - sekarang;
    if (Number.isFinite(ms)) return Math.min(EL_API.maksTungguMs, Math.max(0, ms));
  }
  return EL_API.jedaMs * i;
}

const tidur = (ms) => new Promise((s) => setTimeout(s, ms));

/* Model TTS bawaan. `suara.model` di config proyek menimpanya.
   eleven_v4 (dicek 10 Okt 2026 lewat GET /v1/models) mendukung bahasa id, seed,
   previous_text/next_text, dan speed. `style` dan `use_speaker_boost` tidak didukung:
   API menerimanya, tetapi model mengabaikannya. */
export const MODEL_SUARA = 'eleven_v4';

/**
 * @param {string} url
 * @param {RequestInit} opsi
 * @param {{coba?: number, batasMs?: number, tunggu?: (ms: number) => Promise<unknown>}} [o]
 */
export async function kirim(url, opsi, {coba = EL_API.coba, batasMs = EL_API.batasMs, tunggu = tidur} = {}) {
  for (let i = 1; ; i++) {
    let r;
    try {
      r = await fetch(url, {...opsi, signal: AbortSignal.timeout(batasMs)});
    } catch (e) {
      // Timeout dan koneksi putus dianggap sementara, sama seperti 5xx.
      const waktu = e.name === 'TimeoutError' || e.name === 'AbortError';
      const sebab = waktu ? `tidak menjawab dalam ${Math.round(batasMs / 1000)} dtk` : `jaringan: ${e.cause?.code || e.message}`;
      if (i >= coba) throw new GalatEL(`${sebab} (sesudah ${i} percobaan)`, {ulang: true});
      await tunggu(EL_API.jedaMs * i);
      continue;
    }
    if (r.ok) return r;
    const isi = (await r.text()).slice(0, 240);
    const g = golongkan(r.status, isi);
    if (g.kuota) {
      throw new GalatEL(`kuota/kredit ElevenLabs habis (${r.status} ${isi}). Isi ulang lalu jalankan `
        + 'perintah yang sama: berkas yang sudah jadi tidak dibuat ulang.', {status: r.status, kuota: true});
    }
    if (!g.ulang || i >= coba) {
      throw new GalatEL(`${r.status} ${isi}${g.ulang ? ` (sesudah ${i} percobaan)` : ''}`, {status: r.status, ulang: g.ulang});
    }
    await tunggu(tungguUlang(r.headers.get('retry-after'), i));
  }
}
const post = (jalur, badan) => kirim(`${dasar.url}${jalur}`, {
  method: 'POST',
  headers: {'xi-api-key': kunci(), 'Content-Type': 'application/json'},
  body: JSON.stringify(badan),
});
const get = (jalur) => kirim(`${dasar.url}${jalur}`, {headers: {'xi-api-key': kunci()}}).then((r) => r.json());

/* Menambahkan nama berkas/baris ke galat tanpa kehilangan golongannya (`kuota`, `status`).
   "422 ..." saja tidak memberi tahu baris VO mana dari 40 yang ditolak.
   @param {string} label @param {unknown} e */
export function beriLabel(label, e) {
  if (e instanceof Error) { e.message = `${label}: ${e.message}`; return e; }
  return new Error(`${label}: ${String(e)}`);
}

/* Satu baris VO. `sebelum`/`sesudah` diisi SATU kalimat tetangga saja: tanpa konteks
   hasilnya terdengar sepatah-sepatah, tetapi konteks satu paragraf penuh membuat durasi
   melar ±25% dan membuat `speed` berhenti berpengaruh. */
export async function suara(teks, o = {}) {
  const r = await post(`/v1/text-to-speech/${o.voice}?output_format=mp3_44100_128`, {
    text: teks,
    model_id: o.model || MODEL_SUARA,
    language_code: o.bahasa || 'id',
    seed: o.seed,
    previous_text: o.sebelum || undefined,
    next_text: o.sesudah || undefined,
    voice_settings: {
      stability: o.stability ?? 0.40,
      similarity_boost: o.similarity ?? 0.80,
      style: o.style ?? 0.05,          // 0-0,10; di atas itu terdengar dibuat-buat
      use_speaker_boost: true,
      speed: o.speed ?? 1.0,
    },
  });
  return Buffer.from(await r.arrayBuffer());
}

export async function efek(prompt, detik) {
  const r = await post('/v1/sound-generation?output_format=mp3_44100_128', {
    text: prompt,
    duration_seconds: Math.min(30, Math.max(0.5, detik)),   // API menolak di luar rentang ini
    prompt_influence: 0.72,
  });
  return Buffer.from(await r.arrayBuffer());
}

/* Dua cara meminta musik, dan yang kedua yang membuatnya berhenti terdengar datar.

   `prompt` saja (music_v1) menyerahkan SELURUH susunan lagu kepada generator: satu gumpalan
   55 detik, arc-nya dipilih sendiri, dan puncaknya jatuh di detik yang tidak ada
   hubungannya dengan cerita. Hasilnya benar secara musik dan datar secara iklan.

   `rencana` (music_v2, composition_plan) meminta lagunya PER BAGIAN, masing-masing dengan
   durasi sendiri. Bagian itu dipatok ke batas scene, jadi bangunan dan hentakan musiknya
   jatuh persis di tempat gambarnya menghentak. Batas API: 3-120 detik per bagian, maksimum
   30 bagian, 3 detik sampai 10 menit total.

   Tiap bagian: {detik, teks, gaya[], hindari[]}. `teks` diisi label bagian dalam kurung
   siku ('[intro]', '[drop]'); force_instrumental menahan agar tidak ada yang dinyanyikan. */
export async function musik(prompt, detik, rencana) {
  /* `force_instrumental` DITOLAK bersama composition_plan (422: "can only be used with
     prompt"). Instrumentalnya datang dari rencananya sendiri: `text` cuma berisi label
     bagian, tidak ada lirik, dan 'vocals' masuk daftar `negative_styles` tiap bagian. */
  const badan = rencana?.length
    ? {
      model_id: 'music_v2',
      composition_plan: {
        chunks: rencana.map((b) => ({
          text: b.teks || '',
          duration_ms: Math.round(b.detik * 1000),
          positive_styles: b.gaya || [],
          negative_styles: b.hindari || [],
        })),
      },
    }
    : {
      model_id: 'music_v1', force_instrumental: true,
      music_length_ms: Math.round(detik * 1000), prompt,
    };
  const r = await post('/v1/music?output_format=mp3_44100_128', badan);
  return Buffer.from(await r.arrayBuffer());
}

// Transkrip balik. Dipakai untuk membuktikan VO di dalam mix benar — bukan berkas sumbernya.
export async function transkrip(buf, bahasa = 'id') {
  const fd = new FormData();
  fd.append('model_id', 'scribe_v1');
  fd.append('language_code', bahasa);
  fd.append('file', new Blob([buf]), 'a.mp3');
  const r = await kirim(`${dasar.url}/v1/speech-to-text`, {method: 'POST', headers: {'xi-api-key': kunci()}, body: fd});
  return (await r.json()).text || '';
}

export const kuota = async () => {
  const s = await get('/v1/user/subscription');
  return {sisa: s.character_limit - s.character_count, batas: s.character_limit, terpakai: s.character_count};
};

export const pemakaian = (mulai, selesai) =>
  get(`/v1/usage/character-stats?start_unix=${Math.floor(mulai)}&end_unix=${Math.floor(selesai)}` +
      `&breakdown_type=product_type&aggregation_interval=hour`);

export const daftarSuara = () => get('/v2/voices?page_size=100');
