const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  recipient: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
});

directMessageSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.msgid = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('DirectMessage', directMessageSchema);
