import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, readFileSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {durasi} from '../lib/ff.mjs';
import {pangkasVo} from '../lib/pipa.mjs';
import {simpanVo} from '../mcp/proyek.mjs';

test('pangkasVo menyamakan hasil TTS dan unggahan MCP', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'motion-vo-'));
  const mentah = path.join(dir, 'masuk.wav'), cli = path.join(dir, 'cli.mp3');
  const aset = path.join(dir, 'aset');
  mkdirSync(path.join(aset, 'vo'), {recursive: true});
  try {
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono:d=0.2',
      '-f', 'lavfi', '-i', 'sine=frequency=440:duration=0.4', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=mono:d=0.5',
      '-filter_complex', '[0][1][2]concat=n=3:v=0:a=1', mentah]);
    pangkasVo(mentah, cli, {tempo: 1});
    const unggah = simpanVo({aset}, 1, readFileSync(mentah), 1);
    assert.equal(unggah.berkas, 'vo-01.mp3');
    assert.ok(Math.abs(durasi(cli) - unggah.detik) < 0.002);
  } finally { rmSync(dir, {recursive: true, force: true}); }
});
