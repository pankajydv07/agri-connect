import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { logout } from '../../actions/authActions';
import { useTranslation } from 'react-i18next';

const Navbar = ({ auth: { isAuthenticated, loading, user }, logout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLangMenu = () => {
    setIsLangMenuOpen(!isLangMenuOpen);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangMenuOpen(false);
  };

  const farmerLinks = (
    <Fragment>
      <Link to="/farmer/dashboard" className="text-white hover:text-green-200 px-3 py-2 rounded">
        {t('nav.dashboard')}
      </Link>
      <Link to="/farmer/products/add" className="text-white hover:text-green-200 px-3 py-2 rounded">
        {t('nav.addProduct')}
      </Link>
      <Link to="/organic-farming" className="text-white hover:text-green-200 px-3 py-2 rounded">
        Organic Farming
      </Link>
      <Link to="/profile" className="text-white hover:text-green-200 px-3 py-2 rounded">
        {t('nav.profile')}
      </Link>
    </Fragment>
  );

  const buyerLinks = (
    <Fragment>
      <Link to="/buyer/dashboard" className="text-white hover:text-green-200 px-3 py-2 rounded">
        {t('nav.dashboard')}
      </Link>
      <Link to="/marketplace" className="text-white hover:text-green-200 px-3 py-2 rounded">
        {t('nav.marketplace')}
      </Link>
      <Link to="/profile" className="text-white hover:text-green-200 px-3 py-2 rounded">
        {t('nav.profile')}
      </Link>
    </Fragment>
  );

  const adminLinks = (
    <Fragment>
      <Link to="/profile" className="text-white hover:text-green-200 px-3 py-2 rounded">
        {t('nav.profile')}
      </Link>
      <Link to="/admin/dashboard" className="text-white hover:text-green-200 px-3 py-2 rounded">
        {t('nav.adminDashboard')}
      </Link>
    </Fragment>
  );

  return (
    <nav className="bg-gradient-to-r from-green-700 to-green-600 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/" className="flex items-center space-x-2 text-white">
            <img 
              src="https://png.pngtree.com/png-vector/20211208/ourmid/pngtree-agricultural-logo-design-png-image_4051578.png" 
              alt="AgriConnect Logo" 
              className="h-10 w-10 rounded-full"
            />
            <span className="font-bold text-xl tracking-tight">{t('common.appName')}</span>
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
                          {t('nav.dashboard')}
                        </Link>
                        <Link to="/farmer/products/add" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                          {t('nav.addProduct')}
                        </Link>
                        <Link to="/organic-farming" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                          Organic Farming
                        </Link>
                      </Fragment>
                    )}
                    {user && user.role === 'buyer' && (
                      <Fragment>
                        <Link to="/buyer/dashboard" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                          {t('nav.dashboard')}
                        </Link>
                        <Link to="/marketplace" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                          {t('nav.marketplace')}
                        </Link>
                        <Link to="/organic-farming" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                          Organic Farming
                        </Link>
                      </Fragment>
                    )}
                    {user && user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                        {t('nav.adminDashboard')}
                      </Link>
                    )}
                    <Link to="/profile" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                      {t('nav.profile')}
                    </Link>

                    {/* Language Selector Dropdown */}
                    <div className="relative group ml-2">
                      <button 
                        onClick={toggleLangMenu}
                        className="flex items-center space-x-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                      >
                        <span>{t('nav.language')}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className={`absolute right-0 w-32 mt-2 py-2 bg-white rounded-lg shadow-xl ${isLangMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-200`}>
                        <button
                          onClick={() => changeLanguage('en')}
                          className={`w-full text-left px-4 py-2 text-sm ${i18n.language === 'en' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                        >
                          English
                        </button>
                        <button
                          onClick={() => changeLanguage('hi')}
                          className={`w-full text-left px-4 py-2 text-sm ${i18n.language === 'hi' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                        >
                          हिंदी (Hindi)
                        </button>
                        <button
                          onClick={() => changeLanguage('te')}
                          className={`w-full text-left px-4 py-2 text-sm ${i18n.language === 'te' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                        >
                          తెలుగు (Telugu)
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative group ml-2">
                      <button className="flex items-center space-x-1 bg-green-800 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors duration-200">
                        <span>{user ? user.name.split(' ')[0] : t('common.account')}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">{t('common.signedInAs')} <span className="font-semibold">{user?.role}</span></div>
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500"
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm7 2a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1zm0 6a1 1 0 100 2h.01a1 1 0 100-2H10z" clipRule="evenodd" />
                            </svg>
                            {t('nav.logout')}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Fragment>
                    <Link to="/marketplace" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                      {t('nav.marketplace')}
                    </Link>
                    <Link to="/organic-farming" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                      Organic Farming
                    </Link>
                    <Link to="/register" className="px-4 py-2 text-white font-medium hover:bg-green-500 rounded-lg transition-colors duration-200">
                      {t('nav.register')}
                    </Link>
                    <Link to="/login" className="bg-white text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors duration-200">
                      {t('nav.login')}
                    </Link>
                    
                    {/* Language Selector for non-authenticated users */}
                    <div className="relative ml-2">
                      <button 
                        onClick={toggleLangMenu}
                        className="flex items-center space-x-1 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg transition-colors duration-200"
                      >
                        <span>{t('nav.language')}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className={`absolute right-0 w-32 mt-2 py-2 bg-white rounded-lg shadow-xl ${isLangMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-all duration-200`}>
                        <button
                          onClick={() => changeLanguage('en')}
                          className={`w-full text-left px-4 py-2 text-sm ${i18n.language === 'en' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                        >
                          English
                        </button>
                        <button
                          onClick={() => changeLanguage('hi')}
                          className={`w-full text-left px-4 py-2 text-sm ${i18n.language === 'hi' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                        >
                          हिंदी (Hindi)
                        </button>
                        <button
                          onClick={() => changeLanguage('te')}
                          className={`w-full text-left px-4 py-2 text-sm ${i18n.language === 'te' ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
                        >
                          తెలుగు (Telugu)
                        </button>
                      </div>
                    </div>
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
                    {t('nav.dashboard')}
                  </Link>
                  <Link to="/farmer/products/add" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                    {t('nav.addProduct')}
                  </Link>
                  <Link to="/organic-farming" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                    Organic Farming
                  </Link>
                </Fragment>
              )}
              {user && user.role === 'buyer' && (
                <Fragment>
                  <Link to="/buyer/dashboard" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                    {t('nav.dashboard')}
                  </Link>
                  <Link to="/marketplace" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                    {t('nav.marketplace')}
                  </Link>
                  <Link to="/organic-farming" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                    Organic Farming
                  </Link>
                </Fragment>
              )}
              {user && user.role === 'admin' && (
                <Link to="/admin/dashboard" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                  {t('nav.adminDashboard')}
                </Link>
              )}
              <Link to="/profile" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                {t('nav.profile')}
              </Link>
              
              {/* Language Selector for Mobile */}
              <div className="border-t border-green-700 mt-2 pt-2">
                <div className="px-3 py-1 text-sm text-white">{t('nav.language')}:</div>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full text-left block px-3 py-2 ${i18n.language === 'en' ? 'bg-green-700' : ''} text-white font-medium hover:bg-green-700 rounded-md`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`w-full text-left block px-3 py-2 ${i18n.language === 'hi' ? 'bg-green-700' : ''} text-white font-medium hover:bg-green-700 rounded-md`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  onClick={() => changeLanguage('te')}
                  className={`w-full text-left block px-3 py-2 ${i18n.language === 'te' ? 'bg-green-700' : ''} text-white font-medium hover:bg-green-700 rounded-md`}
                >
                  తెలుగు (Telugu)
                </button>
              </div>
              
              <button
                onClick={logout}
                className="w-full text-left block px-3 py-2 text-white font-medium hover:bg-red-700 rounded-md"
              >
                {t('nav.logout')}
              </button>
            </Fragment>
          ) : (
            <Fragment>
              <Link to="/marketplace" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                {t('nav.marketplace')}
              </Link>
              <Link to="/organic-farming" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                Organic Farming
              </Link>
              <Link to="/register" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                {t('nav.register')}
              </Link>
              <Link to="/login" className="block px-3 py-2 text-white font-medium hover:bg-green-700 rounded-md">
                {t('nav.login')}
              </Link>
              
              {/* Language Selector for Mobile */}
              <div className="border-t border-green-700 mt-2 pt-2">
                <div className="px-3 py-1 text-sm text-white">{t('nav.language')}:</div>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`w-full text-left block px-3 py-2 ${i18n.language === 'en' ? 'bg-green-700' : ''} text-white font-medium hover:bg-green-700 rounded-md`}
                >
                  English
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={`w-full text-left block px-3 py-2 ${i18n.language === 'hi' ? 'bg-green-700' : ''} text-white font-medium hover:bg-green-700 rounded-md`}
                >
                  हिंदी (Hindi)
                </button>
                <button
                  onClick={() => changeLanguage('te')}
                  className={`w-full text-left block px-3 py-2 ${i18n.language === 'te' ? 'bg-green-700' : ''} text-white font-medium hover:bg-green-700 rounded-md`}
                >
                  తెలుగు (Telugu)
                </button>
              </div>
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
