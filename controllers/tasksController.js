
module.exports = function(tasks) {
	var tasksController = {
		list : function(req, res) {
			tasks.list(req.user.username, function(err, tasks) {
				res.render(
					'tasks.hbs', 
					{tasks: tasks},
					function(err, html) {
						if (err) 
							throw err;

						res.render('layout.hbs', {
							content: html,
							username: req.user.username
						});
					}
				)
			})
		},

		add : function(req, res) {
			var task = {
				name: req.body.Name,
				username: req.user.username
			}
		    tasks.add(task, function() {
				res.redirect('/user');
			});
		},

		delete: function(req, res) {
		    tasks.delete(req.body.id, function () {
		        res.redirect('/');
		    })
		},

		complete: function(req, res) {
		    tasks.complete(req.body.id, req.body.value, function () {
		        res.redirect('/');
		    })
		}
	}

	return tasksController;
};