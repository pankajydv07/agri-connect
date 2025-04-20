import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getProducts } from '../../actions/productActions';
import ProductCard from '../../components/products/ProductCard';

const NGOMarketplace = ({ getProducts, products, loading }) => {
  const [filters, setFilters] = useState({
    cropName: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });

  useEffect(() => {
    // Get all products and filter on the client side for products expiring within 7 days
    getProducts();
  }, [getProducts]);

  const onChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const onSubmit = e => {
    e.preventDefault();
    let queryString = '?';
    if (filters.cropName) queryString += `cropName=${filters.cropName}&`;
    if (filters.minPrice) queryString += `price[gte]=${filters.minPrice}&`;
    if (filters.maxPrice) queryString += `price[lte]=${filters.maxPrice}&`;
    if (filters.location) queryString += `location=${filters.location}&`;
    getProducts(queryString);
  };

  // Filter products that expire within 7 days
  const filteredProducts = products.filter(product => {
    const expiryDate = new Date(product.availableUntil);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">NGO Agricultural Marketplace</h1>
        <p className="text-gray-600">Find and purchase products expiring within 7 days</p>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Filter Products</h2>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <label htmlFor="cropName" className="text-sm font-medium text-gray-700 mb-1">Crop Name</label>
              <input
                id="cropName"
                type="text"
                placeholder="e.g., Tomatoes, Rice"
                name="cropName"
                value={filters.cropName}
                onChange={onChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="minPrice" className="text-sm font-medium text-gray-700 mb-1">Min Price ($)</label>
              <input
                id="minPrice"
                type="number"
                placeholder="Minimum price"
                name="minPrice"
                value={filters.minPrice}
                onChange={onChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="maxPrice" className="text-sm font-medium text-gray-700 mb-1">Max Price ($)</label>
              <input
                id="maxPrice"
                type="number"
                placeholder="Maximum price"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={onChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="location" className="text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                id="location"
                type="text"
                placeholder="e.g., California, Texas"
                name="location"
                value={filters.location}
                onChange={onChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
          <div className="mt-6 text-center">
            <button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Apply Filters
            </button>
          </div>
        </form>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-2xl font-medium text-gray-700 mb-2">No products found expiring within 7 days</h3>
          <p className="text-gray-500">Try adjusting your filter criteria or check back later</p>
        </div>
      )}
    </div>
  );
};

NGOMarketplace.propTypes = {
  getProducts: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  products: state.products.products,
  loading: state.products.loading
});

export default connect(mapStateToProps, { getProducts })(NGOMarketplace); 