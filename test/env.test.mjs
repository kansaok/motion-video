import assert from 'node:assert/strict';
import test from 'node:test';
import {periksaLingkungan} from '../mcp/env.mjs';
import {batasDariEnv} from '../mcp/proyek.mjs';

const lengkap = {
  NODE_ENV: 'production',
  UNDUH_RAHASIA: 'a'.repeat(32),
  BIMP_API_URL: 'https://api.contoh.test',
  BIMP_SERVICE_KEY: 'kunci-servis',
};

test('produksi menolak setiap rahasia wajib yang kosong atau pendek', () => {
  assert.throws(() => periksaLingkungan({...lengkap, UNDUH_RAHASIA: 'pendek'}), /UNDUH_RAHASIA/);
  assert.throws(() => periksaLingkungan({...lengkap, BIMP_API_URL: ''}), /BIMP_API_URL/);
  assert.throws(() => periksaLingkungan({...lengkap, BIMP_SERVICE_KEY: ''}), /BIMP_SERVICE_KEY/);
  assert.throws(() => periksaLingkungan({...lengkap, MCP_DEV_TOKEN: 'hanya-lokal'}), /MCP_DEV_TOKEN/);
});

test('produksi menerima konfigurasi lengkap dan pengembangan tidak dipaksa', () => {
  assert.doesNotThrow(() => periksaLingkungan(lengkap));
  assert.doesNotThrow(() => periksaLingkungan({NODE_ENV: 'development'}));
});

test('batas render bawaan mengikuti durasi maksimum dengan minimum sepuluh menit', () => {
  assert.equal(batasDariEnv({MAKS_DETIK: '180'}).renderMenit, 30);
  assert.equal(batasDariEnv({MAKS_DETIK: '7200'}).renderMenit, 1200);
  assert.equal(batasDariEnv({MAKS_DETIK: '180', RENDER_BATAS_MENIT: '25'}).renderMenit, 25);
});
