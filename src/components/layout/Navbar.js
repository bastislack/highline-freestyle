const Navbar = ({ children }) => {
  return (
    <div class="navbar-container sticky-top">
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        {children}
      </nav>
    </div>
  );
}

export default Navbar;
