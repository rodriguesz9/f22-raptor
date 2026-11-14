document.documentElement.classList.remove('no-js')
import Lenis from './media/lenis.mjs'
const reduce=matchMedia('(prefers-reduced-motion: reduce)')
const motion=document.querySelector('.motion-button')
const video=document.querySelector('.film video')
const play=document.querySelector('.film-play')
const player=document.querySelector('.film-player')
let paused=false,lenis=null
function setup(){lenis?.destroy();lenis=null;document.body.classList.toggle('motion-stopped',paused||reduce.matches);if(!paused&&!reduce.matches&&!navigator.connection?.saveData)lenis=new Lenis({autoRaf:true,lerp:.12,syncTouch:false,anchors:true,allowNestedScroll:true,prevent:el=>!!el.closest('dialog')});if(paused||reduce.matches)video.pause();configureFlight()}
reduce.addEventListener('change',setup)
motion.addEventListener('click',()=>{paused=!paused;motion.setAttribute('aria-pressed',String(paused));motion.innerHTML=paused?'Retomar efeitos <span aria-hidden="true">▷</span>':'Pausar efeitos <span aria-hidden="true">Ⅱ</span>';setup()})
play.addEventListener('click',()=>{video.play().catch(()=>{})})
video.addEventListener('play',()=>{player.dataset.playing='true'})
video.addEventListener('pause',()=>{player.dataset.playing='false'})
const filmObserver=new IntersectionObserver(entries=>{for(const item of entries){if(!item.isIntersecting)video.pause()}},{threshold:.1});filmObserver.observe(video)
const navLinks=[...document.querySelectorAll('header nav a')]
const sectionObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){navLinks.forEach(link=>{if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}}},{rootMargin:'-20% 0px -50% 0px'});navLinks.forEach(link=>{const section=document.querySelector(link.hash);if(section)sectionObserver.observe(section)})
const dialog=document.querySelector('dialog'),large=dialog.querySelector('img')
let opener=null
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{opener=button;large.src=button.dataset.image;large.alt=button.querySelector('img').alt;dialog.showModal()}))
dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()})
window.addEventListener('pagehide',()=>{lenis?.destroy();video.pause()},{once:true})

// One demand-driven seek at a time. Scroll stays native; the video never plays itself.
const hero=document.querySelector('.hero'),flight=hero.querySelector('video'),instruction=hero.querySelector('.scroll-instruction'),time=hero.querySelector('.flight-time')
let flightFrame=0,flightEnabled=false,target=0
const clamp=value=>Math.min(1,Math.max(0,value))
function configureFlight(){
 flightEnabled=!paused&&!reduce.matches&&!navigator.connection?.saveData
 hero.dataset.motionReady='false'
 instruction.textContent=flightEnabled?'Role para acompanhar o voo':'Movimento pausado · explore o ensaio abaixo'
 if(flightEnabled&&!flight.hasAttribute('src')){flight.src=flight.dataset.src;flight.preload='auto';flight.load()}
 flight.pause();scheduleFlight()
}
function scheduleFlight(){if(!flightFrame)flightFrame=requestAnimationFrame(drawFlight)}
function drawFlight(){
 flightFrame=0
 if(!flightEnabled)return
 const bounds=hero.getBoundingClientRect(),range=hero.offsetHeight-innerHeight
 const progress=range>0?clamp(-bounds.top/range):0
 hero.style.setProperty('--flight-progress',progress)
 if(!Number.isFinite(flight.duration)||flight.duration<=0)return
 target=progress*Math.max(0,flight.duration-.045)
 time.textContent=`${target.toFixed(2).padStart(5,'0')} / ${flight.duration.toFixed(2)}`
 if(!flight.seeking&&Math.abs(flight.currentTime-target)>.025)flight.currentTime=target
 else if(flight.readyState>=2)hero.dataset.motionReady='true'
}
flight.addEventListener('loadedmetadata',scheduleFlight)
flight.addEventListener('loadeddata',()=>{if(flightEnabled){hero.dataset.motionReady='true';scheduleFlight()}})
flight.addEventListener('seeked',()=>{if(flightEnabled){hero.dataset.motionReady='true';if(Math.abs(flight.currentTime-target)>.05)scheduleFlight()}})
flight.addEventListener('error',()=>{hero.dataset.motionReady='false';instruction.textContent='Explore o ensaio em fotografia'})
addEventListener('scroll',scheduleFlight,{passive:true});addEventListener('resize',scheduleFlight,{passive:true})
setup()
