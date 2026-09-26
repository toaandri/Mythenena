from playwright.sync_api import sync_playwright
from pathlib import Path
import base64,json
root=Path('D:/Ecole/Hackaton/Mythenena/presentation/.build');out=root.parent/'livraison'
with sync_playwright() as p:
 b=p.chromium.launch();page=b.new_page(viewport={'width':1280,'height':720})
 page.route('http://demo.local/**',lambda r:r.fulfill(body=(root/r.request.url.rsplit('/',1)[-1]).read_bytes(),content_type='video/webm') if r.request.url.endswith('.webm') else r.fulfill(body='<html><body></body></html>',content_type='text/html'))
 page.on('console',lambda m: print(m.text,flush=True));page.goto('http://demo.local/')
 for i in range(1,4):
  result=page.evaluate('''async (i)=>{const v=document.createElement('video');v.muted=true;v.src='http://demo.local/demo'+i+'.webm';document.body.replaceChildren(v);await new Promise((ok,no)=>{v.onloadedmetadata=ok;v.onerror=no});console.log('loaded',i,v.duration);const c=document.createElement('canvas');c.width=1280;c.height=720;const ctx=c.getContext('2d');const chunks=[];const rec=new MediaRecorder(c.captureStream(25),{mimeType:'video/mp4;codecs=avc1.42001f',videoBitsPerSecond:4500000});rec.ondataavailable=e=>chunks.push(e.data);const done=new Promise(ok=>rec.onstop=ok);let running=true;function draw(){ctx.drawImage(v,0,0,1280,720);if(running)requestAnimationFrame(draw)}draw();rec.onerror=e=>console.log('RECERROR',e.error.message);rec.start();console.log('recording',i);await v.play();console.log('playing',i);await new Promise(ok=>v.onended=ok);running=false;rec.stop();await done;const blob=new Blob(chunks,{type:'video/mp4'});const encoded=await new Promise(ok=>{let r=new FileReader();r.onload=()=>ok(r.result.split(',')[1]);r.readAsDataURL(blob)});return {encoded,duration:v.currentTime,size:blob.size}}''',i)
  (out/f'Demo_{i}.mp4').write_bytes(base64.b64decode(result.pop('encoded')));print('CONVERTED',i,json.dumps(result),flush=True)
 b.close()


