import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/authActions';

const Navbar = ({ auth: { isAuthenticated, loading, user }, logout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const farmerLinks = (
    <Fragment>
      <Link to="/farmer/dashboard" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Dashboard
      </Link>
      <Link to="/farmer/products/add" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Add Product
      </Link>
      
<Link to="/profile" className="text-white hover:text-green-200 px-3 py-2 rounded">
  Profile
</Link>

    </Fragment>
  );

  const buyerLinks = (
    <Fragment>
      <Link to="/buyer/dashboard" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Dashboard
      </Link>
      <Link to="/marketplace" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Marketplace
      </Link>
     
<Link to="/profile" className="text-white hover:text-green-200 px-3 py-2 rounded">
  Profile
</Link>

    </Fragment>
  );

  const adminLinks = (
    <Fragment>
      
<Link to="/profile" className="text-white hover:text-green-200 px-3 py-2 rounded">
  Profile
</Link>

      <Link to="/admin/dashboard" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Admin Dashboard
      </Link>
    </Fragment>
  );

  return (
    <nav className="bg-gradient-to-r from-green-700 to-green-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/" className="flex items-center space-x-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="font-bold text-xl tracking-tight">AgriConnect</span>
          </Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu} 
              className="text-white hover:text-green-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            {!loading && (
              <Fragment>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    {user && user.role === 'farmer' && (
                      <Fragment>
                        <Link to="/farmer/dashboard" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                          Dashboard
                        </Link>
                        <Link to="/farmer/products/add" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                          Add Product
                        </Link>
                      </Fragment>
                    )}
                    {user && user.role === 'buyer' && (
                      <Fragment>
                        <Link to="/buyer/dashboard" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                          Dashboard
                        </Link>
                        <Link to="/marketplace" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                          Marketplace
                        </Link>
                      </Fragment>
                    )}
                    {user && user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/profile" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                      Profile
                    </Link>
                    <div className="relative group ml-2">
                      <button className="flex items-center space-x-1 bg-green-800 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-200">
                        <span>{user ? user.name.split(' ')[0] : 'Account'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">Signed in as <span className="font-semibold">{user?.role}</span></div>
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500"
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm7 2a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1zm0 6a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
                            </svg>
                            Logout
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Fragment>
                    <Link to="/marketplace" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                      Marketplace
                    </Link>
                    <Link to="/register" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                      Register
                    </Link>
                    <Link to="/login" className="bg-white text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors duration-200">
                      Login
                    </Link>
                  </Fragment>
                )}
              </Fragment>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} bg-green-800`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {!loading && isAuthenticated ? (
            <Fragment>
              {user && user.role === 'farmer' && (
                <Fragment>
                  <Link to="/farmer/dashboard" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                    Dashboard
                  </Link>
                  <Link to="/farmer/products/add" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                    Add Product
                  </Link>
                </Fragment>
              )}
              {user && user.role === 'buyer' && (
                <Fragment>
                  <Link to="/buyer/dashboard" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                    Dashboard
                  </Link>
                  <Link to="/marketplace" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                    Marketplace
                  </Link>
                </Fragment>
              )}
              {user && user.role === 'admin' && (
                <Link to="/admin/dashboard" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                  Admin Dashboard
                </Link>
              )}
              <Link to="/profile" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                Profile
              </Link>
              <button
                onClick={logout}
                className="w-full text-left block px-3 py-2 text-white font-medium hover:bg-red-700 rounded-md"
              >
                Logout
              </button>
            </Fragment>
          ) : (
            <Fragment>
              <Link to="/marketplace" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                Marketplace
              </Link>
              <Link to="/register" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                Register
              </Link>
              <Link to="/login" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                Login
              </Link>
            </Fragment>
          )}
        </div>
      </div>
    </nav>
  );
};

Navbar.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { logout })(Navbar);
