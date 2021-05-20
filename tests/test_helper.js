const bcrypt = require('bcrypt');
const User = require('../models/user');
const Tweet = require('../models/tweet');

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

const initialTweets = [
  { content: 'i love twitter', replies: [], likedBy: [] },
  { content: 'follow for follow!', replies: [], likedBy: [] },
  { content: 'i ate a pizza today', replies: [], likedBy: [] },
];

const retrieveRandomTweetFromDb = async () => {
  const tweets = await Tweet.find({});

  // We parse and stringify to turn the id object into a string
  const retrievedTweet = JSON.parse(JSON.stringify(tweets[0]));
  return retrievedTweet;
};

module.exports = {
  registerUser,
  initialTweets,
  retrieveRandomTweetFromDb,
};
