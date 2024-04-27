var express = require('express');
var router = express.Router();
var questionController = require('../controllers/questionController.js');
const questionModel = require('../models/questionModel.js');


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
router.get('/', questionController.list);

router.get('/list', questionController.list);

router.get('/mylist', questionController.myList);

router.get('/publish', requiresLogin, questionController.publish);

router.get('/hot', questionController.hot);

router.get('/upvote/:id', requiresLogin, questionController.upvote);

router.get('/downvote/:id', requiresLogin, questionController.downvote);

router.post('/publish', requiresLogin, questionController.create);
/*
 * DELETE
 */
router.post('/delete/:id', requiresLogin, questionController.remove);


module.exports = router;
