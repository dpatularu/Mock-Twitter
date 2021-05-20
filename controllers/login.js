/* eslint-disable no-underscore-dangle */
const loginRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

loginRouter.post('/', async (request, response) => {
  const { body } = request;
  const user = await User.findOne({ username: body.username });

  const isPasswordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.password);

  if (!(user && isPasswordCorrect)) {
    return response.status(401).json({
      error: 'Error: Invalid username or password',
    });
  }

  const userInfoPayload = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userInfoPayload, process.env.SECRET, { expiresIn: 3600 });

  return response.status(200).send({
    token,
    username: user.username,
  });
});

module.exports = loginRouter;
