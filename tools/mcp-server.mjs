#!/usr/bin/env node
/** Adaptador MCP stdio de SOLO LECTURA. Sin credenciales, red ni ejecución de comandos. */
import readline from 'node:readline';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateBrand, compilePrompt, toDesignTokens } from '../public/lib/core.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../brands');
const tools=[
 {name:'bil_list_brands',description:'Enumera perfiles locales de marca en el directorio brands/.',inputSchema:{type:'object',properties:{},additionalProperties:false}},
 {name:'bil_get_brand',description:'Obtiene un perfil JSON por su ID, solo lectura.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false}},
 {name:'bil_validate_brand',description:'Verifica esquema y devuelve alertas de una marca.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false}},
 {name:'bil_compile_prompt',description:'Compila instrucciones para un agente según copy, code o creative.',inputSchema:{type:'object',properties:{id:{type:'string'},channel:{type:'string',enum:['copy','code','creative']}},required:['id','channel'],additionalProperties:false}},
 {name:'bil_design_tokens',description:'Exporta tokens de diseño tipados.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false}}
];
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
async function load(id){if(typeof id!=='string'||!slug.test(id))throw new Error('ID inválido');const b=JSON.parse(await readFile(join(root,`${id}.json`),'utf8'));if(b.id!==id)throw new Error('ID de archivo y documento no coinciden');return b;}
async function call(name,args){switch(name){
 case 'bil_list_brands':return (await readdir(root)).filter(x=>x.endsWith('.json')).map(x=>x.slice(0,-5));
 case 'bil_get_brand':return await load(args.id);
 case 'bil_validate_brand':return validateBrand(await load(args.id));
 case 'bil_compile_prompt':return compilePrompt(await load(args.id),args.channel);
 case 'bil_design_tokens':return toDesignTokens(await load(args.id));
 default:throw new Error('Herramienta desconocida');
}}
function reply(payload){process.stdout.write(JSON.stringify(payload)+'\n');}
const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
rl.on('line',async line=>{let msg;try{msg=JSON.parse(line);if(!msg||msg.jsonrpc!=='2.0'||!msg.method)return;if(msg.id===undefined)return;
 let result; if(msg.method==='initialize')result={protocolVersion:'2025-06-18',capabilities:{tools:{listChanged:false}},serverInfo:{name:'bil-readonly',version:'0.1.0'}};
 else if(msg.method==='ping')result={};
 else if(msg.method==='tools/list')result={tools};
 else if(msg.method==='tools/call'){try{const value=await call(msg.params?.name,msg.params?.arguments||{});result={content:[{type:'text',text:typeof value==='string'?value:JSON.stringify(value,null,2)}]};}catch(e){result={isError:true,content:[{type:'text',text:e.message}]};}}
 else {reply({jsonrpc:'2.0',id:msg.id,error:{code:-32601,message:'Method not found'}});return;}
 reply({jsonrpc:'2.0',id:msg.id,result});
 }catch(e){if(msg?.id!==undefined)reply({jsonrpc:'2.0',id:msg.id,error:{code:-32603,message:'Internal error'}});}});
