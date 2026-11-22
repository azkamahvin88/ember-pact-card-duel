/* main.ts — EMBER PACT entry program (Node, stdlib only).
 * Copies game/ and screenshots/ from this repository into the output
 * directory and writes dossier.json there, via the kit's buildDossier.
 * Output dir: $MAKEFUN_OUTPUT_DIR, or /output when unset.
 * Fully deterministic: the same repository always writes the same bytes.
 */

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_DIR = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function main(): void {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // The playable game, copied whole.
  const gameSrc = join(REPO_DIR, 'game');
  const gameDst = join(OUTPUT_DIR, 'game');
  cpSync(gameSrc, gameDst, { recursive: true });

  // The screenshots, when the repository holds any.
  const shotsDst = join(OUTPUT_DIR, 'screenshots');
  mkdirSync(shotsDst, { recursive: true });
  const shotsSrc = join(REPO_DIR, 'screenshots');
  if (existsSync(shotsSrc)) {
    cpSync(shotsSrc, shotsDst, { recursive: true });
  }

  // The judge's dossier of exactly what was handed in.
  const dossier = buildDossier(OUTPUT_DIR, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
  console.log(`EMBER PACT: wrote ${OUTPUT_DIR} (dossier ${dossier.length} bytes)`);
}

main();
