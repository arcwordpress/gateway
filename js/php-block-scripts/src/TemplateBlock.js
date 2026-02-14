import { useState, useEffect } from '@wordpress/element';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import apiFetch from '@wordpress/api-fetch';
import parse from 'html-react-parser';

/**
 * Component that parses PHP templates and renders them with InnerBlocks support
 */
export default function TemplateBlock({ blockName, attributes }) {
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const blockProps = useBlockProps();

    useEffect(() => {
        // Fetch the template content from the API
        const fetchTemplate = async () => {
            try {
                setLoading(true);
                const response = await apiFetch({
                    path: `/gateway/v1/blocks/${blockName}/template`,
                });
                setTemplate(response.template);
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Failed to load template');
                setLoading(false);
            }
        };

        fetchTemplate();
    }, [blockName]);

    if (loading) {
        return <div {...blockProps}>Loading template...</div>;
    }

    if (error) {
        return <div {...blockProps}>Error: {error}</div>;
    }

    if (!template) {
        return <div {...blockProps}>No template found</div>;
    }

    // Parse the PHP template into renderable content
    const parsedContent = parseTemplate(template);

    return <div {...blockProps}>{parsedContent}</div>;
}

/**
 * Parse PHP template string into React components
 * Handles <InnerBlocks /> replacement and HTML parsing
 */
function parseTemplate(templateString) {
    // Remove PHP opening tags and comments
    let cleaned = templateString
        .replace(/<\?php[\s\S]*?\?>/gi, '') // Remove PHP tags
        .trim();

    // Check if there's an InnerBlocks placeholder (with or without attributes)
    if (!/<InnerBlocks\b/i.test(cleaned)) {
        // No InnerBlocks found, just parse as HTML
        return parse(cleaned);
    }

    // Parse with custom replace function to handle InnerBlocks
    return parse(cleaned, {
        replace: (domNode) => {
            // Check if this is an InnerBlocks element
            if (domNode.type === 'tag' && domNode.name.toLowerCase() === 'innerblocks') {
                // Extract all attributes from the tag and convert them to React props
                const innerBlocksProps = parseInnerBlocksAttributes(domNode.attribs || {});
                return <InnerBlocks {...innerBlocksProps} />;
            }
        }
    });
}

/**
 * Parse InnerBlocks attributes from the HTML tag
 * Converts attribute strings to appropriate JavaScript values
 *
 * @param {Object} attribs - Attributes object from html-react-parser
 * @returns {Object} Parsed props for InnerBlocks component
 */
function parseInnerBlocksAttributes(attribs) {
    const props = {};

    for (const [key, value] of Object.entries(attribs)) {
        // Try to parse as JSON for array/object values
        if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try {
                props[key] = JSON.parse(value);
            } catch (e) {
                // If JSON parsing fails, use the string value
                console.warn(`Failed to parse InnerBlocks attribute "${key}" as JSON:`, e);
                props[key] = value;
            }
        }
        // Convert boolean strings to actual booleans
        else if (value === 'true') {
            props[key] = true;
        } else if (value === 'false') {
            props[key] = false;
        }
        // Pass through everything else as-is
        else {
            props[key] = value;
        }
    }

    return props;
}
