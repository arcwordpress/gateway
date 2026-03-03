/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./hoc/with-inspector-controls.js"
/*!****************************************!*\
  !*** ./hoc/with-inspector-controls.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);
/**
 * Higher Order Component for adding inspector controls to blocks that opt-in
 *
 * Blocks can opt-in by adding to their block.json:
 * "supports": {
 *   "gtsInspectorControls": {
 *     "gap": true
 *   }
 * }
 *
 * The HOC transparently adds the controls and applies styles without requiring
 * any changes to the block implementation.
 */






/**
 * Check if a block has opted into GTS inspector controls
 *
 * @param {string} blockName - The block name
 * @returns {Object|null} - The inspector controls config or null
 */

const getInspectorControlsConfig = blockName => {
  const settings = wp.blocks.getBlockType(blockName);
  console.log('[GTS HOC] Checking block:', blockName);
  console.log('[GTS HOC] Block settings:', settings);
  console.log('[GTS HOC] Supports:', settings?.supports);
  console.log('[GTS HOC] gtsInspectorControls:', settings?.supports?.gtsInspectorControls);
  if (!settings?.supports?.gtsInspectorControls) {
    console.log('[GTS HOC] Block did not opt-in, skipping');
    return null;
  }
  console.log('[GTS HOC] Block opted in! Config:', settings.supports.gtsInspectorControls);
  return settings.supports.gtsInspectorControls;
};

/**
 * Higher Order Component that adds inspector controls
 * This only adds the UI controls - style application is handled by filters in index.js
 */
const withInspectorControls = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_3__.createHigherOrderComponent)(BlockEdit => {
  return props => {
    const {
      name: blockName,
      attributes,
      setAttributes
    } = props;
    console.log('[GTS HOC] withInspectorControls called for:', blockName);
    console.log('[GTS HOC] Props:', props);
    const config = getInspectorControlsConfig(blockName);

    // If block hasn't opted in, return original component
    if (!config) {
      console.log('[GTS HOC] No config, returning original BlockEdit');
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(BlockEdit, {
        ...props
      });
    }
    console.log('[GTS HOC] Config found! Will add controls');
    console.log('[GTS HOC] Gap support:', config.gap);

    // Get current style attribute or initialize empty object
    const currentStyle = attributes.style || {};
    const currentSpacing = currentStyle.spacing || {};
    const currentGap = currentSpacing.blockGap || '';
    const currentDisplay = currentStyle.display || '';

    /**
     * Update the gap value in the style attribute
     */
    const setGap = value => {
      const newStyle = {
        ...currentStyle,
        spacing: {
          ...currentSpacing,
          blockGap: value
        }
      };

      // Clean up empty objects
      if (!newStyle.spacing.blockGap) {
        delete newStyle.spacing.blockGap;
      }
      if (Object.keys(newStyle.spacing || {}).length === 0) {
        delete newStyle.spacing;
      }
      setAttributes({
        style: Object.keys(newStyle).length > 0 ? newStyle : undefined
      });
    };

    /**
     * Update the display value in the style attribute
     */
    const setDisplay = value => {
      const newStyle = {
        ...currentStyle,
        display: value
      };

      // Clean up if empty
      if (!newStyle.display) {
        delete newStyle.display;
      }
      setAttributes({
        style: Object.keys(newStyle).length > 0 ? newStyle : undefined
      });
    };

    /**
     * Parse gap value to number (assumes px unit)
     */
    const parseGapValue = gap => {
      if (!gap) return 0;
      const match = gap.match(/^(\d+)px$/);
      return match ? parseInt(match[1], 10) : 0;
    };

    /**
     * Format number to gap string
     */
    const formatGapValue = num => {
      return num > 0 ? `${num}px` : '';
    };
    const gapValue = parseGapValue(currentGap);
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.Fragment, {
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(BlockEdit, {
        ...props
      }), config.gap && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.InspectorControls, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('GTS Layout Controls', 'gateway'),
          initialOpen: false,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.RangeControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Gap', 'gateway'),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Set the gap between child elements (CSS gap property)', 'gateway'),
            value: gapValue,
            onChange: value => setGap(formatGapValue(value)),
            min: 0,
            max: 100,
            step: 1,
            allowReset: true,
            resetFallbackValue: 0
          }), gapValue > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
            style: {
              marginTop: '8px',
              fontSize: '12px',
              color: '#757575'
            },
            children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Current value:', 'gateway'), " ", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("code", {
              children: currentGap
            })]
          })]
        })
      }), config.display && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__.InspectorControls, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.PanelBody, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('GTS Display Controls', 'gateway'),
          initialOpen: false,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_1__.SelectControl, {
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Display', 'gateway'),
            help: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Set the CSS display property', 'gateway'),
            value: currentDisplay,
            onChange: setDisplay,
            options: [{
              label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Default', 'gateway'),
              value: ''
            }, {
              label: 'block',
              value: 'block'
            }, {
              label: 'inline',
              value: 'inline'
            }, {
              label: 'inline-block',
              value: 'inline-block'
            }, {
              label: 'flex',
              value: 'flex'
            }, {
              label: 'inline-flex',
              value: 'inline-flex'
            }, {
              label: 'grid',
              value: 'grid'
            }, {
              label: 'inline-grid',
              value: 'inline-grid'
            }, {
              label: 'flow-root',
              value: 'flow-root'
            }, {
              label: 'none',
              value: 'none'
            }, {
              label: 'contents',
              value: 'contents'
            }, {
              label: 'table',
              value: 'table'
            }, {
              label: 'table-row',
              value: 'table-row'
            }, {
              label: 'table-cell',
              value: 'table-cell'
            }]
          }), currentDisplay && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("div", {
            style: {
              marginTop: '8px',
              fontSize: '12px',
              color: '#757575'
            },
            children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Current value:', 'gateway'), " ", /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("code", {
              children: currentDisplay
            })]
          })]
        })
      })]
    });
  };
}, 'withInspectorControls');
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (withInspectorControls);

/***/ },

/***/ "@wordpress/block-editor"
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
(module) {

module.exports = window["wp"]["blockEditor"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/compose"
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["compose"];

/***/ },

/***/ "@wordpress/hooks"
/*!*******************************!*\
  !*** external ["wp","hooks"] ***!
  \*******************************/
(module) {

module.exports = window["wp"]["hooks"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "react/jsx-runtime"
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./hoc/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _with_inspector_controls__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./with-inspector-controls */ "./hoc/with-inspector-controls.js");
/**
 * Register the Inspector Controls HOC with WordPress filters
 *
 * This applies the HOC to all blocks in the editor.
 * Individual blocks can opt-in by configuring their block.json supports.
 *
 * Blocks call useGTSStyles() hook to receive HOC-injected styles.
 * The HOC provides inspector controls, and blocks apply the styles
 * via the hook without needing to know what specific styles are injected.
 */



console.log('[GTS HOC] Registering inspector controls HOC');
console.log('[GTS HOC] withInspectorControls:', _with_inspector_controls__WEBPACK_IMPORTED_MODULE_1__["default"]);

/**
 * Apply the HOC to all block Edit components
 * Adds the inspector controls UI
 */
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('editor.BlockEdit', 'gateway/with-inspector-controls', _with_inspector_controls__WEBPACK_IMPORTED_MODULE_1__["default"], 10);
console.log('[GTS HOC] Filter registered successfully');
})();

/******/ })()
;
//# sourceMappingURL=index.js.map