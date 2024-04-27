var express = require('express');
var router = express.Router();
var commentController = require('../controllers/commentController.js');

function requiresLogin(req, res, next){
    if(req.session && req.session.userId){
        return next();
    } else{
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}

router.post('/acomment/:id', requiresLogin, commentController.createAnswerComment);
router.post('/adelete/:id', requiresLogin, commentController.removeAnswerComment);
router.post('/qcomment/:id', requiresLogin, commentController.createQuestionComment);
router.post('/qdelete/:id', requiresLogin, commentController.removeQuestionComment);



module.exports = router;
