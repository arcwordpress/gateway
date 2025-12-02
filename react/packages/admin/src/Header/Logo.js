function Logo({ children, ...props }) {
  return (
    <span className="gty-admin-header__brand" {...props}>
      {children}
    </span>
  );
}

export default Logo;