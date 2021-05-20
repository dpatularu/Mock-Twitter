const supertest = require('supertest');
const mongoose = require('mongoose');
const { registerUser, initialTweets, retrieveRandomTweetFromDb } = require('./test_helper');
const app = require('../app');

const api = supertest(app);

const User = require('../models/user');
const Tweet = require('../models/tweet');

let user;
let token;
const invalidToken = 'bearer 12345iaminvalid';

describe('Tweets have CRUD and user authentication functionality', () => {
  beforeAll(async () => {
    await User.deleteMany({});
    const userLogin = await registerUser('tester', 'password');

    const response = await api.post('/api/login').send(userLogin);
    user = {
      ...response.body,
    };
    token = `bearer ${user.token}`;
  });

  beforeEach(async () => {
    await Tweet.deleteMany({});

    let tweets = [];
    for (let i = 0; i < initialTweets.length; i++) {
      const newTweet = new Tweet({
        content: initialTweets[i].content,
        userid: user.id,
        likedBy: [],
        replies: [],
      });
      tweets = tweets.concat(newTweet);
    }
    const promiseArray = tweets.map((tweet) => tweet.save());
    await Promise.all(promiseArray);
  });

  test('Retrieve all tweets from a user', async () => {
    const response = await api.get('/api/tweets').set('authorization', token).expect(200);
    expect(response.body).toHaveLength(3);
  });

  test('Retrieve specific tweet by id', async () => {
    const tweetToRetrieve = await retrieveRandomTweetFromDb();
    const { tweetid } = tweetToRetrieve;
    await api.get(`/api/tweets/${tweetid}`).set('authorization', token).expect(200);
  });

  test('Cannot retrieve non-existant tweet', async () => {
    const tweetid = '123idontexist456';
    await api.get(`/api/tweets/${tweetid}`).set('authorization', token).expect(400);
  });

  test('Add a tweet and invalid Tokens get 401', async () => {
    const newTweet = {
      content: 'I am a new tweet',
      userid: user.id,
    };
    const addedTweet = await api.post('/api/tweets').set('authorization', token).send(newTweet).expect(201);
    expect(addedTweet.body).toMatchObject(newTweet);

    const tweetsAtEnd = await Tweet.find({});
    expect(tweetsAtEnd).toHaveLength(initialTweets.length + 1);

    await api.post('/api/tweets').set('authorization', invalidToken).send(newTweet).expect(401);
  });

  test('Delete a tweet and invalid tokens get 401', async () => {
    const tweetToRemove = await retrieveRandomTweetFromDb();
    const { tweetid } = tweetToRemove;

    await api.delete(`/api/tweets/${tweetid}`).set('authorization', token).expect(204);
    await api.delete(`/api/tweets/${tweetid}`).set('authorization', invalidToken).expect(401);
  });

  test('Update a tweet and invalid Tokens get 401', async () => {
    const newTweet = {
      content: 'Updated Tweet',
    };

    let tweetToUpdate = await retrieveRandomTweetFromDb();
    tweetToUpdate = {
      ...tweetToUpdate,
      content: 'Updated Tweet',
    };
    const { tweetid } = tweetToUpdate;

    const response = await api.put(`/api/tweets/${tweetid}`).set('authorization', token).send(newTweet).expect(200);

    expect(response.body).toMatchObject(newTweet);
  });

  test('Thread functionality. Users can reply to tweets', async () => {
    const tweetToReply = await retrieveRandomTweetFromDb();
    const { tweetid } = tweetToReply;

    const replyTweet = {
      content: 'reply',
    };

    const response = await api.post(`/api/tweets/${tweetid}`).set('authorization', token).send(replyTweet).expect(201);

    expect(response.body.replies).toHaveLength(1);
  });

  test('Like and unlike functionality', async () => {
    const tweetToLike = await retrieveRandomTweetFromDb();
    const { tweetid } = tweetToLike;

    const likeResponse = await api.patch(`/api/tweets/${tweetid}`).set('authorization', token).expect(200);
    expect(likeResponse.body.likedBy).toHaveLength(1);

    const unlikeResponse = await api.patch(`/api/tweets/${tweetid}`).set('authorization', token).expect(200);
    expect(unlikeResponse.body.likedBy).toHaveLength(0);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
