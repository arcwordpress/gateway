import React, { createContext, useState, useEffect } from 'react';

export const FieldTypesContext = createContext();

export const FieldTypesProvider = ({ children }) => {
  const [fieldTypes, setFieldTypes] = useState([]);
  const [fieldTypeMap, setFieldTypeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch field types once on mount
    const fetchFieldTypes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/wp-json/gateway/v1/field-types', {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': window.gatewayAdminScript?.nonce || '',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch field types');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          // Create a map for easy lookup by type
          const map = {};
          const types = [];
          
          result.data.forEach(fieldType => {
            map[fieldType.type] = fieldType;
            types.push(fieldType.type);
          });

          setFieldTypes(types);
          setFieldTypeMap(map);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching field types:', err);
        setError(err.message);
        setFieldTypes([]);
        setFieldTypeMap({});
      } finally {
        setLoading(false);
      }
    };

    fetchFieldTypes();
  }, []);

  const getFieldTypeConfig = (type) => {
    return fieldTypeMap[type] || null;
  };

  const value = {
    fieldTypes,
    fieldTypeMap,
    loading,
    error,
    getFieldTypeConfig,
  };

  return (
    <FieldTypesContext.Provider value={value}>
      {children}
    </FieldTypesContext.Provider>
  );
};
