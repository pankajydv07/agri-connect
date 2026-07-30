import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getProducts } from '../../actions/productActions';
import ProductCard from '../../components/products/ProductCard';
import { SpinnerBlock } from '../../components/ui/Spinner';
import EmptyState, { ErrorState, emptyStateActionClass } from '../../components/ui/EmptyState';

const EMPTY_FILTERS = { cropName: '', minPrice: '', maxPrice: '', location: '' };

const isFiltered = (filters) =>
  Object.values(filters).some((v) => String(v).trim() !== '');

const Marketplace = ({ getProducts, products, loading }) => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [fetchError, setFetchError] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);

  const doFetch = (queryString) => {
    setFetchError('');
    try {
      getProducts(queryString);
    } catch (err) {
      setFetchError(
        err?.response?.data?.message ||
          'Could not load products. Check your connection and try again.'
      );
    }
  };

  useEffect(() => {
    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    let queryString = '?';
    if (filters.cropName) queryString += `cropName=${encodeURIComponent(filters.cropName)}&`;
    if (filters.minPrice) queryString += `price[gte]=${encodeURIComponent(filters.minPrice)}&`;
    if (filters.maxPrice) queryString += `price[lte]=${encodeURIComponent(filters.maxPrice)}&`;
    if (filters.location) queryString += `location=${encodeURIComponent(filters.location)}&`;
    setFiltersApplied(isFiltered(filters));
    doFetch(queryString === '?' ? undefined : queryString);
  };

  const onClearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setFiltersApplied(false);
    doFetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">Agricultural Marketplace</h1>
        <p className="text-gray-600">Find and purchase quality agricultural products from local farmers</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Filter Products</h2>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <label htmlFor="cropName" className="text-sm font-medium text-gray-700 mb-1">
                Crop Name
              </label>
              <input
                id="cropName"
                type="text"
                placeholder="e.g., Tomatoes, Rice"
                name="cropName"
                value={filters.cropName}
                onChange={onChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
            <div className="flex flex-col">
              {/* Currency label corrected from $ to ₹ */}
              <label htmlFor="minPrice" className="text-sm font-medium text-gray-700 mb-1">
                Min Price (₹)
              </label>
              <input
                id="minPrice"
                type="number"
                placeholder="Minimum price"
                name="minPrice"
                value={filters.minPrice}
                onChange={onChange}
                min="0"
                step="any"
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
            <div className="flex flex-col">
              {/* Currency label corrected from $ to ₹ */}
              <label htmlFor="maxPrice" className="text-sm font-medium text-gray-700 mb-1">
                Max Price (₹)
              </label>
              <input
                id="maxPrice"
                type="number"
                placeholder="Maximum price"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={onChange}
                min="0"
                step="any"
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="location" className="text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g., Punjab, Maharashtra"
                name="location"
                value={filters.location}
                onChange={onChange}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 inline-flex items-center"
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              Apply Filters
            </button>
            {filtersApplied && (
              <button
                type="button"
                onClick={onClearFilters}
                className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-md transition-colors duration-300 inline-flex items-center"
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Clear Filters
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <SpinnerBlock label="Loading products…" tone="green" />
      ) : fetchError ? (
        <ErrorState
          title="Could not load products"
          description={fetchError}
          onRetry={() => doFetch()}
        />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={filtersApplied ? 'No products match your filters' : 'No products listed yet'}
          description={
            filtersApplied
              ? 'Try adjusting or clearing your filter criteria to see more results.'
              : 'Check back soon — farmers are adding new produce regularly.'
          }
          action={
            filtersApplied ? (
              <button type="button" onClick={onClearFilters} className={emptyStateActionClass}>
                Clear Filters
              </button>
            ) : null
          }
        />
      )}
    </div>
  );
};

Marketplace.propTypes = {
  getProducts: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => ({
  products: state.products.products,
  loading: state.products.loading
});

export default connect(mapStateToProps, { getProducts })(Marketplace);
