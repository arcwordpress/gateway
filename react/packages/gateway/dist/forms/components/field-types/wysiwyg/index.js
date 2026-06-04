function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { useEffect, useMemo } from 'react';
import { useGatewayForm } from "../../..";
import Field from "../../field";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import "./wysiwyg-style.css";

// @TODO Review the handling of buttons. Why are we providing the icons, doesn't TipTap have it's own buttons?
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
var WysiwygControl = _ref => {
  var _ref$config = _ref.config,
    config = _ref$config === void 0 ? {} : _ref$config;
  var _useGatewayForm = useGatewayForm(),
    register = _useGatewayForm.register,
    setValue = _useGatewayForm.setValue,
    watch = _useGatewayForm.watch,
    formState = _useGatewayForm.formState;
  var name = config.name;
  if (!name) {
    console.warn('WysiwygFieldTypeInput: No "name" provided in config');
    return null;
  }
  var fieldError = formState.errors[name];
  var _config$label = config.label,
    label = _config$label === void 0 ? '' : _config$label,
    _config$help = config.help,
    help = _config$help === void 0 ? '' : _config$help,
    _config$default = config.default,
    defaultValue = _config$default === void 0 ? '' : _config$default,
    _config$placeholder = config.placeholder,
    placeholder = _config$placeholder === void 0 ? 'Start typing...' : _config$placeholder;
  var currentValue = watch(name);
  useEffect(() => {
    register(name);
    if (defaultValue && !currentValue) {
      setValue(name, defaultValue);
    }
  }, []);
  var editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({
      openOnClick: false
    }), TextAlign.configure({
      types: ['heading', 'paragraph']
    })],
    content: currentValue || defaultValue || '',
    onUpdate: _ref2 => {
      var editor = _ref2.editor;
      var html = editor.getHTML();
      setValue(name, html, {
        shouldValidate: true
      });
    }
  });
  useEffect(() => {
    if (editor && currentValue !== editor.getHTML()) {
      editor.commands.setContent(currentValue || '');
    }
  }, [currentValue, editor]);
  if (!editor) {
    return /*#__PURE__*/_jsx("div", {
      className: "wysiwyg-field",
      children: /*#__PURE__*/_jsx("div", {
        className: "wysiwyg-field__loading",
        children: "Loading editor..."
      })
    });
  }
  return /*#__PURE__*/_jsxs("div", {
    className: "wysiwyg-field",
    children: [/*#__PURE__*/_jsxs("div", {
      className: "wysiwyg-field__editor-container",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "wysiwyg-field__toolbar",
        children: [/*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => editor.chain().focus().toggleBold().run(),
          className: "wysiwyg-field__toolbar-button ".concat(editor.isActive('bold') ? 'wysiwyg-field__toolbar-button--active' : ''),
          title: "Bold",
          children: /*#__PURE__*/_jsx("strong", {
            children: "B"
          })
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => editor.chain().focus().toggleItalic().run(),
          className: "wysiwyg-field__toolbar-button ".concat(editor.isActive('italic') ? 'wysiwyg-field__toolbar-button--active' : ''),
          title: "Italic",
          children: /*#__PURE__*/_jsx("em", {
            children: "I"
          })
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => editor.chain().focus().toggleUnderline().run(),
          className: "wysiwyg-field__toolbar-button ".concat(editor.isActive('underline') ? 'wysiwyg-field__toolbar-button--active' : ''),
          title: "Underline",
          children: /*#__PURE__*/_jsx("u", {
            children: "U"
          })
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => editor.chain().focus().toggleStrike().run(),
          className: "wysiwyg-field__toolbar-button ".concat(editor.isActive('strike') ? 'wysiwyg-field__toolbar-button--active' : ''),
          title: "Strikethrough",
          children: /*#__PURE__*/_jsx("s", {
            children: "S"
          })
        }), /*#__PURE__*/_jsx("span", {
          className: "wysiwyg-field__toolbar-separator"
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => editor.chain().focus().toggleHeading({
            level: 2
          }).run(),
          className: "wysiwyg-field__toolbar-button ".concat(editor.isActive('heading', {
            level: 2
          }) ? 'wysiwyg-field__toolbar-button--active' : ''),
          title: "Heading 2",
          children: "H2"
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => editor.chain().focus().toggleHeading({
            level: 3
          }).run(),
          className: "wysiwyg-field__toolbar-button ".concat(editor.isActive('heading', {
            level: 3
          }) ? 'wysiwyg-field__toolbar-button--active' : ''),
          title: "Heading 3",
          children: "H3"
        }), /*#__PURE__*/_jsx("span", {
          className: "wysiwyg-field__toolbar-separator"
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => editor.chain().focus().toggleBulletList().run(),
          className: "wysiwyg-field__toolbar-button ".concat(editor.isActive('bulletList') ? 'wysiwyg-field__toolbar-button--active' : ''),
          title: "Bullet List",
          children: "\u2022"
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
          className: "wysiwyg-field__toolbar-button ".concat(editor.isActive('orderedList') ? 'wysiwyg-field__toolbar-button--active' : ''),
          title: "Numbered List",
          children: "1."
        }), /*#__PURE__*/_jsx("span", {
          className: "wysiwyg-field__toolbar-separator"
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => editor.chain().focus().setTextAlign('left').run(),
          className: "wysiwyg-field__toolbar-button ".concat(editor.isActive({
            textAlign: 'left'
          }) ? 'wysiwyg-field__toolbar-button--active' : ''),
          title: "Align Left",
          children: "\u21E4"
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => editor.chain().focus().setTextAlign('center').run(),
          className: "wysiwyg-field__toolbar-button ".concat(editor.isActive({
            textAlign: 'center'
          }) ? 'wysiwyg-field__toolbar-button--active' : ''),
          title: "Align Center",
          children: "\u2261"
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => editor.chain().focus().setTextAlign('right').run(),
          className: "wysiwyg-field__toolbar-button ".concat(editor.isActive({
            textAlign: 'right'
          }) ? 'wysiwyg-field__toolbar-button--active' : ''),
          title: "Align Right",
          children: "\u21E5"
        }), /*#__PURE__*/_jsx("span", {
          className: "wysiwyg-field__toolbar-separator"
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => {
            var url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({
                href: url
              }).run();
            }
          },
          className: "wysiwyg-field__toolbar-button ".concat(editor.isActive('link') ? 'wysiwyg-field__toolbar-button--active' : ''),
          title: "Insert Link",
          children: "\uD83D\uDD17"
        }), /*#__PURE__*/_jsx("button", {
          type: "button",
          onClick: () => editor.chain().focus().unsetLink().run(),
          disabled: !editor.isActive('link'),
          className: "wysiwyg-field__toolbar-button",
          title: "Remove Link",
          children: "\uD83D\uDD17\u2715"
        })]
      }), /*#__PURE__*/_jsx(EditorContent, {
        editor: editor,
        className: "wysiwyg-field__content"
      })]
    }), help && /*#__PURE__*/_jsx("p", {
      className: "wysiwyg-field__help",
      children: help
    }), fieldError && /*#__PURE__*/_jsx("p", {
      className: "wysiwyg-field__error",
      children: fieldError.message
    })]
  });
};
var WysiwygFieldTypeInput = _ref3 => {
  var _ref3$config = _ref3.config,
    config = _ref3$config === void 0 ? {} : _ref3$config;
  return /*#__PURE__*/_jsx(Field, {
    config: config,
    fieldControl: /*#__PURE__*/_jsx(WysiwygControl, {
      config: config
    })
  });
};
var WysiwygFieldTypeDisplay = _ref4 => {
  var value = _ref4.value,
    config = _ref4.config;
  if (!value) {
    return /*#__PURE__*/_jsx("span", {
      className: "wysiwyg-field__display wysiwyg-field__display--empty",
      children: "-"
    });
  }
  return /*#__PURE__*/_jsx("div", {
    className: "wysiwyg-field__display",
    dangerouslySetInnerHTML: {
      __html: value
    }
  });
};
export var wysiwygFieldType = {
  type: 'wysiwyg',
  Input: WysiwygFieldTypeInput,
  Display: WysiwygFieldTypeDisplay,
  defaultConfig: {
    label: '',
    help: '',
    default: '',
    placeholder: 'Start typing...'
  }
};
export var useWysiwygField = config => {
  return useMemo(() => ({
    Input: props => /*#__PURE__*/_jsx(WysiwygFieldTypeInput, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    Display: props => /*#__PURE__*/_jsx(WysiwygFieldTypeDisplay, _objectSpread(_objectSpread({}, props), {}, {
      config: config
    })),
    utils: {
      stripHtml: html => {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      },
      isEmpty: value => !value || value.trim() === ''
    }
  }), [config]);
};