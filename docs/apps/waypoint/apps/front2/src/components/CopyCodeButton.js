import { useState } from '@wordpress/element';

/**
 * CopyCodeButton Component
 *
 * Self-contained button for copying code to clipboard.
 * Uses BEM methodology for styling.
 *
 * @param {Object} props
 * @param {string} props.code - The code text to copy
 */
function CopyCodeButton({ code }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    const buttonClass = copied
        ? 'code-block-wrapper__button code-block-wrapper__button--copied'
        : 'code-block-wrapper__button';

    return (
        <button
            onClick={handleCopy}
            className={buttonClass}
            aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
        >
            {copied ? (
                <span className="code-block-wrapper__button-content">
                    <svg
                        className="code-block-wrapper__button-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    Copied!
                </span>
            ) : (
                <span className="code-block-wrapper__button-content">
                    <svg
                        className="code-block-wrapper__button-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                    Copy
                </span>
            )}
        </button>
    );
}

export default CopyCodeButton;
