import { spawnSync } from 'node:child_process';
import { mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const sourceDir = path.resolve(import.meta.dirname, '../public/assets/complejos');
const outputDir = path.join(sourceDir, 'responsive');
await mkdir(outputDir, { recursive: true });

for (const file of (await readdir(sourceDir)).filter((name) => name.endsWith('.jpg')).sort()) {
  const source = path.join(sourceDir, file);
  const originalBytes = (await stat(source)).size;
  for (const width of [640, 960]) {
    const output = path.join(outputDir, `${path.parse(file).name}-${width}.webp`);
    const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', source,
      '-vf', `scale=${width}:-2:flags=lanczos`, '-frames:v', '1', '-c:v', 'libwebp',
      '-quality', '78', '-compression_level', '6', output], { encoding: 'utf8' });
    if (result.error || result.status !== 0) throw new Error(result.stderr || result.error?.message || 'ffmpeg failed');
    console.log(`${path.basename(output)}: ${(await stat(output)).size} / ${originalBytes} bytes`);
  }
}
