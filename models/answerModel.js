var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var answerSchema = new Schema({
	'content' : String,
	'date' : Date,
	'upvotes' : {
		type: [{
			type: Schema.Types.ObjectId,
			ref: 'user'
		}],
	},
	'downvotes' : {
		type: [{
			type: Schema.Types.ObjectId,
			ref: 'user'
		}],
	},
	'comments' : {
		type: [{
			type: Schema.Types.ObjectId,
			ref: 'comment'
		}],
	},
	'postedBy' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'question' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'question'
	}
});

module.exports = mongoose.model('answer', answerSchema);
