#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateBrand, compilePrompt, toDesignTokens, toCssVars } from '../public/lib/core.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export async function readBrand(filename) { const b=JSON.parse(await readFile(filename,'utf8'));const report=validateBrand(b);if(!report.valid)throw new Error(`${filename}: ${report.errors.map(e=>`${e.path}: ${e.message}`).join('; ')}`);return b; }
export async function run(args){const [cmd,arg,extra]=args;
 if(cmd==='validate-all'){const dir=join(root,'brands');const names=(await readdir(dir)).filter(x=>x.endsWith('.json'));if(!names.length)throw new Error('No hay archivos de marcas.');let warnings=0;for(const name of names){const b=await readBrand(join(dir,name));const report=validateBrand(b);warnings+=report.warnings.length;console.log(`OK ${b.id} · ${report.completeness}% · ${report.warnings.length} avisos`);}console.log(`Validación: ${names.length} marca(s), ${warnings} advertencias`);return;}
 if(!['validate','prompt','tokens','css'].includes(cmd)||!arg)throw new Error('Uso: brand-cli.mjs validate-all | validate <archivo> | prompt <archivo> [copy|code|creative] | tokens <archivo> | css <archivo>');
 const b=await readBrand(resolve(arg));
 if(cmd==='validate')console.log(JSON.stringify(validateBrand(b),null,2));
 else if(cmd==='prompt')console.log(compilePrompt(b,extra||'copy'));
 else if(cmd==='tokens')console.log(JSON.stringify(toDesignTokens(b),null,2));
 else if(cmd==='css')console.log(toCssVars(b));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){run(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=1;});}
