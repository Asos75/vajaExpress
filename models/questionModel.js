var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var questionSchema = new Schema({
	'title' : {type : String, required : true},
	'description' : {type : String, required : true},
	'postedBy' : {
		type: Schema.Types.ObjectId,
		ref: 'user',
		required : true
   	},
	'featuredAnswer' : {
		type: Schema.Types.ObjectId,
		ref: 'answer'
	},
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
	'views' : {
		type: [{
			key: { type: Schema.Types.ObjectId, ref: 'user' },
			value: Date
		}]
	},
	'date' :  {type : Date, required : true},
});

module.exports = mongoose.model('question', questionSchema);
