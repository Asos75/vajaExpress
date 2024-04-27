var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


// vključimo routerje
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/userRoutes');
var photosRouter = require('./routes/photoRoutes');
var questionRouter = require('./routes/questionRoutes');
var answerRouter = require('./routes/answerRoutes');
var commentRouter = require('./routes/commentRoutes');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




/**
 * Vključimo session in connect-mongo.
 * Connect-mongo skrbi, da se session hrani v bazi.
 * Posledično ostanemo prijavljeni, tudi ko spremenimo kodo (restartamo strežnik)
 */

require('dotenv').config()
// vključimo mongoose in ga povežemo z MongoDB
var mongoose = require('mongoose');
mongoose.set('strictQuery', true);
MONGODB_URI = "mongodb+srv://andrazsosteric:andraz@cluster0.hpcgsrl.mongodb.net/vaja2?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
  console.error('Error connecting to MongoDB Atlas:', err);
});
var session = require('express-session');
var MongoStore = require('connect-mongo');
const commentController = require('./controllers/commentController');
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({mongoUrl: MONGODB_URI})
}));

app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/photos', photosRouter);
app.use('/question', questionRouter);
app.use('/answer', answerRouter);
app.use('/comment', commentRouter)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
