const Navbar = ({ children }) => {
  return (
    <div className="navbar-container sticky-top">
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        {children}
      </nav>
    </div>
  );
}

export default Navbar;
