import json,zipfile,re
from pathlib import Path
from lxml import etree
root=Path('D:/Ecole/Hackaton/Mythenena/presentation')
p=root/'livraison/Mythenena_Soutenance.pptx'
with zipfile.ZipFile(p) as z:
 slides=[n for n in z.namelist() if re.match(r'ppt/slides/slide\d+\.xml$',n)]
 media=[n for n in z.namelist() if n.endswith('.mp4')]
 assert len(slides)==10,(len(slides),slides)
 assert len(media)==3,media
 for n in media:
  d=z.read(n);assert b'ftyp' in d[:20] and b'avc1' in d,(n,'not H264 MP4')
 for i in [4,5,6]:
  rel=z.read(f'ppt/slides/_rels/slide{i}.xml.rels').decode()
  assert '.mp4' in rel
  assert not re.search(r'<Relationship[^>]+TargetMode="External"[^>]+(?:video|media)',rel)
  xml=z.read(f'ppt/slides/slide{i}.xml').decode();assert 'timing' in xml
 print('Package: 10 slides, 3 embedded H264 MP4 videos, playback timing present.')
 notes=json.loads((root/'.build/notes.json').read_text('utf8'))
 print('Speaking notes:',len(notes),'slides, words before Q&A:',sum(len(n['script'].split()) for n in notes[:9]))

