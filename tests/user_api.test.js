const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);

const User = require('../models/user');

describe('Login and Registration tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash('password', 10);
    const user = new User({
      username: 'tester',
      password: passwordHash,
    });

    await user.save();
  });

  test('Successful login returns status 200 and JWT', async () => {
      const user = {
          username: 'tester',
          password: 'password'
      }
      const response = await api.post('/api/login').send(user).expect(200);
      expect(response.body).toHaveProperty('token');
  })

  test('Invalid login credentials return status 401', async () => {
      const nonExistantUser = {
          username: 'idontexist',
          password: 'ghost2'
      }
      await api.post('/api/login').send(nonExistantUser).expect(401);
  })

  test('Successful registration returns 200', async () => {
      const newUser = {
          username: 'newguy42',
          password: 'hunter2'
      }
      await api.post('/api/register').send(newUser).expect(200);
  })

  test('Registration with too short of password returns 400', async () => {
      const shortPasswordUser = {
          username: 'tinypassword',
          password: 'ab'
      }
      await api.post('/api/register').send(shortPasswordUser).expect(400);
  })

    test('Registration with too short of username returns 400', async () => {
      const shortNameUser = {
          username: 'abc',
          password: 'password'
      }
      await api.post('/api/register').send(shortNameUser).expect(400);
  })
});

afterAll(() => {
    mongoose.connection.close()
  })