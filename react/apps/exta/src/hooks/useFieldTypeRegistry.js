import { useContext } from 'react';
import { FieldTypesContext } from '../context/FieldTypesContext';

export const useFieldTypeRegistry = () => {
  const context = useContext(FieldTypesContext);
  
  if (!context) {
    throw new Error('useFieldTypeRegistry must be used within FieldTypesProvider');
  }

  return context;
};
