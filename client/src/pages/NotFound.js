import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="text-center py-12">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
      <p className="text-xl mb-8">The page you are looking for does not exist.</p>
      <Link to="/" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
