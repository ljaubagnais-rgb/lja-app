const pages=[...document.querySelectorAll('.page')],drawer=document.getElementById('drawer'),overlay=document.getElementById('overlay'),menuBtn=document.getElementById('menuBtn');function showPage(id){pages.forEach(p=>p.classList.toggle('active',p.id===id));drawer.classList.remove('open');overlay.classList.remove('show');drawer.setAttribute('aria-hidden','true');menuBtn.setAttribute('aria-expanded','false');window.scrollTo(0,0);if(id==='results'&&!window.resultsLoaded)loadResults();if(id==='courses')loadCourses()}document.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();showPage(el.dataset.page)}));menuBtn.onclick=()=>{drawer.classList.add('open');overlay.classList.add('show');drawer.setAttribute('aria-hidden','false')};document.getElementById('closeMenu').onclick=overlay.onclick=()=>showPage(document.querySelector('.page.active').id);
function parseTime(v){const p=v.trim().split(':').map(Number);if(p.some(Number.isNaN))return NaN;if(p.length===3)return p[0]*3600+p[1]*60+p[2];if(p.length===2)return p[0]*60+p[1];return NaN}function fmtTime(sec){sec=Math.round(sec);return `${String(Math.floor(sec/3600)).padStart(2,'0')}:${String(Math.floor((sec%3600)/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
document.getElementById('paceBtn').onclick=()=>{const s=parseTime(document.getElementById('paceInput').value);document.getElementById('paceOut').textContent=s>0?`${(3600/s).toFixed(2)} km/h`:'Saisir une allure valide'};document.getElementById('speedBtn').onclick=()=>{const v=+document.getElementById('speedInput').value,s=3600/v;document.getElementById('speedOut').textContent=v>0?`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')} min/km`:'Saisir une vitesse valide'};document.getElementById('effortBtn').onclick=()=>{const d=+document.getElementById('distanceInput').value,e=+document.getElementById('elevationInput').value;document.getElementById('effortOut').textContent=d>=0&&e>=0?`${(d+e/100).toFixed(1)} km-effort`:'Valeurs invalides'};document.getElementById('predictBtn').onclick=()=>{const d1=+document.getElementById('d1').value,d2=+document.getElementById('d2').value,t=parseTime(document.getElementById('t1').value);document.getElementById('predictionOut').textContent=d1>0&&d2>0&&t>0?fmtTime(t*Math.pow(d2/d1,1.06)):'Valeurs invalides'};
const SHEET_ID='1x9HpN6Y4upAxCbAXxS0NFY2EqYheDx1F',RESULTS_SHEET='TOUS LES RESULTATS';let allResults=[];function cell(c){return c&&c.v!=null?String(c.f??c.v).trim():''}function frenchDateParts(v){if(!v)return null;const s=String(v).trim();let m=s.match(/Date\((\d+),(\d+),(\d+)/);if(m)return{y:+m[1],m:+m[2]+1,d:+m[3]};m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(m)return{y:+m[3],m:+m[2],d:+m[1]};m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(m)return{y:+m[1],m:+m[2],d:+m[3]};return null}function formatDate(v){if(!v)return'';const p=frenchDateParts(v);if(p)return`${String(p.d).padStart(2,'0')}/${String(p.m).padStart(2,'0')}/${p.y}`;const d=new Date(v);return isNaN(d)?v:d.toLocaleDateString('fr-FR')}function yearOf(v){const p=frenchDateParts(v);if(p)return String(p.y);const m=String(v).match(/(19|20)\d{2}/);return m?m[0]:''}function dateKey(v){const p=frenchDateParts(v);if(p)return new Date(p.y,p.m-1,p.d).getTime();const d=new Date(v);return isNaN(d)?0:d.getTime()}function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]))}
async function loadResults(){const status=document.getElementById('resultsStatus');try{const url=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(RESULTS_SHEET)}&tqx=out:json&t=${Date.now()}`;const txt=await fetch(url).then(r=>{if(!r.ok)throw Error();return r.text()});const json=JSON.parse(txt.substring(txt.indexOf('{'),txt.lastIndexOf('}')+1));allResults=json.table.rows.map(r=>{const c=r.c||[];return{annee:cell(c[0]),course:cell(c[1]),distance:cell(c[2]),denivele:cell(c[3]),date:cell(c[4]),rentrants:cell(c[5]),nom:cell(c[6]),prenom:cell(c[7]),classement:cell(c[8]),temps:cell(c[9]),categorie:cell(c[10])}}).filter(r=>r.course||r.nom);window.resultsLoaded=true;renderResults()}catch(e){status.textContent='Impossible de charger les résultats.'}}function renderResults(){const q=document.getElementById('resultSearch').value.trim().toLocaleLowerCase('fr'),y=document.getElementById('yearFilter').value;let rows=allResults.filter(r=>(!q||`${r.nom} ${r.prenom} ${r.course}`.toLocaleLowerCase('fr').includes(q))&&(!y||(r.annee||yearOf(r.date))===y));rows.sort((a,b)=>dateKey(b.date)-dateKey(a.date));document.getElementById('resultsStatus').textContent=`${rows.length} résultat${rows.length>1?'s':''}`;document.getElementById('resultsList').innerHTML=rows.slice(0,150).map(r=>`<article class="result-card"><div class="result-date">${esc(formatDate(r.date))}</div><h3>${esc(`${r.prenom} ${r.nom}`.trim())}</h3><div class="result-race">${esc(r.course)}</div><div class="result-grid"><span><b>Distance</b>${esc(r.distance||'—')}</span><span><b>Temps</b>${esc(r.temps||'—')}</span><span><b>Classement</b>${esc(r.classement||'—')}</span><span><b>Catégorie</b>${esc(r.categorie||'—')}</span></div>${r.denivele?`<div class="result-extra">D+ : ${esc(r.denivele)}</div>`:''}</article>`).join('')};document.getElementById('resultSearch').addEventListener('input',renderResults);document.getElementById('yearFilter').addEventListener('change',renderResults);
const COURSES_API='https://script.google.com/macros/s/AKfycby-ia_7Io16DcuyoxzOYE978U1S6DXl4WPYfsxteAPtcgLAToz8MBgWqvG6qnchujgd8g/exec';let courses=[],currentCourse=null;async function apiGet(params){const u=new URL(COURSES_API);Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw Error('API');return r.json()}async function apiPost(data){const r=await fetch(COURSES_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data)});if(!r.ok)throw Error('API');return r.json()}
async function loadCourses(){const status=document.getElementById('coursesStatus');status.textContent='Chargement des courses…';try{courses=await apiGet({action:'courses',t:Date.now()});courses.sort((a,b)=>String(a.date).localeCompare(String(b.date)));status.textContent=courses.length?`${courses.length} course${courses.length>1?'s':''}`:'Aucune course pour le moment. Ajoute la première !';document.getElementById('coursesList').innerHTML=courses.map(c=>`<button class="course-row" data-course-id="${esc(c.id)}"><span class="course-main"><b>${esc(c.nom)}</b><small>${esc(c.distance||'Distance non indiquée')}</small></span><span class="course-date">${esc(formatDate(c.date))}</span><span class="chevron">›</span></button>`).join('');document.querySelectorAll('[data-course-id]').forEach(b=>b.onclick=()=>openCourse(b.dataset.courseId))}catch(e){status.textContent='Impossible de charger les courses.'}}
async function openCourse(id){currentCourse=courses.find(c=>String(c.id)===String(id));if(!currentCourse)return;document.getElementById('courseDetail').innerHTML=`<div class="course-detail-card"><h2>${esc(currentCourse.nom)}</h2><div>${esc(formatDate(currentCourse.date))}</div><strong>${esc(currentCourse.distance||'Distance non indiquée')}</strong><button id="deleteCourseBtn" class="danger-btn">🗑 Supprimer cette course</button></div>`;showPage('course-detail');document.getElementById('deleteCourseBtn').onclick=deleteCurrentCourse;await loadParticipants()}
async function loadParticipants(){const status=document.getElementById('participantsStatus'),list=document.getElementById('participantsList');status.textContent='Chargement…';list.innerHTML='';try{const rows=await apiGet({action:'participants',courseId:currentCourse.id,t:Date.now()});status.textContent=rows.length?`${rows.length} LJA inscrit${rows.length>1?'s':''}`:'Aucun LJA inscrit pour le moment.';list.innerHTML=rows.map(p=>`<div class="participant-row"><span class="runner-icon">🏃</span><b>${esc(p.nom)}</b><button class="delete-participant" data-participant-id="${esc(p.id)}" data-participant-name="${esc(p.nom)}" aria-label="Supprimer ${esc(p.nom)}">🗑</button></div>`).join('');document.querySelectorAll('.delete-participant').forEach(b=>b.onclick=()=>deleteParticipant(b.dataset.participantId,b.dataset.participantName))}catch(e){status.textContent='Impossible de charger les participants.'}}
async function deleteParticipant(id,nom){if(!confirm(`Supprimer ${nom} de cette course ?`))return;try{const out=await apiPost({action:'deleteParticipant',id});if(!out.ok)throw Error(out.error||'Erreur');await loadParticipants()}catch(e){alert(e.message||'Impossible de supprimer ce coureur.')}}async function deleteCurrentCourse(){if(!currentCourse)return;const nom=currentCourse.nom;if(!confirm(`Supprimer la course « ${nom} » ?\n\nTous les coureurs inscrits à cette course seront également supprimés.`))return;try{const out=await apiPost({action:'deleteCourse',id:currentCourse.id});if(!out.ok)throw Error(out.error||'Erreur');currentCourse=null;showPage('courses')}catch(e){alert(e.message||'Impossible de supprimer cette course.')}}
function openModal(id){document.getElementById(id).classList.add('show')}function closeModal(id){document.getElementById(id).classList.remove('show')}document.getElementById('openAddCourse').onclick=()=>{document.getElementById('courseForm').reset();document.getElementById('courseFormStatus').textContent='';openModal('courseModal')};document.getElementById('openAddParticipant').onclick=()=>{document.getElementById('participantForm').reset();document.getElementById('participantFormStatus').textContent='';openModal('participantModal')};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));document.getElementById('backCourses').onclick=()=>showPage('courses');document.getElementById('courseForm').onsubmit=async e=>{e.preventDefault();const s=document.getElementById('courseFormStatus');s.textContent='Ajout en cours…';try{const out=await apiPost({action:'addCourse',nom:document.getElementById('courseName').value,date:document.getElementById('courseDate').value,distance:document.getElementById('courseDistance').value});if(!out.ok)throw Error(out.error||'Erreur');closeModal('courseModal');await loadCourses()}catch(err){s.textContent=err.message||'Impossible d’ajouter la course.'}};document.getElementById('participantForm').onsubmit=async e=>{e.preventDefault();const s=document.getElementById('participantFormStatus');s.textContent='Ajout en cours…';try{const out=await apiPost({action:'addParticipant',courseId:currentCourse.id,nom:document.getElementById('participantName').value});if(!out.ok)throw Error(out.error||'Erreur');closeModal('participantModal');await loadParticipants()}catch(err){s.textContent=err.message||'Impossible d’ajouter le coureur.'}};
const RESULTS_API='https://script.google.com/macros/s/AKfycbzoS-k9W6cpjJ2DoTBZPuREHzbs1c47FEL_EuPKR9-Py8n-Oa5zLQcNxkmY7VxBXZhQnw/exec';let resultManual=false;async function loadResultCourseOptions(){const sel=document.getElementById('rfCourse'),info=document.getElementById('rfSelectedInfo');info.textContent='Chargement des courses…';try{const rows=await apiGet({action:'courses',t:Date.now()});rows.sort((a,b)=>String(a.date).localeCompare(String(b.date)));courses=rows;sel.innerHTML='<option value="">Choisir une course…</option>'+rows.map(c=>`<option value="${esc(c.id)}">${esc(c.nom)} — ${esc(formatDate(c.date))}${c.distance?' — '+esc(c.distance):''}</option>`).join('');info.textContent='';}catch(e){info.textContent='Impossible de charger la liste. Utilisez « Ma course n’est pas dans la liste ».'}}
async function syncManualCourse(course, date, distance, nom, prenom) {
  try {
    // Recharge la liste actuelle des courses
    const rows = await apiGet({
      action: 'courses',
      t: Date.now()
    });

    const normalize = v =>
      String(v || '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, ' ');

    const normalizeDistance = v =>
      String(v || '')
        .toUpperCase()
        .replace(/\s*KM\s*/g, '')
        .replace(',', '.')
        .trim();

    // Recherche d'une course déjà existante
    let existing = rows.find(c =>
      normalize(c.nom) === normalize(course) &&
      String(c.date).substring(0, 10) === String(date).substring(0, 10) &&
      normalizeDistance(c.distance) === normalizeDistance(distance)
    );

    let courseId = existing ? existing.id : '';

    // Si elle n'existe pas, on la crée
    if (!courseId) {
      const created = await apiPost({
        action: 'addCourse',
        nom: course,
        date: date,
        distance: distance
      });

      if (!created.ok) {
        throw new Error(created.error || 'Création de la course impossible');
      }

      // On recharge pour récupérer son identifiant
      const updated = await apiGet({
        action: 'courses',
        t: Date.now()
      });

      existing = updated.find(c =>
        normalize(c.nom) === normalize(course) &&
        String(c.date).substring(0, 10) === String(date).substring(0, 10) &&
        normalizeDistance(c.distance) === normalizeDistance(distance)
      );

      if (existing) {
        courseId = existing.id;
      }
    }

    // Inscription du coureur à la course
    if (courseId) {
      const participantName =
        `${String(prenom || '').trim()} ${String(nom || '').trim()}`.trim();

      // Vérifie qu'il n'est pas déjà inscrit
      const participants = await apiGet({
        action: 'participants',
        courseId: courseId,
        t: Date.now()
      });

      const alreadyExists = participants.some(p =>
        normalize(p.nom) === normalize(participantName)
      );

      if (!alreadyExists) {
        await apiPost({
          action: 'addParticipant',
          courseId: courseId,
          nom: participantName
        });
      }
    }

  } catch (err) {
    console.warn(
      'Résultat enregistré, mais synchronisation de la course impossible :',
      err
    );
  }
}
function setManualResult(on){resultManual=on;document.getElementById('rfManual').classList.toggle('show',on);document.getElementById('rfCourse').required=!on;['rfCourseName','rfDate','rfDistance'].forEach(id=>document.getElementById(id).required=on);document.getElementById('rfOther').textContent=on?'← Choisir une course de la liste':"Ma course n'est pas dans la liste";document.getElementById('rfSelectedInfo').textContent='';if(on)document.getElementById('rfCourse').value=''}
document.querySelectorAll('[data-page="submit-result"]').forEach(el=>el.addEventListener('click',()=>loadResultCourseOptions()));document.getElementById('rfOther').onclick=()=>setManualResult(!resultManual);document.getElementById('rfCourse').onchange=e=>{const c=courses.find(x=>String(x.id)===String(e.target.value));document.getElementById('rfSelectedInfo').textContent=c?`${c.nom} • ${formatDate(c.date)} • ${c.distance||'distance non indiquée'}`:''};
const timeOriginal=document.getElementById('rfTemps');const timeWrap=document.createElement('div');timeWrap.style.cssText='display:flex;align-items:center;gap:8px;width:100%';function timePart(ph,max){const i=document.createElement('input');i.type='text';i.inputMode='numeric';i.pattern='[0-9]*';i.maxLength=2;i.placeholder=ph;i.autocomplete='off';i.style.cssText='width:72px;text-align:center;font-size:22px;font-weight:700;padding:12px 8px';return i}const timeH=timePart('hh',23),timeM=timePart('mm',59),timeS=timePart('ss',59);function colon(){const s=document.createElement('span');s.textContent=':';s.style.cssText='font-size:28px;font-weight:900';return s}timeWrap.append(timeH,colon(),timeM,colon(),timeS);timeOriginal.style.display='none';timeOriginal.required=false;timeOriginal.parentNode.insertBefore(timeWrap,timeOriginal);function cleanTimePart(input,max,next){input.value=input.value.replace(/\D/g,'').slice(0,2);if(input.value.length===2){if(Number(input.value)>max)input.value=String(max).padStart(2,'0');if(next)next.focus()}syncRaceTime()}function syncRaceTime(){const h=timeH.value.padStart(2,'0'),m=timeM.value.padStart(2,'0'),s=timeS.value.padStart(2,'0');timeOriginal.value=(timeH.value||timeM.value||timeS.value)?`${h}:${m}:${s}`:''}timeH.addEventListener('input',()=>cleanTimePart(timeH,99,timeM));timeM.addEventListener('input',()=>cleanTimePart(timeM,59,timeS));timeS.addEventListener('input',()=>cleanTimePart(timeS,59,null));[timeH,timeM,timeS].forEach((i,n)=>i.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!i.value&&n>0)[timeH,timeM,timeS][n-1].focus()}));
document.getElementById('resultForm').onsubmit=async e=>{e.preventDefault();const status=document.getElementById('resultFormStatus');syncRaceTime();let courseId='',course='',date='',distance='';if(resultManual){course=document.getElementById('rfCourseName').value.trim();date=document.getElementById('rfDate').value;distance=document.getElementById('rfDistance').value}else{const c=courses.find(x=>String(x.id)===String(document.getElementById('rfCourse').value));if(c){courseId=c.id;course=c.nom;date=c.date;distance=String(c.distance||'').replace(/[^0-9.,]/g,'').replace(',','.')}}if(!course||!date||!distance){status.textContent='La course, la date et la distance sont obligatoires.';return}if(!timeH.value||!timeM.value||!timeS.value){status.textContent='Saisissez les heures, les minutes et les secondes.';timeH.focus();return}const temps=document.getElementById('rfTemps').value.trim();if(!/^\d{2}:[0-5]\d:[0-5]\d$/.test(temps)){status.textContent='Le temps doit être au format hh:mm:ss.';return}status.textContent='Envoi en cours…';try{const r=await fetch(RESULTS_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'addResult',courseId,course,date,distance,denivele:document.getElementById('rfDenivele').value,rentrants:document.getElementById('rfRentrants').value,nom:document.getElementById('rfNom').value,prenom:document.getElementById('rfPrenom').value,temps,classement:document.getElementById('rfClassement').value,categorie:document.getElementById('rfCategorie').value,sexe:document.getElementById('rfSexe').value,classementCategorie:document.getElementById('rfClassementCategorie').value})});const out=await r.json();if(!out.ok)throw Error(out.error||'Erreur');

if(resultManual){
  await syncManualCourse(
    course,
    date,
    distance,
    document.getElementById('rfNom').value,
    document.getElementById('rfPrenom').value
  );
}

status.textContent='✓ Résultat enregistré. Merci !';e.target.reset();timeH.value=timeM.value=timeS.value='';timeOriginal.value='';setManualResult(false);document.getElementById('rfSelectedInfo').textContent='';}catch(err){status.textContent=err.message||'Impossible d’enregistrer le résultat.'}};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
