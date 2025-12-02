import Logo from './Logo';
import Menu from './Menu';
import Buttons from './Buttons';

function Header() {
  return (
    <header className="gty-admin-header">
      <div className="gty-admin-header__container">
        <div className="gty-admin-header__row">
          <Logo />
          <Menu />
          <Buttons />
        </div>
      </div>
    </header>
  );
}

Header.Buttons = Buttons;

export default Header;
