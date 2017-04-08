var templates = require('consolidate');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlutils = require('url');
var mysql = require('mysql');
var cookieParser = require('cookie-parser');

// var https = require( "https" );  // для организации https
// var fs = require( "fs" );   // для чтения ключевых файлов

// httpsOptions = {
//     key: fs.readFileSync("server.key"), // путь к ключу
//     cert: fs.readFileSync("server.crt") // путь к сертификату
// }

var bcrypt = require('bcrypt');

app.engine('hbs', templates.handlebars);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('views'));

var config = require('./config');
var pool = mysql.createPool(config);
var tasksModel = require('./models/tasks')(pool);
var tasksController = require('./controllers/tasksController.js')(tasksModel);


var session = require('cookie-session');
app.use(session({keys: ['secret']}));


var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

var LocalStrategy = require('passport-local').Strategy;


passport.serializeUser(function(user, done) {
	done(null, user.username);
});

passport.deserializeUser(function(id, done) {
	done(null, {username: id});
});

var auth = passport.authenticate(
	'local', {
		successRedirect: '/user', 
		failureRedirect: '/login'
	}
);

var userController = require('./controllers/userController.js')(auth, pool);

passport.use(new LocalStrategy(userController.strategy));

var mustBeAuthenticated = function (req, res, next) {
	req.isAuthenticated() ? next() : res.redirect('/');
};


app.all('/user', mustBeAuthenticated);
app.all('/user/*', mustBeAuthenticated);

app.get('/login',  userController.login_get);
app.get('/registration', userController.registration_get);
app.get('/', userController.root);
app.post('/login', userController.login_post);
app.post('/registration', userController.registration_post);
app.get('/user/settings', userController.settings);
app.get('/logout', userController.logout);


app.get('/user', function(req, res) {tasksController.list(req, res);});
app.post('/user/add', tasksController.add);
app.post('/delItem', tasksController.delete);
app.post('/completeTask', tasksController.complete);

app.listen(3000, function () {
    console.log('Express server listening on port 3000');
});

///https.createServer(httpsOptions, app).listen(3000);