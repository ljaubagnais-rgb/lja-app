(()=>{
  const vma=document.getElementById('vmaInput');
  const distance=document.getElementById('predictionDistance');
  const percent=document.getElementById('predictionPercent');
  const out=document.getElementById('predictionOut');
  if(!vma||!distance||!percent||!out)return;

  function render(){
    const v=Number(String(vma.value).replace(',','.'));
    const d=Number(distance.value);
    const p=Number(percent.value);
    if(!(v>0&&d>0&&p>0)){out.textContent='Saisissez une VMA valide.';return;}
    const targetSpeed=v*p/100;
    const seconds=Math.round(d/targetSpeed*3600);
    const h=Math.floor(seconds/3600);
    const m=Math.floor((seconds%3600)/60);
    const s=seconds%60;
    const paceSeconds=Math.round(3600/targetSpeed);
    const paceMin=Math.floor(paceSeconds/60);
    const paceSec=paceSeconds%60;
    out.innerHTML=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-top:18px;background:#333;border:1px solid #333;border-radius:10px;overflow:hidden;text-align:center"><div style="background:#171717;padding:10px"><small>Heure</small><strong style="display:block;font-size:20px;margin-top:8px">${h} h</strong></div><div style="background:#171717;padding:10px"><small>Minutes</small><strong style="display:block;font-size:20px;margin-top:8px">${String(m).padStart(2,'0')} '</strong></div><div style="background:#171717;padding:10px"><small>Secondes</small><strong style="display:block;font-size:20px;margin-top:8px">${String(s).padStart(2,'0')} ″</strong></div></div><div style="margin-top:12px;text-align:center;font-size:14px;opacity:.8">Vitesse cible : ${targetSpeed.toFixed(2).replace('.',',')} km/h</div><div style="margin-top:6px;text-align:center;font-size:14px;opacity:.8">Allure cible : ${paceMin}:${String(paceSec).padStart(2,'0')} min/km</div>`;
  }
  [vma,distance,percent].forEach(el=>el.addEventListener('input',render));
  [vma,distance,percent].forEach(el=>el.addEventListener('change',render));
  render();
})();