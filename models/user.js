const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: 4,
  },
  password: {
    type: String,
    required: true,
  },
  directMessages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DirectMessage',
    },
  ],
  tweets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tweet',
    },
  ],
});

userSchema.plugin(uniqueValidator);

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // eslint-disable-next-line no-param-reassign
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

module.exports = mongoose.model('User', userSchema);
