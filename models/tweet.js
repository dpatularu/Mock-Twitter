/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

tweetSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.tweetid = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Tweet', tweetSchema);
