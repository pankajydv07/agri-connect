import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const Home = ({ isAuthenticated, user }) => {
  // Features data for the animation
  const features = [
    {
      id: 1,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: 'Fresh Produce',
      description: 'Always get the freshest produce directly from local farms to your table.'
    },
    {
      id: 2,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Fair Pricing',
      description: 'Farmers earn more while consumers pay less by eliminating middlemen.'
    },
    {
      id: 3,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Community Growth',
      description: 'Building stronger agricultural communities through direct connections.'
    },
    {
      id: 4,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Quality Assurance',
      description: 'All products verified to ensure high quality and food safety standards.'
    },
    {
      id: 5,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Convenient Delivery',
      description: 'Schedule deliveries that work with your timeline and location.'
    },
    {
      id: 6,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      title: 'Transparent Sourcing',
      description: 'Know exactly where your food comes from and how it was grown.'
    }
  ];

  const scrollRef = useRef(null);
  
  // Set up the automatic scrolling animation
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    let scrollAmount = 0;
    const speed = 0.5; // pixels per frame
    // Remove unused gap variable
    const totalWidth = scrollContainer.scrollWidth;
    const containerWidth = scrollContainer.clientWidth;
    
    const scroll = () => {
      scrollContainer.scrollLeft = scrollAmount;
      scrollAmount += speed;
      
      // Reset when the scroll reaches the end to create infinite loop effect
      if (scrollAmount >= totalWidth - containerWidth) {
        scrollAmount = 0;
      }
    };
    
    const animationId = setInterval(scroll, 20);
    
    // Pause the animation when hovering
    const handleMouseEnter = () => clearInterval(animationId);
    const handleMouseLeave = () => {
      clearInterval(animationId);
      setInterval(scroll, 20);
    };
    
    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    
    // Clean up
    return () => {
      clearInterval(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-green-100 to-white">
      {/* Hero Section with New Farm Background */}
      <div className="w-full h-screen max-h-[600px] relative mb-16 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
          alt="Farm landscape with crops" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center z-10 px-8 md:px-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Welcome to <span className="text-green-400">AgriConnect</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-xl leading-relaxed mb-8">
              Empowering agriculture through direct connections between farmers and buyers
            </p>
            {!isAuthenticated ? (
              <div className="space-y-4 md:space-y-0 md:space-x-6">
                <Link to="/register" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                  Get Started
                </Link>
                <Link to="/login" className="inline-block bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-0 md:space-x-6">
                {user && user.role === 'farmer' && (
                  <Link to="/farmer/dashboard" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      Farmer Dashboard
                    </span>
                  </Link>
                )}
                {user && user.role === 'buyer' && (
                  <Link to="/buyer/dashboard" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      Buyer Dashboard
                    </span>
                  </Link>
                )}
                {user && user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      Admin Dashboard
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl w-full">
        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-green-500">
            <div className="p-3 rounded-full bg-green-100 w-14 h-14 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Fresh Produce</h2>
            <p className="text-gray-600 text-center">Get access to high-quality, locally sourced agricultural products directly from farmers.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-500">
            <div className="p-3 rounded-full bg-blue-100 w-14 h-14 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Fair Pricing</h2>
            <p className="text-gray-600 text-center">Eliminate middlemen and support farmers with fair prices while getting better deals.</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-yellow-500">
            <div className="p-3 rounded-full bg-yellow-100 w-14 h-14 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Community Growth</h2>
            <p className="text-gray-600 text-center">Support local agricultural communities and foster sustainable farming practices.</p>
          </div>
        </div>
      </div>
      
      {/* Farm to Table Process Section */}
      <div className="w-full bg-green-50 py-20 px-4 mb-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-800">
            From <span className="text-green-600">Farm to Table</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4 relative">
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">1</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Farmers Register</h3>
              <p className="text-gray-600">Farmers sign up and list their available produce with details and pricing.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 relative">
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Buyers Browse</h3>
              <p className="text-gray-600">Buyers explore the marketplace and select fresh produce from local farmers.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mb-4 relative">
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">3</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Order Confirmation</h3>
              <p className="text-gray-600">Orders are confirmed and farmers prepare the produce for delivery or pickup.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4 relative">
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">4</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Fresh Delivery</h3>
              <p className="text-gray-600">Buyers receive fresh produce directly from local farms to their table.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Horizontal Scrolling Features Section */}
      <div className="w-full mb-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
          Why Choose <span className="text-green-600">AgriConnect</span>
        </h2>
        
        <div className="relative w-full overflow-hidden py-4">
          {/* Add a fade effect on the sides */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
          
          {/* The scrolling container */}
          <div 
            ref={scrollRef}
            className="flex space-x-8 overflow-x-scroll scrollbar-hide py-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Features cards */}
            {features.map(feature => (
              <div 
                key={feature.id} 
                className="flex-shrink-0 w-64 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
            
            {/* Duplicate the first few items to create a seamless loop */}
            {features.slice(0, 3).map(feature => (
              <div 
                key={`duplicate-${feature.id}`} 
                className="flex-shrink-0 w-64 bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section with Farm Background */}
      <div className="w-full relative py-20 px-4 mb-16 overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
          alt="Farmer in field with crops" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Transform Your Agricultural Business?</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">Join AgriConnect today and be part of the agricultural revolution that benefits farmers, buyers, and communities.</p>
          <Link to="/register" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 text-lg">
            Join Us Today
          </Link>
        </div>
      </div>
      
      <div className="mt-20 text-center">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} AgriConnect - Transforming agricultural commerce</p>
      </div>
    </div>
  );
};

// Add this CSS to hide scrollbars while keeping scrolling functionality
const scrollbarHideStyle = document.createElement('style');
scrollbarHideStyle.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(scrollbarHideStyle);

Home.propTypes = {
  isAuthenticated: PropTypes.bool,
  user: PropTypes.object
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  user: state.auth.user
});

export default connect(mapStateToProps)(Home);
