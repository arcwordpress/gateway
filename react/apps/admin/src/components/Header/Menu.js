import { NavLink } from 'react-router-dom';

function Menu() {
  return (
    <>
      <div className="gty-admin-header-menu">
        <NavLink
          to="/collections"
          className={({ isActive }) =>
            [
              'gty-admin-header-menu__link',
              isActive ? 'gty-admin-header-menu__link--active' : ''
            ].join(' ')
          }
        >
          Collections
        </NavLink>
      </div>
    </>
  );
}

export default Menu;
