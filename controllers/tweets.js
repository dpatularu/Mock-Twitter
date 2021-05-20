/* eslint-disable no-underscore-dangle */
const tweetRouter = require('express').Router();
const Tweet = require('../models/tweet');
const User = require('../models/user');

tweetRouter.get('/', async (request, response) => {
  const allTweets = await Tweet.find({});
  return response.json(allTweets);
});

tweetRouter.get('/:tweetid', async (request, response) => {
  const { tweetid } = request.params;
  const tweetInDatabase = await Tweet.findById(tweetid);

  if (!tweetInDatabase) {
    return response.status(400).json({ error: 'Error: tweet does not exist in database' });
  }
  return response.json(tweetInDatabase);
});

tweetRouter.post('/', async (request, response) => {
  const { body } = request;

  const tweet = new Tweet({
    content: body.content,
    userid: request.user.id,
  });

  const savedTweet = await tweet.save();

  const user = await User.findById(request.user.id);
  user.tweets = user.tweets.concat(savedTweet._id);
  await user.save();

  return response.status(201).json(savedTweet);
});

tweetRouter.put('/:tweetid', async (request, response) => {
  const { body } = request;
  const { tweetid } = request.params;

  const tweetInDatabase = await Tweet.findById(tweetid);

  if (!tweetInDatabase) {
    return response.status(400).json({ error: 'Error: tweet does not exist in database' });
  }

  if (!request.user.id || request.user.id !== tweetInDatabase.userid.toString()) {
    return response.status(401).json({ error: 'Authenitcation failed: token either missing or invalid' });
  }

  const tweet = {
    ...body,
  };

  const updatedTweet = await Tweet.findByIdAndUpdate(tweetid, tweet, { new: true });
  return response.status(200).json(updatedTweet);
});

tweetRouter.delete('/:tweetid', async (request, response) => {
  const { tweetid } = request.params;
  const tweetInDatabase = await Tweet.findById(tweetid);

  if (!tweetInDatabase) {
    return response.status(400).json({ error: 'Error: tweet does not exist in database' });
  }

  if (!request.user.id || request.user.id !== tweetInDatabase.userid.toString()) {
    return response.status(401).json({ error: 'Authenitcation failed: token either missing or invalid' });
  }

  await Tweet.findByIdAndRemove(tweetid);
  return response.status(204).end();
});

module.exports = tweetRouter;
