import { useState, useEffect, useMemo } from '@wordpress/element';
import { Form } from '@arcwp/gateway-forms';

const App = ({ collectionKey, recordId }) => {
  return <Form collectionKey={collectionKey} recordId={recordId} />;
};

export default App;
