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

    const senderLogin = await registerUser('sender', 'password');
    const recipientLogin = await registerUser('recipient', 'password');

    const senderResponse = await api.post('/api/login').send(senderLogin);
    senderToken = `bearer ${senderResponse.body.token}`;

    const recipientResponse = await api.post('/api/login').send(recipientLogin);
    recipientToken = `bearer ${recipientResponse.body.token}`;
  });

  beforeEach(async () => {
    await DirectMessage.deleteMany({});
  });

  test('Direct Messages are successfully sent', async () => {
    const message = {
      message: 'this is a test',
    };
    await api.post('/api/inbox/recipient').set('authorization', senderToken).send(message).expect(200);
  });

  test('Recipient has successfully received senders DM', async () => {
    const message = {
      message: 'this is a test',
    };
    await api.post('/api/inbox/recipient').set('authorization', senderToken).send(message);

    const recipientInbox = await api.get('/api/inbox').set('authorization', recipientToken);

    expect(recipientInbox.body[0]).toMatchObject({
      sender: 'sender',
      recipient: 'recipient',
      message: 'this is a test',
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
