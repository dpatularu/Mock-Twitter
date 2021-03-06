const tweetRouter = require('express').Router();
const Tweet = require('../models/tweet');
const User = require('../models/user');
const { compareIdToString } = require('../utils/helper_functions');

// Get all tweets in the database
tweetRouter.get('/', async (request, response) => {
  const allTweets = await Tweet.find({}).populate('replies', {
    content: 1, userid: 1, replies: 1, likedBy: 1,
  });
  return response.json(allTweets);
});

// Get a specific tweet from the database
tweetRouter.get('/:tweetid', async (request, response) => {
  const { tweetid } = request.params;
  const tweetInDatabase = await Tweet.findById(tweetid).populate('replies', {
    content: 1, userid: 1, replies: 1, likedBy: 1,
  });

  return response.json(tweetInDatabase);
});

// Add a tweet to the database
tweetRouter.post('/', async (request, response) => {
  const { body } = request;

  const tweet = new Tweet({
    content: body.content,
    userid: request.user.id,
    replies: [],
    likedBy: [],
  });

  const savedTweet = await tweet.save();

  const user = await User.findById(request.user.id);
  user.tweets = user.tweets.concat(savedTweet._id);
  await user.save();

  return response.status(201).json(savedTweet);
});

// Reply to a tweet's thread
tweetRouter.post('/:tweetid', async (request, response) => {
  const { body } = request;
  const { tweetid } = request.params;
  const thread = await Tweet.findById(tweetid);

  /* Add the reply tweet to DB */
  const reply = new Tweet({
    content: body.content,
    userid: request.user.id,
    replies: [],
    likedBy: [],
  });
  const savedReply = await reply.save();

  /* Append target tweet's reply array with new reply */
  thread.replies = thread.replies.concat(savedReply._id);
  const updatedThread = await thread.save();

  /* Update user's tweets */
  const user = await User.findById(request.user.id);
  user.tweets = user.tweets.concat(savedReply._id);

  await user.save();

  return response.status(201).json(updatedThread);
});

// Edit a tweet in the database
tweetRouter.put('/:tweetid', async (request, response) => {
  const { body } = request;
  const { tweetid } = request.params;

  const tweetInDatabase = await Tweet.findById(tweetid);

  if (request.user.id !== tweetInDatabase.userid.toString()) {
    return response.status(401).json({ error: 'Authenitcation failed: token either missing or invalid' });
  }

  const tweet = {
    ...body,
  };

  const updatedTweet = await Tweet.findByIdAndUpdate(tweetid, tweet, { new: true });
  return response.status(200).json(updatedTweet);
});

// Delete a tweet from the database
tweetRouter.delete('/:tweetid', async (request, response) => {
  const { tweetid } = request.params;
  const tweetInDatabase = await Tweet.findById(tweetid);

  // Check if logged in user matches owner of tweet
  if (request.user.id !== tweetInDatabase.userid.toString()) {
    return response.status(401).json({ error: 'Authenitcation failed: token either missing or invalid' });
  }

  await Tweet.findByIdAndRemove(tweetid);
  return response.status(204).end();
});

// Like/Unlike a tweet
tweetRouter.patch('/:tweetid', async (request, response) => {
  const { tweetid } = request.params;
  const likedTweet = await Tweet.findById(tweetid);

  // If user  already liked tweet, unlike it; else, like it
  if (likedTweet.likedBy.includes(request.user.id)) {
    // compareIdToString will compare a MongoDB ObjectID to a string for equality
    likedTweet.likedBy = likedTweet.likedBy.filter((id) => compareIdToString(id, request.user.id));
  } else {
    likedTweet.likedBy = likedTweet.likedBy.concat(request.user.id);
  }

  const updatedTweet = await likedTweet.save();
  return response.status(200).json(updatedTweet);
});

module.exports = tweetRouter;
