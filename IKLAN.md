# Aturan iklan: apa yang membuat satu video menjual

Berkas ini menyimpan hal-hal yang **tidak bisa dibaca dari kode**: kenapa satu naskah menjual dan satu lagi tidak, kenapa satu trek musik terdengar datar, dan setting mana yang sudah diuji. `README.md` menyimpan aturan mesinnya; berkas ini menyimpan aturan iklannya.

Tiap aturan di bawah lahir dari satu kesalahan yang benar-benar terjadi atau satu riset yang benar-benar dibaca. Kalau kamu menambah aturan, tulis juga **sebabnya** — aturan tanpa sebab akan dilanggar orang berikutnya, termasuk dirimu sendiri tiga minggu lagi.

## 1. Musik

### Pakai `rencana`, bukan `prompt`

Satu prompt untuk satu gumpalan 55 detik menyerahkan SELURUH susunan lagu kepada generator. Arc-nya dipilih sendiri dan puncaknya jatuh di detik yang tidak ada hubungannya dengan cerita. Hasilnya benar secara musik dan datar secara iklan. Itu yang dilaporkan sebagai "musiknya monoton".

`rencana` memakai `composition_plan` ElevenLabs: lagunya diminta **per bagian**, tiap bagian punya durasi sendiri. Patok bagian itu ke batas scene.

```js
rencana: ({C}) => {
  const bagian = (dari, sampai, teks, gaya) => ({detik: sampai - dari, teks, gaya, hindari: HINDARI});
  return [
    bagian(0, C.Nyala, '[intro]', ['dark cinematic', 'low sustained drone']),
    bagian(C.Nyala, C.Sebelum, '[riser and impact]', ['tension riser', 'big cinematic hit']),
    // ...
  ];
},
```

Batas API: 3-120 detik per bagian, maksimum 30 bagian, 3 detik sampai 10 menit total. `force_instrumental` **ditolak** bersama `composition_plan` (422). Instrumentalnya datang dari rencananya: `text` hanya berisi label bagian, dan `vocals` masuk `negative_styles`.

Terukur pada satu iklan yang sama, level trek mentah per detik:

|  | **detik 0** | **detik 10** | **detik 23** | **detik 40** |
|---|---|---|---|---|
| satu prompt | −38,9 dB | −30,5 dB | −26,7 dB | −25,0 dB |
| `rencana` | −30,9 dB | −31,0 dB | −27,8 dB | −24,2 dB |

Trek satu-prompt membuka 14 dB di bawah penutupnya. Empat setengah detik pertamanya terukur sebagai lubang, dan itu tepat di scene pembuka.

### Jangan pernah minta bagian yang "sparse", "quiet", atau "patient"

Generator menerjemahkan kata itu sebagai **senyap**, bukan sebagai tipis. Dua kali terjadi:

| **Diminta** | **Hasil** |
|---|---|
| `'sparse, dark and patient'` untuk intro | 4,5 detik nyaris senyap di scene pembuka |
| `'quiet unease building'`, `'no melody yet'` untuk verse | lubang 4,25 detik di scene masalah |

Yang benar: minta sesuatu yang **selalu ada** dan gelap. `'tense but always present'`, `'steady and continuous'`, `'insistent repeating motif'`. Suasana gelapnya diurus AMPLOP. Amplop bisa menurunkan bed yang ada; amplop tidak bisa menghidupkan bed yang tidak pernah ada.

### Satu tukikan yang disengaja itu boleh — dan itu yang bikin "wah"

Aturan umum: amplop tidak boleh menukik lebih dari 6 dB dalam 1,5 detik, karena terdengar seperti musiknya bolong. Pengecualiannya satu: **tepat sebelum hentakan terbesar**. Hening sesaat sebelum hentakan terdengar lebih besar daripada hentakan yang datang dari musik yang sudah ramai.

['Nyala', 1.05, -14], ['Nyala', 1.45, -23],   // hening 0,4 detik

['Nyala', 1.90, -13],                          // lalu meledak masuk

Mixer akan memperingatkannya. Untuk titik ini peringatan itu memang diharapkan — pakai sekali saja per video, di momen terbesarnya.

### Trek yang dipakai sebagian diminta LEBIH PANJANG, dengan satu bagian buangan di ujung

Generator selalu menutup treknya dengan fade-out sendiri. Kalau treknya dipakai sampai ujung, fade itu jatuh di dalam gambar — bukan sesudahnya.

Trailer horor "Shift Malam" memakai `bgm` untuk 0-20,5 detik dan meminta 21 detik. Trek keluar 20,06 detik, dan bed-nya mulai turun di detik 18,5 — tepat di tengah scene Buka, scene yang justru harus menegang. Diukur pada `stem/mus.wav`:

| **detik** | **17** | **18** | **19** | **19,5** |
|---|---|---|---|---|
| diminta 21 detik | -31,9 | -36,0 | **-48,1** | **-49,7** |
| diminta 25 detik + bagian `[tail]` | -32,2 | -34,8 | -42,2 | -45,4 |

Perbaikannya: tambahkan satu bagian `rencana` di ujung yang **tidak pernah terdengar**, lalu potong treknya di batas yang dipakai. Bagian itu ada semata supaya fade-nya punya tempat jatuh. Untuk `prompt` biasa, pola yang sama sudah ada: `detik: ({total}) => total + 10`.

### Bed PENDEK juga butuh `rencana`, dan sebabnya bukan monoton

Aturan `rencana` di atas ditulis untuk trek panjang yang keluar datar. Bed 5 detik tidak punya ruang untuk jadi monoton, jadi opener Rama Digital pertama dibuat dengan satu `prompt` biasa — dan `check` melaporkan **bed bolong 0,00-1,25 detik pada -71 dB**.

Sebabnya: generator menyusun INTRO-nya sendiri, dan intro itu jatuh persis di seperempat pertama video 5 detik. Pada trek 55 detik intro tipis cuma memakan 4% durasi; pada bed 5 detik dia memakan 25%, dan itu tepat di scene pembuka.

Perbaikannya dua bagian, dan bagian keduanya tidak pernah terdengar:

```js
rencana: () => [
  {detik: 3,  teks: '[intro]', gaya: ['warm sustained strings from the very first beat',
    'steady and continuous', 'always present']},
  {detik: 11, teks: '[tail]',  gaya: ['warm sustained strings resolving', 'steady and continuous']},
],
```

Sesudahnya: bed rata, tanpa lubang. Batas API 3 detik per bagian berarti video di bawah 6 detik cuma bisa punya SATU bagian yang dipakai — itu cukup, karena yang diperbaiki bukan susunan lagunya, melainkan siapa yang memutuskan di mana intro-nya jatuh.

### Tiap batas bagian `rencana` adalah tempat generator membuat breakdown

Video 160 dtk "Apa itu Konektor?", BGM 130 BPM yang sama, diminta dua cara:

