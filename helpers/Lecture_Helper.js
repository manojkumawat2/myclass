const { query } = require("express");
const Common_Helpers = require("./Common_Helpers");
const connection = require("./database/config");

class Lecture_Helper {
	constructor() {

	}

	get_lecture_details(lecture_id) {
		let query = "SELECT * FROM lectures WHERE id = ?";
		let values = [lecture_id];

		return new Promise(function(resolve, reject) {
			connection.query(query, values, function(err, rows) {
				if(err) {
					return resolve(null);
				} else {
					return resolve(rows[0]);
				}
			});
		});
	}

	get_student_lecture_preference(user_id, lecture_id) {
		let query = "SELECT * FROM student_preferences WHERE user_id = ? AND lecture_id = ?";
		let values = [user_id, lecture_id];

		return new Promise(function(resolve, reject) {
			connection.query(query, values, function(err, rows) {
				if(err) {
					return resolve(null);
				} else {
					if(rows.length > 0) {
						return resolve(rows[0]);
					}
					else {
						return resolve(null);
					}
				}
			});
		});
	}

	async update_preference(user_id, input_data) {
		let already_filled_id = await this.is_preference_already_updated(user_id, input_data.lecture_id);
		if(already_filled_id == -1) {
			let query = "INSERT INTO student_preferences (lecture_id, user_id, mode) VALUES (?)";
			let values = [[input_data.lecture_id, user_id, input_data.select_preference]];

			return new Promise(function(resolve, reject) {
				connection.query(query, values, function(err, rows) {
					if(err) {
						return resolve(false);
					} else {
						return resolve(true);
					}
				});	
			});
		} else {
			let query = "UPDATE student_preferences SET mode = ? WHERE id = ?";
			let values = [input_data.select_preference, already_filled_id];

			return new Promise(function(resolve, reject) {
				connection.query(query, values, function(err, rows) {
					if(err) {
						console.log(err);
						return resolve(false);
					} else {
						return resolve(true);
					}
				});	
			});
		}
		
	}

	is_preference_already_updated(user_id, lecture_id) {
		let query = "SELECT id FROM student_preferences WHERE user_id = ? AND lecture_id = ?";
		let values = [user_id, lecture_id];

		return new Promise(function(resolve, reject) {
			connection.query(query, values, function(err, rows) {
				if(err) {
					console.log(err);
					return resolve(null);
				} else {
					if(rows.length == 0) {
						return resolve(-1);
					} else {
						return resolve(rows[0].id);
					}
				}
			});
		});
	}
}

module.exports = Lecture_Helper;