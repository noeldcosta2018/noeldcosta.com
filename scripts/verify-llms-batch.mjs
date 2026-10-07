import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';
import * as cheerio from 'cheerio';
import { extractArchiveMetadata } from './lib/archive-schema-verification.mjs';
const audit = 'docs/codex/audit';
const read = f => readFileSync(f);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const before = JSON.parse(read(audit+'/phase-5d-llms-before.json'));
const diagnostic = process.argv.includes('--diagnostic');
const control = process.argv.includes('--control');
const final = process.argv.includes('--final');
const manifestBytes = read('.next/prerender-manifest.json');
const routes = Object.keys(JSON.parse(manifestBytes).routes).sort();
if (process.argv.includes('--capture-routes')) {
  assert.equal(hash(manifestBytes), before.manifestHash);
  writeFileSync(audit+'/phase-5d-llms-before-routes.json', JSON.stringify(routes,null,2), {flag:'wx'});
  console.log(JSON.stringify({capturedRoutes:routes.length})); process.exit(0);
}
const files = [];
const walk = dir => {for(const item of readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+item.name;if(item.isDirectory())walk(p);else if(!p.includes('phase-5d-llms') && p!=='src/app/llms.txt/route.ts' && p!=='src/lib/llms-contract.test.mjs' && p!=='scripts/verify-llms-batch.mjs')files.push(p);}};
for(const dir of ['src','content','public','docs/codex'])walk(dir);
for(const p of ['package.json','package-lock.json','next.config.ts','next.config.mjs','next.config.js']){try{read(p);files.push(p);}catch(e){if(e.code!=='ENOENT')throw e;}}
files.sort();
if (process.argv.includes('--capture-files')) {
  const records = files.map(p => [p, hash(read(p))]);
  assert.equal(records.length, before.fileCount);
  assert.equal(hash(JSON.stringify(files)), before.fileListHash);
  assert.equal(hash(JSON.stringify(records)), before.protectedAggregate);
  writeFileSync(audit+'/phase-5d-llms-before-files-complete.json', JSON.stringify(records,null,2), {flag:'wx'});
  console.log(JSON.stringify({capturedFiles:records.length,originalAggregateVerified:true}));process.exit(0);
}
const frozen = JSON.parse(read(audit+'/phase-5d-llms-before-files-complete.json'));
const sourceHash = hash(read('src/app/llms.txt/route.ts'));
assert.equal(sourceHash, hash(control ? before.llmsSource : JSON.parse(read(audit+'/phase-5d-llms-corrected-source.json')).source));
assert.equal(frozen.length, before.fileCount);
assert.equal(new Set(frozen.map(r => r[0])).size, before.fileCount);
assert.equal(hash(JSON.stringify(frozen)), before.protectedAggregate);
assert.deepEqual(files, frozen.map(r=>r[0]), 'Protected filenames');
for(const [p,h] of frozen)assert.equal(hash(read(p)),h,'Protected bytes: '+p);
assert.deepEqual(routes, JSON.parse(read(audit+'/phase-5d-llms-before-routes.json')));
assert.equal(hash(read('.next/server/app/robots.txt.body')), before.robots.sha256);
assert.equal(hash(read('.next/server/app/sitemap.xml.body')), before.sitemapHash);
const discovery=JSON.parse(read(audit+'/phase-5a-discovery.json'));
const replacements=new Map(discovery.llms.html.map(r=>[r.url,r.canonical]));
assert.equal(replacements.size,62);
const expected=before.llmsText.replace(/\]\((https:\/\/noeldcosta\.com\/[^)]+)\)/g,(match,url)=>replacements.has(url)?']('+replacements.get(url)+')':match);
const text=read('.next/server/app/llms.txt.body').toString();
assert.equal(text,control ? before.llmsText : expected);
const links=[...text.matchAll(/\]\((https:\/\/noeldcosta\.com\/[^)]+)\)/g)].map(m=>m[1]);
assert.equal(links.length,63);assert.equal(new Set(links).size,63);
const oldBytes=read(audit+'/phase-4g-archive-schema/after.json.gz');
assert.equal(hash(oldBytes),JSON.parse(read(audit+'/phase-4g-archive-schema/after-summary.json')).evidenceHash);
const old=JSON.parse(gunzipSync(oldBytes));
const htmlHashes={};
const records={};
const failures={metadata:[],rawSchema:[],schema:[],body:[]};
for(const [path,original]of Object.entries(old.records)){
  const bytes=read('.next/server/app/'+(path==='/'?'index':path.slice(1,-1))+'.html');
  const page=cheerio.load(bytes.toString());
  const metadata=extractArchiveMetadata(page);
  const raw=page('script[type="application/ld+json"]').toArray().map(el=>page(el).html());
  const scriptHashes=raw.map(hash),schemas=raw.map(JSON.parse);
  for(const [key,actual,expected]of [['metadata',metadata,original.metadata],['rawSchema',scriptHashes,original.scriptHashes],['schema',schemas,original.schemas]]){
    try{assert.deepEqual(actual,expected);}catch{failures[key].push(path);}
  }
  page('script').remove();const body=page('body').html(),bodyHash=hash(body);
  if(bodyHash!==original.bodyHash)failures.body.push(path);
  htmlHashes[path]=hash(bytes);
  records[path]={metadata,raw,scriptHashes,schemas,body,bodyHash,htmlHash:htmlHashes[path]};
}
assert.equal(Object.keys(htmlHashes).length,1457);
assert.deepEqual(failures.metadata,[]);assert.deepEqual(failures.rawSchema,[]);assert.deepEqual(failures.schema,[]);
if(!diagnostic&&!control&&!final)assert.deepEqual(failures.body,[], 'Historical non-script body parity');
if(!control)for(const url of links.filter(u=>!u.endsWith('/sitemap.xml'))){
  const parsed=new URL(url);assert.equal(parsed.origin,'https://noeldcosta.com');assert.ok(parsed.pathname.endsWith('/'));
  const record=old.records[parsed.pathname];assert.ok(record,url);
  assert.equal(record.metadata.links.find(l=>l.rel==='canonical')?.href,url);
  const directives=record.metadata.meta.filter(m=>['robots','googlebot'].includes(m.name?.toLowerCase())).map(m=>m.content).join(',');
  assert.ok(!/\bnoindex\b|\bnone\b/i.test(directives),url);
}
assert.ok(read('.next/prerender-manifest.json').equals(manifestBytes));
if(control||final){
  const corrected=JSON.parse(gunzipSync(read(audit+'/phase-5d-llms-corrected-diagnostic.json.gz')));
  assert.deepEqual(Object.keys(records).sort(),Object.keys(corrected.records).sort());
  for(const [p,r]of Object.entries(records)){
    assert.equal(r.body,corrected.records[p].body,'Controlled body: '+p);
    assert.deepEqual(r.metadata,corrected.records[p].metadata,'Controlled metadata: '+p);
    assert.deepEqual(r.raw,corrected.records[p].raw,'Controlled raw schema: '+p);
  }
  assert.deepEqual(failures,corrected.failures);
  if(final){const c=JSON.parse(gunzipSync(read(audit+'/phase-5d-llms-control.json.gz')));for(const[p,r]of Object.entries(records))assert.equal(r.body,c.records[p].body,'Final/control body: '+p);}
}
const result={buildId:read('.next/BUILD_ID').toString().trim(),previousBuildId:before.buildId,sourceHash,protectedFiles:frozen.length,manifestRoutes:routes.length,publicRoutesVerified:1457,llmsLinks:links.length,canonicalHtmlLinks:control?0:62,llmsHash:hash(text),llmsBytes:Buffer.byteLength(text),sitemapHash:before.sitemapHash,robotsHash:before.robots.sha256,proseAndOrderPreserved:true,htmlMetadataAndSchemaPreserved:true,historicalBodyParity:{pass:1457-failures.body.length,fail:failures.body.length},controlledBodyParity:control||final?1457:undefined,failures,links,htmlHashes};
const name=diagnostic?'corrected-diagnostic':control?'control':'after';
writeFileSync(audit+'/phase-5d-llms-'+name+'.json.gz',gzipSync(JSON.stringify({...result,records,manifest:JSON.parse(manifestBytes),surfaces:{llms:text,robots:read('.next/server/app/robots.txt.body').toString(),sitemap:read('.next/server/app/sitemap.xml.body').toString()}})),{flag:'wx'});
writeFileSync(audit+'/phase-5d-llms-'+name+'.json',JSON.stringify(result,null,2),{flag:'wx'});
console.log(JSON.stringify({...result,links:undefined,htmlHashes:undefined}));
