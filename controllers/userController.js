var bcrypt = require('bcrypt');
var mysql = require('mysql');

module.exports = function(auth, pool){
	return {
		logout: function(req, res){
			req.logout();
			res.redirect('/');
		},

		settings: function(req, res){
			res.status(200).send('Secret place');
		},

		login_get:  function(req, res){
			res.render("login.hbs");
		},
		login_post: function(req, res){
			if(!req.body.username){
				res.render("login.hbs", {msg: "Enter your username"});
				return;
			}
			if(!req.body.password){
				res.render("login.hbs", {msg: "Enter your password"});
				return;
			}

			pool.query("SELECT * FROM users WHERE username=" + mysql.escape(req.body.username), function(err, user){

				if( !user[0] ){
					res.render("login.hbs", { msg: "User is not exist" });
					return;
				}

				if(bcrypt.compareSync(req.body.password, user[0].password)) {
					//req.body.password = user[0].password;
					auth(req, res);
				} else {
					res.render("login.hbs", { msg: "Wrong password" });
				}
			});
		},
		registration_post: function(req, res){
			if(!req.body.username){
				res.render("registration.hbs", {msg: "Enter your username"});
				return;
			}
			if(!req.body.password){
				res.render("registration.hbs", {msg: "Enter your password"});
				return;
			}
		    if(req.body.password != req.body.password2){
		        res.render("registration.hbs", {msg: "Wrong password"});
		        return;
		    }
			pool.query("SELECT * FROM users WHERE username=" + mysql.escape(req.body.username), function(err, user){
				if(user[0]){
					res.render("registration.hbs", { msg: "User already exist" });
					return;
				}
				bcrypt.hash(req.body.password, 5, function(err, hash) {
					pool.query("INSERT INTO users SET ?", {username: req.body.username, password: hash},function() {
						//req.body.password = hash;
						auth(req,res);
					});
				});
			});
		},
		registration_get: function(req, res){
			res.render("registration.hbs");
		},

		root : function(req, res){
			req.isAuthenticated() ? res.redirect('/user') : res.redirect('/login');
		},

		strategy: function(username, password, done){
			pool.query("SELECT * FROM users WHERE username=" + mysql.escape(username), function(err, user){
				if(user[0].username && bcrypt.compareSync(password, user[0].password)){
					return done(null, {username: username});
				}
			});
		}
	}
}