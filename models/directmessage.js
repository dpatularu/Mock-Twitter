/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  recipiant: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
});

directMessageSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.tweetid = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('DirectMessage', directMessageSchema);
