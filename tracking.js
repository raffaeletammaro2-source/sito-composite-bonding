/* Eventi per Google Tag Manager (dataLayer).
   GTM legge questi eventi e li invia a GA4 e al Pixel Meta, nel rispetto del consenso iubenda. */
(function () {
  var dl = (window.dataLayer = window.dataLayer || []);
  function push(o) { dl.push(o); }
  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  function section(el) {
    if (el.closest('.mobile-cta')) return 'barra-mobile';
    if (el.closest('.hero')) return 'hero';
    var s = el.closest('section[id], aside, header, footer, .cta-box');
    if (!s) return 'pagina';
    if (s.id) return s.id;
    if (s.classList.contains('cta-box')) return 'box-articolo';
    return s.tagName.toLowerCase();
  }
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  };

  // Clic su WhatsApp e telefono
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('api.whatsapp.com') > -1 || href.indexOf('wa.me') > -1) {
      var sede = href.indexOf('393792757303') > -1 ? 'Salerno' : 'Aversa';
      push({ event: 'click_whatsapp', link_location: section(a), sede: sede, event_id: uid() });
    } else if (href.indexOf('tel:') === 0) {
      var tsede = href.indexOf('3792757303') > -1 ? 'Salerno' : 'Aversa';
      push({ event: 'click_phone', link_location: section(a), sede: tsede, event_id: uid() });
    }
  }, true);

  // Modulo prenotazione: prepara l'ID evento (stesso ID per GA4, Meta e CRM)
  var form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', function () {
      var id = uid();
      var hidden = form.querySelector('input[name="event_id"]');
      if (hidden) hidden.value = id;
      var sede = form.sede ? form.sede.value : '';
      var foto = form.foto && form.foto.files && form.foto.files.length ? 'si' : 'no';
      store.set('lead_pending', JSON.stringify({ event_id: id, sede: sede, foto: foto }));
    });
  }

  // Pagina di ringraziamento: lead confermato (una sola volta, anche se la pagina viene ricaricata)
  if (document.body && document.body.dataset.page === 'grazie') {
    var raw = store.get('lead_pending');
    if (raw) {
      store.del('lead_pending');
      var d = {};
      try { d = JSON.parse(raw); } catch (e) {}
      push({ event: 'generate_lead', event_id: d.event_id || uid(), sede: d.sede || '', foto_caricata: d.foto || 'no', form_name: 'prenotazione' });
    }
  }

  // Guide: visualizzazione contenuto
  var guide = document.body && document.body.dataset.guide;
  if (guide) push({ event: 'view_guide', guide_name: guide, event_id: uid() });

  // Video dell'hero: avvio con audio, metà, fine
  var v = document.getElementById('docVideo');
  if (v) {
    var started = false, half = false;
    v.addEventListener('volumechange', function () {
      if (!v.muted && !started) { started = true; push({ event: 'video_start', video_title: 'Injection Technique - Dott. Iuorio' }); }
    });
    v.addEventListener('timeupdate', function () {
      if (started && !half && v.duration && v.currentTime / v.duration >= 0.5) { half = true; push({ event: 'video_progress', video_percent: 50, video_title: 'Injection Technique - Dott. Iuorio' }); }
    });
    v.addEventListener('ended', function () {
      if (started) push({ event: 'video_complete', video_percent: 100, video_title: 'Injection Technique - Dott. Iuorio' });
    });
  }
})();
