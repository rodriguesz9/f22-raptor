from pathlib import Path
import shutil,hashlib,re
root=Path(__file__).resolve().parents[1]
out=root/'dist'
if out.exists():shutil.rmtree(out)
out.mkdir()
for name in ['styles.css','entry.js']:shutil.copy2(root/name,out/name)
shutil.copytree(root/'media',out/'media')
html=(root/'index.html').read_text()
for name in ['styles.css','entry.js','media/gsap.min.js','media/ScrollTrigger.min.js']:
    digest=hashlib.sha256((root/name).read_bytes()).hexdigest()[:12]
    html=html.replace('"'+name+'"','"'+name+'?v='+digest+'"')
(out/'index.html').write_text(html)
print('BUILD OK: F22, one video, versioned CSS/JS')
