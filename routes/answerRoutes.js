var express = require('express');
var router = express.Router();
var answerController = require('../controllers/answerController.js');

function requiresLogin(req, res, next){
    if(req.session && req.session.userId){
        return next();
    } else{
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}


/*
 * GET
 */
router.get('/list/:question_id', answerController.list);

router.get('/upvote/:id', requiresLogin, answerController.upvote);

router.get('/downvote/:id', requiresLogin, answerController.downvote);

/*
 * POST
 */

router.post('/create/:question_id', requiresLogin, answerController.create);

router.post('/delete/:id', requiresLogin, answerController.remove);

router.post('/mark/:id', requiresLogin, answerController.mark);

router.post('/unmark/:id', requiresLogin, answerController.unmark);
module.exports = router;
