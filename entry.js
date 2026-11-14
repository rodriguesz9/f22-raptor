import Lenis from './media/lenis.mjs'
document.documentElement.classList.remove('no-js')
const gsap=window.gsap, ScrollTrigger=window.ScrollTrigger
if(gsap&&ScrollTrigger)gsap.registerPlugin(ScrollTrigger)
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),connection=navigator.connection
const motion=document.querySelector('.motion-button'),hero=document.querySelector('.hero'),flight=hero.querySelector('video')
const instruction=hero.querySelector('.scroll-instruction'),time=hero.querySelector('.flight-time')
let enabled=false,override=null,lenis=null,ticker=null,trigger=null,intro=null,frame=0,target=0,progress=0,entered=false
const clamp=value=>Math.min(1,Math.max(0,value))
function scheduleSeek(){if(!frame)frame=requestAnimationFrame(seekFrame)}
function seekFrame(){frame=0;if(!enabled||flight.seeking||flight.readyState<2)return;if(Math.abs(flight.currentTime-target)>.025)flight.currentTime=target;else hero.dataset.motionReady='true'}
function updateFlight(value){
 progress=clamp(value);hero.style.setProperty('--flight-progress',progress)
 if(!enabled||!Number.isFinite(flight.duration))return
 target=progress*Math.max(0,flight.duration-.045)
 time.textContent=`${target.toFixed(2).padStart(5,'0')} / ${flight.duration.toFixed(2)}`
 scheduleSeek()
}
function setup(){
 trigger?.kill();trigger=null;intro?.kill();intro=null
 if(ticker)gsap?.ticker.remove(ticker);ticker=null;lenis?.destroy();lenis=null
 cancelAnimationFrame(frame);frame=0
 enabled=(override??!reduce.matches)&&!connection?.saveData&&!!gsap&&!!ScrollTrigger
 document.body.classList.toggle('motion-stopped',!enabled)
 motion.setAttribute('aria-pressed',String(!enabled))
 motion.innerHTML=enabled?'Pausar animação <span aria-hidden="true">Ⅱ</span>':'Ativar animação <span aria-hidden="true">▷</span>'
 instruction.textContent=enabled?'Role para avançar o voo. Volte para rever.':'Animação pausada · use “Ativar animação” para explorar'
 hero.dataset.motionReady=String(enabled&&flight.readyState>=2)
 flight.pause()
 if(!enabled)return
 lenis=new Lenis({autoRaf:false,lerp:.12,syncTouch:false,anchors:true,allowNestedScroll:true,prevent:el=>!!el.closest('dialog')})
 lenis.on('scroll',ScrollTrigger.update)
 ticker=seconds=>lenis?.raf(seconds*1000);gsap.ticker.add(ticker)
 if(!flight.hasAttribute('src')){flight.src=flight.dataset.src;flight.preload='auto';flight.load()}
 trigger=ScrollTrigger.create({trigger:hero,start:'top top',end:()=>`+=${Math.max(1,hero.offsetHeight-innerHeight)}`,onUpdate:self=>updateFlight(self.progress),onRefresh:self=>updateFlight(self.progress)})
 if(!entered){entered=true;intro=gsap.timeline({defaults:{ease:'power3.out'}}).from('.hero-lockup > *',{y:24,opacity:0,duration:.65,stagger:.1}).from('.flight-meta',{opacity:0,duration:.4},0)}
 ScrollTrigger.refresh();updateFlight(trigger.progress)
}
reduce.addEventListener('change',()=>{override=null;setup()});connection?.addEventListener('change',setup)
motion.addEventListener('click',()=>{override=!enabled;setup()})
flight.addEventListener('loadedmetadata',()=>{ScrollTrigger?.refresh();updateFlight(trigger?.progress??progress)})
flight.addEventListener('loadeddata',()=>{hero.dataset.motionReady=String(enabled);updateFlight(trigger?.progress??progress)})
flight.addEventListener('seeked',()=>{if(enabled){hero.dataset.motionReady='true';if(Math.abs(flight.currentTime-target)>.05)scheduleSeek()}})
flight.addEventListener('error',()=>{hero.dataset.motionReady='false';instruction.textContent='Vídeo indisponível · explore o ensaio em fotografia'})
const navLinks=[...document.querySelectorAll('header nav a')]
const sections=new IntersectionObserver(entries=>{for(const item of entries)if(item.isIntersecting)navLinks.forEach(link=>{if(link.hash==='#'+item.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})},{rootMargin:'-20% 0px -50% 0px'})
navLinks.forEach(link=>{const section=document.querySelector(link.hash);if(section)sections.observe(section)})
const dialog=document.querySelector('dialog'),large=dialog.querySelector('img');let opener=null
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{opener=button;large.src=button.dataset.image;large.alt=button.querySelector('img').alt;dialog.showModal()}))
dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()})
window.addEventListener('pagehide',()=>{trigger?.kill();intro?.kill();if(ticker)gsap?.ticker.remove(ticker);lenis?.destroy();cancelAnimationFrame(frame);flight.pause()},{once:true})
navigator.serviceWorker?.getRegistration('/').then(registration=>registration?.update()).catch(()=>{})
setup()
