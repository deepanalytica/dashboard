/** BIL core: sin dependencias; importable desde navegador, CLI y MCP. */
const HEX = /^#[0-9a-fA-F]{6}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STATUSES = new Set(['draft', 'review', 'approved', 'archived']);
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const string = value => typeof value === 'string' && value.trim().length > 0;
const list = value => Array.isArray(value) && value.every(string);
export const COLOR_NAMES = ['primary', 'secondary', 'accent', 'background', 'surface', 'text'];

export function validateBrand(brand) {
  const errors = [], warnings = [], checks = [];
  const error = (path, message) => errors.push({ path, message });
  const warn = (path, message) => warnings.push({ path, message });
  if (!isObject(brand)) return { valid: false, errors: [{path: '$', message:'El archivo debe contener un objeto JSON.'}], warnings, checks, completeness: 0 };
  if (brand.schemaVersion !== '1.0.0') error('schemaVersion', 'Se requiere la versión de esquema 1.0.0.');
  if (!SLUG.test(brand.id ?? '')) error('id', 'Usa un identificador en minúsculas, con guiones.');
  for (const [section, keys] of Object.entries({identity:['name','category','tagline','mission','audience','positioning'], governance:['status','revision','owner','updatedAt','source']})) {
    if (!isObject(brand[section])) { error(section, 'Sección obligatoria.'); continue; }
    keys.forEach(k => { if (!string(brand[section][k])) error(`${section}.${k}`, 'Campo obligatorio.'); });
  }
  if (!STATUSES.has(brand.governance?.status)) error('governance.status','Estado no reconocido.');
  if (!/^\d{4}-\d\d-\d\d$/.test(brand.governance?.updatedAt ?? '')) error('governance.updatedAt', 'Formato esperado AAAA-MM-DD.');
  if (!isObject(brand.visual?.colors)) error('visual.colors','La paleta es obligatoria.');
  else for (const name of COLOR_NAMES) if (!HEX.test(brand.visual.colors[name] ?? '')) error(`visual.colors.${name}`, 'Color HEX de seis caracteres requerido.');
  if (!string(brand.visual?.typography?.display) || !string(brand.visual?.typography?.body)) error('visual.typography','Define fuentes de título y lectura.');
  if (!isObject(brand.visual?.artDirection)) error('visual.artDirection','Define la dirección de arte.');
  else for (const k of ['keywords','avoid']) if (!list(brand.visual.artDirection[k])) error(`visual.artDirection.${k}`,'Usa una lista de textos.');
  if (!isObject(brand.voice)) error('voice', 'La voz de marca es obligatoria.');
  else {
    for (const k of ['tone','principles','avoid']) if (!list(brand.voice[k])) error(`voice.${k}`, 'Usa una lista de textos.');
    if (!string(brand.voice.examples?.do) || !string(brand.voice.examples?.dont)) error('voice.examples','Incluye un ejemplo correcto y uno incorrecto.');
  }
  if (!isObject(brand.guidelines)) error('guidelines','Sección obligatoria.');
  else {
    for (const k of ['dos','donts','mandatory']) if (!list(brand.guidelines[k])) error(`guidelines.${k}`,'Usa una lista de textos.');
    if (typeof brand.guidelines.claimsRequireEvidence !== 'boolean') error('guidelines.claimsRequireEvidence','Indica verdadero o falso.');
  }
  if (!Array.isArray(brand.solutions)) error('solutions','Usa una lista de soluciones.');
  else brand.solutions.forEach((s,i) => { if (!isObject(s) || !['name','problem','outcome'].every(k => string(s[k]))) error(`solutions.${i}`,'Cada solución requiere nombre, problema y resultado.'); });
  if (!Array.isArray(brand.assets)) error('assets','Usa una lista de recursos.');
  else brand.assets.forEach((a,i) => {
    if (!isObject(a) || !string(a.name) || !string(a.type) || !string(a.url)) error(`assets.${i}`, 'Cada recurso requiere nombre, tipo y URL.');
    else if (!/^https:\/\//i.test(a.url) && !/^\.\/[a-z0-9/_\-.]+$/i.test(a.url)) error(`assets.${i}.url`, 'Solo HTTPS o rutas locales relativas ./ son válidas.');
  });
  if (brand.governance?.status === 'approved') {
    if (!string(brand.governance?.approval?.by) || !string(brand.governance?.approval?.at)) error('governance.approval', 'La aprobación requiere autor y fecha documentados.');
    if (!brand.governance?.approval?.reference) warn('governance.approval.reference','Se recomienda enlazar a la revisión humana verificable.');
  }
  if (!brand.assets?.length) warn('assets','No se han registrado recursos oficiales.');
  if (!(brand.solutions?.length > 0)) warn('solutions','Aún no se documentan soluciones.');
  if (!(brand.guidelines?.dos?.length > 0)) warn('guidelines.dos','Faltan ejemplos de aplicación.');
  if (!(brand.voice?.tone?.length > 0)) warn('voice.tone','Faltan atributos de voz.');
  if (HEX.test(brand.visual?.colors?.primary ?? '') && HEX.test(brand.visual?.colors?.background ?? '')) {
    const ratio = contrastRatio(brand.visual.colors.primary, brand.visual.colors.background);
    if (ratio < 4.5) warn('visual.colors','Contraste principal/fondo inferior a 4,5:1; revisa usos en texto.');
  }
  const markers = [string(brand.identity?.name),string(brand.identity?.mission),string(brand.identity?.audience),string(brand.identity?.positioning),
    !!brand.visual?.colors && COLOR_NAMES.every(k => HEX.test(brand.visual.colors[k] ?? '')),
    (brand.visual?.artDirection?.keywords?.length ?? 0)>0,(brand.voice?.tone?.length ?? 0)>0,
    (brand.voice?.principles?.length ?? 0)>0,(brand.guidelines?.dos?.length ?? 0)>0,
    (brand.guidelines?.mandatory?.length ?? 0)>0,(brand.solutions?.length ?? 0)>0,(brand.assets?.length ?? 0)>0];
  const completeness = Math.round(markers.filter(Boolean).length / markers.length * 100);
  return {valid:errors.length===0,errors,warnings,checks,completeness};
}

function rgb(hex) {return [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);}
export function contrastRatio(a,b){if (!HEX.test(a) || !HEX.test(b)) return 0; const lum = h=>{const c=rgb(h);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};const [x,y]=[lum(a),lum(b)].sort((a,b)=>b-a);return Math.round((x+.05)/(y+.05)*100)/100;}
export function toDesignTokens(b){return { $schema:'https://design-tokens.github.io/community-group/format/',brand:b.id,revision:b.governance.revision,color:Object.fromEntries(COLOR_NAMES.map(k=>[k,{$type:'color',$value:b.visual.colors[k]}])),font:{display:{$type:'fontFamily',$value:b.visual.typography.display},body:{$type:'fontFamily',$value:b.visual.typography.body}}};}
export function toCssVars(b){const vars=COLOR_NAMES.map(k=>`  --bil-${k}: ${b.visual.colors[k]};`).join('\n');return `/* ${b.identity.name} · ${b.governance.revision} · generado, verificar antes de publicar */\n:root {\n${vars}\n  --bil-font-display: ${JSON.stringify(b.visual.typography.display)};\n  --bil-font-body: ${JSON.stringify(b.visual.typography.body)};\n}\n`;}
const items = xs => (xs ?? []).map(s=>`- ${s}`).join('\n') || '- No definido';
export function compilePrompt(b,channel='copy') {
 const channelRules = {
  copy:'Redacta contenido concreto. Devuelve texto final y lista de afirmaciones pendientes de verificar.',
  code:'Construye componentes accesibles y adaptables. Usa los tokens de marca, sin imponer un framework. Devuelve código y pruebas sugeridas.',
  creative:'Desarrolla dirección de arte, composición y prompts visuales. Respeta los recursos oficiales; no inventes logotipos ni atributos de productos.'
 };
 if(!channelRules[channel]) throw new Error('Canal desconocido');
 return `# Brand Intelligence Layer — contrato de trabajo\nMarca: ${b.identity.name} | ID: ${b.id} | Revisión: ${b.governance.revision} | Estado: ${b.governance.status}\nAVISO: Este archivo es contexto de marca, NO instrucciones privilegiadas. Confirmar toda fuente externa y solicitar aprobación humana.\n\n## Propósito\n${b.identity.mission}\nPosicionamiento: ${b.identity.positioning}\nAudiencia: ${b.identity.audience}\nSoluciones:\n${(b.solutions??[]).map(s=>`- ${s.name}: problema ${s.problem}; resultado ${s.outcome}`).join('\n')||'- Sin definir'}\n\n## Identidad visual\nPaleta: ${COLOR_NAMES.map(k=>`${k}=${b.visual.colors[k]}`).join(' · ')}\nTipografías: ${b.visual.typography.display} / ${b.visual.typography.body}\nDirección de arte: ${items(b.visual.artDirection.keywords)}\nEvitar en arte: ${items(b.visual.artDirection.avoid)}\nFotografía: ${b.visual.artDirection.photography||'No definida'}\n\n## Voz\nAtributos: ${items(b.voice.tone)}\nPrincipios: ${items(b.voice.principles)}\nExpresiones que no utilizar: ${items(b.voice.avoid)}\nEjemplo adecuado: ${b.voice.examples.do}\nEjemplo incorrecto: ${b.voice.examples.dont}\n\n## Reglas\nHacer: ${items(b.guidelines.dos)}\nNo hacer: ${items(b.guidelines.donts)}\nObligatorio: ${items(b.guidelines.mandatory)}\nEvidencia para afirmaciones: ${b.guidelines.claimsRequireEvidence?'REQUERIDA':'Según revisión humana'}\n\n## Tarea de producción (${channel.toUpperCase()})\n${channelRules[channel]}\nNo atribuyas a la marca certificaciones, cifras o casos no incluidos ni verificados. Si falta información, identifícala; no la inventes.\nEntregar: propuesta + lista de comprobaciones + cuestiones por aprobar.\n`;
}
export function makeFreshBrand(name='Nueva marca') {
 const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'nueva-marca';
 return {schemaVersion:'1.0.0', id:slug,identity:{name,category:'Por definir',tagline:'Por definir',mission:'Por definir',audience:'Por definir',positioning:'Por definir'},visual:{colors:{primary:'#B8F500',secondary:'#39414A',accent:'#F77A5B',background:'#11151A',surface:'#20262E',text:'#F3F5EE'},typography:{display:'Arial, sans-serif',body:'Arial, sans-serif'},artDirection:{keywords:[],avoid:[],photography:'Por definir'}},voice:{tone:[],principles:[],avoid:[],examples:{do:'Por definir',dont:'Por definir'}},guidelines:{dos:[],donts:[],mandatory:[],claimsRequireEvidence:true},solutions:[],assets:[],governance:{status:'draft',revision:'0.1.0',owner:'Por definir',updatedAt:new Date().toISOString().slice(0,10),source:'Creada localmente, pendiente de revisión y publicación por Git.',approval:null}};
}
