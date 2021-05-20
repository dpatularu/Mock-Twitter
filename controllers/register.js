const registerRouter = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

registerRouter.post('/', async (request, response) => {
  const { body } = request;

  if (body.password.length < 5) { return response.status(400).send({ error: 'Password must be greater than 4 characters' }); }

  const passwordHash = await bcrypt.hash(body.password, 10); // rename magic number 10
  delete body.password;

  const user = new User({
    username: body.username,
    password: passwordHash,
  });

  await user.save();

  return response.send({
    message: 'Registration complete! Please log in.',
  });
});

module.exports = registerRouter;
