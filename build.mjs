// Production build with esbuild. The metafile is the module map vexproof reads: every file that went into the bundle.
import * as esbuild from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';

const result = await esbuild.build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  minify: true,
  outfile: 'dist/app.js',
  metafile: true,
  format: 'esm',
  define: { 'process.env.NODE_ENV': '"production"' },
  jsx: 'automatic',
  logLevel: 'error',
});
mkdirSync('dist', { recursive: true });
writeFileSync('dist/meta.json', JSON.stringify(result.metafile));
