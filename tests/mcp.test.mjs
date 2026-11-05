import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
test('MCP stdio responde a initialize/list/call y rechaza traversal',async()=>{
 const processChild=spawn(process.execPath,[new URL('../tools/mcp-server.mjs',import.meta.url).pathname],{stdio:['pipe','pipe','pipe']});
 const lines=[];let buffer='';processChild.stdout.on('data',buf=>{buffer+=buf.toString();while(buffer.includes('\n')){const i=buffer.indexOf('\n');lines.push(JSON.parse(buffer.slice(0,i)));buffer=buffer.slice(i+1);}});
 const send=(id,method,params={})=>processChild.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');
 send(1,'initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'test',version:'1'}});
 send(2,'tools/list');
 send(3,'tools/call',{name:'bil_get_brand',arguments:{id:'../invalid'}});
 send(4,'tools/call',{name:'bil_list_brands',arguments:{}});
 const deadline=Date.now()+3000;while(lines.length<4&&Date.now()<deadline)await new Promise(r=>setTimeout(r,10));
 processChild.kill();await once(processChild,'exit');
 assert.equal(lines.length,4);assert.equal(lines[0].result.serverInfo.name,'bil-readonly');assert.ok(lines[1].result.tools.some(t=>t.name==='bil_compile_prompt'));assert.equal(lines[2].result.isError,true);assert.match(lines[3].result.content[0].text,/horizon-demo/);
});
