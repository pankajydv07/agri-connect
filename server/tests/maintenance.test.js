const request = require('supertest');
const app = require('../app');
const MaintenanceLog = require('../models/MaintenanceLog');
const { createFarmer, createBuyer, bearer } = require('./helpers');

const validLog = () => ({
  machine: 'Mahindra 575 Tractor',
  location: 'North Field',
  task: 'Change engine oil and replace air filter',
  technician: 'Ravi Kumar',
  scheduledDate: '2026-09-15',
  nextServiceDate: '2026-12-15',
  status: 'Scheduled',
  priority: 'High',
  downtimeHours: '3',
  notes: 'Use 15W-40 as per the manual.',
});

describe('POST /api/maintenance-logs', () => {
  it('creates a log owned by the caller', async () => {
    const { user, token } = await createFarmer();

    const res = await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(token))
      .send(validLog());

    expect(res.status).toBe(201);
    expect(res.body.data.machine).toBe('Mahindra 575 Tractor');
    expect(res.body.data.downtimeHours).toBe(3);

    const stored = await MaintenanceLog.findById(res.body.data._id);
    expect(stored.owner.toString()).toBe(user._id.toString());
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).post('/api/maintenance-logs').send(validLog());
    expect(res.status).toBe(401);
  });

  it('ignores an owner supplied in the body', async () => {
    const { user, token } = await createFarmer();
    const victim = await createFarmer();

    const res = await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(token))
      .send({ ...validLog(), owner: victim.user._id.toString() });

    expect(res.status).toBe(201);

    const stored = await MaintenanceLog.findById(res.body.data._id);
    expect(stored.owner.toString()).toBe(user._id.toString());
  });

  /**
   * The form submits '' for a cleared optional date. Without the
   * empty-string-to-undefined preprocessing this fails validation on a field the
   * user legitimately left blank.
   */
  it('accepts empty strings for optional fields', async () => {
    const { token } = await createFarmer();

    const res = await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(token))
      .send({ ...validLog(), nextServiceDate: '', downtimeHours: '', notes: '' });

    expect(res.status).toBe(201);
  });

  it('rejects a missing required field', async () => {
    const { token } = await createFarmer();
    const { machine, ...withoutMachine } = validLog();

    const res = await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(token))
      .send(withoutMachine);

    expect(res.status).toBe(400);
    expect(res.body.details.some((d) => d.field === 'machine')).toBe(true);
  });

  it('rejects an invalid status', async () => {
    const { token } = await createFarmer();

    const res = await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(token))
      .send({ ...validLog(), status: 'Whenever' });

    expect(res.status).toBe(400);
  });

  it('rejects negative downtime', async () => {
    const { token } = await createFarmer();

    const res = await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(token))
      .send({ ...validLog(), downtimeHours: '-4' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/maintenance-logs', () => {
  it('returns only the caller\'s own logs', async () => {
    const owner = await createFarmer();
    const other = await createFarmer();

    await request(app).post('/api/maintenance-logs').set(bearer(owner.token)).send(validLog());
    await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(other.token))
      .send({ ...validLog(), machine: 'Someone else pump' });

    const res = await request(app).get('/api/maintenance-logs').set(bearer(owner.token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].machine).toBe('Mahindra 575 Tractor');
  });

  it('filters by status and returns a status summary', async () => {
    const { token } = await createFarmer();

    await request(app).post('/api/maintenance-logs').set(bearer(token)).send(validLog());
    await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(token))
      .send({ ...validLog(), machine: 'Water Pump', status: 'Completed' });

    const all = await request(app).get('/api/maintenance-logs').set(bearer(token));
    expect(all.body.summary).toEqual({ Scheduled: 1, Completed: 1 });

    const filtered = await request(app)
      .get('/api/maintenance-logs?status=Completed')
      .set(bearer(token));
    expect(filtered.body.data).toHaveLength(1);
    expect(filtered.body.data[0].machine).toBe('Water Pump');
  });

  it('searches across machine, task, technician and location', async () => {
    const { token } = await createFarmer();

    await request(app).post('/api/maintenance-logs').set(bearer(token)).send(validLog());
    await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(token))
      .send({ ...validLog(), machine: 'Borewell Pump', technician: 'Sunita Devi' });

    const res = await request(app)
      .get('/api/maintenance-logs?search=sunita')
      .set(bearer(token));

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].machine).toBe('Borewell Pump');
  });

  it('paginates', async () => {
    const { token } = await createFarmer();

    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await request(app)
        .post('/api/maintenance-logs')
        .set(bearer(token))
        .send({ ...validLog(), machine: `Machine ${i}` });
    }

    const res = await request(app)
      .get('/api/maintenance-logs?page=1&limit=2')
      .set(bearer(token));

    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(5);
    expect(res.body.pagination.hasNext).toBe(true);
  });

  it('exposes the isOverdue virtual', async () => {
    const { token } = await createFarmer();

    await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(token))
      .send({ ...validLog(), scheduledDate: '2020-01-01', status: 'Scheduled' });

    const res = await request(app).get('/api/maintenance-logs').set(bearer(token));
    expect(res.body.data[0].isOverdue).toBe(true);
  });

  it('rejects an over-large page size', async () => {
    const { token } = await createFarmer();
    const res = await request(app).get('/api/maintenance-logs?limit=5000').set(bearer(token));
    expect(res.status).toBe(400);
  });
});

