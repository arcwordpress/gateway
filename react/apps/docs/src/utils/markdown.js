/**
 * Markdown utility functions
 */

/**
 * Strip markdown formatting and extract plain text
 * Useful for creating excerpts/previews
 *
 * @param {string} markdown - Markdown text
 * @returns {string} - Plain text without markdown formatting
 */
export function stripMarkdown(markdown) {
    if (!markdown) return '';

    let text = markdown;

    // Remove code blocks (fenced with triple backticks)
    text = text.replace(/```[\s\S]*?```/g, '');

    // Remove inline code
    text = text.replace(/`([^`]+)`/g, '$1');

    // Remove headings
    text = text.replace(/^#{1,6}\s+/gm, '');

    // Remove bold/italic
    text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
    text = text.replace(/(\*|_)(.*?)\1/g, '$2');

    // Remove links [text](url)
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove images ![alt](url)
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

    // Remove blockquotes
    text = text.replace(/^>\s+/gm, '');

    // Remove horizontal rules
    text = text.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '');

    // Remove list markers
    text = text.replace(/^[\s]*[-*+]\s+/gm, '');
    text = text.replace(/^\s*\d+\.\s+/gm, '');

    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Collapse multiple newlines into single space
    text = text.replace(/\n+/g, ' ');

    // Collapse multiple spaces
    text = text.replace(/\s+/g, ' ');

    // Trim
    text = text.trim();

    return text;
}

/**
 * Create an excerpt from markdown content
 *
 * @param {string} markdown - Markdown text
 * @param {number} maxLength - Maximum length of excerpt (default 150)
 * @returns {string} - Excerpt with ellipsis if truncated
 */
export function createExcerpt(markdown, maxLength = 150) {
    const plainText = stripMarkdown(markdown);

    if (plainText.length <= maxLength) {
        return plainText;
    }

    // Find the last space before maxLength to avoid cutting words
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 0) {
        return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
}