|  | **lubang di dalam video** |
|---|---|
| 16 bagian (satu per beat komposisi) | 0-9 dtk (-42 dB) · 119,8-124,8 dtk (-34 dB), 24 dtk total dari percobaan terbaik |
| 8 bagian, ditambah `breakdown`, `silence`, `quiet intro`, `fade in`, `sparse` di `negative_styles` | tidak ada (level rata -13,4 s/d -20,8 dB) |

Kedua lubang jatuh tepat di awal bagian. Patok bagian ke perubahan SUASANA (gelap, terang, puncak), bukan ke tiap beat. Beat kecil diurus SFX dan amplop.

### Intro yang cuma "denyut sub" terukur sebagai lubang

Brief "Apa itu Konektor?" meminta intro berupa pulsa sub-bass 40-50 Hz, satu denyut per detik. Bagian `[intro]` diminta dengan kata itu, dan trek keluar -50,5 dB pada 0-2,5 dtk, sementara median treknya -25,8 dB. Pulsa di bawah 70 Hz dibuang HPF bed, jadi yang tersisa memang senyap.

Denyut sub itu tugas SFX, bukan tugas musik. Minta intro dengan pad yang selalu ada, dan taruh denyutnya sebagai cue `bass-duk`. Untuk video itu drone gelap dari stok mengisi 0-3 dtk.

### Musik boleh berhenti; jangan minta bagian yang "hampir senyap"

Satu video kadang memang butuh lubang — Blank 3 detik di trailer horor harus benar-benar kosong. Jangan memintanya sebagai bagian `rencana`; itu aturan yang sama dengan "jangan minta sparse/quiet/patient", dan hasilnya tidak bisa ditentukan.

Yang dipakai: **dua trek, bukan satu**. `bgm` berhenti di 20,5 dan `bgm-d` baru mulai di 23,5. Lubangnya jadi keputusan mixer, bukan tebakan generator. `motion check` tetap akan melaporkan bed musik ✖ di jendela itu — dia tidak punya cara mengecualikan satu jendela, jadi sebutkan angkanya dan sebabnya, jangan diamkan.

### Amplop mengompensasi, bukan menambah

Trek generator sudah punya arc-nya sendiri. Menumpuk ramp gelap-ke-terang kedua di atasnya membuat ayunannya lebih dari 20 dB dan pembukanya jatuh jadi lubang. **Ukur treknya dulu**, baru tulis amplopnya:

```sh
for t in 0 5 10 16 23 35 40; do
  ffmpeg -hide_banner -nostats -ss $t -t 3 -i aset/musik.mp3 -af volumedetect -f null /dev/null 2>&1 | grep mean_volume
done
```

(Sejak P8-09 tidak ada lagi `musik-norm.mp3`: perataan -6 dBFS dipasang di filtergraph mixer. Perataan itu gain tetap, jadi SELISIH antarjendela yang dibaca di sini sama; angka mutlaknya saja yang bergeser.)

Trek yang sudah rata (dengan `rencana`) butuh amplop yang rata juga.

### Musik tanpa satu pun alat: minta a cappella, lalu UKUR

Klien da'wah bisa meminta latar tanpa alat musik, dan itu syarat adab — bukan selera. Istilahnya nasyid a cappella: humming, vocal pad, dan harmoni latar, tanpa perkusi dan tanpa duff. Dimintanya tetap lewat `rencana`, dan tiap bagian memuat dua hal:

- `gaya`: `'warm male a cappella humming from the very first beat'`, `'unaccompanied human voices only'`, `'steady and continuous'`, `'always present'`
- `hindari`: seluruh daftar alat sekaligus — instruments, piano, guitar, strings, violin, oud, synth, bass guitar, booming sub bass, drums, percussion, beat, tabla, duff, clapping, kick, trap 808, autotune, EDM, lyrics, words

Janji generator tidak bisa dipercaya begitu saja, dan tidak ada telinga di dalam rantai ini. Yang bisa diukur: **lonjakan level lebih dari 12 dB antar jendela 50 ms**, dihitung per menit di dua pita. Perkusi memberi transien setajam itu; suara manusia hampir tidak pernah.

| **Trek** | **60-200 Hz** | **2-8 kHz** |
|---|---|---|
| nasyid a cappella (Biro Jodoh Rumaysho, 2 trek) | 0,6 · 1,6 | **0,0 · 0,0** |
| pembanding berinstrumen (`konektor-sinyal`) | 71,8 | 224,5 |

Dua pangkat lebih rendah, bukan selisih tipis. Sebutkan angkanya waktu menyerahkan berkasnya — itu satu-satunya bukti yang dipegang klien sebelum dia mendengarkan sendiri.

```sh
ukur() {   # $1 = berkas · $2 = filter pita
  ffmpeg -hide_banner -nostats -i "$1" -af \
    "$2,astats=metadata=1:reset=1:length=0.05,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-" \
    -f null /dev/null 2>/dev/null \
  | grep -o 'RMS_level=[-0-9.]*' | cut -d= -f2 \
  | awk 'NR>1 && $1-p>12 {n++} {p=$1} END {printf "%.1f lonjakan per menit\n", n/(NR*0.05/60)}'
}
ukur aset/nasyid.mp3 highpass=f=60,lowpass=f=200      # kick, duff
ukur aset/nasyid.mp3 highpass=f=2000,lowpass=f=8000   # hi-hat, tepuk tangan
```

### Bed a cappella SELALU dilaporkan bolong, dan itu bukan cacat

`check` mengukur lubang bed terhadap median trek itu sendiri. Nasyid a cappella berhenti tiap penyanyinya mengambil napas, dan tidak ada instrumen yang menahan nada di bawahnya — jadi tiap jeda frasa terbaca sebagai lubang. Terukur 2,0 detik (video 90 detik) dan 2,75 detik (video 45 detik), masing-masing 2-3 jendela.

Jangan menambalnya dengan kompresor bed yang lebih galak: gain tidak bisa mengarang suara yang memang tidak ada, dan yang didapat cuma pumping. Bed duduk 17-21 dB di bawah VO, jadi jeda itu terdengar sebagai napas. Sebutkan angkanya dan sebabnya di laporan; jangan diamkan, dan jangan pula menyebutnya lulus.

Jendela gate yang memang diminta brief juga muncul di daftar yang sama, pada -120 dB. Baris `hening` mengukur jendela yang sama dan lulus — pakai itu untuk memisahkan mana lubang yang disengaja.

### Satu video boleh memakai DUA suara, dan itu ditulis per baris

Brief da'wah menandai baris yang membahas sisi akhwat dengan `[A]`. `voice` di dalam satu baris `vo` menimpa `suara.id` untuk baris itu saja, dan ikut masuk `.kunci` cache. Sisa setelannya — speed, stability, style — tetap dari `suara`, jadi kedua pembaca terdengar berada di ruang yang sama.

