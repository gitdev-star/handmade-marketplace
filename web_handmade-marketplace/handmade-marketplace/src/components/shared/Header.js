import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, role, onLogout }) => (
  <header>
    <nav>
      <Link to="/">Home</Link>
      {user && role === 'admin' && <Link to="/admin">Admin</Link>}
      {user ? <button onClick={onLogout}>Logout</button> : <Link to="/login">Login</Link>}
    </nav>
    <hr/>
  </header>
);

export default Header;
