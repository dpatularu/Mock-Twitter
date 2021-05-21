# Speer-Twitter
## Twitter API created for the Speer Backend Assessment


Speer-Twitter is a RESTful API created with Node.js, Express and MongoDB. It was created for Speer as part of their backend assessment challenge. I had quite a lot of fun with it and doing something with my hands on is time well spent. 

## Features
- User registration with unique username and a password
- User login with with session maintenance using JSON Web Tokens
- Chat functionality via direct messaging. Users can send DMs to other user's inboxes.
- Complete CRUD API for tweets.
- Ability to like/unlike tweets.
- Users can reply to tweets for threading functionality.
- Plenty of thorough unit and integration tests!

The API is designed to give all the necessary data so that frontend developers do not have to make hacky patchwork requests to get the information they need. Good, clean code is everyone's responsibility so that others spend more time implementing features and less time untangling metaphorical wires.

## Technologies

Speer-Twitter is created with the following tech:

- [Node.js](https://nodejs.dev/) - my first (but not last!) backend language that I learned
- [Express](https://expressjs.com/) - a lovely framework for node.js
- [jwt](https://jwt.io/) - for session maintenance
- [MongoDB](https://www.mongodb.com/) - our NOSQL document-based database
- [bcrypt](https://www.npmjs.com/package/bcrypt) - encryption and hashing for passwords
# Developer Depencencies
A product is only as good as its codebase
- [ESLint](https://eslint.org/) - Automated code styling and syntax for consistent readability
- [jest](https://jestjs.io/) - Facebook's delightful testing framework



## Installation

Speer-Twitter requires [Node.js](https://nodejs.org/) and a [MongoDB](https://www.mongodb.com) cluster. In the MongoDB Cluster, make a two databases; one will be for production while the other is for testing.

Install the dependencies and devDependencies and start the server.
```sh
npm i
node index
```

Set up environment variables

```sh
touch .env
```
Inside .env...
```sh
MONGODB_URI='put uri to MongoDB URI here'
TEST_MONGODB_URI='put uri to MongoDB test database'

PORT=3003
SECRET='jwt secret string for hashing'
```

## My experiences developing this app

I would first like to say that this was a very fun project to create. It was the perfect difficulty level for me as there were both features I knew how to implement and features I had to think and plan my approach for. I am walking away from this experience a better developer and more knowledgable on server development.

When you are given a project to create, you have to start small. The smallest place you can start is how you are going to organize your code. The worst thing you can do is put everything in one big file as it will only make future features exponentially harder to implement. So I created the following folders:
-  controllers: holds all the routing and business logic
-  models: holds the logic for MongoDB models 
-  tests: all tests using jest are here
-  utils: helper functions, configs and middleware are stored here

With this structure, the codebase becomes much more wieldly and pleasant to use. 

The next step is to actually start coding. We start with creating user registration and login, as our tweets will need to know who is logged in to have any meaningful functionality. 

Registering users is easy enough, we just have to make sure the password in the request object is immediately hashed and removed for security reasons. We use the bcrypt library to hash and verify passwords. Once we can store new users (hopefully with hashed passwords!) we now implement logging in, which is quite easy as we're just checking the request body has the right information.

```javascript
// Register a new account
registerRouter.post('/', async (request, response) => {
  const { body } = request;

  if (body.password.length < 5) {
    return response.status(400).send({ error: 'Password must be greater than 4 characters' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);
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
```

```javascript
// Login to an existing account
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
    id: user._id,
  });
});
```



Once completed, we write tests to ensure all possible cases are satisfied.

```
 PASS  tests/register_api.test.js
  Registration tests
    √ Successful registration returns 200 (519 ms)
    √ Username must be unique (270 ms)
    √ Registration with too short of password returns 400 (35 ms)
    √ Registration with too short of username returns 400 (128 ms)

 PASS  tests/login_api.test.js
  Login tests
    √ Successful login returns status 200 and JWT (632 ms)
    √ Invalid login credentials return status 401 (201 ms)
```
So far, so good. Next up is adding chat functionality. The implementation for this is inspired by the direct messaging feature on Twitter. Users can send DMs to others, who can then read and reply back. We'll need a DirectMessage schema, a new endpoint we call inbox and, of course, tests to make sure that adding new functionality wont break old ones!

```
 PASS  tests/inbox_api.test.js
  Chat functionality with Direct Messages
    √ Direct Messages are successfully sent (100 ms)
    √ Recipient has successfully received senders DM (133 ms)
```
Awesome, now for the meat-and-potatoes, the CRUD. It really isn't so bad to write a CRUD API if you've done it a bunch of times before. The time was mostly spent prettying up the code, refactoring, creating helper functions and commenting any confusing bits. The tests were fun to write as I had to think about various ways users could break the API.

Let's give the test a whirl and...
```
 PASS  tests/tweets_api.test.js
  Tweets have CRUD and user authentication functionality
    √ Retrieve all tweets from a user (130 ms)
    √ Retrieve specific tweet by id (160 ms)
    √ Cannot retrieve non-existant tweet (75 ms)
    √ Add a tweet and invalid Tokens get 401 (233 ms)
    √ Delete a tweet and invalid tokens get 401 (165 ms)
    √ Update a tweet and invalid Tokens get 401 (160 ms)
```
we're good!

Now moving on to threading and likes. This one I had to think a bit on. If you think logically, you like and reply to tweets, so I will have to somehow alter existing tweets with necessary information. It's really easy to muck up the code and make a confusing API when things depend on each other, but thankfully database management systems come equipped with use cases like threads and likes. I altered the Tweet schema as such:

```javascript
const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
    },
  ],
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});
```
Now every tweet has two arrays, one for likes which will hold users (who liked that tweet) and another for replies to that tweet. We have successfully set the foundations to add our functionalities. It felt good to come up with an elegant solution to a problem I did not immediately know the answer for. I spent a lot of time with competitive programming problems, particularly on LeetCode, so that has given me the patience to work through these sort of challenges. All we have to do is make a few more endpoints and tests

Let's create the endpoint for likes. Since we are altering tweets slightly, we will use the patch HTTP method
```javascript
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
```

For replying to threads:
```javascript
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
```

Now for the moment of truth...
```    
 PASS  tests/tweets_api.test.js
    √ Thread functionality. Users can reply to tweets (280 ms)
    √ Like and unlike functionality (227 ms)
```

And it's done! The thing I am most proud of is seeing the responses on Postman.
```
{
        "replies": [
            {
                "replies": [
                    "60a6c8fd75714333b43edd3b"
                ],
                "likedBy": [
                    "60a6a240c8dc5b45400d6042"
                ],
                "content": "This is a reply to your thread!",
                "userid": "60a6a160896f96264014384f",
                "tweetid": "60a6c88975714333b43edd3a"
            }
        ],
        "likedBy": [
            "60a6a160896f96264014384f"
        ],
        "content": "THREAD",
        "userid": "60a6a240c8dc5b45400d6042",
        "tweetid": "60a6ace429fd243668c92605"
    },
```

Seeing all of the functionality I created work together is very satisfying. 

That concludes my experiences working on this assessment. Thank you for the opportunity to showcase my skills. You can see the history of development if you follow the commits I've made along the way. If you have any questions do not hesitate to ask and I look forward to hearing from you!
