import {readFile} from 'node:fs/promises';

const akar = new URL('..', import.meta.url);
const [paketMentah, dockerfile] = await Promise.all([
  readFile(new URL('package.json', akar), 'utf8'),
  readFile(new URL('Dockerfile', akar), 'utf8'),
]);
const paket = JSON.parse(paketMentah);
const versiPaket = paket.dependencies?.playwright;
const cocok = dockerfile.match(/^FROM\s+mcr\.microsoft\.com\/playwright:v([^\s-]+)-/m);
const versiImage = cocok?.[1];

if (!versiPaket || !versiImage) {
  throw new Error('Tidak dapat menemukan versi Playwright di package.json atau tag image Dockerfile.');
}
if (versiPaket !== versiImage) {
  throw new Error(`Versi Playwright berbeda: package.json=${versiPaket}, Dockerfile=${versiImage}.`);
}

console.log(`Versi Playwright selaras: ${versiPaket}.`);
