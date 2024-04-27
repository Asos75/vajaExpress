var QuestionModel = require('../models/questionModel.js');
var PhotoModel = require('../models/photoModel.js');
var AnswerModel = require('../models/answerModel.js');
var CommentModel = require('../models/commentModel.js');
/**
 * questionController.js
 *
 * @description :: Server-side logic for managing questions.
 */
module.exports = {

    /**
     * questionController.list()
     */
    list: async function (req, res) {
        try {
            const questions = await QuestionModel.find().populate('postedBy').populate({path: "comments", populate: { path: "postedBy" }});
    
            for (let question of questions) {
                // Find the user who posted the question
                const photo = await PhotoModel.findOne({ postedBy: question.postedBy._id });

                // If user is found and has a photo, update the path
                if (photo) {
                    question.postedBy.path = photo.path;
                } else {
                    // If user is not found or has no photo, set a default path or null
                    question.postedBy.path = '/images/default.jpg'; // or null
                }
                question.isset = false;
                if(req.session.userId){
                    question.isset = true;
                }

                question.own = false;
                if(question.postedBy._id == req.session.userId){
                    question.own = true;
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
                
                for(let comment of question.comments){
                    comment.own = false;
                    if(comment.postedBy._id == req.session.userId){
                        comment.own = true
                    }
                }

                question.hasComments = false;
                if(question.comments.length != 0){
                    question.hasComments = true;
                }
            }
            
            
            
            return res.render('question/list',  { questions: questions });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting questions.',
                error: err
            });
        }
    },

    myList: async function (req, res) {
        try {
            const questions = await QuestionModel.find({postedBy: req.session.userId}).populate('postedBy').populate({path: "comments", populate: { path: "postedBy" }});
    
            for (let question of questions) {
                // Find the user who posted the question
                const photo = await PhotoModel.findOne({ postedBy: question.postedBy._id });

                // If user is found and has a photo, update the path
                if (photo) {
                    question.postedBy.path = photo.path;
                } else {
                    // If user is not found or has no photo, set a default path or null
                    question.postedBy.path = '/images/default.jpg'; // or null
                }
                question.isset = false;
                if(req.session.userId){
                    question.isset = true;
                }

                question.own = false;
                if(question.postedBy._id == req.session.userId){
                    question.own = true;
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

                for(let comment of question.comments){
                    comment.own = false;
                    if(comment.postedBy._id == req.session.userId){
                        comment.own = true
                    }
                }

                question.hasComments = false;
                if(question.comments.length != 0){
                    question.hasComments = true;
                }
            }
            
            
            
            return res.render('question/list',  { questions: questions });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting questions.',
                error: err
            });
        }
    },

    hot: async function(req, res) {
        try {
            const questions = await QuestionModel.find().populate('postedBy');
    
            for (let question of questions) {
                // Find the user who posted the question
                const photo = await PhotoModel.findOne({ postedBy: question.postedBy._id });

                // If user is found and has a photo, update the path
                if (photo) {
                    question.postedBy.path = photo.path;
                } else {
                    // If user is not found or has no photo, set a default path or null
                    question.postedBy.path = '/images/default.jpg'; // or null
                }
                question.isset = false;
                if(req.session.userId){
                    question.isset = true;
                }

                question.own = false;
                if(question.postedBy._id == req.session.userId){
                    question.own = true;
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

                question.impressions = 0;


                const currentDate = new Date();

                const last24Hours = new Date(currentDate);
                last24Hours.setHours(last24Hours.getHours() - 24);
                
                for (const view of question.views) {
                    if (view.value >= last24Hours && view.value <= currentDate) {
                        question.impressions++;
                    }
                }

                const answers = await AnswerModel.find({question: question._id});
                for (const answer of answers) {
                    if (answer.date >= last24Hours && answer.date <= currentDate) {
                        question.impressions++;
                    }
                }

                question.hasComments = false;
                if(question.comments.length != 0){
                    question.hasComments = true;
                }
            }
            
            questions.sort((a, b) => b.impressions - a.impressions)
            
            return res.render('question/list',  { questions: questions });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting questions.',
                error: err
            });
        }
    },


    /**
     * questionController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        QuestionModel.findOne({_id: id}, function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question.',
                    error: err
                });
            }

            if (!question) {
                return res.status(404).json({
                    message: 'No such question'
                });
            }

            return res.json(question);
        });
    },

    /**
     * questionController.create()
     */
    create: function (req, res) {
        var question = new QuestionModel({
			title : req.body.title,
			description : req.body.description,
            postedBy : req.session.userId,
            upvotes : [],
            downvotes : [],
            comments: [],
            views : [],
			date : new Date()
        });

        question.save(function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating question',
                    error: err
                });
            }

            //return res.status(201).json(question);
            res.redirect('/');
        });
    },

    /**
     * questionController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        QuestionModel.findOne({_id: id}, function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting question',
                    error: err
                });
            }

            if (!question) {
                return res.status(404).json({
                    message: 'No such question'
                });
            }

            question.title = req.body.title ? req.body.title : question.title;
			question.description = req.body.description ? req.body.description : question.description;
			question.date = req.body.date ? req.body.date : question.date;
			
            question.save(function (err, question) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating question.',
                        error: err
                    });
                }

                return res.json(question);
            });
        });
    },

    /**
     * questionController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        QuestionModel.findByIdAndRemove(id, function (err, question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the question.',
                    error: err
                });
            }
            AnswerModel.deleteMany({ question: id }, async function (err) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when deleting the answers associated with the question.',
                        error: err
                    });
                }


                CommentModel.deleteMany({ _id: { $in: question.comments } })
                    .then(result => {
                        return res.redirect('/');
                    })
                    .catch(err => {
                        console.error('Error deleting comments:', err);
        
                    });
            });
        });
    },

    publish: function(req, res){
        return res.render('question/publish');
    },

    upvote: function(req, res) {
        QuestionModel.findOne({ _id: req.params.id }, function(err, question) {
            if (err) {
                console.error('Error when upvoting question:', err);
                return res.status(500).json({
                    message: 'Error when upvoting question',
                    error: err
                });
            }
        
            if (!question) {
                return res.status(404).json({
                    message: 'Answer not question'
                });
            }
            
            if(!question.upvotes.includes(req.session.userId)){
                updateOperation = { 
                    $addToSet: { upvotes: req.session.userId },
                    $pull: { downvotes: req.session.userId }
                };
            } else {
                updateOperation = { $pull: { upvotes: req.session.userId } };
            }
            
            
            QuestionModel.findOneAndUpdate(
                { _id: req.params.id },
                updateOperation,
                { new: true }, 
                function(err, updatedQuestion) { 
                    if (err) {
                        console.error('Error when upvoting question:', err);
                        return res.status(500).json({
                            message: 'Error when upvoting question',
                            error: err
                        });
                    }

                    if (!updatedQuestion) {
                        return res.status(404).json({
                            message: 'Answer not found'
                        });
                    }
        
                    return res.redirect('/');
                }
            );
        });
    },

    downvote: function(req, res){
        QuestionModel.findOne({ _id: req.params.id }, function(err, question) {
            if (err) {
                console.error('Error when upvoting question:', err);
                return res.status(500).json({
                    message: 'Error when upvoting question',
                    error: err
                });
            }
        
            if (!question) {
                return res.status(404).json({
                    message: 'Answer not question'
                });
            }
            
            if(!question.downvotes.includes(req.session.userId)){
                updateOperation = { 
                    $addToSet: { downvotes: req.session.userId },
                    $pull: { upvotes: req.session.userId }
                };
            } else {
                updateOperation = { $pull: { downvotes: req.session.userId } };
            }
            
            
            QuestionModel.findOneAndUpdate(
                { _id: req.params.id },
                updateOperation,
                { new: true }, 
                function(err, updatedQuestion) { 
                    if (err) {
                        console.error('Error when upvoting question:', err);
                        return res.status(500).json({
                            message: 'Error when upvoting question',
                            error: err
                        });
                    }

                    if (!updatedQuestion) {
                        return res.status(404).json({
                            message: 'Answer not found'
                        });
                    }
        
                    return res.redirect('/');
                }
            );
        });
    }
};