Ukur kecepatan KEDUA suara sebelum menulis: Firman 16,0 kar/dtk, Citra 14,0 kar/dtk pada speed 1,0. Selisih 2 kar/dtk sudah cukup membuat baris akhwat lewat batas scene-nya sementara baris ikhwan dengan panjang yang sama muat.

### Trek dari luar (Suno): potong di bar, dan jangan menukik di atas break

Trek Suno datang utuh, 2 menit, dengan susunannya sendiri. Break-drop yang dibutuhkan iklan hampir pasti tidak jatuh di detik yang tepat. Susun ulang treknya, jangan digeser:

1. Ukur tempo lewat autokorelasi onset, bukan dari prompt. Diminta 132 BPM, terukur 134,3.
2. Petakan energi bass (<150 Hz) per bar. Bar fill dan break terlihat sebagai lubang 3-6 dB di bawah tetangganya.
3. Sambung hanya pada kelipatan 8 bar. Fase ketukan dan frasa tetap utuh.

`luar: true` di entri `musik` mencegah `motion music` menimpa berkasnya. Contoh lengkap: `proyek/kelas-ctwa-rahasia/bgm.py`.

Break di trek sumber sudah membuang bass-nya. Tukikan amplop -24 dB di atas break itu terukur **-50 dB, bed bolong 2,0 detik**. Tukikan -18 dB di tempat yang sama lulus `check`.

### Whoosh transisi: lembut dan pelan, bukan cerah

Whoosh cepat yang cerah di tiap batas scene (gain 0,30, 10 kali dalam 46 detik) dilaporkan "kasar, bikin gak fokus". Yang dipakai sekarang: prompt `very soft gentle airy swish, muted, no harsh high frequencies` pada gain 0,12. Hentakan yang menandai isi (stempel, stiker, klik tombol) tetap keras; yang dipelankan cuma bunyi perpindahan.

### Satu kuis cepat = SATU baris VO, bukan satu baris per kartu

Reels contekan membaca 15 kartu sebagai 15 baris terpisah. Kartu 7-15 cuma "Tof!", masing-masing 0,34-0,44 detik, dan tiap potongan punya nada dan jeda sendiri. Rama melaporkannya sebagai "VO-nya keputus-putus". Seluruh kuis sekarang dibaca satu baris, dan jadwal kartu dibaca dari timestamp kata di transkrip (`proyek/reels-contekan/kartu.mjs`). Berlaku untuk deret pendek apa pun: hitungan, daftar, atau jawaban kuis.

### Generator musik TIDAK menepati batas bagian `rencana`

V07 meminta bagian `[hook]` 9,10 dtk dan `[build]` 9,05 dtk, jadi drop di 18,15 dtk. Trek 120 BPM keluar dengan build di 8,0 dtk dan drop di **15,49 dtk**: 2,7 dtk terlalu awal. Selisihnya tidak tetap (0,88 lalu 0,85 dari yang diminta), jadi tidak bisa dikoreksi di prompt.

Yang dipakai: ukur onset dan tempo, lalu sambung di ketukan. 6 ketukan build diulang (`proyek/kelas-motion-v07/bgm.sh`), dan `tata.ekor` scene sebelum drop menaruh awal Daftar tepat di drop baru. Selalu ukur letak drop sebelum mix:

```sh
for t in 14 14.5 15 15.5 16 16.5 17 17.5 18 18.5; do
  ffmpeg -hide_banner -nostats -ss $t -t 0.5 -i aset/bgm.mp3 -af volumedetect -f null /dev/null 2>&1 | grep mean_volume
done
```

Drop terlihat sebagai lompatan level sesudah satu jendela yang turun (stop sebelum drop).

Trek chiptune (V08) terkompresi rata: level tiap 0,5 dtk -12 dB dari awal sampai akhir, jadi `volumedetect` tidak menunjukkan drop. Ukur pita di atas 5 kHz: crash drop terlihat sebagai kenaikan 5 dB yang bertahan. Kalau drop lebih LAMBAT dari scene-nya, `lewati` cukup; pilih kelipatan 0,25 dtk (seperdelapan ketukan 120 BPM) supaya frame 0 tetap jatuh di ketukan.

### Kick tidak boleh memimpin

Diukur per pita, stem lawan stem, pada mix yang dilaporkan "VO-nya tidak kedengeran jelas":

| **Pita** | **Musik** | **VO** |
|---|---|---|
| < 120 Hz | **−31,6 dB** | — |
| 300 Hz – 4 kHz | −40,9 dB | −35,1 dB |

Kick-nya 9 dB lebih keras daripada pita bicara musiknya sendiri. `check` sekarang menggagalkan mix kalau musik di bawah 120 Hz lebih keras daripada pita bicara VO.

Selalu masukkan ke `negative_styles`: `heavy four-on-the-floor kick`, `booming sub bass`, `trap 808`. Tenaganya dibawa lapisan atas — arpeggio, hi-hat, tepuk tangan — yang semuanya di atas pita bicara, jadi ducking bisa mengurusnya.

## 2. Efek suara

### Lapis tiap hentakan besar

Satu berkas yang berusaha jadi transien DAN sub selalu kalah pada salah satunya. Hentakan terbesar dalam satu iklan dilapis empat:

| **Lapis** | **Fungsi** |
|---|---|
| `riser-long` (mulai −1,3 dtk) | menarik perhatian ke titiknya |
| `whoosh-rev` (−0,2 dtk) | menghisap, memberi tanda sesuatu akan mendarat |
| `impact-hit` (0 dtk) | transien: memberi TITIK hentakannya |
| `sub-drop` (+0,02 dtk) | memberi BERAT-nya |

Pakai pelapisan penuh **sekali** per video. Kalau semua hentakan dilapis, tidak ada yang terasa besar.

### `duckMusik` di config bisa lebih LEMAH daripada default mesin, dan tidak ada yang mengeluh

Default mixer: `th 0.02 · ratio 8`. Ditulis `th 0.12 · ratio 3` di config, ducking-nya justru mati hampir seluruhnya — dan itu terbaca sebagai setelan yang "sudah diatur".

Terukur di pita bicara 300 Hz - 4 kHz, VO lawan bed pada jendela tiap baris:

| **Baris** | **th 0,12 ratio 3** | **th 0,03 ratio 8** |
|---|---|---|
| 3 (24,40) | **-0,1 dB di bawah musik** | +3,8 dB |
| 4 (26,50) | **-1,5 dB di bawah musik** | +2,5 dB |

Dua baris pengungkapan itu tenggelam, dan angka `masking` rata-rata seluruh berkas tidak menangkapnya: VO yang cuma 5,7 detik dalam video 32,5 detik selalu terlihat pelan di rata-rata. **Ukur per jendela baris, bukan rata-rata berkas** — apalagi kalau VO-nya jarang.

### "VO-nya nggak kedengeran" biasanya butuh TIGA perubahan, bukan satu

