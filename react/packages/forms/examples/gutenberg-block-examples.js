/**
 * Gateway Fields in Gutenberg Blocks - Usage Examples
 *
 * This file demonstrates various patterns for using Gateway Fields
 * in Gutenberg block InspectorControls.
 */

import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

// Import Gateway Forms components
import {
  GutenbergFieldProvider,
  GutenbergField,
  GutenbergFieldGroup,
  useGutenbergField,
  useFieldType
} from '@arcwp/gateway-forms';

/**
 * EXAMPLE 1: Simple Batch Rendering
 *
 * Use GutenbergFieldGroup for simple cases where you want to render
 * all fields in a linear layout without custom organization.
 */
registerBlockType('gateway/example-simple', {
  attributes: {
    title: { type: 'string', default: '' },
    description: { type: 'string', default: '' },
    showAuthor: { type: 'boolean', default: false },
  },

  edit: ({ attributes, setAttributes }) => {
    const blockProps = useBlockProps();

    // Define fields using JSON config
    const fields = [
      {
        name: 'title',
        type: 'text',
        label: __('Block Title', 'gateway'),
        help: __('The main title for this block', 'gateway')
      },
      {
        name: 'description',
        type: 'textarea',
        label: __('Description', 'gateway'),
        rows: 4
      },
      {
        name: 'showAuthor',
        type: 'checkbox',
        label: __('Show Author', 'gateway')
      }
    ];

    return (
      <>
        <InspectorControls>
          <PanelBody title={__('Block Settings', 'gateway')}>
            {/* Simple batch rendering - all fields in one go */}
            <GutenbergFieldGroup
              fields={fields}
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </PanelBody>
        </InspectorControls>

        <div {...blockProps}>
          <h2>{attributes.title || __('Untitled', 'gateway')}</h2>
          <p>{attributes.description}</p>
        </div>
      </>
    );
  },

  save: ({ attributes }) => {
    return (
      <div>
        <h2>{attributes.title}</h2>
        <p>{attributes.description}</p>
      </div>
    );
  }
});

/**
 * EXAMPLE 2: Individual Fields with Custom Layout
 *
 * Use GutenbergFieldProvider + individual fields for complex layouts
 * with multiple panels, tabs, or custom organization.
 */
registerBlockType('gateway/example-complex', {
  attributes: {
    title: { type: 'string', default: '' },
    subtitle: { type: 'string', default: '' },
    layout: { type: 'string', default: 'grid' },
    columns: { type: 'number', default: 3 },
    showMeta: { type: 'boolean', default: true },
    bgColor: { type: 'string', default: '#ffffff' },
    textColor: { type: 'string', default: '#000000' },
  },

  edit: ({ attributes, setAttributes }) => {
    const blockProps = useBlockProps();

    // Define field configs
    const contentFields = {
      title: {
        name: 'title',
        type: 'text',
        label: __('Title', 'gateway'),
        help: __('Main heading text', 'gateway')
      },
      subtitle: {
        name: 'subtitle',
        type: 'text',
        label: __('Subtitle', 'gateway'),
        help: __('Secondary heading text', 'gateway')
      }
    };

    const layoutFields = {
      layout: {
        name: 'layout',
        type: 'select',
        label: __('Layout', 'gateway'),
        options: [
          { value: 'grid', label: __('Grid', 'gateway') },
          { value: 'list', label: __('List', 'gateway') },
          { value: 'masonry', label: __('Masonry', 'gateway') }
        ]
      },
      columns: {
        name: 'columns',
        type: 'number',
        label: __('Columns', 'gateway'),
        min: 1,
        max: 6
      },
      showMeta: {
        name: 'showMeta',
        type: 'checkbox',
        label: __('Show Metadata', 'gateway')
      }
    };

    const styleFields = {
      bgColor: {
        name: 'bgColor',
        type: 'color-picker',
        label: __('Background Color', 'gateway')
      },
      textColor: {
        name: 'textColor',
        type: 'color-picker',
        label: __('Text Color', 'gateway')
      }
    };

    return (
      <>
        <InspectorControls>
          {/* Wrap all panels with GutenbergFieldProvider once */}
          <GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>

            {/* Panel 1: Content Settings */}
            <PanelBody title={__('Content Settings', 'gateway')} initialOpen={true}>
              <GutenbergField config={contentFields.title} attributes={attributes} />
              <GutenbergField config={contentFields.subtitle} attributes={attributes} />
            </PanelBody>

            {/* Panel 2: Layout Settings */}
            <PanelBody title={__('Layout Settings', 'gateway')} initialOpen={false}>
              <GutenbergField config={layoutFields.layout} attributes={attributes} />
              <GutenbergField config={layoutFields.columns} attributes={attributes} />
              <GutenbergField config={layoutFields.showMeta} attributes={attributes} />
            </PanelBody>

            {/* Panel 3: Style Settings */}
            <PanelBody title={__('Style Settings', 'gateway')} initialOpen={false}>
              <GutenbergField config={styleFields.bgColor} attributes={attributes} />
              <GutenbergField config={styleFields.textColor} attributes={attributes} />
            </PanelBody>

          </GutenbergFieldProvider>
        </InspectorControls>

        <div {...blockProps}>
          <div style={{ backgroundColor: attributes.bgColor, color: attributes.textColor }}>
            <h2>{attributes.title}</h2>
            <h3>{attributes.subtitle}</h3>
            <p>Layout: {attributes.layout}, Columns: {attributes.columns}</p>
          </div>
        </div>
      </>
    );
  },

  save: ({ attributes }) => {
    return (
      <div style={{ backgroundColor: attributes.bgColor, color: attributes.textColor }}>
        <h2>{attributes.title}</h2>
        <h3>{attributes.subtitle}</h3>
      </div>
    );
  }
});

