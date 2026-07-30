/**
 * Jest global setup.
 *
 * Runs an in-memory MongoDB so the suite needs no external database and cannot
 * touch real data. Env vars are set here, before any module reads config.
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-only-secret-value-at-least-32-characters-long';
process.env.JWT_EXPIRE = '1h';
// Keep bcrypt cheap in tests; production uses 12.
process.env.BCRYPT_ROUNDS = '4';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { serverSelectionTimeoutMS: 30000 });
}, 120000);

afterEach(async () => {
  // Wipe between tests so each one starts from a known-empty state.
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});
