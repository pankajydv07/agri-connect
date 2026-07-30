const User = require('../models/User');
const Product = require('../models/Product');

let counter = 0;
const unique = () => {
  counter += 1;
  return counter;
};

/** Creates a user directly (bypassing the API) and returns it with a valid JWT. */
const createUser = async (overrides = {}) => {
  const n = unique();

  const user = await User.create({
    name: overrides.name || `Test User ${n}`,
    email: overrides.email || `user${n}@example.com`,
    password: overrides.password || 'Password123',
    role: overrides.role || 'buyer',
    location: overrides.location || 'Hyderabad',
    phone: overrides.phone || '9876543210',
  });

  return { user, token: user.getSignedJwtToken() };
};

const createFarmer = (overrides) => createUser({ ...overrides, role: 'farmer' });
const createBuyer = (overrides) => createUser({ ...overrides, role: 'buyer' });
const createAdmin = (overrides) => createUser({ ...overrides, role: 'admin' });

const createProduct = async (farmerId, overrides = {}) => {
  const n = unique();

  return Product.create({
    cropName: overrides.cropName || `Tomatoes ${n}`,
    description: overrides.description || 'Fresh organic produce grown without pesticides.',
    quantity: overrides.quantity ?? 100,
    unit: overrides.unit || 'kg',
    price: overrides.price ?? 40,
    availableUntil: overrides.availableUntil || new Date(Date.now() + 7 * 24 * 3600 * 1000),
    status: overrides.status || 'Available',
    farmer: farmerId,
  });
};

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = { createUser, createFarmer, createBuyer, createAdmin, createProduct, bearer };
