import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getProducts } from '../../actions/productActions';
import ProductCard from '../../components/products/ProductCard';

const Marketplace = ({ getProducts, products, loading }) => {
  const [filters, setFilters] = useState({
    cropName: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });

  useEffect(() => {
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Marketplace</h1>
      <form onSubmit={onSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Crop Name"
            name="cropName"
            value={filters.cropName}
            onChange={onChange}
            className="px-3 py-2 border rounded-md"
          />
          <input
            type="number"
            placeholder="Min Price"
            name="minPrice"
            value={filters.minPrice}
            onChange={onChange}
            className="px-3 py-2 border rounded-md"
          />
          <input
            type="number"
            placeholder="Max Price"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={onChange}
            className="px-3 py-2 border rounded-md"
          />
          <input
            type="text"
            placeholder="Location"
            name="location"
            value={filters.location}
            onChange={onChange}
            className="px-3 py-2 border rounded-md"
          />
        </div>
        <button type="submit" className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          Apply Filters
        </button>
      </form>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

Marketplace.propTypes = {
  getProducts: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
  products: state.products.products,
  loading: state.products.loading
});

export default connect(mapStateToProps, { getProducts })(Marketplace);
