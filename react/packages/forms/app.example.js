import React from 'react';
import { AppForm } from '@arcwp/gateway-forms';
import { useTextField, useEmailField, useTextareaField } from '@arcwp/gateway-fields';

function MyProfileForm() {
  const FirstNameField = useTextField({ 
    name: 'first_name',
    label: 'First Name',
    required: true 
  });
  
  const EmailField = useEmailField({ 
    name: 'email',
    label: 'Email',
    required: true 
  });
  
  const BioField = useTextareaField({ 
    name: 'bio',
    label: 'Bio',
    rows: 4 
  });

  return (
    <AppForm
      collection="users"
      recordId={123}
      autoSave={true}
      onSuccess={(data) => console.log('Saved:', data)}
    >
      <FirstNameField />
      <EmailField />
      <BioField />
    </AppForm>
  );
}

export default MyProfileForm;