// A bounded decoded-frame cache: 16 × 960 × 540 × 4 ≈ 32 MiB, plus four in-flight decodes.
// Only the neighborhood of the scroll target is fetched; no 240-frame bitmap preload.
export function createFlightSequence(canvas, ready, fail) {
  const context = canvas.getContext('2d', { alpha:false });
  if (!context || !window.createImageBitmap) return null;
  const cache = new Map(), pending = new Set(), controller = new AbortController();
  const count = 240, capacity = 16, concurrency = 4;
  let target = 0, current = 0, drawn = -1, stopped = false, active = true, failed = false;
  let started = false, width = 960, height = 540;
  // One compressed bundle (<1 MiB), decoded lazily into a bounded bitmap cache.
  const source = Promise.all([
    fetch(new URL('./media/flight-frames.bin',import.meta.url),{signal:controller.signal}).then(response=>{if(!response.ok)throw Error('Frames unavailable');return response.arrayBuffer()}),
    fetch(new URL('./media/flight-frames.json',import.meta.url),{signal:controller.signal}).then(response=>{if(!response.ok)throw Error('Frame index unavailable');return response.json()}),
  ]);
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(devicePixelRatio || 1, 1.5, 1440/Math.max(1,rect.width));
    width = Math.max(1, Math.round(rect.width * ratio));
    height = Math.max(1, Math.round(rect.height * ratio));
    canvas.width = width; canvas.height = height; drawn = -1;
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
  function trim() {
    while (cache.size > capacity) {
      const farthest = [...cache.keys()].sort((a,b)=>Math.abs(b-current)-Math.abs(a-current))[0];
      cache.get(farthest).close(); cache.delete(farthest);
    }
  }
  function candidates() {
    // Current display comes first, followed by the destination during fast scroll reversals.
    const indices = [Math.floor(current),Math.ceil(current),Math.round(Math.max(current-7,Math.min(current+7,target)))];
    for (let offset=1;offset<=6;offset++) indices.push(Math.round(current)+offset,Math.round(current)-offset);
    return [...new Set(indices)].filter(index=>index>=0 && index<count);
  }
  function pump() {
    if (stopped || !active || failed) return;
    for (const index of candidates()) {
      if (pending.size>=concurrency) break;
      if (cache.has(index) || pending.has(index)) continue;
      pending.add(index);
      source.then(([bytes,offsets])=>{
          const [start,length]=offsets[index];
          return createImageBitmap(new Blob([new Uint8Array(bytes,start,length)],{type:'image/webp'}));
        })
        .then(bitmap=>{
          if(stopped){bitmap.close();return;}
          cache.set(index,bitmap);trim();drawn=-1;
          if(!started){started=true;ready();}
        })
        .catch(error=>{if(error.name!=='AbortError' && !failed){failed=true;fail();}})
        .finally(()=>{pending.delete(index);pump();});
    }
  }
  function paint(bitmap, alpha=1) {
    const scale = Math.max(width/bitmap.width,height/bitmap.height);
    const w = bitmap.width*scale,h = bitmap.height*scale;
    context.globalAlpha=alpha;context.drawImage(bitmap,(width-w)/2,(height-h)/2,w,h);
  }
  function tick(delta) {
    if (stopped || !active || failed) return;
    // Exponential smoothing is time-based, so 60/120 Hz screens follow the same motion.
    const next=current+(target-current)*(1-Math.exp(-Math.min(delta,64)/150));
    const distance=Math.abs(next-current),direction=Math.sign(next-current);
    // Never outrun the decoded neighborhood: retain the last valid frame while loading.
    const step=Math.min(distance,6)*direction;
    const proposed=Math.max(0,Math.min(count-1,current+step));
    const low=Math.floor(proposed),high=Math.ceil(proposed);
    if(cache.has(low) && cache.has(high)) current=proposed;
    else if(distance>3) current=Math.max(0,Math.min(count-1,current+step));
    pump();
    if(Math.abs(current-drawn)<.003)return;
    const before=cache.get(Math.floor(current)),after=cache.get(Math.ceil(current));
    if(!before || !after)return;
    paint(before);if(before!==after)paint(after,current%1);
    context.globalAlpha=1;drawn=current;
    canvas.dataset.frame=current.toFixed(3);
  }
  pump();
  return {
    setProgress(progress){target=Math.max(0,Math.min(1,progress))*(count-1);pump();},
    tick,
    setActive(value){active=value;if(active)pump();},
    destroy(){stopped=true;controller.abort();observer.disconnect();for(const bitmap of cache.values())bitmap.close();cache.clear();},
  };
}