Diukur per jendela baris di pita bicara 300 Hz - 4 kHz pada iklan PKRT, dengan bed amplop -10,6 sampai -18,5 dB, `duckMusik` th 0,05 ratio 6, dan `gainVO` 1,45:

| **Baris** | **VO lawan musik** |
|---|---|
| 4 (Momentum) | **-0,2 dB DI BAWAH musik** |
| 14 (Solusi) | +1,5 dB |
| 15 (Solusi) | +2,0 dB |
| 10 (Kenali) | +2,7 dB |

Menaikkan `gainVO` saja tidak cukup: bed-nya sendiri terlalu tinggi di scene yang paling ramai, dan th 0,05 melewatkan terlalu banyak suara. Ketiganya diubah sekaligus — bed diturunkan 2 sampai 4,4 dB, `duckMusik` jadi th 0,03 ratio 8, `gainVO` 1,45 -> 1,75 — dan baris terburuk naik dari **-0,2 dB ke +8,1 dB**. Rata-rata seluruh berkas naik ke +8,7 dB.

### Duck dalam TIDAK meratakan bed: dia memotong jumlah dB yang sama di mana pun

`duckMusik {th: 0.015, ratio: 14}` memotong bed ±15 dB tiap kali VO bicara, apa pun isi musiknya. Bagian musik yang padat di pita bicara (string, piano) tetap terlalu keras, dan bagian yang tipis (drone, intro) jatuh jadi lubang. Diukur pada video 161 dtk "Apa itu Konektor?", 39 baris VO, pita 300 Hz - 4 kHz:

|  | **baris di bawah +9 dB** | **terburuk** | **rata-rata** |
|---|---|---|---|
| mix pertama | 16 dari 39 | +4,5 dB (puncak Sejarah) | — |
| `gainVO` 1,50 → 1,75 + amplop −2 s/d −3 dB di bagian padat | 0 dari 39 | +9,3 dB | +14,5 dB |

Untuk video panjang dengan VO hampir terus-menerus, ukur SETIAP baris sesudah mix pertama, lalu betulkan amplop per bagian. Menambah ratio tidak menolong bagian padat, dan membuat bagian tipis makin bolong.

### Transien pendek menurunkan RMS walau pukulannya lebih keras

Mengganti bunyi bertahan dengan transien pendek membuat `VO di atas SFX` melompat dari 10,4 dB ke 15,7 dB — bukan karena SFX-nya melemah, tetapi karena rata-ratanya turun. Naikkan `gainSFX` waktu melakukannya (0,80 → 0,95), dan percayai A/B bus di `check`, bukan angka rata-ratanya.

### Motif nada dibuat dari SATU berkas dan penggeser `nada`, bukan dari tiga generate

Audio-logo Rama Digital tiga nada: C5 -> A4 -> F5, nada ketiga jatuh tepat di momen lock. Meminta tiga nada absolut ke generator tidak bisa diandalkan — nada yang keluar tidak dipesan dan tiga generate memberi tiga nada acak yang tidak berhubungan.

Yang dipakai: satu berkas marimba, tiga cue, `nada: 0 / -3 / +5` semitone. Nada absolutnya tetap tidak diketahui, dan itu tidak penting — yang membuat motifnya terasa selesai adalah INTERVAL-nya, dan interval bisa dipesan dengan tepat.

Pakai `nada` juga untuk memisahkan bunyi kembar: dua `getar` yang di-pan kiri-kanan diberi selisih 1 semitone, kalau tidak dua-duanya terdengar sebagai satu bunyi mono yang melebar.

### Tiap hentakan di layar wajib punya bunyinya sendiri

Gambar yang menghentak tanpa bunyi terbaca sebagai gambar yang **lambat**, bukan gambar yang sunyi. Iklan 30 detik memakai 48 cue; iklan 45 detik memakai 54.

### Suara Maya (`U3dExJoUNcmTY5H6GMuG`) dengan bed -17 dB: VO cuma +7,1 dB di atas musik

Grupy "Habis scrap, ringkas" (41 dtk): `check` melaporkan `masking` VO +7,1 dB di atas musik pada bed -17 dB (suara ini 13,8 kar/dtk dan tipis di pita bicara). Bed diturunkan ke -20 dB, tukikan hentakan ke -31 dB: VO naik ke +10,1 dB, sub bed -16,1 dB terhadap VO, bed tetap rata tanpa lubang. Musik pelan harus dimulai dari -20 dB untuk suara ini, bukan -17 dB.

Kapsi komposisi yang membaca array `VO` dengan offset tetap (`[a, b, teks]`) juga lolos dari `geserKapsi` ("0 kapsi") dan tampil 0,45 dtk lebih awal dari suaranya. Ubah jadi `const caps` satu baris satu kapsi (lihat README) dan sunting `.jsx` DAN `.jsx.asli`.

## 3. Voice-over

### Setting yang diuji

| **Parameter** | **Nilai** | **Sebab** |
|---|---|---|
| `style` | 0,72 | 0,30 terdengar rata dan dilaporkan "kurang energik". Ayunan nada inilah yang membuat pembacanya terdengar peduli. |
| `stability` | 0,14 | Nilai tinggi meratakan ayunan itu balik jadi pembaca berita. |
| `speed` | 1,20 | Batas API. 1,22 ditolak (`greater or equal to 0.7 and less or equal to 1.2`). |

Suara Cahaya (`iWydkXKoiVtvdn4vLKp9`) dipakai untuk seluruh kampanye Rama Digital. Satu merek harus terdengar satu merek.

### Naskah ditulis untuk intonasinya

Tanda baca adalah perintah nada. Kalimat pendek, tanda seru di tempat yang memang naik, dan koma sebagai jeda yang disengaja. Kalimat panjang bertingkat akan dibaca rata apa pun `style`-nya.

### Naskah diukur terhadap SUARANYA, bukan terhadap durasi komposisi

Brief LEMBAR #03 ditulis untuk komposisi 87 detik dan naskahnya 1.593 karakter. Suara yang diminta (`ZPI4bKVkeIVdAkOA73qX`, 15,7 kar/dtk) membutuhkan **95,3 detik** untuk naskah yang sama — 8,3 detik lewat, dan lewat batas 90 detik Facebook Reels.

Hitungnya per SCENE, bukan per baris. Ambang per baris menuduh baris yang boleh meluber ke celah tetangganya; yang benar-benar menentukan adalah apakah satu scene menampung seluruh barisnya:

butuh = off baris pertama + Σ(karakter / kar-per-detik) + (n-1) × jeda + ekor

Diukur pada naskah yang sama: 6 dari 9 scene lewat, dan satu scene lewat 2,2 detik sendirian karena SATU baris. Yang dipotong hanya kalimat yang membacakan ulang angka di layar (lihat aturan berikutnya) — 130 karakter, dan totalnya turun 95,3 -> 89,8 detik. Aritmetika di layar tidak boleh ikut terpotong: yang hilang harus kalimatnya, bukan angkanya.

