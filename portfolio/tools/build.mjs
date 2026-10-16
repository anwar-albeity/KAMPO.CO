// Builds the two files the site loads: js/site.min.js and css/site.min.css.
// Edit the readable sources (js/*.js, css/style.css), then run:  npm install --no-save esbuild@0.24.2 && node tools/build.mjs
// js/data.js (your words and links) is not bundled, so you can edit it without rebuilding.
import { transform } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('..', import.meta.url);
const read = (p) => readFile(new URL(p, root), 'utf8');
const js = ['js/gl.js', 'js/tear.js', 'js/edges.js', 'js/script-line.js', 'js/pages.js', 'js/app.js'];
const parts = [];
for (const f of js) parts.push((await transform(await read(f), { minify: true, target: 'es2020', legalComments: 'none' })).code.trim().replace(/;?$/, ';'));
await writeFile(new URL('js/site.min.js', root), parts.join('\n') + '\n');
const css = (await read('vendor/lenis.css')) + '\n' + (await read('css/style.css'));
await writeFile(new URL('css/site.min.css', root), (await transform(css, { loader: 'css', minify: true, target: ['chrome111', 'safari16.4', 'firefox113'] })).code);
console.log('built js/site.min.js and css/site.min.css');
