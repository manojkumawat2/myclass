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

    
}

module.exports = User_Helper;