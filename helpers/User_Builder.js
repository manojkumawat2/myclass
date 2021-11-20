var connection = require('./database/config');
var Common_Helpers = require('./Common_Helpers');

class User_Builder {
    constructor() {
    }

    async create_new_user(user_info) {
        let name = user_info.name;
        let email = user_info.register_email;
        let password = user_info.register_password;
        let confirm_password = user_info.register_password_confirm;
        
        if(this.check_if_password_match(password, confirm_password) == false) {
            return "Password and Confirm Password is not matching.";
        }

        let is_user_already_exist = await this.check_if_the_user_exists(user_info);
        
        if(is_user_already_exist) {
            return "User Already Exist";
        }

        //hashed password
        password = Common_Helpers.get_hashed_password(password);

        let query = "INSERT INTO users (name, email, password) VALUES (?)";
        let values = [[name, email, password]];
        
        let message = new Promise(function(resolve) {
            connection.query(query, values, function(err, result) {
                if(err) {
                    console.log(err);
                    resolve("Please try again.");
                }
                resolve("success");
            });
        });
        return await message;
    }

    check_if_the_user_exists(user_info) {
        let email = user_info.register_email;
        
        let query = "SELECT * FROM users WHERE email = ?";
        let values = [email];
        return new Promise(function(resolve) {
            connection.query(query, values, function(err, result) {
                if(err) {
                    console.log(err);
                    resolve(true);
                }
                if(result.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    check_if_password_match(password, confirm_password) {
        if(password == confirm_password) {
            return true;
        }
        return false;
    }
}


module.exports = User_Builder;