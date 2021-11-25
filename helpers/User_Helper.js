var connection = require("./database/config");
var Common_Helpers = require("./Common_Helpers");

class User_Helper {
    constructor() {

    }

    user_login_helper(user_info) {
        let email = user_info.login_email;
        let password = user_info.login_password;
        let hashed_password = Common_Helpers.get_hashed_password(password);
        let query = "SELECT * FROM users WHERE email = ?";
        let values = [email];
        
        return new Promise(function(resolve) {
            let result = {};
            connection.query(query, values, function(err, rows) {
                if(err) {
                    console.log(err);
                    result.status = "error",
                    result.message = "Please try again";
                } else {
                    result.user_data = rows[0];
                    if(rows.length > 0) {
                        let is_password_match = Common_Helpers.compare_password(password, rows[0].password);
                        if(is_password_match) {
                            result.status = "success",
                            result.message = "Login Success";
                        } else {
                            result.status = "error",
                            result.message = "Please enter a valid email or password combination.";
                        }
                    } else {
                        result.status = "success";
                        result.message = "User not found";
                    }
                }
                resolve(result);
            });
        })
    }

    get_user_details_from_user_id(user_id) {
        let query = "SELECT * FROM users WHERE id = ?";
        let values = [user_id];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                if(err) {
                    resolve(null);
                } else {
                    resolve(rows[0]);
                }
            })
        });
    }

    get_users_list_for_lecture_dashboard(lecture_id, class_id) {
        let query = "SELECT * FROM users " +
                    "WHERE users.id IN (SELECT user_id FROM classes_join WHERE class_id = ?) ";

        let values = [class_id, lecture_id, lecture_id];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                if(err) {
                    console.log(err);
                    resolve(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
}

module.exports = User_Helper;