import { createElement } from '@wordpress/element';
import { useState, useEffect } from '@wordpress/element';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import './style.css';

/**
 * WysiwygInput Component
 * Renders a WYSIWYG editor using TipTap
 */
export const WysiwygInput = ({ config = {}, error, register, setValue, watch, ...inputProps }) => {
    const name = inputProps.name || config.name;
    if (!name) {
        console.warn('WysiwygInput: No "name" provided in props or config');
        return null;
    }

    const {
        label = '',
        help = '',
        default: defaultValue = '',
        placeholder = 'Start typing...'
    } = config;

    const currentValue = watch(name);

    // Initialize value on mount
    useEffect(() => {
        register(name);

        if (defaultValue && !currentValue) {
            setValue(name, defaultValue);
        }
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: currentValue || defaultValue || '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            if (setValue) {
                setValue(name, html);
            }
        },
    });

    // Update editor content when external value changes
    useEffect(() => {
        if (editor && currentValue !== editor.getHTML()) {
            editor.commands.setContent(currentValue || '');
        }
    }, [currentValue, editor]);

    if (!editor) {
        return (
            <div className="wysiwyg-field">
                {label && <label className="wysiwyg-field__label">{label}</label>}
                <div className="wysiwyg-field__loading">Loading editor...</div>
            </div>
        );
    }

    return (
        <div className="wysiwyg-field">
            {label && (
                <label htmlFor={name} className="wysiwyg-field__label">
                    {label}
                </label>
            )}

            <div className="wysiwyg-field__editor-container">
                <div className="wysiwyg-field__toolbar">
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`wysiwyg-field__toolbar-button ${editor.isActive('bold') ? 'wysiwyg-field__toolbar-button--active' : ''}`}
                        title="Bold"
                    >
                        <strong>B</strong>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`wysiwyg-field__toolbar-button ${editor.isActive('italic') ? 'wysiwyg-field__toolbar-button--active' : ''}`}
                        title="Italic"
                    >
                        <em>I</em>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={`wysiwyg-field__toolbar-button ${editor.isActive('underline') ? 'wysiwyg-field__toolbar-button--active' : ''}`}
                        title="Underline"
                    >
                        <u>U</u>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`wysiwyg-field__toolbar-button ${editor.isActive('strike') ? 'wysiwyg-field__toolbar-button--active' : ''}`}
                        title="Strikethrough"
                    >
                        <s>S</s>
                    </button>

                    <span className="wysiwyg-field__toolbar-separator" />

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`wysiwyg-field__toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'wysiwyg-field__toolbar-button--active' : ''}`}
                        title="Heading 2"
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`wysiwyg-field__toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'wysiwyg-field__toolbar-button--active' : ''}`}
                        title="Heading 3"
                    >
                        H3
                    </button>

                    <span className="wysiwyg-field__toolbar-separator" />

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`wysiwyg-field__toolbar-button ${editor.isActive('bulletList') ? 'wysiwyg-field__toolbar-button--active' : ''}`}
                        title="Bullet List"
                    >
                        •
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`wysiwyg-field__toolbar-button ${editor.isActive('orderedList') ? 'wysiwyg-field__toolbar-button--active' : ''}`}
                        title="Numbered List"
                    >
                        1.
                    </button>

                    <span className="wysiwyg-field__toolbar-separator" />

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={`wysiwyg-field__toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'wysiwyg-field__toolbar-button--active' : ''}`}
                        title="Align Left"
                    >
                        ⇤
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={`wysiwyg-field__toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'wysiwyg-field__toolbar-button--active' : ''}`}
                        title="Align Center"
                    >
                        ≡
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={`wysiwyg-field__toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'wysiwyg-field__toolbar-button--active' : ''}`}
                        title="Align Right"
                    >
                        ⇥
                    </button>

                    <span className="wysiwyg-field__toolbar-separator" />

                    <button
                        type="button"
                        onClick={() => {
                            const url = window.prompt('Enter URL:');
                            if (url) {
                                editor.chain().focus().setLink({ href: url }).run();
                            }
                        }}
                        className={`wysiwyg-field__toolbar-button ${editor.isActive('link') ? 'wysiwyg-field__toolbar-button--active' : ''}`}
                        title="Insert Link"
                    >
                        🔗
                    </button>

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        disabled={!editor.isActive('link')}
                        className="wysiwyg-field__toolbar-button"
                        title="Remove Link"
                    >
                        🔗✕
                    </button>
                </div>

                <EditorContent
                    editor={editor}
                    className="wysiwyg-field__content"
                />
            </div>

            {help && <p className="wysiwyg-field__help">{help}</p>}
            {error && <p className="wysiwyg-field__error">{error.message}</p>}
        </div>
    );
};

/**
 * WysiwygDisplay Component
 * Displays WYSIWYG content as rendered HTML
 */
export const WysiwygDisplay = ({ value, fieldConfig = {} }) => {
    const { label = '' } = fieldConfig;

    return (
        <div className="wysiwyg-field">
            {label && <span className="wysiwyg-field__label">{label}</span>}
            <div
                className="wysiwyg-field__display"
                dangerouslySetInnerHTML={{ __html: value || '<p class="wysiwyg-field__display--empty">No content</p>' }}
            />
        </div>
    );
};

/**
 * Field Definition for Registry
 */
export const wysiwygFieldDefinition = {
    type: 'wysiwyg',
    Input: WysiwygInput,
    Display: WysiwygDisplay,
    defaultConfig: {
        label: '',
        help: '',
        default: '',
        placeholder: 'Start typing...'
    }
};

/**
 * Custom Hook for WYSIWYG Field
 */
export const useWysiwygField = (fieldName, fieldConfig, formMethods) => {
    const { watch, setValue } = formMethods;
    const value = watch(fieldName);

    const clearContent = () => {
        setValue(fieldName, '');
    };

    const stripHtml = (html) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    return {
        value,
        clearContent,
        isEmpty: !value || stripHtml(value).trim() === '',
        plainText: stripHtml(value)
    };
};

export default WysiwygInput;
