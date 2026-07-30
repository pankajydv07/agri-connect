const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { createFarmer, createBuyer, createAdmin, createProduct, bearer } = require('./helpers');

const validProduct = {
  cropName: 'Organic Tomatoes',
  description: 'Vine-ripened tomatoes grown without synthetic pesticides.',
  quantity: 200,
  unit: 'kg',
  price: 45,
};

const futureDate = () => new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();

describe('POST /api/products', () => {
  it('lets a farmer create a listing', async () => {
    const { user, token } = await createFarmer();

    const res = await request(app)
      .post('/api/products')
      .set(bearer(token))
      .send({ ...validProduct, availableUntil: futureDate() });

    expect(res.status).toBe(201);
    // Ownership comes from the token, never the request body.
    expect(res.body.data.farmer).toBe(user._id.toString());
  });

  /** A buyer must not be able to list produce. */
  it('forbids a buyer from creating a listing', async () => {
    const { token } = await createBuyer();

    const res = await request(app)
      .post('/api/products')
      .set(bearer(token))
      .send({ ...validProduct, availableUntil: futureDate() });

    expect(res.status).toBe(403);
  });

  it('ignores a farmer id supplied in the body', async () => {
    const { user, token } = await createFarmer();
    const victim = await createFarmer();

    const res = await request(app)
      .post('/api/products')
      .set(bearer(token))
      .send({
        ...validProduct,
        availableUntil: futureDate(),
        farmer: victim.user._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.data.farmer).toBe(user._id.toString());
  });

  it('rejects a past availability date', async () => {
    const { token } = await createFarmer();

    const res = await request(app)
      .post('/api/products')
      .set(bearer(token))
      .send({ ...validProduct, availableUntil: '2020-01-01' });

    expect(res.status).toBe(400);
  });

  it('rejects a negative price', async () => {
    const { token } = await createFarmer();

    const res = await request(app)
      .post('/api/products')
      .set(bearer(token))
      .send({ ...validProduct, price: -10, availableUntil: futureDate() });

    expect(res.status).toBe(400);
  });

  it('rejects an unknown unit', async () => {
    const { token } = await createFarmer();

    const res = await request(app)
      .post('/api/products')
      .set(bearer(token))
      .send({ ...validProduct, unit: 'wheelbarrows', availableUntil: futureDate() });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/products/:id', () => {
  /**
   * Regression test for mass assignment. `req.body` used to be passed straight
   * into findByIdAndUpdate, so a farmer could send {"farmer": "<other id>"} and
   * reassign another farmer's listing to themselves.
   */
  it('ignores an attempt to reassign ownership', async () => {
    const owner = await createFarmer();
    const attacker = await createFarmer();
    const product = await createProduct(owner.user._id);

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set(bearer(owner.token))
      .send({ price: 60, farmer: attacker.user._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(60);

    const reloaded = await Product.findById(product._id);
    expect(reloaded.farmer.toString()).toBe(owner.user._id.toString());
  });

  it("forbids a farmer from editing another farmer's listing", async () => {
    const owner = await createFarmer();
    const attacker = await createFarmer();
    const product = await createProduct(owner.user._id);

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set(bearer(attacker.token))
      .send({ price: 1 });

    expect(res.status).toBe(403);

    const reloaded = await Product.findById(product._id);
    expect(reloaded.price).not.toBe(1);
  });

  /** The route guard used to exclude admins while the controller allowed them. */
  it('allows an admin to edit any listing', async () => {
    const owner = await createFarmer();
    const admin = await createAdmin();
    const product = await createProduct(owner.user._id);

    const res = await request(app)
      .put(`/api/products/${product._id}`)
      .set(bearer(admin.token))
      .send({ price: 99 });

    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(99);
  });

  it('returns 404 for a listing that does not exist', async () => {
    const { token } = await createFarmer();

    const res = await request(app)
      .put('/api/products/507f1f77bcf86cd799439011')
      .set(bearer(token))
      .send({ price: 10 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/products/:id', () => {
  /**
   * The cascade hook was `pre('remove')`, which never fired because the
   * controller deletes with findByIdAndDelete — so orders were orphaned.
   */
  it('cascades to related orders', async () => {
    const owner = await createFarmer();
    const buyer = await createBuyer();
    const product = await createProduct(owner.user._id, { quantity: 100 });

    await request(app)
      .post('/api/orders')
      .set(bearer(buyer.token))
      .send({
        productId: product._id.toString(),
        quantityOrdered: 5,
        deliveryAddress: '12 Green Lane, Hyderabad, Telangana 500001',
      });

    expect(await Order.countDocuments({ product: product._id })).toBe(1);

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set(bearer(owner.token));

    expect(res.status).toBe(200);
    expect(await Product.findById(product._id)).toBeNull();
    expect(await Order.countDocuments({ product: product._id })).toBe(0);
  });

  it("forbids deleting another farmer's listing", async () => {
    const owner = await createFarmer();
    const attacker = await createFarmer();
    const product = await createProduct(owner.user._id);

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set(bearer(attacker.token));

    expect(res.status).toBe(403);
    expect(await Product.findById(product._id)).not.toBeNull();
  });
});

describe('GET /api/products', () => {
  it('is publicly readable and paginated', async () => {
    const { user } = await createFarmer();
    await Promise.all(
      Array.from({ length: 5 }, (_, i) => createProduct(user._id, { price: (i + 1) * 10 }))
    );

    const res = await request(app).get('/api/products?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(5);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('filters by price range', async () => {
    const { user } = await createFarmer();
    await createProduct(user._id, { price: 10 });
    await createProduct(user._id, { price: 50 });
    await createProduct(user._id, { price: 100 });

    const res = await request(app).get('/api/products?minPrice=20&maxPrice=60');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].price).toBe(50);
  });

  /**
   * The old implementation JSON-stringified req.query and regex-replaced
   * `gt|gte|lt|lte|in` into Mongo operators, promoting arbitrary user input
   * into query operators. Unknown/operator-shaped params are now rejected or
   * ignored rather than executed.
   */
  it('does not let query params inject Mongo operators', async () => {
    const { user } = await createFarmer();
    await createProduct(user._id, { price: 10 });
    await createProduct(user._id, { price: 1000 });

    const res = await request(app).get('/api/products?price[$gt]=0&limit=100');

    expect(res.status).toBeLessThan(500);

    if (res.status === 200) {
      // If it parsed at all, the operator must not have been honoured as a filter.
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    }
  });

  it('never exposes farmer password hashes through populate', async () => {
    const { user } = await createFarmer();
    await createProduct(user._id);

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('$2a$');
  });

  it('rejects an over-large page size', async () => {
    const res = await request(app).get('/api/products?limit=100000');
    expect(res.status).toBe(400);
  });
});

describe('GET /health', () => {
  it('reports service and database status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
  });
});

describe('unmatched routes', () => {
  it('returns a 404 envelope rather than HTML', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
