const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { createUser, bearer } = require('./helpers');

const validRegistration = {
  name: 'Pankaj Yadav',
  email: 'farmer@example.com',
  password: 'Password123',
  role: 'farmer',
  location: 'Hyderabad',
  phone: '9876543210',
};

describe('POST /api/auth/register', () => {
  it('registers a user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(validRegistration);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('farmer');
  });

  it('never returns the password hash', async () => {
    const res = await request(app).post('/api/auth/register').send(validRegistration);

    expect(JSON.stringify(res.body)).not.toContain('$2a$');
    expect(res.body.user.password).toBeUndefined();
  });

  /**
   * Regression test for a privilege-escalation hole: `role` used to be taken
   * straight from the request body, so anyone could self-register as an admin.
   */
  it('rejects an attempt to self-assign the admin role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validRegistration, role: 'admin' });

    expect(res.status).toBe(400);

    const created = await User.findOne({ email: validRegistration.email });
    expect(created).toBeNull();
  });

  it('defaults to the buyer role when none is given', async () => {
    const { role, ...withoutRole } = validRegistration;
    const res = await request(app).post('/api/auth/register').send(withoutRole);

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('buyer');
  });

  it('rejects a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validRegistration, password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.details.some((d) => d.field === 'password')).toBe(true);
  });

  it('rejects a malformed email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validRegistration, email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validRegistration);
    const res = await request(app).post('/api/auth/register').send(validRegistration);

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validRegistration);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validRegistration.email, password: validRegistration.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it('rejects a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validRegistration.email, password: 'WrongPassword1' });

    expect(res.status).toBe(401);
  });

  /** The error must not reveal whether the address is registered. */
  it('returns an identical error for unknown and wrong-password accounts', async () => {
    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123' });

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: validRegistration.email, password: 'WrongPassword1' });

    expect(unknown.status).toBe(wrongPassword.status);
    expect(unknown.body.message).toBe(wrongPassword.body.message);
  });
});

describe('GET /api/auth/me', () => {
  it('rejects a request with no token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a malformed token', async () => {
    const res = await request(app).get('/api/auth/me').set(bearer('not-a-real-token'));
    expect(res.status).toBe(401);
  });

  it('returns the current user for a valid token', async () => {
    const { user, token } = await createUser();
    const res = await request(app).get('/api/auth/me').set(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(user.email);
  });

  /**
   * Regression test: a token for a deleted account used to leave `req.user`
   * null, and `authorize` then threw a TypeError instead of returning 401.
   */
  it('rejects a token whose user has been deleted', async () => {
    const { user, token } = await createUser();
    await User.findByIdAndDelete(user._id);

    const res = await request(app).get('/api/auth/me').set(bearer(token));
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/auth/change-password', () => {
  it('changes the password and invalidates previously issued tokens', async () => {
    const { token } = await createUser({ password: 'Password123' });

    // The old token works before the change.
    expect((await request(app).get('/api/auth/me').set(bearer(token))).status).toBe(200);

    const change = await request(app)
      .put('/api/auth/change-password')
      .set(bearer(token))
      .send({ currentPassword: 'Password123', newPassword: 'BrandNewPass456' });

    expect(change.status).toBe(200);
    expect(change.body.token).toBeTruthy();

    /**
     * The heart of the fix: changing a password must revoke tokens minted
     * beforehand. Previously a stolen token survived the password reset
     * intended to kill it.
     */
    const withOldToken = await request(app).get('/api/auth/me').set(bearer(token));
    expect(withOldToken.status).toBe(401);

    // The freshly issued token still works.
    const withNewToken = await request(app)
      .get('/api/auth/me')
      .set(bearer(change.body.token));
    expect(withNewToken.status).toBe(200);
  });

  it('rejects an incorrect current password', async () => {
    const { token } = await createUser({ password: 'Password123' });

    const res = await request(app)
      .put('/api/auth/change-password')
      .set(bearer(token))
      .send({ currentPassword: 'WrongPassword1', newPassword: 'BrandNewPass456' });

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/auth/profile', () => {
  /** `role` is not in the profile schema, so it cannot be escalated here. */
  it('ignores an attempt to change role via profile update', async () => {
    const { user, token } = await createUser({ role: 'buyer' });

    const res = await request(app)
      .put('/api/auth/profile')
      .set(bearer(token))
      .send({ name: 'New Name', role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('New Name');
    expect(res.body.data.role).toBe('buyer');

    const reloaded = await User.findById(user._id);
    expect(reloaded.role).toBe('buyer');
  });
});
