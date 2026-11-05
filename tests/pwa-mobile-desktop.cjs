const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const {mkdirSync,writeFileSync}=require("node:fs");
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const [label,width,height] of [["aplicativo-mobile",390,844],["navegador-desktop",1440,900]]){
   const context=await browser.newContext({viewport:{width,height},serviceWorkers:"allow"});
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   const r=await page.goto("http://127.0.0.1:8765/index.html",{waitUntil:"load"});
   assert.equal(r.status(),200);
   const manifest=await page.locator('link[rel="manifest"]').getAttribute("href");
   assert.equal(manifest,"manifest.webmanifest");
   const response=await page.request.get("http://127.0.0.1:8765/"+manifest);
   assert.equal(response.status(),200);
   const m=await response.json();
   assert.equal(m.display,"standalone");
   assert.ok(m.start_url&&Array.isArray(m.icons)&&m.icons.length>=2);
   assert.ok(m.icons.some(x=>x.sizes==="192x192"));
   assert.ok(m.icons.some(x=>x.sizes==="512x512"));
   for(const icon of m.icons){
    const image=await page.request.get("http://127.0.0.1:8765/"+icon.src);
    assert.equal(image.status(),200,"ícone "+icon.src);
    assert.match(image.headers()["content-type"]||"",/image\/png/);
   }
   await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,{timeout:20000});
   const registration=await page.evaluate(async()=>await navigator.serviceWorker.getRegistration());
   assert.ok(registration,"registro do service worker");
   const cached=await page.evaluate(async()=>{
    const cachesList=await caches.keys();
    const entries=[];
    for(const name of cachesList){
      const cache=await caches.open(name);
      const req=await cache.match(new URL("./index.html",location.href));
      if(req) entries.push(name);
    }
    return entries;
   });
   assert.ok(cached.length,"a página inicial deve estar no cache do aplicativo");
   await page.locator('[data-entry-screen][data-stage="choices"]').waitFor({timeout:7000});
   await page.locator('[data-profile-entry="visitante"]').click();
   await page.locator("[data-entry-screen]").waitFor({state:"hidden"});
   if(label==="aplicativo-mobile"){
    const toggle=page.locator("[data-menu-toggle]").first();
    if(await toggle.isVisible()){
     await toggle.click();
     assert.equal(await toggle.getAttribute("aria-expanded"),"true");
     await page.keyboard.press("Escape");
     assert.equal(await toggle.getAttribute("aria-expanded"),"false");
    }
   }
   await context.setOffline(true);
   const offline=await page.goto("http://127.0.0.1:8765/index.html",{waitUntil:"domcontentloaded"});
   assert.equal(offline.status(),200,"página inicial acessível offline no PWA");
   assert.deepEqual(errors,[],label+" erros do navegador");
   console.log("PWA e navegação aprovados:",label);
   await context.close();
  }
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
