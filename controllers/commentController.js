var CommentModel = require('../models/commentModel.js');
var AnswerModel = require('../models/answerModel.js');
var QuestionModel = require('../models/questionModel.js');
const { update } = require('./photoController.js');
/**
 * commentController.js
 *
 * @description :: Server-side logic for managing comments.
 */
module.exports = {

    /**
     * commentController.list()
     */
    list: function (req, res) {
        CommentModel.find(function (err, comments) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting comment.',
                    error: err
                });
            }

            return res.json(comments);
        });
    },

    /**
     * commentController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        CommentModel.findOne({_id: id}, function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting comment.',
                    error: err
                });
            }

            if (!comment) {
                return res.status(404).json({
                    message: 'No such comment'
                });
            }

            return res.json(comment);
        });
    },

    /**
     * commentController.create()
     */
    createAnswerComment: function (req, res) {
        var comment = new CommentModel({
            postedBy : req.session.userId,
            content : req.body.content,
            date : new Date()
        });
    
        comment.save(function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating comment',
                    error: err
                });
            }
            parentId = req.params.id; // Assuming id of the answer is in the params
            AnswerModel.findOneAndUpdate(
                {_id: parentId},
                {$addToSet: { comments: comment._id }},
                {new: true}, // To return the updated answer document
                function(err, answer) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when updating answer with comment',
                            error: err
                        });
                    }
                    return res.redirect('/answer/list/'+answer.question);
                }
            );
        });
    },

    createQuestionComment: function (req, res) {
        var comment = new CommentModel({
            postedBy : req.session.userId,
            content : req.body.content,
            date : new Date()
        });
    
        comment.save(function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating comment',
                    error: err
                });
            }
            parentId = req.params.id; // Assuming id of the answer is in the params
            QuestionModel.findOneAndUpdate(
                {_id: parentId},
                {$addToSet: { comments: comment._id }},
                {new: true}, // To return the updated answer document
                function(err, answer) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when updating answer with comment',
                            error: err
                        });
                    }
                    return res.redirect("/");
                }
            );
        });
    },

    /**
     * commentController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        CommentModel.findOne({_id: id}, function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting comment',
                    error: err
                });
            }

            if (!comment) {
                return res.status(404).json({
                    message: 'No such comment'
                });
            }

            comment.postedBy = req.body.postedBy ? req.body.postedBy : comment.postedBy;
			comment.content = req.body.content ? req.body.content : comment.content;
			comment.date = req.body.date ? req.body.date : comment.date;
			
            comment.save(function (err, comment) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating comment.',
                        error: err
                    });
                }

                return res.json(comment);
            });
        });
    },

    /**
     * commentController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        CommentModel.findByIdAndRemove(id, function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the comment.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    removeQuestionComment: function (req, res) {
        var id = req.params.id;

        CommentModel.findByIdAndRemove(id, function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the comment.',
                    error: err
                });
            }

            QuestionModel.findOneAndUpdate(
                { "comments": comment._id },
                { $pull: { comments: comment._id } },
                function(err, result) {
                    if (err) {
                        console.error('Error:', err);
                    } else if (!result) {
                        console.log('No document found with the specified comment ID.');
                    } else {
                        console.log('Document updated successfully.');
                    }
                    return res.redirect("/");
                }
                
            );
        });
    },

    removeAnswerComment: function(req, res){
        var id = req.params.id;

        CommentModel.findByIdAndRemove(id, function (err, comment) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the comment.',
                    error: err
                });
            }

            AnswerModel.findOneAndUpdate(
                { "comments": comment._id },
                { $pull: { comments: comment._id } },
                function(err, result) {
                    if (err) {
                        console.error('Error:', err);
                    } else if (!result) {
                        console.log('No document found with the specified comment ID.');
                    } else {
                        console.log('Document updated successfully.');
                    }
                    return res.redirect("/answer/list/"+result.question);
                }
                
            );
        });
    }
};
