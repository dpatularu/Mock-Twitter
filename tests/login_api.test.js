const mongoose = require('mongoose');
const supertest = require('supertest');
const { registerUser } = require('./test_helper');
const app = require('../app');

const api = supertest(app);

const User = require('../models/user');

describe('Login tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    await registerUser('tester', 'password');
  });

  test('Successful login returns status 200 and JWT', async () => {
    const user = {
      username: 'tester',
      password: 'password',
    };
    const response = await api.post('/api/login').send(user).expect(200);
    expect(response.body).toHaveProperty('token');
  });

  test('Invalid login credentials return status 401', async () => {
    const nonExistantUser = {
      username: 'idontexist',
      password: 'ghost2',
    };
    await api.post('/api/login').send(nonExistantUser).expect(401);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
