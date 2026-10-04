// Confirmation, modification et suppression de la saisie courante d'un résultat LJA.
// La modification/suppression n'est proposée que pour l'ID reçu pendant cette session.
(() => {
  const form = document.getElementById('resultForm');
  if (!form) return;

  const status = document.getElementById('resultFormStatus');
  const submitBtn = form.querySelector('button[type="submit"]');
  let currentResultId = null;
  let currentPayload = null;
  let editing = false;

  function getCategory() {
    const sel = document.getElementById('rfCategorie');
    const other = document.getElementById('rfCategorieAutre');
    if (!sel) return '';
    if (sel.value === '__AUTRE__') return (other?.value || '').trim();
    return sel.value.trim();
  }

  function buildPayload() {
    let courseId = '', course = '', date = '', distance = '';
    const manual = document.getElementById('rfManual')?.classList.contains('show');

    if (manual) {
      course = document.getElementById('rfCourseName').value.trim();
      date = document.getElementById('rfDate').value;
      distance = document.getElementById('rfDistance').value;
    } else {
      const selectedId = document.getElementById('rfCourse').value;
      const c = (typeof courses !== 'undefined' ? courses : []).find(x => String(x.id) === String(selectedId));
      if (c) {
        courseId = c.id;
        course = c.nom;
        date = c.date;
        distance = String(c.distance || '').replace(/[^0-9.,]/g, '').replace(',', '.');
      }
    }

    return {
      action: currentResultId && editing ? 'updateResult' : 'addResult',
      id: currentResultId || undefined,
      courseId, course, date, distance,
      denivele: document.getElementById('rfDenivele').value,
      rentrants: document.getElementById('rfRentrants').value,
      nom: document.getElementById('rfNom').value.trim(),
      prenom: document.getElementById('rfPrenom').value.trim(),
      temps: document.getElementById('rfTemps').value.trim(),
      classement: document.getElementById('rfClassement').value,
      categorie: getCategory(),
      sexe: document.getElementById('rfSexe').value,
      classementCategorie: document.getElementById('rfClassementCategorie').value
    };
  }

  function validate(p) {
    if (!p.course || !p.date || !p.distance) return 'La course, la date et la distance sont obligatoires.';
    if (!p.nom || !p.prenom || !p.classement || !p.categorie || !p.sexe) return 'Certains champs obligatoires sont manquants.';
    if (!/^\d{2}:[0-5]\d:[0-5]\d$/.test(p.temps)) return 'Le temps doit être au format hh:mm:ss.';
    return '';
  }

  function ensureDialog() {
    let dlg = document.getElementById('resultReviewDialog');
    if (dlg) return dlg;
    dlg = document.createElement('div');
    dlg.id = 'resultReviewDialog';
    dlg.style.cssText = 'display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);padding:18px;align-items:center;justify-content:center';
    dlg.innerHTML = `
      <div style="background:#fff;border-radius:18px;padding:22px;max-width:520px;width:100%;max-height:88vh;overflow:auto;box-shadow:0 15px 45px rgba(0,0,0,.3)">
        <h2 style="margin-top:0">Vérifiez votre résultat</h2>
        <div id="resultReviewBody" style="line-height:1.65"></div>
        <div style="display:grid;gap:10px;margin-top:20px">
          <button type="button" id="resultConfirmBtn" class="submit-result-btn">CONFIRMER LA SAISIE</button>
          <button type="button" id="resultModifyBtn" class="secondary-btn">MODIFIER</button>
          <button type="button" id="resultCancelBtn" class="secondary-btn">ANNULER</button>
        </div>
      </div>`;
    document.body.appendChild(dlg);
    document.getElementById('resultModifyBtn').onclick = () => closeDialog();
    document.getElementById('resultCancelBtn').onclick = () => { closeDialog(); status.textContent = 'Saisie non envoyée.'; };
    document.getElementById('resultConfirmBtn').onclick = sendConfirmed;
    return dlg;
  }

  function reviewHtml(p) {
    const safe = s => String(s || '—').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    return `<p><b>Coureur :</b> ${safe(p.prenom)} ${safe(p.nom)}</p>
      <p><b>Course :</b> ${safe(p.course)}</p>
      <p><b>Date :</b> ${safe(p.date)} &nbsp; <b>Distance :</b> ${safe(p.distance)} km</p>
      <p><b>Temps :</b> ${safe(p.temps)} &nbsp; <b>Classement :</b> ${safe(p.classement)}</p>
      <p><b>Catégorie :</b> ${safe(p.categorie)} &nbsp; <b>Sexe :</b> ${safe(p.sexe)}</p>
      <p><b>Classement catégorie :</b> ${safe(p.classementCategorie)}</p>
      <p><b>Rentrants :</b> ${safe(p.rentrants)} &nbsp; <b>D+ :</b> ${safe(p.denivele)}</p>`;
  }

  function openDialog(p) {
    const dlg = ensureDialog();
    document.getElementById('resultReviewBody').innerHTML = reviewHtml(p);
    document.getElementById('resultConfirmBtn').textContent = editing ? 'CONFIRMER LA MODIFICATION' : 'CONFIRMER LA SAISIE';
    dlg.style.display = 'flex';
  }

  function closeDialog() {
    const dlg = document.getElementById('resultReviewDialog');
    if (dlg) dlg.style.display = 'none';
  }

  async function resultsPost(data) {
    const r = await fetch(RESULTS_API, {
      method: 'POST',
      headers: {'Content-Type':'text/plain;charset=utf-8'},
      body: JSON.stringify(data)
    });
    const out = await r.json();
    if (!out.ok) throw new Error(out.error || 'Erreur');
    return out;
  }

  function showAfterSave(p) {
    let box = document.getElementById('resultAfterSave');
    if (!box) {
      box = document.createElement('div');
      box.id = 'resultAfterSave';
      status.insertAdjacentElement('afterend', box);
    }
    box.style.cssText = 'margin-top:14px;padding:16px;border:1px solid #ddd;border-radius:14px;background:#fff';
    box.innerHTML = `<b>Résultat enregistré</b><div style="margin:8px 0 14px">${p.prenom} ${p.nom} — ${p.course} — ${p.temps}</div>
      <div style="display:grid;gap:8px"><button type="button" id="editSavedResult" class="secondary-btn">MODIFIER MA SAISIE</button><button type="button" id="deleteSavedResult" class="danger-btn">SUPPRIMER MA SAISIE</button></div>`;
    document.getElementById('editSavedResult').onclick = () => {
      editing = true;
      submitBtn.textContent = 'ENREGISTRER LA MODIFICATION';
      status.textContent = 'Modifiez les champs puis validez.';
      box.style.display = 'none';
      window.scrollTo({top: form.offsetTop - 70, behavior:'smooth'});
    };
    document.getElementById('deleteSavedResult').onclick = deleteSaved;
  }

  async function sendConfirmed() {
    closeDialog();
    status.textContent = editing ? 'Modification en cours…' : 'Envoi en cours…';
    try {
      const out = await resultsPost(currentPayload);
      currentResultId = out.id || currentResultId;
      editing = false;
      submitBtn.textContent = 'ENVOYER MON RÉSULTAT';
      status.textContent = '✓ Résultat enregistré. Vous pouvez encore le modifier ou le supprimer ci-dessous.';
      showAfterSave(currentPayload);
    } catch (err) {
      status.textContent = err.message || 'Impossible d’enregistrer le résultat.';
    }
  }

  async function deleteSaved() {
    if (!currentResultId) return;
    if (!confirm('Supprimer définitivement cette saisie ?')) return;
    status.textContent = 'Suppression en cours…';
    try {
      await resultsPost({action:'deleteResult', id:currentResultId});
      currentResultId = null;
      currentPayload = null;
      editing = false;
      form.reset();
      const box = document.getElementById('resultAfterSave');
      if (box) box.remove();
      submitBtn.textContent = 'ENVOYER MON RÉSULTAT';
      status.textContent = '✓ Saisie supprimée.';
    } catch (err) {
      status.textContent = err.message || 'Impossible de supprimer la saisie.';
    }
  }

  // Remplace le gestionnaire d'envoi initial défini dans app.js.
  form.onsubmit = e => {
    e.preventDefault();
    const p = buildPayload();
    const error = validate(p);
    if (error) { status.textContent = error; return; }
    currentPayload = p;
    openDialog(p);
  };
})();