Jangan menambal dengan `speed`. 1,20 itu batas API, dan suara yang sudah di 1,20 tidak punya sisa.

### Titik A/B bus SFX harus jatuh di tempat VO sedang DIAM

`check` menyatakan bus SFX mati kalau selisihnya 0,0 dB di semua titik. Putaran pertama explainer ROAS memakai detik 0,4 dan 8,5 dan **keduanya kembali 0,0 dB** — padahal bus-nya masuk: di dua titik itu VO sedang berbunyi, dan selisih SFX hilang di bawahnya.

Angka yang sama persis dengan bus yang mati, dari bus yang sebenarnya sehat. Titik yang dipindah ke celah VO memberi -1,1 · -1,0 · 8,9 · 4,1 dB pada mix yang sama.

### Jangan bacakan ulang teks layar

VO yang membaca ulang apa yang sudah terbaca memakan detik tanpa menambah apa pun. Contoh: tiga kartu berlabel OBSERVASI / KLAIM / KONTEKS tidak butuh baris "Observasi, klaim, konteks" — detik itu lebih baik dipakai untuk kata yang tidak bisa ditebak penonton.

### Ejaan yang sudah diuji balik

Diuji lewat speech-to-text pada suara yang sama:

| **Ditulis** | **Terdengar** | **Putusan** |
|---|---|---|
| `C T W A` (huruf kapital berspasi) | "CTWA" | ✓ dipakai, tanpa tambahan waktu |
| `ctwa_clid` → `C T W A C L Ai Di` | "ce-te-we-a-ce-el-ai-di" | ✓ **wajib**, keputusan Rama 26 Sep 2026. Jangan "klid", jangan "C L I D" (terbaca "i de") |
| `TOF` / `MOF` / `BOF` → `T O F` / `M O F` / `B O F` | "Te O eF", "eM O eF", "Be O eF" | ✓ **wajib**, keputusan Rama 27 Sep 2026. Jangan dibaca satu suku kata "Tof" |
| `Ce Te We A` | "Chat WA" | ✖ |
| `audience` → `odiens` | "audience" | ✓ |
| `WhatsApp` → `wasap` | "WhatsApp" | ✓ |
| `landing` → `lending` | "landing" | ✓ |
| `agent` → dibiarkan | "ejen" | ✓ benar |
| `rumaysho` → `rumaysyo` | "rumaysho" | ✓ dipakai |
| `rumaysho` → dibiarkan | "roommyshow" | ✖ vokalnya jatuh ke Inggris |
| `ta'aruf` → `ta-aruf` | "ta'aruf" | ✓ |
| `nadzhor` → `nadzor` | "nadzor" | ✓ |
| `AI` → `ei-ai` | "AI", 0,32 dtk: sama dengan baris yang lolos | ✓ dipakai (suara `1k39YpzqXZn52BgyLyGO`) |
| `AI` → `ei ai` | Rama mendengar "ei a i" di ujung kalimat "…ke AI." | ✖ |
| `AI` → `E-ai` / `E ay` | 0,62 / 0,74 dtk: tiga suku kata | ✖ |
| `CRM` dibiarkan | "CRM", tanpa jeda | ✓ dipakai |
| `CRM` → `si er em` / `si-er-em` | jeda 0,26 dtk sesudahnya; Rama: "seperti ada jeda setelah CRM" | ✖ |
| `CRM` → `sierem` | "serum" | ✖ |
| `build` → `bilt` | "build" 3 dari 3 seed | ✓ dipakai (V08, suara Cahaya) |
| `build` → `bild` | sekali "busy" di produksi | ✖ |
| `AIClub` → `ei-ai klab` | "AI Club" | ✓ |
| `Repliz` | "replace", 4 dari 4 | ✖ suara Ari Eko Pro, 8 Okt 2026 |
| `Repliz` → `Replis`, di frasa `Sambungkan Replis ke Konektor` | "replis", 3 dari 3 di kalimat pembuka; 2 dari 4 di langkah integrasi, 0 dari 4 "replace" | ✓ dipakai. `lalu Replis` di ujung kalimat kembali jadi "replace" |

Ejaan dengan spasi (`si er em`) membuat TTS berhenti sesudahnya. Ukur jeda di dalam baris dengan `silencedetect=noise=-38dB:d=0.12`, dan cocokkan tiap jeda dengan tanda baca. Jeda yang tidak jatuh di koma atau titik adalah jeda ejaan.

### Sunyi total yang disengaja terdengar sebagai "ada jeda"

Brief "Apa itu Konektor?" meminta dua sunyi total 0,8 dtk: sebelum "Buta." dan sebelum logo penutup. Keduanya dipasang dengan `gate`, dan keduanya lolos cek `hening`. Rama menandai sunyi penutup (02:30) sebagai "ada jeda", bukan sebagai jeda dramatis.

Yang dipakai sekarang: satu tukikan musik -9 dB selama 0,45 dtk sebelum hentakan terbesar, dan SFX tetap berbunyi (lihat §1). Tanpa VO dan tanpa musik sama sekali, penonton mendengar kesalahan teknis, bukan dramaturgi.

**Belum terpecahkan: "Claude".** Setiap ejaan kembali sebagai "Cloud" begitu diuji dengan konteks kalimat tetangganya:

| **Ditulis** | **Sendirian** | **Dengan konteks produksi** |
|---|---|---|
| `Claude` | "Cloud Kwork" | — |
| `Klode` | **"Claude Cowork"** ✓ | "Cloud Cowork" ✖ |
| `Clode` · `Kloed` · `Klowd` · `Kloude` · `Klot` | — | "Cloud" semua |

Konteks kalimat tetangga mengubah pelafalannya, jadi uji SELALU dengan `sebelum` dan `sesudah` yang sama seperti produksi. Untuk sekarang `Klode` dipakai dan tulisan di layar yang membawa mereknya. Kalau ada waktu, uji lagi dengan jeda: `Klode, Cowork.`

**Diuji lagi 30 Sep 2026 (V07, suara Cahaya, konteks produksi, 3 seed tiap ejaan):**

| **Ditulis** | **Terdengar "Claude"** |
|---|---|
| `Klode` | 0 dari 3 ("Kalau dia", "Clodo", "Cloudy") |
| `Klod` | 2 dari 3 |
| `Klôd` | 1 dari 3 |
| `Klo'd` | **3 dari 3** ✓ dipakai |

Tetapi STT sendiri tidak stabil: satu berkas yang sama terbaca "Claude" lalu "Cloud" pada panggilan berikutnya. Jadi `dengar` (lihat README) hanya menyaring take yang jelas salah, seperti "Kalau dia". Beda "Claude" dan "Cloud" di telinga orang Indonesia memang tipis.

### eleven_v4: jeda panjang di titik, dan "Chat Wulan" berubah jadi "Cap Wulan"

