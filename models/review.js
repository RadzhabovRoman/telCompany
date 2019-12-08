const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
	managerNumber: {
		type: String,
      	required: true
    },
	reviewText: {
		type: String,
      	required: true
    },
	userNumber: {
		type: String,
      	required: true
    },
  timestamp: {
    type: Number,
    default: Date.now
  }
});

module.exports = mongoose.model('review', schema);