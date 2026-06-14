// CURSOR
const cursor=document.getElementById('cursor'),trail=document.getElementById('cursor-trail');
let mx=0,my=0,tx=0,ty=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursor.style.left=mx+'px';cursor.style.top=my+'px';});
(function animTrail(){tx+=(mx-tx)*.14;ty+=(my-ty)*.14;trail.style.left=tx+'px';trail.style.top=ty+'px';requestAnimationFrame(animTrail);})();
document.querySelectorAll('a,button,.pill,.skill-cat,.project-card,.blog-card,.stat-card').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cursor.classList.add('cursor-hover');trail.classList.add('trail-hover');});
  el.addEventListener('mouseleave',()=>{cursor.classList.remove('cursor-hover');trail.classList.remove('trail-hover');});
});

// TYPED
const phrases=['beautiful UIs.','fast APIs.','full web apps.','things that matter.'];
let pi=0,ci=0,del=false;
const typedEl=document.getElementById('typed-text');
function typeLoop(){
  const phrase=phrases[pi];
  if(!del){typedEl.textContent=phrase.slice(0,++ci);if(ci===phrase.length){del=true;setTimeout(typeLoop,1600);return;}}
  else{typedEl.textContent=phrase.slice(0,--ci);if(ci===0){del=false;pi=(pi+1)%phrases.length;}}
  setTimeout(typeLoop,del?58:88);
}
typeLoop();

// COUNTERS
function animateCounters(){
  document.querySelectorAll('[data-count]').forEach(el=>{
    const target=+el.dataset.count; let cur=0;
    const t=setInterval(()=>{cur+=target/40;if(cur>=target){cur=target;clearInterval(t);}el.textContent=Math.floor(cur)+(target>=10?'+':'');},38);
  });
}

// REVEAL
const revealObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      if(e.target.querySelector('[data-count]')) animateCounters();
      revealObs.unobserve(e.target);
    }
  });
},{threshold:.1});
document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(r=>revealObs.observe(r));

// NAV SCROLL
window.addEventListener('scroll',()=>{
  const nav=document.getElementById('navbar');
  nav.style.background=window.scrollY>50?'rgba(248,247,242,0.97)':'rgba(248,247,242,0.82)';
  nav.style.boxShadow=window.scrollY>50?'0 2px 20px rgba(29,158,117,0.1)':'none';
});

// MOBILE MENU
function toggleMenu(){document.getElementById('navLinks').classList.toggle('open');}
document.getElementById('navLinks').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>document.getElementById('navLinks').classList.remove('open')));

// CONTACT FORM
function sendMessage(){
  const name=document.getElementById('f-name').value.trim();
  const email=document.getElementById('f-email').value.trim();
  const msg=document.getElementById('f-message').value.trim();
  const out=document.getElementById('form-msg');
  if(!name||!email||!msg){out.style.color='var(--coral)';out.textContent='Please fill in name, email and message.';return;}
  out.style.color='var(--teal)';
  out.textContent='✦ Message sent! I\'ll get back to you soon.';
  ['f-name','f-email','f-subject','f-message'].forEach(id=>document.getElementById(id).value='');
  setTimeout(()=>out.textContent='',5000);
}
