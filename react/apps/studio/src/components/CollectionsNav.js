import { NavLink } from 'react-router-dom';
import { useCollections } from '../context/CollectionsContext';

function CollectionsNav() {
  const { collections } = useCollections();

  return (
    <nav className="studio-collections-nav">
      {collections.map((col) => (
        <NavLink
          key={col.key}
          to={`/collection/${col.key}`}
          className={({ isActive }) =>
            'studio-collections-nav__link' +
            (isActive ? ' studio-collections-nav__link--active' : '')
          }
        >
          {col.titlePlural || col.title || col.key}
        </NavLink>
      ))}
    </nav>
  );
}

export default CollectionsNav;
