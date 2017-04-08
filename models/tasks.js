var mysql = require('mysql');





module.exports = function(pool){
	var Tasks = {
		list: function(username, callback) {
			pool.query('SELECT * FROM tasks WHERE username=' + mysql.escape(username), callback);
		},

		add: function(task,callback) {
			pool.query('INSERT INTO tasks SET ?', task, callback);
		},
		
		change: function(id, text, callback) {
			// TODO
		},

		complete: function(id, value, callback) {
	        pool.query('UPDATE tasks SET ? WHERE id=' + mysql.escape(id), {complete: value}, callback);
		},

		delete: function(id, callback) {
			pool.query('DELETE FROM tasks WHERE ?', {id: id}, callback);
		}
	};
	return Tasks;
}