describe('GET /api/maintenance-logs/:id', () => {
  it("returns 404 rather than 403 for another user's log", async () => {
    const owner = await createFarmer();
    const stranger = await createBuyer();

    const created = await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(owner.token))
      .send(validLog());

    const res = await request(app)
      .get(`/api/maintenance-logs/${created.body.data._id}`)
      .set(bearer(stranger.token));

    // 404 not 403: a stranger must not learn that the id exists at all.
    expect(res.status).toBe(404);
  });

  it('returns 400 for a malformed id', async () => {
    const { token } = await createFarmer();
    const res = await request(app).get('/api/maintenance-logs/nope').set(bearer(token));
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/maintenance-logs/:id', () => {
  it('updates a field', async () => {
    const { token } = await createFarmer();
    const created = await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(token))
      .send(validLog());

    const res = await request(app)
      .patch(`/api/maintenance-logs/${created.body.data._id}`)
      .set(bearer(token))
      .send({ status: 'Completed' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('Completed');
  });

  it("refuses to update another user's log", async () => {
    const owner = await createFarmer();
    const attacker = await createFarmer();

    const created = await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(owner.token))
      .send(validLog());

    const res = await request(app)
      .patch(`/api/maintenance-logs/${created.body.data._id}`)
      .set(bearer(attacker.token))
      .send({ status: 'Completed' });

    expect(res.status).toBe(404);

    const stored = await MaintenanceLog.findById(created.body.data._id);
    expect(stored.status).toBe('Scheduled');
  });

  it('rejects an empty update', async () => {
    const { token } = await createFarmer();
    const created = await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(token))
      .send(validLog());

    const res = await request(app)
      .patch(`/api/maintenance-logs/${created.body.data._id}`)
      .set(bearer(token))
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/maintenance-logs', () => {
  it('deletes a single log', async () => {
    const { token } = await createFarmer();
    const created = await request(app)
      .post('/api/maintenance-logs')
      .set(bearer(token))
      .send(validLog());

    const res = await request(app)
      .delete(`/api/maintenance-logs/${created.body.data._id}`)
      .set(bearer(token));

    expect(res.status).toBe(200);
    expect(await MaintenanceLog.findById(created.body.data._id)).toBeNull();
  });

  it("clears only the caller's logs", async () => {
    const owner = await createFarmer();
    const other = await createFarmer();

    await request(app).post('/api/maintenance-logs').set(bearer(owner.token)).send(validLog());
    await request(app).post('/api/maintenance-logs').set(bearer(owner.token)).send(validLog());
    await request(app).post('/api/maintenance-logs').set(bearer(other.token)).send(validLog());

    const res = await request(app).delete('/api/maintenance-logs').set(bearer(owner.token));

    expect(res.status).toBe(200);
    expect(res.body.data.deletedCount).toBe(2);

    // The other user's log survives.
    expect(await MaintenanceLog.countDocuments({ owner: other.user._id })).toBe(1);
  });
});
