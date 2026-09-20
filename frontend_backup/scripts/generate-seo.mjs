import { existsSync,mkdirSync,readFileSync,writeFileSync } from "node:fs";
import { dirname,join } from "node:path";
import { fileURLToPath } from "node:url";
const here=dirname(fileURLToPath(import.meta.url));const pub=join(here,"..");let envUrl=process.env.VITE_SITE_URL||"";const envPath=join(pub,".env");
if(!envUrl&&existsSync(envPath)){for(const line of readFileSync(envPath,"utf8").split("\n")){const m=line.match(/^\s*VITE_SITE_URL\s*=\s*(.+)\s*$/);if(m)envUrl=m[1].replace(/^["']|["']$/g,"").trim();}}
const site=(envUrl||"http://localhost:5173").replace(/\/$/,"");if(!envUrl)console.log("VITE_SITE_URL not set, using "+site+". Set it before deploying.");
const routes=["","/how-it-works","/terms","/privacy"];const today=new Date().toISOString().slice(0,10);const out=join(pub,"public");mkdirSync(out,{recursive:true});
writeFileSync(join(out,"robots.txt"),`User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
writeFileSync(join(out,"sitemap.xml"),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r=>`  <url><loc>${site}${r}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
console.log("Wrote robots.txt and sitemap.xml for "+site);
