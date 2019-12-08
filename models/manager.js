const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
	number: {
		type: String,
      	required: true
    },
	password: {
		type: String,
      	required: true
    },
	name: {
		type: String,
      	required: true
    },
	rating: {
		type: Number,
      	required: true
    },
  sum: {
    type: Number,
        required: true
    },
  reviews: {
    type: Number,
        required: true
    },
  role: {
    type: String,
        required: true
    }
});

module.exports = mongoose.model('manager', schema);