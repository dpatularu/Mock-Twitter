const inboxRouter = require('express').Router();
const DirectMessage = require('../models/directmessage');
const User = require('../models/user');

inboxRouter.get('/', async (request, response) => {
  const { user } = request;
  const allDMs = await DirectMessage.find({ recipient: user.username });

  return response.json(allDMs);
});

inboxRouter.post('/:recipient', async (request, response) => {
  const { recipient } = request.params;
  const { body, user } = request;

  const userInDatabase = await User.find({ username: recipient });

  if (!userInDatabase) {
    return response.status(400).json({ error: 'Error: user does not exist in database' });
  }

  const newMessage = new DirectMessage({
    sender: user.username,
    recipient,
    message: body.message,
  });

  await newMessage.save();
  return response.send({ message: 'DM sent!' });
});

module.exports = inboxRouter;
