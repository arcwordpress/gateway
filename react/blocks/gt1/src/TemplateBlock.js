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

    // Split on <InnerBlocks /> to handle it specially
    const parts = cleaned.split(/<InnerBlocks\s*\/?>/i);

    if (parts.length === 1) {
        // No InnerBlocks found, just parse as HTML
        return parse(cleaned);
    }

    // We have InnerBlocks - parse each part and inject InnerBlocks component
    return parts.map((part, index) => {
        if (index === parts.length - 1) {
            // Last part - no InnerBlocks after it
            return <span key={index}>{parse(part)}</span>;
        }

        // Parse this part and add InnerBlocks after it
        return (
            <span key={index}>
                {parse(part)}
                <InnerBlocks />
            </span>
        );
    });
}
