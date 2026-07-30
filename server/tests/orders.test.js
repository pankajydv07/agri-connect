const request = require('supertest');
const app = require('../app');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createFarmer, createBuyer, createUser, createProduct, bearer } = require('./helpers');

const orderPayload = (productId, quantity = 10) => ({
  productId: productId.toString(),
  quantityOrdered: quantity,
  deliveryAddress: '12 Green Lane, Hyderabad, Telangana 500001',
});

describe('POST /api/orders', () => {
  it('places an order and decrements stock', async () => {
    const { user: farmer } = await createFarmer();
    const { token } = await createBuyer();
    const product = await createProduct(farmer._id, { quantity: 100, price: 40 });

    const res = await request(app)
      .post('/api/orders')
      .set(bearer(token))
      .send(orderPayload(product._id, 10));

    expect(res.status).toBe(201);
    expect(res.body.data.totalPrice).toBe(400);

    const updated = await Product.findById(product._id);
    expect(updated.quantity).toBe(90);
  });

  it('rejects an order larger than available stock', async () => {
    const { user: farmer } = await createFarmer();
    const { token } = await createBuyer();
    const product = await createProduct(farmer._id, { quantity: 5 });

    const res = await request(app)
      .post('/api/orders')
      .set(bearer(token))
      .send(orderPayload(product._id, 10));

    expect(res.status).toBe(409);

    const unchanged = await Product.findById(product._id);
    expect(unchanged.quantity).toBe(5);
  });

  /**
   * The core regression test for the overselling race.
   *
   * The original controller read `product.quantity`, compared it, created the
   * order, then saved a decremented value — three separate round trips with no
   * transaction. Ten concurrent buyers against 5 units of stock could all pass
   * the check and all decrement, leaving negative inventory.
   *
   * With the atomic conditional update, exactly five 1-unit orders may succeed
   * and stock must land on 0 — never below.
   */
  it('does not oversell under concurrent orders', async () => {
    const { user: farmer } = await createFarmer();
    const product = await createProduct(farmer._id, { quantity: 5, price: 10 });

    const buyers = await Promise.all(Array.from({ length: 10 }, () => createBuyer()));

    const responses = await Promise.all(
      buyers.map(({ token }) =>
        request(app).post('/api/orders').set(bearer(token)).send(orderPayload(product._id, 1))
      )
    );

    const created = responses.filter((res) => res.status === 201);
    const rejected = responses.filter((res) => res.status === 409);

    expect(created).toHaveLength(5);
    expect(rejected).toHaveLength(5);

    const finalProduct = await Product.findById(product._id);
    expect(finalProduct.quantity).toBe(0);
    expect(finalProduct.quantity).toBeGreaterThanOrEqual(0);

    // One order row per successful response — no phantom or lost orders.
    expect(await Order.countDocuments({ product: product._id })).toBe(5);
  });

  it('marks a listing out of stock once fully sold', async () => {
    const { user: farmer } = await createFarmer();
    const { token } = await createBuyer();
    const product = await createProduct(farmer._id, { quantity: 10 });

    await request(app).post('/api/orders').set(bearer(token)).send(orderPayload(product._id, 10));

    const sold = await Product.findById(product._id);
    expect(sold.quantity).toBe(0);
    expect(sold.status).toBe('Out of Stock');
  });

  /** `ngo_buyer` was in the User enum and the UI but locked out of ordering. */
  it('allows an ngo_buyer to place an order', async () => {
    const { user: farmer } = await createFarmer();
    const { token } = await createUser({ role: 'ngo_buyer' });
    const product = await createProduct(farmer._id, { quantity: 50 });

    const res = await request(app)
      .post('/api/orders')
      .set(bearer(token))
      .send(orderPayload(product._id, 5));

    expect(res.status).toBe(201);
  });

  it('forbids a farmer from placing an order', async () => {
    const { user: farmer, token } = await createFarmer();
    const product = await createProduct(farmer._id);

    const res = await request(app)
      .post('/api/orders')
      .set(bearer(token))
      .send(orderPayload(product._id, 1));

    expect(res.status).toBe(403);
  });

  it('rejects an unauthenticated order', async () => {
    const { user: farmer } = await createFarmer();
    const product = await createProduct(farmer._id);

    const res = await request(app).post('/api/orders').send(orderPayload(product._id, 1));
    expect(res.status).toBe(401);
  });

  it('rejects a missing delivery address', async () => {
    const { user: farmer } = await createFarmer();
    const { token } = await createBuyer();
    const product = await createProduct(farmer._id);

    const res = await request(app)
      .post('/api/orders')
      .set(bearer(token))
      .send({ productId: product._id.toString(), quantityOrdered: 1 });

    expect(res.status).toBe(400);
  });

  it('rejects a negative quantity', async () => {
    const { user: farmer } = await createFarmer();
    const { token } = await createBuyer();
    const product = await createProduct(farmer._id);

    const res = await request(app)
      .post('/api/orders')
      .set(bearer(token))
      .send(orderPayload(product._id, -5));

    expect(res.status).toBe(400);
  });
});

