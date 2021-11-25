const connection = require("./database/config");

class Chat_Helper {
	constructor() {

	}

	set_new_chat_message(lecture_id, user_id, msg) {
		let query = "INSERT INTO chats (msg, lecture_id, user_id) VALUES (?)";
		let values = [[msg, lecture_id, user_id]];

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

	get_all_lecture_messages(lecture_id) {
		let query = "SELECT * FROM chats INNER JOIN users ON users.id = chats.user_id WHERE lecture_id = ? ORDER BY time";
		let values = [lecture_id];

		return new Promise(function(resolve, reject) {
			connection.query(query, values, function(err, rows) {
				if(err) {
					console.log(err);
					return resolve(null);
				} else {
					return resolve(rows);
				}
			});
		});
	}
}

module.exports = Chat_Helper;