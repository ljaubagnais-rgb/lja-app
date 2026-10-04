// Accès direct aux principales rubriques depuis un lien externe (ex. Kalisport)
(() => {
  const allowedPages = new Set(['submit-result', 'courses', 'results']);
  const requestedPage = new URLSearchParams(window.location.search).get('page');

  if (!allowedPages.has(requestedPage)) return;

  // showPage est défini dans app.js, chargé avant ce fichier.
  showPage(requestedPage);

  // La saisie a besoin de la liste des courses dès l'ouverture directe.
  if (requestedPage === 'submit-result' && typeof loadResultCourseOptions === 'function') {
    loadResultCourseOptions();
  }
})();
