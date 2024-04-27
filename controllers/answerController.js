var AnswerModel = require('../models/answerModel.js');
var QuestionModel = require('../models/questionModel.js');
var PhotoModel = require('../models/photoModel.js');
var CommentModel = require('../models/commentModel.js');
/**
 * answerController.js
 *
 * @description :: Server-side logic for managing answers.
 */
module.exports = {

    /**
     * answerController.list()
     */
    list: function (req, res) {
        QuestionModel.findById(req.params.question_id)
            .populate('postedBy').populate('featuredAnswer')
            .exec()
            .then(async function (question) {
                if (!question) {
                    return res.status(404).json({
                        message: 'Question not found.'
                    });
                }
    
                try {

                    if(req.session.userId){
                        const viewIndex = question.views.findIndex(view => view.key.equals(req.session.userId));

                        if (viewIndex == -1) {
                            question.views.push({ key: req.session.userId, value: new Date() });
                        } else {
                            question.views[viewIndex].value = new Date();
                        }

                        question = await question.save();
                    }
                    question.viewCount = question.views.length;

                    const photo = await PhotoModel.findOne({ postedBy: question.postedBy._id }).exec();

                    if (photo) {
                        question.postedBy.path = photo.path;
                    } else {
                        question.postedBy.path = '/images/default.jpg'; 
                    }
                    
                    question.upvotesCount = question.upvotes.length;
                    question.downvotesCount = question.downvotes.length;


                    question.upvoted = false;
                    question.downvoted = false;
                    if(question.upvotes.includes(req.session.userId)){
                        question.upvoted = true;
                    }
                    if(question.downvotes.includes(req.session.userId)){
                        question.downvoted = true;
                    }

                    
                    const isset = req.session.userId ? true : false;
    
                    const answers = await AnswerModel.find({question: req.params.question_id}).populate("postedBy").populate({path: "comments", populate: { path: "postedBy" }});

                    var featured = null;

                    for (let answer of answers) {
                        const photo = await PhotoModel.findOne({ postedBy: answer.postedBy._id });
            
                        if (photo) {
                            answer.postedBy.path = photo.path;
                        } else {
                            answer.postedBy.path = '/images/default.jpg'; 
                        }
                        answer.isset = false;
                        if(req.session.userId){
                            answer.isset = true;
                        }

                        answer.own = false;
                        if(answer.postedBy._id == req.session.userId){
                            answer.own = true;
                        }

                        answer.canFeature = false;
                        if(req.session.userId == question.postedBy._id){
                            answer.canFeature = true;
                        }
                        try{
                            if(answer._id.toString() === question.featuredAnswer._id.toString()){
                                featured = answer;
                            }                  
                        } catch(err){}

                    
                        answer.upvotesCount = answer.upvotes.length;
                        answer.downvotesCount = answer.downvotes.length;
                       

                        answer.upvoted = false;
                        answer.downvoted = false;
                        if(answer.upvotes.includes(req.session.userId)){
                            answer.upvoted = true;
                        }
                        if(answer.downvotes.includes(req.session.userId)){
                            answer.downvoted = true;
                        }

                        for(let comment of answer.comments){
                            comment.own = false;
                            if(comment.postedBy._id == req.session.userId){
                                comment.own = true
                            }
                        }

                        answer.hasComments = false;
                        if(answer.comments.length != 0){
                            answer.hasComments = true;
                        }
                    }

                    if(featured != null){
                        var index = answers.indexOf(featured);
                        answers.splice(index, 1);
                    }
                    
                    return res.render('answer/list', { question: question, answers: answers, isset: isset, featured: featured});
                } catch (err) {
                    return res.status(500).json({
                        message: 'Error when making the list.',
                        error: err
                    });
                }
            })
            .catch(function (err) {
                return res.status(500).json({
                    message: 'Error when getting question.',
                    error: err
                });
            });
    },

    /**
     * answerController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        AnswerModel.findOne({_id: id}, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer.',
                    error: err
                });
            }

            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }

            return res.json(answer);
        });
    },

    /**
     * answerController.create()
     */
    create: function (req, res) {
        var answer = new AnswerModel({
			content : req.body.response,
			date : new Date(),
			upvotes : [],
			downvotes : [],
            comments: [],
			postedBy : req.session.userId,
			question : req.params.question_id
        });

        answer.save(function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating answer',
                    error: err
                });
            }

            return res.redirect('../../answer/list/'+req.params.question_id);
        });
    },

    /**
     * answerController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        AnswerModel.findOne({_id: id}, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer',
                    error: err
                });
            }

            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }

            answer.content = req.body.content ? req.body.content : answer.content;
			answer.date = req.body.date ? req.body.date : answer.date;
			answer.upvotes = req.body.upvotes ? req.body.upvotes : answer.upvotes;
			answer.downvotes = req.body.downvotes ? req.body.downvotes : answer.downvotes;
			answer.postedBy = req.body.postedBy ? req.body.postedBy : answer.postedBy;
			answer.question = req.body.question ? req.body.question : answer.question;
			
            answer.save(function (err, answer) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating answer.',
                        error: err
                    });
                }

                return res.json(answer);
            });
        });
    },

    /**
     * answerController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        AnswerModel.findByIdAndRemove(id, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the answer.',
                    error: err
                });
            }

            QuestionModel.findOneAndUpdate(
                { _id: answer.question },
                { $unset: { featuredAnswer: 1 } }, 
                { new: true }, 
                function(err, updatedQuestion) {
                    if (err) {
                        console.error('Error when updating question:', err);
                        return;
                    }
            
                    if (!updatedQuestion) {
                        console.error('Question not found.');
                        return;
                    }
            
                    CommentModel.deleteMany({ _id: { $in: answer.comments } })
                    .then(result => {
                        return res.redirect('../../answer/list/'+updatedQuestion._id);
                    })
                    .catch(err => {
                        console.error('Error deleting comments:', err);
                    });
                    
                }
            );
            
            
        });
    },

    mark: function(req, res) {
        AnswerModel.findOne({_id: req.params.id}, function (err, answer) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting answer.',
                    error: err
                });
            }

            if (!answer) {
                return res.status(404).json({
                    message: 'No such answer'
                });
            }

            QuestionModel.findOne({_id: answer.question._id}, function(err, question) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting question.',
                        error: err
                    });
                }
    
                if (!question) {
                    return res.status(404).json({
                        message: 'No such question associated with the answer'
                    });
                }
    
                question.featuredAnswer = req.params.id;

                question.save(function(err, updatedQuestion) {
                    if (err) {
                        // Handle error
                        console.error('Error when updating question:', err);
                        return;
                    }
                    return res.redirect('../../answer/list/'+question._id);
                });
                // Return both the answer and the associated question as JSON
                
            });
        });
    },

    unmark: function(req, res){
        QuestionModel.findOneAndUpdate(
            { _id: req.params.id }, // Query to find the document by its ID
            { $unset: { featuredAnswer: 1 } }, // Use the $unset operator to remove the field
            { new: true }, // To return the updated document
            function(err, updatedQuestion) {
                if (err) {
                    // Handle error
                    console.error('Error when updating question:', err);
                    return;
                }
        
                if (!updatedQuestion) {
                    // Question not found
                    console.error('Question not found.');
                    return;
                }
        
                return res.redirect('../../answer/list/'+req.params.id);
            }
        );
    },

    upvote: function(req, res) {

        AnswerModel.findOne({ _id: req.params.id }, function(err, answer) {
            if (err) {
                console.error('Error when upvoting answer:', err);
                return res.status(500).json({
                    message: 'Error when upvoting answer',
                    error: err
                });
            }
        
            if (!answer) {
                return res.status(404).json({
                    message: 'Answer not found'
                });
            }
            
            if(!answer.upvotes.includes(req.session.userId)){
                updateOperation = { 
                    $addToSet: { upvotes: req.session.userId },
                    $pull: { downvotes: req.session.userId }
                };
            } else {
                updateOperation = { $pull: { upvotes: req.session.userId } };
            }
            
            
            AnswerModel.findOneAndUpdate(
                { _id: req.params.id },
                updateOperation,
                { new: true }, 
                function(err, updatedAnswer) { 
                    if (err) {
                        console.error('Error when upvoting answer:', err);
                        return res.status(500).json({
                            message: 'Error when upvoting answer',
                            error: err
                        });
                    }

                    if (!updatedAnswer) {
                        return res.status(404).json({
                            message: 'Answer not found'
                        });
                    }
        
                    return res.redirect('../../answer/list/'+updatedAnswer.question);
                }
            );
        }); 
    },

    downvote: function(req, res){
        AnswerModel.findOne({ _id: req.params.id }, function(err, answer) {
            if (err) {
                console.error('Error when upvoting answer:', err);
                return res.status(500).json({
                    message: 'Error when upvoting answer',
                    error: err
                });
            }
        
            if (!answer) {
                return res.status(404).json({
                    message: 'Answer not found'
                });
            }
            
            if(!answer.downvotes.includes(req.session.userId)){
                updateOperation = { 
                    $addToSet: { downvotes: req.session.userId },
                    $pull: { upvotes: req.session.userId } 
                };
            } else {
                updateOperation = { $pull: { downvotes: req.session.userId } };
            }
            
            
            AnswerModel.findOneAndUpdate(
                { _id: req.params.id },
                updateOperation,
                { new: true }, 
                function(err, updatedAnswer) { 
                    if (err) {
                        console.error('Error when upvoting answer:', err);
                        return res.status(500).json({
                            message: 'Error when upvoting answer',
                            error: err
                        });
                    }

                    if (!updatedAnswer) {
                        return res.status(404).json({
                            message: 'Answer not found'
                        });
                    }
        
                    return res.redirect('../../answer/list/'+updatedAnswer.question);
                }
            );
        });
    }

};
