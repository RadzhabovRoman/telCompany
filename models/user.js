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
	balance: {
		type: Number,
      	required: true
    },
  mail: {
    type: String
    },
  role: {
    type: String,
        required: true
    }
});

module.exports = mongoose.model('user', schema);