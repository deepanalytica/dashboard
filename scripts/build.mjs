import { rm, cp, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dist=resolve(root,'dist');
await rm(dist,{recursive:true,force:true});
await cp(resolve(root,'public'),dist,{recursive:true});
await mkdir(resolve(dist,'brands'),{recursive:true});
// EXPLICIT ALLOWLIST. Never copy private client profiles from brands/ into a public site.
await cp(resolve(root,'brands/horizon-demo.json'),resolve(dist,'brands/horizon-demo.json'));
await writeFile(resolve(dist,'.nojekyll'),'');
console.log('BIL build completed: dist/ (public demo only)');
