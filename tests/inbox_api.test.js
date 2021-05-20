const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { registerUser } = require('./test_helper');

const api = supertest(app);

const User = require('../models/user');
const DirectMessage = require('../models/directmessage');

let senderToken;
let recipientToken;

describe('Chat functionality with Direct Messages', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    await DirectMessage.deleteMany({});

    const senderLogin = await registerUser('sender', 'password');
    const recipientLogin = await registerUser('recipient', 'password');

    const senderResponse = await api.post('/api/login').send(senderLogin);
    senderToken = `bearer ${senderResponse.body.token}`;

    const recipientResponse = await api.post('/api/login').send(recipientLogin);
    recipientToken = `bearer ${recipientResponse.body.token}`;
  });

  test('Direct Messages are successfully sent', async () => {
    const message = {
      message: 'this is a test',
    };
    await api.post('/api/inbox/recipient').set('authorization', senderToken).send(message).expect(200);
  });

  test('User can retrieve messages from their inbox', async () => {
    const recipientInbox = await api.get('/api/inbox').set('authorization', recipientToken);

    delete recipientInbox.body[0].msgid;

    expect(recipientInbox.body[0]).toEqual({
      sender: 'sender',
      recipient: 'recipient',
      message: 'this is a test',
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
