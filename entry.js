import Lenis from './media/lenis.mjs'
const reduce=matchMedia('(prefers-reduced-motion: reduce)')
const motion=document.querySelector('.motion-button')
const video=document.querySelector('video')
const play=document.querySelector('.film-play')
const player=document.querySelector('.film-player')
let paused=false,lenis=null
function setup(){lenis?.destroy();lenis=null;document.body.classList.toggle('motion-stopped',paused||reduce.matches);if(!paused&&!reduce.matches&&!navigator.connection?.saveData)lenis=new Lenis({autoRaf:true,lerp:.12,syncTouch:false,anchors:true,allowNestedScroll:true,prevent:el=>!!el.closest('dialog')});if(paused||reduce.matches)video.pause()}
setup();reduce.addEventListener('change',setup)
motion.addEventListener('click',()=>{paused=!paused;motion.setAttribute('aria-pressed',String(paused));motion.innerHTML=paused?'Retomar efeitos <span aria-hidden="true">▷</span>':'Pausar efeitos <span aria-hidden="true">Ⅱ</span>';setup()})
function loadVideo(){const source=video.querySelector('source');if(!source.src){source.src=source.dataset.src;video.load()}}
play.addEventListener('click',()=>{loadVideo();video.play().catch(()=>{})})
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
