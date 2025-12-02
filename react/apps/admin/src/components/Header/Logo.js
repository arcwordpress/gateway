import { NavLink } from 'react-router-dom';

function Logo() {
  return (
    <div className="gty-admin-header__brand">
      <NavLink
        to="/"
        className={({ isActive }) =>
          [
            'gty-admin-header__title',
            'gty-admin-link',
            isActive ? 'gty-admin-header__title--active' : ''
          ].join(' ')
        }
        end
      >
        GATEWAY
      </NavLink>
    </div>
  );
}

export default Logo;