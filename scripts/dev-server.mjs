import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
const root=resolve('dist');
const types={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json;charset=utf-8','.svg':'image/svg+xml'};
const port=Number(process.env.PORT||4173);
createServer(async(req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  const target=resolve(root,'.'+pathname,pathname.endsWith('/')?'index.html':'');
  if(target!==root&&!target.startsWith(root+sep)){res.writeHead(403).end('Forbidden');return;}
  try{if(!(await stat(target)).isFile())throw new Error('Not file');const data=await readFile(target);res.writeHead(200,{'Content-Type':types[target.slice(target.lastIndexOf('.'))]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(data);}
  catch{res.writeHead(404,{'Content-Type':'text/plain;charset=utf-8'}).end('No encontrado');}
}).listen(port,'127.0.0.1',()=>console.log(`BIL local → http://127.0.0.1:${port}`));
