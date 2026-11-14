from pathlib import Path
import shutil,hashlib,re
root=Path(__file__).resolve().parents[1]
out=root/'dist'
if out.exists():shutil.rmtree(out)
out.mkdir()
for name in ['styles.css','entry.js','flight-sequence.js']:shutil.copy2(root/name,out/name)
shutil.copytree(root/'media',out/'media',ignore=shutil.ignore_patterns('flight-frames'))
module=(out/'flight-sequence.js').read_bytes()
digest=hashlib.sha256(module).hexdigest()[:12]
entry=(out/'entry.js').read_text().replace("'./flight-sequence.js'","'./flight-sequence.js?v="+digest+"'")
(out/'entry.js').write_text(entry)
html=(root/'index.html').read_text()
for name in ['styles.css','entry.js','media/gsap.min.js','media/ScrollTrigger.min.js']:
    digest=hashlib.sha256((out/name).read_bytes()).hexdigest()[:12]
    html=html.replace('"'+name+'"','"'+name+'?v='+digest+'"')
(out/'index.html').write_text(html)
print('BUILD OK: F22, one video, versioned CSS/JS')
