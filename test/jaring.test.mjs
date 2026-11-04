import assert from 'node:assert/strict';
import test from 'node:test';
import {privat, alamatPublik} from '../lib/jaring.mjs';

test('privat mengenali seluruh rentang internal yang dijaga', () => {
  for (const ip of ['10.1.2.3', '172.16.0.1', '192.168.1.1', '127.0.0.1', '169.254.1.1', '100.64.0.1', '192.0.0.1', '192.0.2.1', '198.18.0.1', '198.51.100.1', '203.0.113.1', '240.0.0.1', '::1', 'fc00::1', 'fe80::1', '64:ff9b::1', '2001:db8::1', 'ff02::1', '::ffff:127.0.0.1']) {
    assert.equal(privat(ip), true, ip);
  }
});

test('privat mengizinkan alamat publik', () => {
  assert.equal(privat('8.8.8.8'), false);
  assert.equal(privat('2001:4860:4860::8888'), false);
});

test('alamatPublik memakai cache singkat lalu memeriksa ulang DNS', async () => {
  let waktu = 0, panggilan = 0;
  const cari = async () => [{address: ++panggilan === 1 ? '8.8.8.8' : '127.0.0.1'}];
  const opsi = {cari, sekarang: () => waktu};
  assert.deepEqual(await alamatPublik('cache-ssrf-uji.example', opsi), ['8.8.8.8']);
  assert.deepEqual(await alamatPublik('cache-ssrf-uji.example', opsi), ['8.8.8.8']);
  assert.equal(panggilan, 1);
  waktu = 60_001;
  await assert.rejects(() => alamatPublik('cache-ssrf-uji.example', opsi), /jaringan privat/);
});
