/* Gateway Grid — Elementor editor panel enhancement
   Watches the collection control and renders a field hide-list UI
   that writes back to the hidden hidden_fields control. */

(function () {
  'use strict';

  var apiRoot = (window.gatewayGridEditor && window.gatewayGridEditor.apiRoot) || '/wp-json/';
  var UI_ID   = 'gty-field-picker';

  // ── Fetch collection fields ──────────────────────────────────────────────

  var fieldCache = {};

  function fetchFields(collectionKey, cb) {
    if (fieldCache[collectionKey]) { cb(fieldCache[collectionKey]); return; }
    fetch(apiRoot + 'gateway/v1/collections/' + encodeURIComponent(collectionKey))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) { cb([]); return; }
        var raw = data.fields || {};
        var list = Array.isArray(raw)
          ? raw
          : Object.values(raw);
        var fields = list
          .filter(function (f) { return f.name && f.name !== 'id'; })
          .map(function (f) { return { key: f.name, label: f.label || f.name }; });
        fieldCache[collectionKey] = fields;
        cb(fields);
      })
      .catch(function () { cb([]); });
  }

  // ── Build / refresh the checkbox UI ──────────────────────────────────────

  function buildUI(container, fields, hiddenSet, onChange) {
    container.innerHTML = '';

    if (!fields.length) {
      container.innerHTML = '<p style="color:#aaa;font-size:11px;margin:4px 0">No fields found.</p>';
      return;
    }

    var heading = document.createElement('p');
    heading.textContent = 'Hide fields:';
    heading.style.cssText = 'color:#aaa;font-size:11px;margin:4px 0 6px;text-transform:uppercase;letter-spacing:.04em';
    container.appendChild(heading);

    fields.forEach(function (field) {
      var row = document.createElement('label');
      row.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:4px;cursor:pointer;font-size:12px;color:#ccc';

      var cb = document.createElement('input');
      cb.type    = 'checkbox';
      cb.checked = hiddenSet.has(field.key);
      cb.addEventListener('change', function () {
        if (cb.checked) hiddenSet.add(field.key);
        else            hiddenSet.delete(field.key);
        onChange(Array.from(hiddenSet));
      });

      row.appendChild(cb);
      row.appendChild(document.createTextNode(field.label + ' (' + field.key + ')'));
      container.appendChild(row);
    });
  }

  // ── Wire into the Elementor panel ─────────────────────────────────────────

  function wirePanel(view) {
    // Give Elementor a moment to finish rendering the panel DOM
    setTimeout(function () {
      var panel = document.querySelector('#elementor-panel');
      if (!panel) return;

      // Find the hidden_fields input Elementor renders (type=hidden)
      var hiddenInput = panel.querySelector('input[data-setting="hidden_fields"]');
      if (!hiddenInput) return;

      // Don't double-inject
      if (panel.querySelector('#' + UI_ID)) return;

      var collectionSelect = panel.querySelector('select[data-setting="collection"]');
      if (!collectionSelect) return;

      // Container injected right after the collection select row
      var ui = document.createElement('div');
      ui.id = UI_ID;
      ui.style.cssText = 'padding:8px 0 4px';
      collectionSelect.closest('.elementor-control') .insertAdjacentElement('afterend', ui);

      function refresh(collectionKey) {
        ui.innerHTML = '<p style="color:#aaa;font-size:11px;margin:4px 0">Loading fields…</p>';
        if (!collectionKey) { ui.innerHTML = ''; return; }

        var hiddenSet = new Set();
        try {
          var parsed = JSON.parse(hiddenInput.value || '[]');
          if (Array.isArray(parsed)) parsed.forEach(function (k) { hiddenSet.add(k); });
        } catch (_) {}

        fetchFields(collectionKey, function (fields) {
          buildUI(ui, fields, hiddenSet, function (newHidden) {
            var json = JSON.stringify(newHidden);
            // Update the hidden input and trigger Elementor's change detection
            hiddenInput.value = json;
            hiddenInput.dispatchEvent(new Event('input',  { bubbles: true }));
            hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
          });
        });
      }

      refresh(collectionSelect.value);

      collectionSelect.addEventListener('change', function () {
        fieldCache = {}; // bust cache on collection switch
        refresh(collectionSelect.value);
      });
    }, 300);
  }

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  window.addEventListener('load', function () {
    if (!window.elementor) return;

    elementor.hooks.addAction('panel/open_editor/widget/gateway_grid', function (panel, model, view) {
      wirePanel(view);
    });

    // Also wire when panel section changes (user navigates between tabs)
    elementor.hooks.addAction('panel/section/opened', function () {
      wirePanel(null);
    });
  });
}());
