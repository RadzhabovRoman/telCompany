const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
	number: {
		type: String,
      	required: true
    },
	available: [String],
	confirmed: [String],
    bought: [String]
});

module.exports = mongoose.model('service', schema);