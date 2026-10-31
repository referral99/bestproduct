/* ============================================================
   Shared interactive case-flow engine.
   A case page defines a global `FLOW` object:

   window.FLOW = {
     title: "Case title",
     subtitle: "one line description",
     breadcrumb: [{label:"Home", href:"../index.html"}, {label:"Civil", href:"index.html"}],
     acts: [{name:"Transfer of Property Act, 1882", href:"../Civil/Transfer_of_Property_Act_1882.pdf"}],
     start: "start",                // key of the first step (default "start")
     steps: { key: { label, labelClass, html }, ... },
     modals: { key: "<h2>..</h2>..", ... }
   }

   Inside step html use:
     - decision buttons:  <button class="btn-yes" onclick="choose('next-key')">YES</button>
     - modal link:        <span class="info-link" onclick="openModal('will')">notes</span>
   ============================================================ */
(function () {
  const F = window.FLOW || {};
  const steps = F.steps || {};
  const modals = F.modals || {};
  let path = [F.start || 'start'];

  function el(id) { return document.getElementById(id); }

  function ensureRelatedContainer() {
    if (el('related')) return;
    const acts = el('acts');
    if (!acts) return;
    const div = document.createElement('div');
    div.className = 'acts related';
    div.id = 'related';
    acts.parentNode.insertBefore(div, acts.nextSibling);
  }

  function buildChrome() {
    ensureRelatedContainer();
    // breadcrumb
    if (Array.isArray(F.breadcrumb) && F.breadcrumb.length) {
      const bar = el('topbar');
      if (bar) {
        const parts = F.breadcrumb.map(function (b) {
          return b.href ? '<a href="' + b.href + '">' + b.label + '</a>' : '<span class="here">' + b.label + '</span>';
        });
        bar.innerHTML = parts.join(' <span class="sep">/</span> ');
      }
    }
    if (el('title')) el('title').textContent = F.title || 'Case Flow';
    if (el('subtitle')) el('subtitle').innerHTML = F.subtitle || '';

    // acts panel
    if (Array.isArray(F.acts) && F.acts.length) {
      const a = el('acts');
      if (a) {
        a.innerHTML = '<h4>Governing Acts &amp; Statutes</h4><ul>' +
          F.acts.map(function (x) {
            return '<li><a href="' + x.href + '" target="_blank" rel="noopener">' + x.name + '</a></li>';
          }).join('') + '</ul>';
      }
    }

    // related flows panel
    if (Array.isArray(F.related) && F.related.length) {
      const r = el('related');
      if (r) {
        r.innerHTML = '<h4>Related case flows</h4><ul>' +
          F.related.map(function (x) {
            return '<li><a href="' + x.href + '">' + x.label + '</a></li>';
          }).join('') + '</ul>';
      }
    }
  }

  function render() {
    const flowEl = el('flow');
    flowEl.innerHTML = '';
    path.forEach(function (key, idx) {
      const data = steps[key];
      if (!data) return;
      const block = document.createElement('div');
      block.className = 'step-block';
      block.innerHTML = data.html;
      flowEl.appendChild(block);
      if (idx < path.length - 1) {
        block.querySelectorAll('.choice-btns button').forEach(function (b) { b.disabled = true; });
        const nextKey = path[idx + 1];
        const nextData = steps[nextKey];
        if (nextData && nextData.label) {
          const decBox = block.querySelector('.box.decision');
          if (decBox) {
            const lbl = document.createElement('div');
            lbl.className = 'chosen-label ' + (nextData.labelClass || 'yes');
            lbl.textContent = 'Chosen \u2192 ' + nextData.label;
            decBox.appendChild(lbl);
          }
        }
      }
    });
    const labels = path.map(function (k) {
      return (k === (F.start || 'start')) ? 'Start' : ((steps[k] && steps[k].label) || k);
    });
    el('history').innerHTML = labels.length > 1 ? '<span>' + labels.join(' \u2192 ') + '</span>' : '';
    el('backBtn').style.display = path.length > 1 ? 'inline-block' : 'none';
    setTimeout(function () {
      const last = flowEl.lastElementChild;
      if (last) last.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 40);
  }

  // Navigate to the next step key directly.
  window.choose = function (nextKey) {
    if (nextKey && steps[nextKey]) { path.push(nextKey); render(); }
  };
  window.goBack = function () { if (path.length > 1) { path.pop(); render(); } };
  window.restart = function () { path = [F.start || 'start']; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  window.openModal = function (key) {
    el('modal-content').innerHTML = modals[key] || '<p>No details available.</p>';
    el('modal').classList.add('show');
  };
  window.closeModal = function () { el('modal').classList.remove('show'); };

  document.addEventListener('DOMContentLoaded', function () {
    buildChrome();
    render();
  });
})();