Diukur 11 Okt 2026 (V08 Senin Malam, suara Cahaya, speed 1,20). v4 berhenti ±0,8 dtk di tiap titik dan tanda tanya. Naskah tujuh baris yang sama keluar 33,9 dtk dengan titik dan 29,7 dtk sesudah titik di tengah baris diganti koma. Pakai koma di tengah baris iklan; titik hanya di ujung.

| **Ditulis (v4, 3 seed, konteks produksi)** | **Terdengar** |
|---|---|
| `Chat Wulan buat daftar!` | "Cap Wulan", "Catwulan", "Cat Wulan" ✖ |
| `Chet Wulan` | 2 dari 3 |
| `Chat Mbak Wulan` | **3 dari 3** ✓ dipakai lewat `lafal`, tombol tetap "Chat Wulan" |
| `ElevenLabs` dibiarkan (V09) | "ElevenLabs" 3 dari 3 ✓. `ilevenlebs` justru terdengar "iLiveM Labs" di v4 |
| `Excel` | "EXO" 1 dari 3 ✖ · `Eksel` 3 dari 3 ✓ |
| `Claude Pro` | "Cloud Pro" 3 dari 3 ✖ · `Klo'd Pro` 1 dari 3, baris diberi `dengar: /claude/i, coba: 8` |
| `Claude` sendirian di tengah kalimat | "Claude" pada take pertama ✓ |

### `dengar`: kunci hasil dengar, bukan ejaan

Ejaan yang sama bisa benar di satu seed dan salah di seed lain. `Chat Wulan` pada seed yang sama keluar "Chat Wulan", lalu "Jadwulan" begitu konteksnya sedikit berubah. Baris CTA dan baris yang menyebut merek diberi `dengar: /chat wulan/i`; `vo` membuat take baru sampai transkripnya cocok (`coba` per baris, bawaan 4).

## 4. Cerita

### Rangka PAS, dan tiap bagian punya tugasnya

Problem → Agitate → Solution. Yang membuatnya gagal biasanya bukan rangkanya, tetapi isinya:

**Masalah harus SPESIFIK.** "AI-nya belum optimal" tidak menggerakkan siapa pun. "Tiap pagi kamu jelasin ulang dari nol, empat puluh tujuh kali bulan ini" iya. Beri angkanya.

**Agitasi memakai akibat BISNIS, bukan sifat produk.** Untuk B2B: waktu hilang, risiko, kompetitor lebih dulu. Bukan "fiturnya kurang lengkap".

**Solusi jangan diperkenalkan seperti brosur.** Tunjukkan pekerjaannya selesai, jangan sebutkan kemampuannya.

### Tiga detik pertama adalah saringan, bukan pembukaan

Riset Meta 2026: satu sampai tiga detik pertama menentukan sisanya. Kalimat pertama harus sudah berupa pernyataan yang memutus scroll. "Era agentic udah mati." memutus; "Halo, kenalin kami Rama Digital." tidak.

### CTA menyebut tombolnya DAN alasan menekannya

"Konsultasi" saja tidak menjelaskan apa yang penonton dapat. "Chat WULAN, minta jadwalnya sekarang" menjelaskan. Kata kerjanya di depan, dan kata di VO **sama persis** dengan tulisan di tombolnya — supaya penonton tahu tombol mana yang dimaksud.

### Panjang

Riset menyebut 6-15 detik sebagai titik manis untuk feed. Tawaran high-ticket butuh lebih panjang karena harus menjelaskan; iklan pelatihan Rp 9,8 juta berjalan 45 detik. Yang tidak boleh: 45 detik untuk tawaran yang bisa dijelaskan dalam 15.

## 5. Gambar

### Frame 0 adalah SAMPUL, bukan sekadar frame pertama

Instagram Reels, TikTok, dan LinkedIn memakai frame pertama sebagai sampul kalau pengunggah tidak memilih sendiri — dan TikTok tidak mengizinkannya diganti sesudah unggah. Videonya bisa sempurna 40 detik dan tetap muncul di feed sebagai kotak kosong.

Diukur pada **41 berkas MP4 yang sudah dirender** di repo ini — simpangan baku luma frame 0 dibagi median simpangan sepanjang detik pertamanya:

| **Berkas** | **rasio** |  |
|---|---|---|
| `sumopod` (2 rasio) | 0,01-0,02 | ✖ nyaris satu warna |
| `sisa-pekan-9x16` | 0,08 | ✖ |
| `konektor-funnel` (4 rasio) | 0,16-0,25 | ✖ |
| `konektor-audiens` (4 rasio) | 0,19-0,29 | ✖ |
| `konektor-klik-hantu` (8 berkas) | 0,22-0,34 | ✖ |
| `konektor-sinyal` (4 rasio) | 0,26-0,39 | ✖ |
| `ctwa-konektor` (4 rasio) | 0,33-0,46 | ✖ |
| `lead-dari-mana` (4 rasio) | 0,55-0,62 | ✖ |
| `era-agi` (3 rasio) | 0,66-0,73 | ✖ |
| `konektor-hantu-12s` (4 rasio) | 0,94-0,98 | ✓ |
| `shift-malam` | 1,01 | ✓ |

**35 dari 41 gagal.** Yang lolos cuma dua video, dan keduanya kebetulan — bukan karena aturannya pernah ada. Sebabnya satu pola yang sama di hampir semua komposisi: fade loop dipasang di DUA ujung, padahal yang dibutuhkan cuma ujung belakang.

```js
// salah — frame 0 jadi bidang rata
const loopFade = T > total - 0.45 ? (T - (total - 0.45)) / 0.45 : (T < 0.26 ? 1 - T / 0.26 : 0);
// benar — fade hanya di ujung
const loopFade = T > total - 0.45 ? (T - (total - 0.45)) / 0.45 : 0;
```

Sambungan loop tetap halus selama fade penutupnya mendarat di warna latar scene pembukanya.

`motion check` sekarang mengukurnya dan memberi putusan pada rasio, **bukan pada angka mutlak**. Ambang mutlak menuduh trailer gelap yang memang berkontras rendah sepanjang scene pembukanya: "Shift Malam" cuma 20,3 simpangan dan sampulnya justru benar.

### Cek sampul bisa gagal walau frame 0-nya sudah benar: yang diukur slab kapsinya

Satu iklan 45 detik dibuka dengan frame yang sudah selesai — wordmark, kicker, tiga baris judul, dan logo yang sudah tergambar penuh. Cek sampul tetap ✖ pada rasio 0,59.

Sebabnya bukan gambarnya. Kapsi video ini duduk di dalam slab gelap `rgba(26,20,22,.95)` selebar bingkai, dan slab itu baru muncul begitu baris VO pertama mulai. Simpangan baku luma per frame, diukur pada MP4 yang sama:

| **detik** | **0** | **0,1** | **0,2** | **0,3** | **0,4** | **0,5** | **0,7** | **0,9** |
|---|---|---|---|---|---|---|---|---|
| simpangan | 33,7 | 33,9 | 33,9 | 42,2 | **57,2** | 57,2 | 57,2 | 57,2 |

