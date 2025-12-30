import Logo from './Logo';
import Menu from './Menu';
import Buttons from './Buttons';

function Header({ children }) {
  return (
    <header className="gty-admin-header">
      <div className="gty-admin-header__container">
        <div className="gty-admin-header__row">
          {children}
        </div>
      </div>
    </header>
  );
}

Header.Logo = Logo;
Header.Menu = Menu;
Header.Buttons = Buttons;

export default Header;
