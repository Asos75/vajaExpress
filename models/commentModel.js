var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var commentSchema = new Schema({
	'postedBy' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'content' : String,
	'date' : Date
});

module.exports = mongoose.model('comment', commentSchema);