Frame 0, 0,1, dan 0,2 identik — tidak ada fade sama sekali. Yang melompat di 0,3-0,4 itu slab kapsinya, dan median detik pertama diambil dari frame-frame yang sudah memuatnya.

Menambah tinta di scene pembuka TIDAK menolong, dan aritmetikanya bisa dihitung di muka: tambahan `x` masuk ke frame 0 **dan** ke median sekaligus, jadi rasionya `(33,7 + x) / (57,2 + x)`. Untuk mencapai 0,75 dibutuhkan `x` = 36,8 — lebih besar daripada seluruh kontras frame itu. Subjudul, gambar tambahan, apa pun: tidak akan cukup.

Yang menyelesaikannya satu: **kapsi pertama dipaku di detik 0,00 dan tidak di-fade.**

```js
// baris VO pertama diberi off 0,15 — `geserKapsi` menulis at = pos - 0,15
{no: 1, sc: 'Hook', off: 0.15, ...}
// lalu di <Captions>:
var o = active.at <= 0.001 ? 1 : Math.min(1, (t - active.at) / CAPTION_FADE);
```

Sesudahnya 58,4 lawan median 58,5 — rasio 1,00. Dan sampulnya jadi lebih baik sebagai sampul: kalimat pembukanya ikut terbaca di feed, bukan cuma judulnya.

Perhatikan satu hal waktu melakukannya. Kapsi itu ikut jadi bagian sampul, jadi dia tidak boleh mengulang teks yang sudah besar di layar. Naskah baris pertama di iklan ini ditulis ulang supaya melengkapi judulnya: layar berbunyi "Menikah itu menyempurnakan separuh agama", kapsinya "Separuh agama itu menunggu. Yang berat bukan niatnya."

### Jangan membekukan frame pembuka untuk "memberi waktu" sampulnya

Godaan berikutnya sesudah aturan di atas adalah menahan frame pembuka diam beberapa ratus milidetik supaya sampulnya "sempat terbaca". Jangan. Platform mengambil frame, bukan durasi — frame 0 dipakai apa pun yang terjadi sesudahnya, jadi menahannya tidak menambah apa pun.

Dan biayanya nyata. Pembuka yang diam terbaca oleh algoritmanya sebagai tidak ada reaksi: patokan hook rate (penonton yang bertahan lewat 3 detik) 2026 adalah **Meta di bawah 15% lemah, 20-25% rata-rata, 30% ke atas kuat**; TikTok di bawah 18% lemah, 25-32% rata-rata, 40% ke atas kuat. Zoom pelan di atas gambar diam tanpa teks dan tanpa bunyi selama dua detik pertama adalah contoh yang disebut merusaknya.

Jadi dua syarat itu berjalan bersama, bukan bergantian:

1. Frame 0 sudah berupa gambar yang **selesai** — produk, angka, dan satu kalimat terbaca.
2. Gerakannya sudah jalan sejak frame 0 — drift kamera, entrance, atau hitungan angka.

### Tetap tulis sampul kustom, walau frame 0-nya sudah benar

`motion render` mencuplik `<keluaran>-sampul.jpg` dari detik yang ditulis di `sampul.detik`. Meta Ads Manager dan TikTok sama-sama menerima gambar sampul terpisah, dan sampul kustom mengalahkan frame otomatis pada CTR. Pilih detik yang paling memutus scroll — biasanya bukan detik 0, melainkan saat hentakan pertamanya mendarat.

Untuk iklan PKRT: detik 1,60, saat kartu merah "Produk kamu dihapus" sudah mendarat.

### Pakai ikon produk yang sebenarnya

Chip yang cuma bertulisan "Google Sheets" harus DIBACA; ikonnya dikenali sebelum dibaca. Scene yang cuma punya enam detik tidak punya waktu untuk dibaca. Gambar ulang dalam bentuk paling sederhana yang masih dikenali sebagai SVG — bukan berkas merek yang diunduh — dan pakai sebagaimana logo pihak ketiga dipakai di halaman integrasi.

### Gambar yang digenerate harus DIPERKECIL ke kotaknya di komposisi

Generator selalu mengembalikan sekitar 1024x1536 dan 2 MB, apa pun yang diminta — `size` di permintaannya diabaikan. Tiga kartu produk di scene Kenali cuma 300x300 di layar. Delapan berkas sebesar itu membuat tab Chromium di mesin render **mati sebelum satu frame pun keluar**, dan gejalanya tidak menyebut gambar sama sekali: `Target crashed`, tanpa satu pun galat JavaScript. Diperkecil ke 2x kotaknya (untuk zoom scene) dan semuanya lewat.

### Jalur generate gambar: `/responses` + tool `image_generation`

`/v1/images/edits` mati di gateway. Dua jebakan lagi, keduanya memakan satu putaran penuh:

| **Ditulis** | **Hasil** |
|---|---|
| `model: 'cx/gpt-5.5-image'` | `400 The 'gpt-5.5-image' model is not supported` |
| `model: 'cx/gpt-5.4-mini'` | `400 not supported when using Codex with a ChatGPT account` |
| `model: 'cx/gpt-5.6-sol'` | ✓ |
| `background: 'transparent'` | `400 Transparent background is not supported for this model` |

Slot `model` itu DRIVER-nya, bukan model gambarnya — gambarnya dibuat oleh tool-nya. Untuk PNG transparan yang ditolak: pakai foto katalog berlatar putih dan taruh di dalam kartu putih yang memang sudah ada di komposisi. Terbaca sebagai listing marketplace, dan tidak ada keying yang bisa merusak highlight botol.

### Satu klausa gaya untuk SELURUH set, dan satu merek fiktif

Delapan gambar yang masing-masing punya suhu warna sendiri terbaca sebagai delapan stok foto, bukan sebagai satu iklan. Merek fiktif juga harus tetap: label yang berganti nama antar frame terbaca sebagai produk yang berbeda-beda, bukan satu lini produk.

Untuk tokoh yang sama di dua scene, kirim gambar pertama sebagai `input_image` waktu generate yang kedua. Deskripsi teks saja tidak cukup — wajahnya berubah.

### Gerak: kosakata, bukan satu verb

Satu verb (opacity + angkat 44px, satu easing, tanpa overshoot) untuk seluruh video terbaca sebagai slideshow. Yang dipakai sekarang:

- kata masuk satu per satu, bukan seluruh baris sekaligus
- entrance memakai `easeOutBack` — overshoot itulah yang terbaca sebagai tenaga
- tiap scene masuk dari sumbu yang **berbeda**
- kamera tidak pernah parkir: tiap scene punya push, pan, atau pull pelan
- isi scene keluar sebelum potongan, supaya potongan terbaca sebagai gerakan
- CTA terus bernapas sampai frame terakhir

