import {readFile,writeFile} from "node:fs/promises";import {dirname,join} from "node:path";import {fileURLToPath} from "node:url";import sharp from "sharp";import pngToIco from "png-to-ico";
const here=dirname(fileURLToPath(import.meta.url));const pub=join(here,"..","public");const svg=await readFile(join(pub,"favicon.svg"));
for(const [size,name] of [[16,"favicon-16x16.png"],[32,"favicon-32x32.png"],[180,"apple-touch-icon.png"],[192,"android-chrome-192x192.png"],[512,"android-chrome-512x512.png"]]){await sharp(svg,{density:512}).resize(size,size).png().toFile(join(pub,name));console.log("wrote "+name)}
await writeFile(join(pub,"favicon.ico"),await pngToIco([await sharp(svg,{density:512}).resize(32,32).png().toBuffer()]));console.log("wrote favicon.ico");
