const bcrypt = require('bcrypt');
const User = require('../models/user');

const registerUser = async (username, password) => {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    username,
    password,
  };

  const newUser = new User({
    username,
    password: passwordHash,
  });

  await newUser.save();

  return user;
};

module.exports = {
  registerUser,
};
