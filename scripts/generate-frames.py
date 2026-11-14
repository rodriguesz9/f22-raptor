"""Regenerate the compressed scroll bundle from the credited local video (requires ffmpeg)."""
from pathlib import Path
import json, subprocess, tempfile
root = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory(prefix='f22-frames-') as folder:
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(root/'media/hero-flight.mp4'),'-vf','scale=960:-2','-c:v','libwebp','-quality','72','-compression_level','4','-start_number','0',folder+'/%03d.webp'], check=True)
    frames = sorted(Path(folder).glob('*.webp'))
    if len(frames) != 240:
        raise RuntimeError(f'Expected 240 frames, found {len(frames)}')
    bundle = bytearray()
    offsets = []
    for frame in frames:
        data = frame.read_bytes()
        offsets.append([len(bundle),len(data)])
        bundle.extend(data)
    (root/'media/flight-frames.bin').write_bytes(bundle)
    (root/'media/flight-frames.json').write_text(json.dumps(offsets,separators=(',',':'))+'\n')
    print(f'{len(frames)} frames, {len(bundle)} bytes; decoded cache is bounded at runtime.')
