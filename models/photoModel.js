var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var photoSchema = new Schema({
	'path' : String,
	'postedBy' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	}
});

module.exports = mongoose.model('photo', photoSchema);
