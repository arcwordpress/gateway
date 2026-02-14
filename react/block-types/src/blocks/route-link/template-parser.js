/**
 * Template parser utility for route-link block
 * Parses path templates with placeholder syntax like: /course/{item.slug}
 */

/**
 * Parses a path template and extracts placeholder tokens
 *
 * @param {string} template - The template string with placeholders
 * @returns {Object} Object containing tokens array and parts array
 *
 * @example
 * parsePathTemplate("/course/{item.slug}")
 * // Returns: { tokens: ["item.slug"], parts: ["/course/", ""] }
 *
 * @example
 * parsePathTemplate("/blog/{item.category}/{item.slug}")
 * // Returns: { tokens: ["item.category", "item.slug"], parts: ["/blog/", "/", ""] }
 */
export function parsePathTemplate(template) {
	if (!template || typeof template !== 'string') {
		return { tokens: [], parts: [''] };
	}

	const tokens = [];
	const regex = /\{([^}]+)\}/g;
	let match;

	// Extract all tokens from the template
	while ((match = regex.exec(template)) !== null) {
		tokens.push(match[1].trim());
	}

	// Split template into parts around placeholders
	// Example: "/course/{item.slug}" -> ["/course/", ""]
	const parts = template.split(/\{[^}]+\}/);

	return { tokens, parts };
}

/**
 * Generates a unique ID for template data context
 * Used to create unique identifiers for template instances
 *
 * @returns {string} A unique template ID
 */
export function generateTemplateId() {
	return `tpl_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validates a path template
 * Checks for balanced braces and valid token syntax
 *
 * @param {string} template - The template string to validate
 * @returns {Object} Object with isValid boolean and errors array
 */
export function validatePathTemplate(template) {
	const errors = [];

	if (!template) {
		return { isValid: true, errors };
	}

	// Check for balanced braces
	const openBraces = (template.match(/\{/g) || []).length;
	const closeBraces = (template.match(/\}/g) || []).length;

	if (openBraces !== closeBraces) {
		errors.push('Unbalanced braces in template');
	}

	// Check for empty tokens
	if (/\{\s*\}/.test(template)) {
		errors.push('Empty placeholder found');
	}

	// Check for nested braces
	if (/\{[^}]*\{/.test(template)) {
		errors.push('Nested braces are not supported');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}
