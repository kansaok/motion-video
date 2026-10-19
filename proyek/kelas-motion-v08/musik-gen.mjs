/* Generate aset/bgm-gen.mp3 di komentar-web dari `rencana` di basis.mjs, tanpa mengubah config.
   Sesudahnya: bash bgm.sh. */
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as Pp from '../../lib/pipa.mjs';
const c = await Pp.muat(path.join(path.dirname(fileURLToPath(import.meta.url)), 'komentar-web'));
c.musik = c.musik.map((m) => ({...m, nama: 'bgm-gen', luar: false}));
console.log(`  ${await Pp.musik(c)} trek baru`);
