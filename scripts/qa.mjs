import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const project = fileURLToPath(new URL('../', import.meta.url));
const root = path.join(project, 'dist');
const docs = path.join(project, 'docs');
await fs.mkdir(docs, { recursive: true });
const types = { '.html':'text/html', '.mjs':'text/javascript', '.js':'text/javascript', '.css':'text/css', '.webp':'image/webp', '.mp4':'video/mp4', '.ttf':'font/ttf' };
// Video seeks require valid Content-Length/Range responses, as on the production host.
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    if (pathname.endsWith('/')) file = path.join(file, 'index.html');
    const data = await fs.readFile(file);
    const headers = { 'Content-Type':types[path.extname(file)] || 'application/octet-stream', 'Accept-Ranges':'bytes' };
    if (req.headers.range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
      const start = match ? Number(match[1]) : NaN;
      const end = match?.[2] ? Math.min(Number(match[2]), data.length - 1) : data.length - 1;
      if (!Number.isInteger(start) || start < 0 || start > end || start >= data.length) {
        res.writeHead(416, { 'Content-Range':`bytes */${data.length}` }); res.end(); return;
      }
      res.writeHead(206, { ...headers, 'Content-Length':end-start+1, 'Content-Range':`bytes ${start}-${end}/${data.length}` });
      res.end(data.subarray(start, end + 1));
    } else { res.writeHead(200, { ...headers, 'Content-Length':data.length }); res.end(data); }
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ headless:true, args:['--no-sandbox'] });
const result = [];
try {
  for (const width of [320,390,768,1440]) {
    const page = await browser.newPage({ viewport:{width,height:800}, reducedMotion:'reduce' });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    for (const image of await page.locator('main img').all()) if (await image.isVisible()) await image.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const data = await page.evaluate(() => ({
      overflow:document.documentElement.scrollWidth > innerWidth + 1,
      broken:[...document.querySelectorAll('main img')].filter(image=>!image.complete || !image.naturalWidth).map(image=>image.getAttribute('src')),
      h1:document.querySelectorAll('h1').length,
      heroVideoLoaded:document.querySelector('.hero-video').hasAttribute('src'),
      lenis:document.documentElement.classList.contains('lenis'),
    }));
    await page.locator('.photo-button').first().click();
    if (!await page.locator('dialog').evaluate(dialog=>dialog.open)) throw Error('Gallery dialog did not open');
    await page.keyboard.press('Escape');
    await page.locator('summary').click();
    if (!await page.locator('details').evaluate(details=>details.open)) throw Error('Credits did not open');
    result.push({ width, reducedMotion:true, ...data, errors }); await page.close();
  }
  if (result.some(row=>row.overflow || row.broken.length || row.errors.length || row.heroVideoLoaded || row.lenis || row.h1!==1)) throw Error('Responsive/reduced-motion checks failed');

  const normal = await browser.newPage({ viewport:{width:1280,height:800}, reducedMotion:'no-preference' });
  await normal.goto(url);
  await normal.waitForFunction(()=>document.querySelector('.hero').dataset.renderer==='frames' && document.querySelector('.flight-canvas').dataset.frame);
  const lenisActive = await normal.evaluate(()=>document.documentElement.classList.contains('lenis'));
  if (!lenisActive) throw Error('Lenis was not active');
  const seeks = [];
  for (const progress of [0,.5,.99,.2]) {
    await normal.evaluate(progress=>{
      const hero=document.querySelector('.hero');
      scrollTo({ top:hero.offsetTop+progress*(hero.offsetHeight-innerHeight), behavior:'instant' });
    }, progress);
    await normal.waitForTimeout(1500);
    seeks.push(await normal.locator('.hero-video').evaluate(video=>({time:Number(document.querySelector('.flight-canvas').dataset.frame)/24,paused:video.paused})));
  }
  if (!(seeks[1].time>4 && seeks[2].time>9 && seeks[3].time<3 && seeks.every(row=>row.paused))) throw Error('Bidirectional scroll seek failed: '+JSON.stringify(seeks));
  await normal.evaluate(()=>scrollTo({top:0,behavior:'instant'})); await normal.waitForTimeout(1600);
  await normal.screenshot({path:path.join(docs,'inicio.jpg'),type:'jpeg',quality:88});
  await normal.locator('#ensaio').scrollIntoViewIfNeeded(); await normal.waitForTimeout(1600);
  await normal.screenshot({path:path.join(docs,'detalhe.jpg'),type:'jpeg',quality:88});
  const visual = await normal.evaluate(()=>({videos:document.querySelectorAll('video').length,font:getComputedStyle(document.querySelector('h1')).fontFamily,triggers:window.ScrollTrigger.getAll().length}));
  if(visual.videos!==1 || !visual.font.includes('Chakra') || visual.triggers<1) throw Error('Font/GSAP/video check failed '+JSON.stringify(visual));
  await normal.locator('.motion-button').click();
  if(await normal.evaluate(()=>document.documentElement.classList.contains('lenis'))) throw Error('Pause did not destroy Lenis');
  await normal.locator('.motion-button').click();
  await normal.waitForTimeout(200);
  const motionQA={lenisActive,seeks,...visual,pauseDestroysLenis:true,renderer:"bounded canvas sequence",reducedMotionOptIn:true,videoFallback:true};
  await normal.setViewportSize({width:390,height:800});
  await normal.locator('.menu-toggle').click();
  if(await normal.locator('.menu-toggle').getAttribute('aria-expanded')!=='true')throw Error('Mobile menu did not open');
  await normal.screenshot({path:path.join(docs,'navbar-mobile.jpg'),type:'jpeg',quality:88});
  await normal.keyboard.press('Escape');
  if(await normal.locator('.menu-toggle').getAttribute('aria-expanded')!=='false')throw Error('Escape did not close menu');
  if(!await normal.locator('.menu-toggle').evaluate(el=>el===document.activeElement))throw Error('Focus not restored');
  await normal.close();
  const reduced=await browser.newPage({viewport:{width:390,height:800},reducedMotion:'reduce'});
  await reduced.goto(url);
  if(await reduced.locator('.flight-canvas').getAttribute('data-frame'))throw Error('Reduced motion loaded frames before opt-in');
  await reduced.locator('.motion-button').click();
  await reduced.waitForFunction(()=>document.querySelector('.flight-canvas').dataset.frame);
  if(await reduced.locator('.flight-canvas').evaluate(el=>getComputedStyle(el).display)==='none')throw Error('Opt-in canvas hidden');
  await reduced.evaluate(()=>scrollTo({top:400,behavior:'instant'}));await reduced.waitForTimeout(1000);
  await reduced.locator('.motion-button').click();
  const pausedFrame=await reduced.locator('.flight-canvas').getAttribute('data-frame');
  await reduced.waitForTimeout(300);
  if(await reduced.locator('.flight-canvas').getAttribute('data-frame')!==pausedFrame)throw Error('Pause did not freeze the renderer');
  await reduced.close();
  const fallbackPage=await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'no-preference'});
  await fallbackPage.route('**/flight-frames.bin',route=>route.fulfill({status:503,body:'unavailable'}));
  await fallbackPage.goto(url);
  await fallbackPage.waitForFunction(()=>document.querySelector('video').readyState>=2);
  await fallbackPage.evaluate(()=>scrollTo({top:document.querySelector('.hero').offsetHeight/2-innerHeight/2,behavior:'instant'}));
  await fallbackPage.waitForTimeout(600);
  if(await fallbackPage.locator('video').evaluate(video=>video.currentTime)<4)throw Error('Video fallback failed');
  await fallbackPage.close();
  const nojs=await browser.newPage({viewport:{width:390,height:800},javaScriptEnabled:false});
  await nojs.goto(url);
  const fallback=await nojs.locator('.hero').evaluate(hero=>({height:hero.offsetHeight,stage:hero.querySelector('.hero-stage').offsetHeight,source:hero.querySelector('video').hasAttribute('src')}));
  if(fallback.height!==fallback.stage || fallback.source) throw Error('No-JS poster fallback failed');
  await nojs.close();
  await fs.writeFile(path.join(docs,'qa.json'),JSON.stringify(result,null,2)+'\n');
  await fs.writeFile(path.join(docs,'motion-qa.json'),JSON.stringify(motionQA,null,2)+'\n');
  await fs.writeFile(path.join(docs,'scroll-hero-qa.json'),JSON.stringify([...result,{regularMotion:true,...motionQA},{noJS:true,posterFallback:true,...fallback}],null,2)+'\n');
  console.log(JSON.stringify({responsiveCases:result.length,failures:0,...motionQA,noJSFallback:true},null,2));
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
