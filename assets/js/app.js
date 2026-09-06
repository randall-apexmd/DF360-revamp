/* ============================================================
   eos.apexmd.com — behaviour layer
   1. Home-club selection, persisted and written into every intake URL
      so each signup is attributable to a specific location.
   2. The 2-minute assessment modal (goal / stage / labs -> program).
   3. The mobile club sheet.
   No layout or styling is set here.
   ============================================================ */
(function () {
  'use strict';

  /* ---- configuration ----
     The EōS intake lives on its own partner subdomain, matching the pattern
     every other Apex MD partner follows (formvibe, formdf360, ...). It takes
     a categoryId, not the flow/program names this file used to send.

     Valid categories: weight-loss | trt | hrt | longevity | bloodwork

     The selected home club is appended as &club= so a signup stays traceable
     to a location. The form ignores parameters it does not use; drop the line
     in intakeUrl() if club attribution is handled elsewhere. */
  var INTAKE_BASE = 'https://formdefined.apexmd.com';
  var STORAGE_KEY = 'df360.homeStudio';

  /* Default category per CTA kind. An element may override with
     data-category="..." — the generated pages set it per page. */
  var CATEGORY_FOR = {
    'body-scan':  'bloodwork',   /* DF360 has no scanner; bloodwork is the diagnostics entry point */
    'assessment': 'weight-loss', /* overridden per page via data-category */
    'rec':        'weight-loss'  /* replaced by the assessment's own recommendation */
  };

  // CLUBS removed for DF360: the EoS list was invented demo data
  // (EOS-PHX-014 etc), and DF360's intake takes no club param.
  var CLUBS = [];

  var state = { club: null, aGoal: null, aStage: null, aLabs: null };

  function byCode(code) {
    for (var i = 0; i < CLUBS.length; i++) if (CLUBS[i].code === code) return CLUBS[i];
    return null;   // CLUBS is empty on DF360; callers must tolerate null
  }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- category + club code -> intake URLs ---------- */
  function intakeUrl(category) {
    /* No &club= on DF360: there is no studio picker and the intake form does
       not read the param. Appending an empty one would just be noise in the
       URL and in analytics. */
    return INTAKE_BASE + '/?categoryId=' + encodeURIComponent(category);
  }

  function syncClub() {
    var club = byCode(state.club);
    if (club) {
      $all('[data-club-label]').forEach(function (el) { el.textContent = club.label; });
      $all('[data-club-code]').forEach(function (el) { el.textContent = club.code; });
    }

    $all('[data-intake]').forEach(function (el) {
      var kind = el.getAttribute('data-intake');
      var category = el.getAttribute('data-category') ||
                     (kind === 'rec' ? recommend().category : CATEGORY_FOR[kind]) ||
                     'weight-loss';
      el.href = intakeUrl(category);
    });

    $all('select[data-club-select]').forEach(function (sel) { sel.value = state.club; });

    /* analytics hook. Only fires when a studio was actually chosen; DF360 has
       no studio picker, so on this site it never fires. */
    if (club && window.dataLayer && window.dataLayer.push) {
      window.dataLayer.push({ event: 'club_selected', club_code: club.code, club_name: club.label });
    }
  }

  function setClub(code) {
    var c = byCode(code);
    if (!c) return;              // no studio list on DF360
    state.club = c.code;
    try { window.localStorage.setItem(STORAGE_KEY, state.club); } catch (e) {}
    syncClub();
  }

  /* ---------- assessment ---------- */
  function recommend() {
    var g = state.aGoal, stage = state.aStage;
    if (!g) return {
      program: '', goal: 'Answer the three questions',
      copy: 'Your recommendation appears here — then start the intake that begins it.',
      category: 'bloodwork'
    };
    if (g === 'Lose weight') {
      return stage === 'Training consistently'
        ? { program: 'GLP-1 microdose', goal: 'Metabolic Health', copy: 'You are already training. A microdose targets appetite and metabolic markers without blunting the work you are putting in.', category: 'microdosing' }
        : { program: 'GLP-1', goal: 'Lose Weight', copy: 'Medically managed weight loss with quarterly labs so your dose stays matched to you.', category: 'weight-loss' };
    }
    if (g === 'Build muscle and recover') return { program: 'Sermorelin', goal: 'Build Muscle', copy: "Supports your own growth hormone production for recovery, sleep and lean mass.", category: 'longevity' };
    if (g === 'Energy and focus') return { program: 'NAD+ · B-12 MIC', goal: 'Energy & Recovery', copy: 'For the stretch where you make it to the gym but the energy never shows up.', category: 'longevity' };
    if (g === "Men's vitality") return { program: 'TRT', goal: "Men's Vitality", copy: 'Testosterone therapy when your labs and how you feel both point in that direction.', category: 'trt' };
    return { program: 'HRT', goal: "Women's Hormones", copy: 'Hormone therapy for sleep, mood and the changes of perimenopause and beyond.', category: 'hrt' };
  }

  var ON  = 'padding:13px 14px;border:2px solid var(--color-accent);background:var(--color-accent-100);font-size:14.5px;font-weight:700;cursor:pointer;text-align:left';
  var OFF = 'padding:13px 14px;border:2px solid var(--color-divider);background:var(--color-bg);font-size:14.5px;font-weight:500;cursor:pointer;text-align:left';

  function syncAssessment() {
    $all('[data-pick]').forEach(function (el) {
      var parts = el.getAttribute('data-pick').split('::');
      el.setAttribute('style', state[parts[0]] === parts[1] ? ON : OFF);
      el.setAttribute('aria-pressed', state[parts[0]] === parts[1] ? 'true' : 'false');
    });
    var rec = recommend();
    var answered = [state.aGoal, state.aStage, state.aLabs].filter(Boolean).length;
    $all('[data-rec="goal"]').forEach(function (el) { el.textContent = rec.goal; });
    $all('[data-rec="program"]').forEach(function (el) { el.textContent = rec.program; });
    $all('[data-rec="copy"]').forEach(function (el) { el.textContent = rec.copy; });
    $all('[data-rec="step"]').forEach(function (el) { el.textContent = answered + ' of 3 answered'; });
    syncClub();
  }

  /* ---------- overlays ---------- */
  function toggle(id, open) {
    var el = document.getElementById(id);
    if (!el) return;
    if (open) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var focusable = el.querySelector('button, [href], select, input');
      if (focusable) focusable.focus();
    }
  }

  /* ---------- wiring ---------- */
  document.addEventListener('click', function (e) {
    var pick = e.target.closest ? e.target.closest('[data-pick]') : null;
    if (pick) {
      var parts = pick.getAttribute('data-pick').split('::');
      state[parts[0]] = state[parts[0]] === parts[1] ? null : parts[1];
      syncAssessment();
      return;
    }
    var act = e.target.closest ? e.target.closest('[data-action]') : null;
    if (!act) return;
    var a = act.getAttribute('data-action');
    if (a === 'open-assess')  { e.preventDefault(); toggle('assess-modal', true); syncAssessment(); }
    if (a === 'close-assess') { e.preventDefault(); toggle('assess-modal', false); }
    if (a === 'open-sheet')   { e.preventDefault(); toggle('club-sheet', true); }
    if (a === 'close-sheet')  { e.preventDefault(); toggle('club-sheet', false); }
  });

  document.addEventListener('change', function (e) {
    var sel = e.target;
    if (sel && sel.matches && sel.matches('[data-action="club-change"], select[data-club-select]')) setClub(sel.value);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { toggle('assess-modal', false); toggle('club-sheet', false); }
  });

  /* restore the member's saved home club */
  try {
    var saved = window.localStorage.getItem(STORAGE_KEY);
    var found = saved ? byCode(saved) : null;   // byCode returns null when CLUBS is empty
    if (found) state.club = found.code;
  } catch (e) {}

  /* populate every club <select> so the option list can never drift */
  $all('select[data-club-select]').forEach(function (sel) {
    if (sel.options.length) return;
    CLUBS.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.code; o.textContent = c.label;
      sel.appendChild(o);
    });
  });

  syncAssessment();
})();
