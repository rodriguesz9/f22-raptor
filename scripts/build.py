from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
out=root/'dist'
out.mkdir(exist_ok=True)
for name in ['index.html','styles.css','entry.js']:
    shutil.copy2(root/name,out/name)
shutil.copytree(root/'media',out/'media',dirs_exist_ok=True)
print('BUILD OK: F-22 Raptor, assets relativos, sem dependências de rede.')
