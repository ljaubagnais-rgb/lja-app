(()=>{
  const input=document.getElementById('vmaTableInput');
  const btn=document.getElementById('vmaTableBtn');
  const out=document.getElementById('vmaTableOut');

  if(!input||!btn||!out)return;

  const distances=[
    [50,'50'],[100,'100'],[150,'150'],[200,'200'],
    [300,'300'],[400,'400'],[500,'500'],[600,'600'],
    [800,'800'],[1000,'1000'],[1200,'1200'],[1400,'1400'],
    [1500,'1500'],[1600,'1600'],[2000,'2000'],[2500,'2500'],
    [3000,'3000'],[4000,'4000'],[5000,'5000'],[6000,'6000'],
    [7000,'7000'],[8000,'8000'],[9000,'9000'],[10000,'10000'],
    [12000,'12000'],[15000,'15000'],[20000,'20000'],
    [21100,'21100'],[42195,'42195'],[50000,'50000']
  ];

  const percents=[60,70,75,80,85,90,95,100,105,120];

  function timeSeconds(distanceMetres,vma,percent){
    return distanceMetres/(vma*1000*percent/100)*3600;
  }

  function formatTime(seconds){
    seconds=Math.round(seconds);
    const h=Math.floor(seconds/3600);
    const m=Math.floor((seconds%3600)/60);
    const s=seconds%60;
    return h>0
      ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      : `${m}:${String(s).padStart(2,'0')}`;
  }

  function formatPace(seconds){
    seconds=Math.round(seconds);
    const m=Math.floor(seconds/60);
    const s=seconds%60;
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  function cellColor(p){
    if(p<=75)return '#a9a9a9';
    if(p<=85)return '#e5b4b4';
    if(p<=95)return '#8bd447';
    return '#8fc8d8';
  }

  function render(){
    const vma=Number(String(input.value).replace(',','.'));

    if(!(vma>0)){
      out.innerHTML='<p>Saisissez une VMA valide.</p>';
      return;
    }

    let html=`
   <div style="margin-top:20px">
  <div style="background:#e53935;color:white;padding:14px;border-radius:12px 12px 0 0;text-align:center">
    <img src="LOGO Joggeurs Aubagnais rouge et blanc-2.png" alt="Les Joggeurs Aubagnais" style="width:320px;max-width:85%;height:auto;object-fit:contain;margin-bottom:10px">
    <div style="font-size:20px;font-weight:900;margin-top:4px">TABLEAU DES ALLURES SELON VMA</div>
    <div style="font-size:24px;font-weight:900;margin-top:7px">VMA : ${String(vma).replace('.',',')} km/h</div>
  </div>

        <div style="overflow-x:auto">
          <table style="border-collapse:collapse;width:100%;min-width:780px;text-align:center;font-size:12px">
            <thead>
              <tr>
                <th rowspan="2" style="border:1px solid #333;padding:8px;background:#111;color:white">DISTANCE<br>mètres</th>
                <th colspan="3" style="border:1px solid #333;padding:7px;background:#a9a9a9;color:#111">ENDURANCE</th>
                <th colspan="2" style="border:1px solid #333;padding:7px;background:#e5b4b4;color:#111">RÉSISTANCE</th>
                <th colspan="2" style="border:1px solid #333;padding:7px;background:#8bd447;color:#111">RÉSISTANCE</th>
                <th colspan="3" style="border:1px solid #333;padding:7px;background:#8fc8d8;color:#111">VMA</th>
              </tr>
              <tr>
    `;

    percents.forEach(p=>{
      html+=`<th style="border:1px solid #333;padding:7px;background:${cellColor(p)};color:#111">${p}%</th>`;
    });

    html+=`</tr></thead><tbody>`;

    distances.forEach(([d,label])=>{
      html+=`<tr>
        <th style="border:1px solid #333;padding:7px;background:#f5f5f5;color:#111">${label}</th>`;

      percents.forEach(p=>{
        /*
          Comme dans le fichier Excel, les colonnes VMA très élevées
          ne sont utilisées que sur les distances courtes.
        */
        let show=true;
        if(p===105 && d>500)show=false;
        if(p===120 && d>300)show=false;
        if((p===90 || p===95) && d>20000)show=false;
        if(p===100 && d>3000)show=false;

        html+=`<td style="border:1px solid #333;padding:7px;background:${cellColor(p)};color:#111">${
          show ? formatTime(timeSeconds(d,vma,p)) : ''
        }</td>`;
      });

      html+='</tr>';
    });

    html+=`</tbody></table></div>`;

    // Séance 30"/30"
    const d100=Math.round((vma/3.6)*30);
    const d110=Math.round((vma/3.6)*30*1.10);
    const d120=Math.round((vma/3.6)*30*1.20);

    html+=`
      <div style="margin-top:18px;background:#171717;border-radius:12px;padding:14px">
        <h3 style="margin:0 0 12px;color:#e53935">SÉANCE DE 30"/30"</h3>
        <table style="border-collapse:collapse;width:100%;text-align:center">
          <tr>
            <th style="border:1px solid #555;padding:9px">VMA</th>
            <th style="border:1px solid #555;padding:9px">DISTANCE À PARCOURIR</th>
          </tr>
          <tr><td style="border:1px solid #555;padding:9px">100%</td><td style="border:1px solid #555;padding:9px">${d100} m</td></tr>
          <tr><td style="border:1px solid #555;padding:9px">110%</td><td style="border:1px solid #555;padding:9px">${d110} m</td></tr>
          <tr><td style="border:1px solid #555;padding:9px">120%</td><td style="border:1px solid #555;padding:9px">${d120} m</td></tr>
        </table>
      </div>
    `;

    // Estimations identiques au fichier Excel
    const t10=timeSeconds(10000,vma,90);
    const tSemi=timeSeconds(21100,vma,80);
    const tMarathon=timeSeconds(42195,vma,75);

    const estimates=[
      ['10 KM',10000,t10,t10*0.98,t10*1.02],
      ['SEMI-MARATHON',21100,tSemi,tSemi*0.98,tSemi*1.02],
      ['MARATHON',42195,tMarathon,tMarathon*0.97,tMarathon*1.04]
    ];

    html+=`
      <div style="margin-top:18px;background:#171717;border-radius:12px;padding:14px">
        <h3 style="margin:0 0 12px;color:#e53935">TEMPS PRÉVISIBLES</h3>
        <div style="overflow-x:auto">
        <table style="border-collapse:collapse;width:100%;min-width:520px;text-align:center">
          <tr>
            <th style="border:1px solid #555;padding:8px"></th>
            <th style="border:1px solid #555;padding:8px">Valeur basse</th>
            <th style="border:1px solid #555;padding:8px">Prévisible</th>
            <th style="border:1px solid #555;padding:8px">Valeur haute</th>
          </tr>
    `;

    estimates.forEach(([name,d,t,low,high])=>{
      html+=`
        <tr>
          <th style="border:1px solid #555;padding:8px;text-align:left">${name}</th>
          <td style="border:1px solid #555;padding:8px">${formatTime(low)}</td>
          <td style="border:1px solid #555;padding:8px;font-weight:900">${formatTime(t)}</td>
          <td style="border:1px solid #555;padding:8px">${formatTime(high)}</td>
        </tr>`;
    });

    html+=`</table></div></div>`;

    // Allures prévisibles
    html+=`
      <div style="margin-top:18px;background:#171717;border-radius:12px;padding:14px">
        <h3 style="margin:0 0 12px;color:#e53935">ALLURES PRÉVISIBLES</h3>
        <div style="overflow-x:auto">
        <table style="border-collapse:collapse;width:100%;min-width:520px;text-align:center">
          <tr>
            <th style="border:1px solid #555;padding:8px"></th>
            <th style="border:1px solid #555;padding:8px">Valeur basse</th>
            <th style="border:1px solid #555;padding:8px">Prévisible</th>
            <th style="border:1px solid #555;padding:8px">Valeur haute</th>
          </tr>
    `;

    estimates.forEach(([name,d,t,low,high])=>{
      const km=d/1000;
      html+=`
        <tr>
          <th style="border:1px solid #555;padding:8px;text-align:left">${name}</th>
          <td style="border:1px solid #555;padding:8px">${formatPace(low/km)} /km</td>
          <td style="border:1px solid #555;padding:8px;font-weight:900">${formatPace(t/km)} /km</td>
          <td style="border:1px solid #555;padding:8px">${formatPace(high/km)} /km</td>
        </tr>`;
    });

    html+=`</table></div></div></div>`;
html+=`
  <button id="vmaImageBtn" type="button" class="submit-result-btn" style="margin-top:18px">
    ENREGISTRER LE TABLEAU EN IMAGE
  </button>
`;
    out.innerHTML=html;
    const imageBtn=document.getElementById('vmaImageBtn');

if(imageBtn){
  imageBtn.addEventListener('click',async()=>{
    const fiche=out.firstElementChild;

    if(!fiche || typeof html2canvas==='undefined'){
      alert("Impossible de créer l'image.");
      return;
    }

    imageBtn.style.display='none';

    try{
      const canvas=await html2canvas(fiche,{
        scale:2,
        backgroundColor:'#050505',
        useCORS:true
      });

      const link=document.createElement('a');
      const vmaName=String(vma).replace('.','-');

      link.download=`Tableau-VMA-${vmaName}-LJA.png`;
      link.href=canvas.toDataURL('image/png');
      link.click();

    }catch(error){
      console.error(error);
      alert("Une erreur est survenue lors de la création de l'image.");
    }finally{
      imageBtn.style.display='';
    }
  });
}
  }

  btn.addEventListener('click',render);
})();
