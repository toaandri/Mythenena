from playwright.sync_api import sync_playwright
from pathlib import Path
import json,time,sys
ROOT=Path('D:/Ecole/Hackaton/Mythenena/presentation/.build')
post={'id':'p1','pseudonym':'Ravinala','content':'Aujourd’hui, j’ai osé demander de l’aide. Un petit pas qui compte pour moi.','createdAt':'2026-09-26T10:00:00Z','repliesCount':1,'reactions':[{'type':'support','count':4,'active':False}]}
def api(route):
 url=route.request.url;method=route.request.method
 if method=='OPTIONS':route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'*'});return
 data={}
 if '/session/' in url:data={'token':'demo','session':{'id':'demo','pseudonym':'Aina','avatarSeed':'demo','language':'fr','retainHistory':False}}
 elif '/chat/message' in url:
  time.sleep(1.2);data={'message':{'id':'m2','role':'assistant','content':'Merci de me le dire. Qu’est-ce qui te pèse le plus en ce moment ? Nous pouvons aussi prendre un moment pour respirer.','timestamp':'2026-09-26T10:00:00Z'}}
 elif '/chat/' in url:data={'messages':[]}
 elif '/professionals' in url:data={'items':[{'id':'pro1','name':'Profil de démonstration','title':'Psychologue','city':'Antananarivo','languages':['Français','Malagasy'],'specialties':['Stress','Confiance en soi'],'bio':'Un espace d’écoute pour avancer à votre rythme. Profil fictif pour cette démonstration.','isFictional':False,'contactEnabled':True}]} if method=='GET' else {'request':{},'notice':'Demande enregistrée'}
 elif '/categories' in url:data={'categories':[{'id':'c1','slug':'confiance','labelFr':'Confiance','labelMg':'Fahatokisana'},{'id':'c2','slug':'moral','labelFr':'Moral','labelMg':'Toe-po'}]}
 elif '/react' in url:post['reactions']=[{'type':'support','count':5,'active':True}];data={'reaction':{}}
 elif '/posts/p1' in url:data={'post':post,'replies':[dict(post,id='r1',pseudonym='Lova',content='Merci de partager ce moment avec nous.') ]}
 elif '/posts' in url:data={'items':[post]}
 route.fulfill(json=data,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'})
with sync_playwright() as p:
 browser=p.chromium.launch()
 probe=browser.new_page();print('MP4 SUPPORT',probe.evaluate("MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42001E')"),flush=True);probe.close()
 for num in ([int(sys.argv[1])] if len(sys.argv)>1 else [1,2,3]):
  context=browser.new_context(viewport={'width':1280,'height':720},record_video_dir=str(ROOT/'raw'),record_video_size={'width':1280,'height':720})
  context.add_init_script("if(!localStorage.getItem('demo-seeded')){localStorage.setItem('mythenena.session-token','demo');localStorage.setItem('mythenena.onboarding.v1.demo','{}');localStorage.setItem('demo-seeded','1');}")
  context.route('**/api/**',api)
  context.route('**/demo-stage',lambda route:route.fulfill(body=(ROOT/'stage.html').read_text('utf-8-sig'),content_type='text/html'))
  page=context.new_page();page.goto('http://localhost:8083/demo-stage',wait_until='networkidle',timeout=120000)
  frame=page.frames[1]
  def pause(n=2):page.wait_for_timeout(n*1000)
  def caption(title,body,step):page.evaluate('(v)=>caption(...v)',[f'DÉMONSTRATION {num:02}',title,body,step])
  def go(path):frame.goto('http://localhost:8083'+path,wait_until='networkidle');pause(2.3)
  def tap(loc):
   loc.scroll_into_view_if_needed();pause(.4);box=loc.bounding_box();page.evaluate('(v)=>tapAt(...v)',[box['x']+box['width']/2,box['y']+box['height']/2]);pause(.35);loc.click();pause(1.2)
  if num==1:
   caption('Un premier pas,<br>à son rythme','Aina découvre Mythenena. Elle peut répondre à cinq questions, ou les passer.','01 / Une entrée facultative')
   frame.evaluate("localStorage.removeItem('mythenena.onboarding.v1.demo')");go('/onboarding');pause(3);print('DEBUG',frame.url,ascii(frame.locator('body').inner_text()[:2500]),flush=True);page.screenshot(path=str(ROOT/'debug.png'))
   tap(frame.get_by_text('Ça dépend des moments',exact=True));tap(frame.get_by_role('button',name='Continuer',exact=True));pause(2)
   tap(frame.get_by_role('button',name='Tout passer',exact=True));pause(3)
   page.screenshot(path=str(ROOT/'home-stage.png'))
   caption('Un espace<br>pour parler','L’assistant IA permet de commencer un échange par écrit. La sphère accompagne la conversation.','02 / Exprimer ce que l’on ressent')
   go('/chat');pause(3);page.screenshot(path=str(ROOT/'ai-stage.png'))
   field=frame.get_by_placeholder('Ecrivez votre message...');tap(field);field.press_sequentially('Je me sens stressée aujourd’hui.',delay=80);pause(1);tap(field.locator('xpath=..').locator('xpath=./div').last);pause(6)
   page.screenshot(path=str(ROOT/'demo1-poster.png'));pause(3)
  elif num==2:
   caption('Quelques minutes<br>pour souffler','Cinq exercices accessibles depuis un même espace. Aina choisit une respiration guidée.','01 / Choisir sa pause')
   go('/ressources');pause(4);page.screenshot(path=str(ROOT/'resources-stage.png'))
   tap(frame.get_by_role('button',name='Essayer la respiration',exact=True));pause(2)
   caption('Une respiration<br>qui donne le rythme','La sphère grandit puis se relâche. La personne garde le contrôle et peut mettre l’exercice en pause.','02 / Suivre une animation douce')
   tap(frame.get_by_role('button',name='Commencer',exact=True));pause(7);page.screenshot(path=str(ROOT/'demo2-poster.png'));pause(4);tap(frame.get_by_role('button',name='Mettre en pause',exact=True));pause(2)
   tap(frame.get_by_role('button',name='Retour aux ressources',exact=True))
   caption('Des exercices<br>qui se complètent','Respiration, ancrage, gratitude, relâchement corporel et observation des pensées.','03 / Trouver ce qui convient')
   tap(frame.get_by_role('button',name='Laisser passer les pensées',exact=True));tap(frame.get_by_role('button',name='Regarder le nuage passer',exact=True));pause(7);page.screenshot(path=str(ROOT/'thoughts-stage.png'));pause(3)
  else:
   caption('Partager sans<br>rester seul','Le forum organise les échanges par thème, sous pseudonyme. Aina apporte son soutien à une publication.','01 / Le lien avec la communauté')
   go('/forum');pause(3);tap(frame.get_by_role('button',name='♡ Soutenir · 4',exact=True));pause(3);tap(frame.get_by_role('button',name='Réponses · 1',exact=True));pause(4)
   caption('Trouver un<br>accompagnant','Les profils présentent les langues et les spécialités. Une première demande de contact peut être enregistrée.','02 / Préparer un échange humain')
   go('/psy');pause(3);tap(frame.get_by_role('button',name='Découvrir le profil →',exact=True));pause(3);tap(frame.get_by_role('button',name='Écrire un premier message',exact=True));field=frame.get_by_role('textbox',name='Écrivez votre message…');tap(field);field.press_sequentially('Bonjour, je souhaite être accompagnée.',delay=65);pause(3)
   caption('Le relais humain,<br>au cœur de l’offre','Le prototype propose la demande de contact. Les appels directs avec crédits font partie de la prochaine étape.','03 / Les appels restent à développer')
   page.screenshot(path=str(ROOT/'demo3-poster.png'));pause(5)
  video=page.video;context.close();video.save_as(str(ROOT/f'demo{num}.webm'));print('RECORDED',num,flush=True)
 browser.close()






