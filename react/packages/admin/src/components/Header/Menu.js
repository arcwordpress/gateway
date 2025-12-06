function Menu({ children, ...props }) {
  return (
    <div className="gty-admin-header-menu" {...props}>
      {children}
    </div>
  );
}

export default Menu;
