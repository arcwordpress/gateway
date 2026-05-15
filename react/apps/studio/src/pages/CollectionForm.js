import { useParams, useNavigate } from 'react-router-dom';
import { Form } from '@arcwp/gateway-forms';
import { useCollections } from '../context/CollectionsContext';
import CollectionsNav from '../components/CollectionsNav';

function CollectionForm() {
  const { collectionKey, id } = useParams();
  const navigate = useNavigate();
  const { collections } = useCollections();

  const collection = collections.find((c) => c.key === collectionKey);
  const collectionLabel = collection?.titlePlural || collection?.title || collectionKey;

  const handleBack = () => navigate(`/collection/${collectionKey}`);

  return (
    <div className="studio-layout">
      <aside className="studio-sidebar">
        <span className="studio-sidebar__title">{collectionLabel}</span>
        <button onClick={handleBack} className="studio-sidebar__return">
          <span className="studio-sidebar__return-icon" aria-hidden="true">↵</span>
          Return
        </button>
      </aside>
      <main className="studio-main">
        <CollectionsNav />
        <h2 className="gty-collection-form__title">
          {id ? 'Edit Record' : 'Create Record'}
        </h2>
        <Form collectionKey={collectionKey} recordId={id} />
      </main>
    </div>
  );
}

export default CollectionForm;
