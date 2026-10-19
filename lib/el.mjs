// Klien ElevenLabs: TTS, sound-generation, music, speech-to-text, dan pemakaian kredit.
import './env.mjs';
import {wajib} from './env.mjs';

const EL = 'https://api.elevenlabs.io';
const kunci = () => { wajib('ELEVENLABS_API_KEY'); return process.env.ELEVENLABS_API_KEY; };

/* Model TTS bawaan. `suara.model` di config proyek menimpanya.
   eleven_v4 (dicek 10 Okt 2026 lewat GET /v1/models) mendukung bahasa id, seed,
   previous_text/next_text, dan speed. `style` dan `use_speaker_boost` tidak didukung:
   API menerimanya, tetapi model mengabaikannya. */
export const MODEL_SUARA = 'eleven_v4';

async function kirim(url, opsi, coba = 3) {
  for (let i = 1; ; i++) {
    const r = await fetch(url, opsi);
    if (r.ok) return r;
    const isi = (await r.text()).slice(0, 240);
    // 4xx selain 429 tidak akan membaik kalau diulang — gagalkan segera.
    if (i >= coba || (r.status < 500 && r.status !== 429)) throw new Error(`${r.status} ${isi}`);
    await new Promise((s) => setTimeout(s, 2500 * i));
  }
}
const post = (jalur, badan) => kirim(`${EL}${jalur}`, {
  method: 'POST',
  headers: {'xi-api-key': kunci(), 'Content-Type': 'application/json'},
  body: JSON.stringify(badan),
});
const get = (jalur) => kirim(`${EL}${jalur}`, {headers: {'xi-api-key': kunci()}}).then((r) => r.json());

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
  const r = await kirim(`${EL}/v1/speech-to-text`, {method: 'POST', headers: {'xi-api-key': kunci()}, body: fd});
  return (await r.json()).text || '';
}

export const kuota = async () => {
  const s = await get('/v1/user/subscription');
  return {sisa: s.character_limit - s.character_count, batas: s.character_limit};
};

export const pemakaian = (mulai, selesai) =>
  get(`/v1/usage/character-stats?start_unix=${Math.floor(mulai)}&end_unix=${Math.floor(selesai)}` +
      `&breakdown_type=product_type&aggregation_interval=hour`);

export const daftarSuara = () => get('/v2/voices?page_size=100');
