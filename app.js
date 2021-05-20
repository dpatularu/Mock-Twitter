const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('express-async-errors');
const middleware = require('./utils/middleware');

const app = express();

const {
  loginRouter, registerRouter, tweetRouter, inboxRouter,
} = require('./controllers/routes');
const config = require('./utils/config');

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true,
});

app.use(cors());
app.use(express.json());
app.use(middleware.tokenExtractor);

app.use('/api/register', registerRouter);
app.use('/api/login', loginRouter);
app.use('/api/inbox', middleware.userExtractor, inboxRouter);
app.use('/api/tweets', middleware.userExtractor, tweetRouter);

app.use(middleware.errorHandler);

module.exports = app;
