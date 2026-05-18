(function () {
  'use strict';

  var blocks      = wp.blocks;
  var blockEditor = wp.blockEditor;
  var components  = wp.components;
  var el          = wp.element.createElement;
  var Fragment    = wp.element.Fragment;
  var __          = wp.i18n.__;

  var InspectorControls = blockEditor.InspectorControls;
  var useBlockProps     = blockEditor.useBlockProps;
  var PanelBody         = components.PanelBody;
  var TextControl       = components.TextControl;
  var SelectControl     = components.SelectControl;
  var ToggleControl     = components.ToggleControl;
  var RangeControl      = components.RangeControl;

  blocks.registerBlockType('gateway/grid', {

    edit: function (props) {
      var attrs       = props.attributes;
      var setAttrs    = props.setAttributes;
      var blockProps  = useBlockProps({ className: 'gateway-grid-block-editor-preview' });

      var actionRolesStr = (attrs.actionRoles || ['administrator']).join(', ');

      return el(Fragment, null,

        el(InspectorControls, null,

          // ── Grid Display ───────────────────────────────────────
          el(PanelBody, { title: __('Grid Display', 'gateway'), initialOpen: true },

            el(TextControl, {
              label:    __('Collection Key', 'gateway'),
              help:     __('The key of the Gateway collection to display.', 'gateway'),
              value:    attrs.collection,
              onChange: function (v) { setAttrs({ collection: v }); },
            }),

            el(RangeControl, {
              label:    __('Per Page', 'gateway'),
              help:     __('Set to 0 to show all records.', 'gateway'),
              value:    attrs.perPage,
              min:      0,
              max:      200,
              onChange: function (v) { setAttrs({ perPage: v }); },
            }),

            el(SelectControl, {
              label:    __('Color Scheme', 'gateway'),
              value:    attrs.colorScheme,
              options:  [
                { label: 'Light', value: 'light' },
                { label: 'Dark',  value: 'dark' },
              ],
              onChange: function (v) { setAttrs({ colorScheme: v }); },
            }),

            el(SelectControl, {
              label:    __('Default View', 'gateway'),
              value:    attrs.defaultView,
              options:  [
                { label: 'Table', value: 'table' },
                { label: 'List',  value: 'list'  },
                { label: 'Cards', value: 'cards' },
              ],
              onChange: function (v) { setAttrs({ defaultView: v }); },
            }),

            el(ToggleControl, {
              label:    __('Show Filters', 'gateway'),
              checked:  attrs.showFilters,
              onChange: function (v) { setAttrs({ showFilters: v }); },
            }),

            attrs.showFilters && el(ToggleControl, {
              label:    __('Show Facet Toggle', 'gateway'),
              checked:  attrs.showFacetToggle,
              onChange: function (v) { setAttrs({ showFacetToggle: v }); },
            })
          ),

          // ── Views ──────────────────────────────────────────────
          el(PanelBody, { title: __('Views', 'gateway'), initialOpen: false },

            el(ToggleControl, {
              label:    __('Table View', 'gateway'),
              checked:  attrs.enableTableView,
              onChange: function (v) { setAttrs({ enableTableView: v }); },
            }),
            el(ToggleControl, {
              label:    __('List View', 'gateway'),
              checked:  attrs.enableListView,
              onChange: function (v) { setAttrs({ enableListView: v }); },
            }),
            el(ToggleControl, {
              label:    __('Cards View', 'gateway'),
              checked:  attrs.enableCardsView,
              onChange: function (v) { setAttrs({ enableCardsView: v }); },
            })
          ),

          // ── Single Record View ─────────────────────────────────
          el(PanelBody, { title: __('Single Record View', 'gateway'), initialOpen: false },

            el(SelectControl, {
              label:    __('On Row Click', 'gateway'),
              value:    attrs.recordViewMode,
              options:  [
                { label: 'Open Modal',          value: 'modal'    },
                { label: 'Link to Single Page', value: 'link'     },
                { label: 'Disabled',            value: 'disabled' },
              ],
              onChange: function (v) { setAttrs({ recordViewMode: v }); },
            }),

            attrs.recordViewMode === 'link' && el(TextControl, {
              label:       __('Link Pattern', 'gateway'),
              help:        __('Use {{record.field}} tokens — e.g. {{record.slug}}', 'gateway'),
              placeholder: '/listings/{{record.id}}',
              value:       attrs.recordLinkPattern,
              onChange:    function (v) { setAttrs({ recordLinkPattern: v }); },
            })
          ),

          // ── Actions ────────────────────────────────────────────
          el(PanelBody, { title: __('Actions', 'gateway'), initialOpen: false },

            el(ToggleControl, {
              label:    __('Enable Actions', 'gateway'),
              checked:  attrs.actionsEnabled,
              onChange: function (v) { setAttrs({ actionsEnabled: v }); },
            }),

            attrs.actionsEnabled && el(TextControl, {
              label:    __('Visible to Roles', 'gateway'),
              help:     __('Comma-separated role slugs, e.g. administrator,editor', 'gateway'),
              value:    actionRolesStr,
              onChange: function (v) {
                setAttrs({ actionRoles: v.split(',').map(function (r) { return r.trim(); }).filter(Boolean) });
              },
            }),

            attrs.actionsEnabled && el(ToggleControl, {
              label:    __('Enable Create', 'gateway'),
              checked:  attrs.createActionEnabled,
              onChange: function (v) { setAttrs({ createActionEnabled: v }); },
            }),

            attrs.actionsEnabled && el(ToggleControl, {
              label:    __('Enable Update', 'gateway'),
              checked:  attrs.updateActionEnabled,
              onChange: function (v) { setAttrs({ updateActionEnabled: v }); },
            }),

            attrs.actionsEnabled && el(ToggleControl, {
              label:    __('Enable Delete', 'gateway'),
              checked:  attrs.deleteActionEnabled,
              onChange: function (v) { setAttrs({ deleteActionEnabled: v }); },
            })
          )
        ),

        // ── Editor preview placeholder ─────────────────────────
        el('div', blockProps,
          el('div', { className: 'gateway-grid-block-placeholder' },
            el('div', { className: 'gateway-grid-block-placeholder__label' }, 'Grid Display'),
            attrs.collection
              ? el('div', { className: 'gateway-grid-block-placeholder__key' }, attrs.collection)
              : el('div', { className: 'gateway-grid-block-placeholder__hint' },
                  'Select a collection in the block settings.'
                )
          )
        )
      );
    },

    save: function () {
      return null; // server-side rendered
    },
  });

}());
