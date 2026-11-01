/* Remove somente o fundo quase branco conectado às bordas das marcas originais.
   Mantém os pixels internos e as proporções, sem redesenho da identidade. */
(()=>{
 const selectors=['.header-refined .brand-exact img','.header-refined .brand-exact-iff img','.footer .logo-footer-official'];
 const process=(img)=>{
   if(!img || img.dataset.transparencyProcessed)return;
   img.dataset.transparencyProcessed='1';
   const source=new Image();
   source.decoding='async';
   source.onload=()=>{
     try{
       const w=source.naturalWidth,h=source.naturalHeight;
       if(!w||!h||w*h>6000000)return;
       const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
       const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return;
       ctx.drawImage(source,0,0);
       const frame=ctx.getImageData(0,0,w,h),a=frame.data;
       const queue=new Int32Array(w*h);const visited=new Uint8Array(w*h);
       let head=0,tail=0;
       const white=(n)=>{const k=n*4;return a[k]>241&&a[k+1]>241&&a[k+2]>241&&Math.max(a[k],a[k+1],a[k+2])-Math.min(a[k],a[k+1],a[k+2])<11};
       const push=(n)=>{if(!visited[n]&&white(n)){visited[n]=1;queue[tail++]=n}};
       for(let x=0;x<w;x++){push(x);push((h-1)*w+x)}
       for(let y=0;y<h;y++){push(y*w);push(y*w+w-1)}
       while(head<tail){
         const n=queue[head++],k=n*4;a[k+3]=0;
         const x=n%w,y=(n-x)/w;
         if(x>0)push(n-1);if(x<w-1)push(n+1);
         if(y>0)push(n-w);if(y<h-1)push(n+w);
       }
       ctx.putImageData(frame,0,0);
       img.src=canvas.toDataURL('image/png');
       img.classList.add('brand-transparent-ready');
     }catch(err){/* mantém imagem original se o navegador não permitir processamento */}
   };
   source.src=img.currentSrc||img.src;
 };
 const run=()=>document.querySelectorAll(selectors.join(',')).forEach(process);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();