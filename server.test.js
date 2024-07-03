const request = require('supertest');
const app = require('./server'); // Adjust the path to your Express app entry point
const mongoose = require('mongoose');
const User = require('./models/user'); // Adjust the path to your User model

// Mock user data for testing
const testUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 30
};

beforeAll(async () => {
  // Connect to a test database before running tests
  await mongoose.connect('mongodb://localhost:27017/testdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
});

afterAll(async () => {
  // Disconnect from the test database after running tests
  await mongoose.connection.close();
});

describe('POST /users', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send(testUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toEqual(testUser.name);
  });
});

describe('GET /users/:id', () => {
  it('should fetch a single user by id', async () => {
    const newUser = await User.create(testUser);
    const res = await request(app).get(`/users/${newUser._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(testUser.name);
  });

  it('should return 404 if user id is not found', async () => {
    const res = await request(app).get('/users/nonexistent_id');
    expect(res.statusCode).toEqual(404);
  });
});

describe('PUT /users/:id', () => {
  it('should update a user by id', async () => {
    const newUser = await User.create(testUser);
    const updatedUserData = { ...testUser, name: 'Updated Name' };
    const res = await request(app)
      .put(`/users/${newUser._id}`)
      .send(updatedUserData);
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(updatedUserData.name);
  });

  it('should return 404 if user id is not found', async () => {
    const res = await request(app)
      .put('/users/nonexistent_id')
      .send(testUser);
    expect(res.statusCode).toEqual(404);
  });
});

describe('DELETE /users/:id', () => {
  it('should delete a user by id', async () => {
    const newUser = await User.create(testUser);
    const res = await request(app).delete(`/users/${newUser._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('User deleted successfully');
  });

  it('should return 404 if user id is not found', async () => {
    const res = await request(app).delete('/users/nonexistent_id');
    expect(res.statusCode).toEqual(404);
  });
});
