(()=>{
  const input=document.getElementById('vmaTableInput');
  const btn=document.getElementById('vmaTableBtn');
  const out=document.getElementById('vmaTableOut');

  if(!input||!btn||!out)return;

  const distances=[
    [0.05,'50 m'],
    [0.1,'100 m'],
    [0.15,'150 m'],
    [0.2,'200 m'],
    [0.3,'300 m'],
    [0.4,'400 m'],
    [0.5,'500 m'],
    [0.6,'600 m'],
    [0.8,'800 m'],
    [1,'1 km'],
    [1.2,'1200 m'],
    [1.4,'1400 m'],
    [1.5,'1500 m'],
    [1.6,'1600 m'],
    [2,'2000 m'],
    [2.5,'2500 m'],
    [3,'3000 m'],
    [4,'4000 m'],
    [5,'5 km'],
    [6,'6 km'],
    [7,'7 km'],
    [8,'8 km'],
    [9,'9 km'],
    [10,'10 km'],
    [12,'12 km'],
    [15,'15 km'],
    [20,'20 km'],
    [21.0975,'Semi'],
    [42.195,'Marathon'],
    [50,'50 km']
  ];

  const percents=[60,70,75,80,85,90,95,100,105,120];

  function formatTime(seconds){
    seconds=Math.round(seconds);
    const h=Math.floor(seconds/3600);
    const m=Math.floor((seconds%3600)/60);
    const s=seconds%60;

    if(h>0){
      return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  function render(){
    const vma=Number(String(input.value).replace(',','.'));

    if(!(vma>0)){
      out.innerHTML='<p>Saisissez une VMA valide.</p>';
      return;
    }

    let html=`
      <div style="overflow-x:auto;margin-top:18px">
      <table style="border-collapse:collapse;width:100%;min-width:760px;text-align:center;font-size:13px">
      <thead>
        <tr>
          <th style="padding:9px;border:1px solid #555;background:#e53935;color:white">Distance</th>
    `;

    percents.forEach(p=>{
      html+=`<th style="padding:9px;border:1px solid #555;background:#e53935;color:white">${p}%</th>`;
    });

    html+='</tr></thead><tbody>';

    distances.forEach(([d,label])=>{
      html+=`<tr><th style="padding:8px;border:1px solid #555;background:#222;color:white">${label}</th>`;

      percents.forEach(p=>{
        const speed=vma*p/100;
        const seconds=d/speed*3600;
        html+=`<td style="padding:8px;border:1px solid #444;background:#111;color:white">${formatTime(seconds)}</td>`;
      });

      html+='</tr>';
    });

    html+='</tbody></table></div>';
    out.innerHTML=html;
  }

  btn.addEventListener('click',render);
})();
