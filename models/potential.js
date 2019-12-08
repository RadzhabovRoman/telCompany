const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
	number: {
		type: String,
      	required: true
    },
	services: {
		type: [String],
		required: true
	}
});

module.exports = mongoose.model('potential', schema);