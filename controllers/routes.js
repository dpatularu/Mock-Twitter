const registerRouter = require('./register');
const loginRouter = require('./login');
const tweetRouter = require('./tweets');
const inboxRouter = require('./inbox');

module.exports = {
  registerRouter,
  loginRouter,
  inboxRouter,
  tweetRouter,
};
