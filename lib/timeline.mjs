// Timeline kerja proyek: durasi scene hasil `rencana`, atau durasi asli komposisi bila belum ada.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import * as K from './komposisi.mjs';

/** @type {(c: import('./tipe.mjs').Config, scenes: import('./tipe.mjs').Scene[]) => void} */
export const simpanTimeline = (c, scenes) => writeFileSync(path.join(c.dir, 'timeline.json'), JSON.stringify(scenes, null, 1));
/** @type {(c: import('./tipe.mjs').Config) => import('./tipe.mjs').Scene[]} */
export const bacaTimeline = (c) => {
  const f = path.join(c.dir, 'timeline.json');
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : K.bacaScenes(c.htmlUtama);
};