describe('GET /api/orders', () => {
  it('scopes results to the requesting buyer', async () => {
    const { user: farmer } = await createFarmer();
    const buyerA = await createBuyer();
    const buyerB = await createBuyer();
    const product = await createProduct(farmer._id, { quantity: 100 });

    await request(app)
      .post('/api/orders')
      .set(bearer(buyerA.token))
      .send(orderPayload(product._id, 1));

    const res = await request(app).get('/api/orders').set(bearer(buyerB.token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('paginates results', async () => {
    const { user: farmer } = await createFarmer();
    const { token } = await createBuyer();
    const product = await createProduct(farmer._id, { quantity: 100 });

    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).post('/api/orders').set(bearer(token)).send(orderPayload(product._id, 1));
    }

    const res = await request(app).get('/api/orders?page=1&limit=2').set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(5);
    expect(res.body.pagination.hasNext).toBe(true);
  });
});

describe('GET /api/orders/:id', () => {
  it('forbids an unrelated buyer from reading an order', async () => {
    const { user: farmer } = await createFarmer();
    const buyer = await createBuyer();
    const stranger = await createBuyer();
    const product = await createProduct(farmer._id, { quantity: 100 });

    const created = await request(app)
      .post('/api/orders')
      .set(bearer(buyer.token))
      .send(orderPayload(product._id, 1));

    const res = await request(app)
      .get(`/api/orders/${created.body.data._id}`)
      .set(bearer(stranger.token));

    expect(res.status).toBe(403);
  });

  it('returns 400 for a malformed id rather than 500', async () => {
    const { token } = await createBuyer();
    const res = await request(app).get('/api/orders/not-an-object-id').set(bearer(token));

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/orders/:id/cancel', () => {
  it('restores stock when an order is cancelled', async () => {
    const { user: farmer } = await createFarmer();
    const { token } = await createBuyer();
    const product = await createProduct(farmer._id, { quantity: 100 });

    const created = await request(app)
      .post('/api/orders')
      .set(bearer(token))
      .send(orderPayload(product._id, 10));

    expect((await Product.findById(product._id)).quantity).toBe(90);

    const res = await request(app)
      .put(`/api/orders/${created.body.data._id}/cancel`)
      .set(bearer(token));

    expect(res.status).toBe(200);
    expect((await Product.findById(product._id)).quantity).toBe(100);
  });

  /**
   * Previously this threw a TypeError (500) because the controller did
   * `product.quantity += ...` on a null product.
   */
  it('cancels cleanly when the product has since been deleted', async () => {
    const { user: farmer } = await createFarmer();
    const { token } = await createBuyer();
    const product = await createProduct(farmer._id, { quantity: 100 });

    const created = await request(app)
      .post('/api/orders')
      .set(bearer(token))
      .send(orderPayload(product._id, 10));

    // Delete directly to avoid the cascade that would remove the order too.
    await Product.collection.deleteOne({ _id: product._id });

    const res = await request(app)
      .put(`/api/orders/${created.body.data._id}/cancel`)
      .set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Cancelled');
  });

  it('refuses to cancel an already-confirmed order', async () => {
    const { user: farmer, token: farmerToken } = await createFarmer();
    const { token: buyerToken } = await createBuyer();
    const product = await createProduct(farmer._id, { quantity: 100 });

    const created = await request(app)
      .post('/api/orders')
      .set(bearer(buyerToken))
      .send(orderPayload(product._id, 10));

    await request(app)
      .put(`/api/orders/${created.body.data._id}`)
      .set(bearer(farmerToken))
      .send({ status: 'Confirmed' });

    const res = await request(app)
      .put(`/api/orders/${created.body.data._id}/cancel`)
      .set(bearer(buyerToken));

    expect(res.status).toBe(409);
  });
});

describe('PUT /api/orders/:id', () => {
  it('rejects an illegal status transition', async () => {
    const { user: farmer, token: farmerToken } = await createFarmer();
    const { token: buyerToken } = await createBuyer();
    const product = await createProduct(farmer._id, { quantity: 100 });

    const created = await request(app)
      .post('/api/orders')
      .set(bearer(buyerToken))
      .send(orderPayload(product._id, 1));

    await request(app)
      .put(`/api/orders/${created.body.data._id}`)
      .set(bearer(farmerToken))
      .send({ status: 'Confirmed' });

    await request(app)
      .put(`/api/orders/${created.body.data._id}`)
      .set(bearer(farmerToken))
      .send({ status: 'Delivered' });

    // Delivered is terminal — it must not be walked back to Pending.
    const res = await request(app)
      .put(`/api/orders/${created.body.data._id}`)
      .set(bearer(farmerToken))
      .send({ status: 'Pending' });

    expect(res.status).toBe(409);
  });

  it("forbids another farmer from updating someone else's order", async () => {
    const { user: farmer } = await createFarmer();
    const other = await createFarmer();
    const { token: buyerToken } = await createBuyer();
    const product = await createProduct(farmer._id, { quantity: 100 });

    const created = await request(app)
      .post('/api/orders')
      .set(bearer(buyerToken))
      .send(orderPayload(product._id, 1));

    const res = await request(app)
      .put(`/api/orders/${created.body.data._id}`)
      .set(bearer(other.token))
      .send({ status: 'Confirmed' });

    expect(res.status).toBe(403);
  });
});
