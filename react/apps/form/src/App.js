import { useState, useEffect, useMemo } from '@wordpress/element';
import { FormBuilder } from '@gateway/forms';

const App = ({ collectionKey, recordId }) => {
  return <FormBuilder collectionKey={collectionKey} recordId={recordId} />;
};

export default App;
