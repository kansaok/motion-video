/* Bentuk data yang dilewatkan antartahap pipa. Hanya JSDoc: tidak ada kode yang berjalan.
   Dipakai `tsc --noEmit` (npm run periksa:tipe) dan editor; sumber kebenaran skema MCP tetap
   `Config` zod di mcp/alat.mjs, dan perubahan di sana wajib disalin ke mcp/PANDUAN.md. */

/**
 * Satu scene dari `OM_SCENES` komposisi.
 * @typedef {{name: string, dur: number}} Scene
 */

/**
 * Peta nama scene -> detik mulai. Diberikan ke `cue`, `gate`, `detik`, dan `rencana`.
 * @typedef {Record<string, number>} PetaCue
 * @typedef {{C: PetaCue, P?: Record<number, number>, E?: Record<number, number>,
 *   S?: Record<string, number>, total: number}} Lingkungan
 */

/**
 * Satu baris naskah VO. Field bertanda "diisi" ditulis tahap pipa, bukan oleh config.
 * @typedef {object} BarisVO
 * @property {number} no          nomor baris; berkasnya `aset/vo/vo-<no>.mp3`
 * @property {string} text        naskah apa adanya (lafal diterapkan saat TTS)
 * @property {string} sc          nama scene tempat baris ini diucapkan
 * @property {number} [off]       detik sesudah awal scene (jangkar dari brief)
 * @property {number} [jeda]      jeda minimum sesudah baris sebelumnya
 * @property {number} [maks]      kontrak durasi: generate ulang sampai muat
 * @property {RegExp} [dengar]    kontrak transkrip: take diterima hanya bila cocok
 * @property {number} [coba]      jumlah percobaan untuk `maks`/`dengar`
 * @property {string} [voice]     suara per baris, menimpa `suara.id`
 * @property {number} [stability]
 * @property {number} [style]
 * @property {string} [file]      diisi: jalur mp3
 * @property {number} [dur]       diisi: durasi sesudah trim
 * @property {number} [pos]       diisi: detik mulai di timeline
 */

/**
 * @typedef {object} Suara
 * @property {string} [id]
 * @property {string} [model]
 * @property {string} [bahasa]
 * @property {number} [seed]
 * @property {number} [stability]
 * @property {number} [similarity]
 * @property {number} [style]
 * @property {number | ((l: BarisVO) => number)} [speed]
 * @property {boolean} [luar]     VO diunggah dari luar (MCP); jangan pernah generate
 * @property {number} [kps]       kar/dtk suara ini pada `speed` yang dipakai (hasil `motion speed`);
 *   hanya untuk perkiraan durasi `--kering` bila proyek belum punya VO suara itu
 */

/**
 * @typedef {object} Musik
 * @property {string} nama
 * @property {string} [prompt]
 * @property {number | ((l: Lingkungan) => number)} [detik]
 * @property {any[] | ((l: Lingkungan) => any[])} [rencana]
 * @property {number | ((l: Lingkungan) => number)} [mulai]
 * @property {number | ((l: Lingkungan) => number)} [fadeOut]
 * @property {boolean} [luar]     trek ditaruh tangan; jangan ditimpa generator
 * @property {string} [file]      diisi: jalur mp3
 */

/**
 * Config proyek (`motion.config.mjs`) sesudah `muat` melengkapi jalurnya.
 * @typedef {object} Config
 * @property {string} nama
 * @property {string} komposisi   berkas HTML utama, relatif ke `src`
 * @property {string} dir         diisi `muat`
 * @property {string} src         diisi `muat`
 * @property {string} aset        diisi `muat`
 * @property {string} stem        diisi `muat`
 * @property {string} htmlUtama   diisi `muat`
 * @property {string} [keluaran]
 * @property {string} [jsx]
 * @property {string[]} [jugaTulis]
 * @property {boolean} [kapsi]
 * @property {Record<string, number>} [jangkar]
 * @property {Record<string, number[]>} [deret]
 * @property {BarisVO[]} vo
 * @property {Suara} [suara]
 * @property {Record<string, string | ((teks: string) => string)>} [lafal]
 * @property {Array<[string, number | string, string?]>} [sfx]
 * @property {Musik[]} [musik]
 * @property {(l: Lingkungan) => Array<{nama: string, at: number}>} [cue]
 * @property {(l: Lingkungan) => any[]} [gate]
 * @property {Record<string, any>} [tata]
 * @property {Record<string, any>} [mixer]
 * @property {Record<string, any>} [sampul]
 * @property {Array<{komposisi: string, keluaran?: string, sampul?: Record<string, any>}>} [varian]  rasio lain
 *   untuk `motion render --semua-varian` (CLI saja)
 * @property {{busTitik?: number[], kapsi?: boolean | string}} [periksa]  `kapsi`: periksa kapsi di tengah
 *   tiap baris VO (`true` = cari kata naskah di stage; string = selektor elemen kapsi)
 */

export {};