/**
 * EXAMPLE 3: Advanced - Tabs with Individual Field Rendering
 *
 * Use GutenbergFieldProvider with TabPanel for tabbed interface.
 * Demonstrates maximum flexibility with individual field rendering.
 */
registerBlockType('gateway/example-tabs', {
  attributes: {
    title: { type: 'string', default: '' },
    description: { type: 'string', default: '' },
    layout: { type: 'string', default: 'grid' },
    columns: { type: 'number', default: 3 },
    bgColor: { type: 'string', default: '#ffffff' },
    textColor: { type: 'string', default: '#000000' },
  },

  edit: ({ attributes, setAttributes }) => {
    const blockProps = useBlockProps();

    return (
      <>
        <InspectorControls>
          <GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
            <TabPanel
              className="gateway-block-tabs"
              activeClass="active-tab"
              tabs={[
                {
                  name: 'content',
                  title: __('Content', 'gateway'),
                  className: 'tab-content',
                },
                {
                  name: 'layout',
                  title: __('Layout', 'gateway'),
                  className: 'tab-layout',
                },
                {
                  name: 'style',
                  title: __('Style', 'gateway'),
                  className: 'tab-style',
                }
              ]}
            >
              {(tab) => {
                if (tab.name === 'content') {
                  return (
                    <>
                      <GutenbergField
                        config={{
                          name: 'title',
                          type: 'text',
                          label: __('Title', 'gateway')
                        }}
                        attributes={attributes}
                      />
                      <GutenbergField
                        config={{
                          name: 'description',
                          type: 'textarea',
                          label: __('Description', 'gateway'),
                          rows: 4
                        }}
                        attributes={attributes}
                      />
                    </>
                  );
                }

                if (tab.name === 'layout') {
                  return (
                    <>
                      <GutenbergField
                        config={{
                          name: 'layout',
                          type: 'select',
                          label: __('Layout Type', 'gateway'),
                          options: [
                            { value: 'grid', label: 'Grid' },
                            { value: 'list', label: 'List' }
                          ]
                        }}
                        attributes={attributes}
                      />
                      <GutenbergField
                        config={{
                          name: 'columns',
                          type: 'number',
                          label: __('Columns', 'gateway'),
                          min: 1,
                          max: 6
                        }}
                        attributes={attributes}
                      />
                    </>
                  );
                }

                if (tab.name === 'style') {
                  return (
                    <>
                      <GutenbergField
                        config={{
                          name: 'bgColor',
                          type: 'color-picker',
                          label: __('Background Color', 'gateway')
                        }}
                        attributes={attributes}
                      />
                      <GutenbergField
                        config={{
                          name: 'textColor',
                          type: 'color-picker',
                          label: __('Text Color', 'gateway')
                        }}
                        attributes={attributes}
                      />
                    </>
                  );
                }
              }}
            </TabPanel>
          </GutenbergFieldProvider>
        </InspectorControls>

        <div {...blockProps}>
          <h2>{attributes.title}</h2>
          <p>{attributes.description}</p>
        </div>
      </>
    );
  },

  save: ({ attributes }) => {
    return (
      <div>
        <h2>{attributes.title}</h2>
        <p>{attributes.description}</p>
      </div>
    );
  }
});

/**
 * EXAMPLE 4: Using useFieldType directly for maximum control
 *
 * This shows how to use useFieldType hook directly when you need
 * full control over field rendering and composition.
 */
registerBlockType('gateway/example-advanced', {
  attributes: {
    firstName: { type: 'string', default: '' },
    lastName: { type: 'string', default: '' },
    email: { type: 'string', default: '' },
  },

  edit: ({ attributes, setAttributes }) => {
    const blockProps = useBlockProps();

    // Individual field configs
    const firstNameConfig = {
      name: 'firstName',
      type: 'text',
      label: __('First Name', 'gateway')
    };

    const lastNameConfig = {
      name: 'lastName',
      type: 'text',
      label: __('Last Name', 'gateway')
    };

    const emailConfig = {
      name: 'email',
      type: 'email',
      label: __('Email', 'gateway')
    };

    // Use useFieldType to get field components
    const { Input: FirstNameField } = useFieldType(firstNameConfig);
    const { Input: LastNameField } = useFieldType(lastNameConfig);
    const { Input: EmailField } = useFieldType(emailConfig);

    return (
      <>
        <InspectorControls>
          <GutenbergFieldProvider attributes={attributes} setAttributes={setAttributes}>
            <PanelBody title={__('User Information', 'gateway')}>

              {/* Custom layout - fields side by side */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <FirstNameField
                    config={firstNameConfig}
                    value={attributes.firstName}
                    defaultValue={attributes.firstName}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <LastNameField
                    config={lastNameConfig}
                    value={attributes.lastName}
                    defaultValue={attributes.lastName}
                  />
                </div>
              </div>

              {/* Full width email field */}
              <EmailField
                config={emailConfig}
                value={attributes.email}
                defaultValue={attributes.email}
              />

            </PanelBody>
          </GutenbergFieldProvider>
        </InspectorControls>

        <div {...blockProps}>
          <p>Name: {attributes.firstName} {attributes.lastName}</p>
          <p>Email: {attributes.email}</p>
        </div>
      </>
    );
  },

  save: ({ attributes }) => {
    return (
      <div>
        <p>Name: {attributes.firstName} {attributes.lastName}</p>
        <p>Email: {attributes.email}</p>
      </div>
    );
  }
});
