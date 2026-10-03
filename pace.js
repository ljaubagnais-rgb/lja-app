(()=>{
  const original=document.getElementById('paceInput');
  const btn=document.getElementById('paceBtn');
  const out=document.getElementById('paceOut');
  if(!original||!btn||!out)return;

  const wrap=document.createElement('div');
  wrap.style.cssText='display:flex;align-items:center;gap:10px;width:100%;margin-top:8px';

  function part(value,placeholder){
    const i=document.createElement('input');
    i.type='text';
    i.inputMode='numeric';
    i.pattern='[0-9]*';
    i.maxLength=2;
    i.value=value;
    i.placeholder=placeholder;
    i.autocomplete='off';
    i.style.cssText='width:90px;text-align:center;font-size:22px;font-weight:700;padding:12px 8px';
    return i;
  }

  const min=part('05','min');
  const sec=part('00','sec');
  const colon=document.createElement('span');
  colon.textContent=':';
  colon.style.cssText='font-size:30px;font-weight:900';
  wrap.append(min,colon,sec);
  original.style.display='none';
  original.parentNode.insertBefore(wrap,original);

  function calculate(){
    let m=parseInt(min.value||'0',10);
    let s=parseInt(sec.value||'0',10);
    if(!Number.isFinite(m)||!Number.isFinite(s)||m<0||s<0){out.textContent='Saisir une allure valide';return;}
    if(s>59)s=59;
    sec.value=String(s).padStart(2,'0');
    const total=m*60+s;
    original.value=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    out.textContent=total>0?`${(3600/total).toFixed(2).replace('.',',')} km/h`:'Saisir une allure valide';
  }

  function clean(i,max,next){
    i.value=i.value.replace(/\D/g,'').slice(0,2);
    if(i.value.length===2){
      if(Number(i.value)>max)i.value=String(max).padStart(2,'0');
      if(next)next.focus();
    }
    calculate();
  }

  min.addEventListener('input',()=>clean(min,99,sec));
  sec.addEventListener('input',()=>clean(sec,59,null));
  sec.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!sec.value)min.focus()});
  btn.onclick=calculate;
  calculate();
})();