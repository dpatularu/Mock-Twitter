const inboxRouter = require('express').Router();
const DirectMessage = require('../models/directmessage');

inboxRouter.get('/', async (request, response) => {
  const { user } = request;
  const allDMs = await DirectMessage.find({ recipiant: user.username });

  return response.json(allDMs);
});

inboxRouter.post('/:recipiant', async (request, response) => {
  const { recipiant } = request.params;
  const { body, user } = request;

  const newMessage = new DirectMessage({
    sender: user.username,
    recipiant,
    message: body.message,
  });

  await newMessage.save();
  return response.send({ message: 'DM sent!' });
});

module.exports = inboxRouter;