### Watermark preview: satu baris di tepi bawah, bukan diagonal penuh bingkai

Dipasang di KOMPOSISI, bukan di ffmpeg — dari sana dia ikut ke setiap rasio dan setiap `motion shot`, tanpa satu bendera tambahan yang bisa terlupa di salah satu perintah.

Versi pertama memakai teks diagonal berulang memenuhi bingkai pada opasitas 0,40. Dia menandai berkasnya dengan benar dan membuat iklannya **tidak bisa dinilai** — dilaporkan sebagai "terlalu lebay". Yang dipakai sekarang: satu baris 21 px di `bottom: 18`, putih 0,5 alpha, di dalam scrim gelap yang memang sudah ada di situ. Kapsi duduk di `bottom 4,5%` jadi keduanya tidak pernah bertabrakan.

### Kilat hentakan harus RADIAL

Screen blend rata pada 0,12 saja sudah mengubah seluruh bingkai gelap jadi abu dan menghapus identitas warnanya. Radial yang jatuh ke transparan pada 70% menjaga sudutnya tetap gelap.

### Kata yang masuk dari KIRI menabrak kata sebelumnya

`di iklanmu` terbaca `diiklanmu`. Dari kanan tidak pernah — tiap kata datang dari luar ujung barisnya sendiri.

## 6. Jebakan mesin yang memakan satu putaran penuh

`apply` **memulihkan** `.jsx` **dari** `.asli` **tiap kali.** Menyunting berkas kerjanya saja lalu menjalankan `apply` membuang suntingan itu diam-diam. Sekarang `apply` menggagalkan diri kalau keduanya berbeda — tetapi tetap: **sunting keduanya**.

**Pembungkus ber-**`aspectRatio` **di akar komponen memotong stage.** Bingkai 9:16 keluar 870x958. Pakai `React.Fragment` dan `hint-size="100%,100%"`.

**Cache aset dikunci ke permintaannya lewat** `.kunci`**.** Kalau naskah atau parameter suara berubah, asetnya diregenerate sendiri. Sebelum ini ada, satu putaran revisi penuh hilang tanpa jejak.

## 7. Puncak audio: yang divalidasi bukan yang dikirim

Mixer memvalidasi puncaknya terhadap encode AAC percobaannya sendiri — dan encode itu dibuat oleh ffmpeg di mesin tempat `mix` berjalan, sementara berkas yang dikirim dibuat oleh ffmpeg di **mesin render**. Terukur pada satu `master.wav` yang sama persis (md5 identik):

| **ffmpeg** | **Hasil encode AAC** |
|---|---|
| 6.1.1 (mesin kerja) | −1,3 dBTP ✓ |
| 8.1.1 (`rama-tuf`) | **+0,7 dBTP** ✖ |

Dua dB selisih. Mixer lolos, berkas yang dikirim melanggar spesifikasi −1,0 dBTP, dan tidak ada satu pun langkah yang mengeluh.

Selisihnya **tidak tetap** — dia bergantung pada materinya, dan encoder AAC melonjak paling jauh pada materi padat seperti hentakan yang dilapis. Iklan sebelumnya, dengan hentakan tunggal, mendarat di −1,4 dBTP tanpa masalah. Jadi tidak bisa dikompensasi dengan margin tetap; harus diukur.

**Perbaikannya ada di dua tempat:**

1. `render` mengukur satu encode AAC percobaan **di mesin render** sebelum mux, lalu memasang limiter yang memperhitungkan lonjakan encoder itu. Audio saja, hitungan detik, frame tidak dirender ulang.
2. `check` sekarang **memberi putusan** pada angka MP4, bukan cuma mencetaknya. Cuma di situ berkas yang benar-benar dikirim itu diukur.

**Koreksi memakai LIMITER, bukan gain.** Gain rata menurunkan puncaknya DAN loudness-nya sekaligus: koreksi −0,5 dB memberi puncak yang benar dan LUFS meleset jadi −14,8. Limiter hanya menyentuh momen paling keras.

## 8. Rasio: mana yang diskala, mana yang di-layout ulang

Dua komposisi, dua jawaban berbeda, dan memilih yang salah menghasilkan bingkai yang tidak terpakai.

**Komposisi yang isinya penuh teks.** Iklan jasa setup ditulis natif 16:9. Memuatkannya ke 9:16 lewat satu skala kanvas memberi pita setinggi 607 px di tengah bingkai 1920 — Reels tidak bisa memakainya. Jawabannya DUA tata letak, bukan empat: landscape apa adanya, dan satu tata letak tegak yang dipakai bertiga.

**Komposisi yang natif tegak.** Iklan pelatihan ditulis natif 9:16. Untuk 4:5 dan 1:1 tingginya berkurang 30% dan 44%. Yang dipadatkan adalah **jarak antar-blok**, bukan kanvasnya — memperkecil kanvas lalu memusatkannya memberi pita kosong di kiri-kanan, dan bingkai 1:1 akan memuat strip selebar 790 px di tengah bingkai 1080.

Ruang kosong itu memang ada dan memang banyak. Diukur pada scene MCP: sekitar 700 px isi disebar sepanjang 1294 px. Enam ratus piksel di antaranya ruang kosong, dan itu yang dibuang lebih dulu — sebelum satu huruf pun dikecilkan.

### Polanya

9:16, 4:5, dan 1:1 sama-sama **selebar 1080**, jadi seluruh metrik mendatar identik dan tidak perlu diperiksa tiga kali. Yang berbeda cuma tingginya.

```js
const TINGGI = H >= W * 1.5;                        // 9:16 memakai tata letak aslinya
const K = TINGGI ? 1 : Math.min(1, (H / 1920) * 1.25);   // 4:5 -> 0,88 · 1:1 -> 0,70
const f = (n) => Math.round(n * K);                 // huruf, jarak, padding
const V = (frac, abs) => (TINGGI ? abs : Math.round(H * frac));   // posisi vertikal
```

**Objek visual utuh DISKALA utuh.** Nisan, mockup perangkat, dan panel yang punya tata letak internal sendiri diberi `f()` pada dimensinya, bukan di-layout ulang. Isinya tetap persis sama di semua format, jadi tidak ada satu pun yang perlu diperiksa dua kali.

**Titik yang dipasang berpasangan harus diturunkan dari variabel yang sama.** Empat chip MCP dulu memakai koordinat absolut (`x: 92, y: 1148`) dan kabel SVG-nya memakai angka lain (`sy.x + 211`). Begitu chip-nya diskala, kabelnya menunjuk ke tempat kosong. Sekarang keduanya diturunkan dari `chipW`, `kolX`, dan `barisY` yang sama.

### 16:9 untuk komposisi tegak: jangan

Nisan dan panelnya mengecil, dan sisi kiri-kanan jadi ruang kosong. Kalau anggaran render terbatas, jalankan 9:16, 4:5, dan 1:1 saja.
