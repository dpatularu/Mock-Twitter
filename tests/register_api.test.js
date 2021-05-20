const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);

const User = require('../models/user');

describe('Registration tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('Successful registration returns 200', async () => {
    const newUser = {
      username: 'newguy42',
      password: 'hunter2',
    };
    await api.post('/api/register').send(newUser).expect(200);
  });

  test('Username must be unique', async () => {
    const newUser = {
      username: 'newguy42',
      password: 'hunter2',
    };
    await api.post('/api/register').send(newUser);
    await api.post('/api/register').send(newUser).expect(400);
  });

  test('Registration with too short of password returns 400', async () => {
    const shortPasswordUser = {
      username: 'tinypassword',
      password: 'ab',
    };
    await api.post('/api/register').send(shortPasswordUser).expect(400);
  });

  test('Registration with too short of username returns 400', async () => {
    const shortNameUser = {
      username: 'abc',
      password: 'password',
    };
    await api.post('/api/register').send(shortNameUser).expect(400);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
