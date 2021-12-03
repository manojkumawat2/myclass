var connection = require("./database/config");
var Common_Helpers = require("./Common_Helpers");
var Class_Helper = require('./Class_Helper');
var Lecture_Helper = require('./Lecture_Helper');

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

    async get_users_list_for_lecture_dashboard(lecture_id, class_id) {
        let students_joined_class = await this.get_student_list_using_class_id(class_id);

        let lecture_helper = new Lecture_Helper();
        let students_attendance = await lecture_helper.get_student_attendance_by_lecture_id(lecture_id);

        let students_preferences = await lecture_helper.get_students_lecture_preferences_by_lecture_id(lecture_id);


        let final_result = this.customize_data_according_to_dashboard(students_joined_class, students_preferences, students_attendance);

        return final_result;
    }

    customize_data_according_to_dashboard(students_joined_class, students_preferences, students_attendance) {
        let result = {};

        for(let i = 0; i < students_joined_class.length; i++) {
            if(!result[students_joined_class[i].id]) {
                result[students_joined_class[i].id] = {};
            }
            result[students_joined_class[i].id].id = students_joined_class[i].id;
            result[students_joined_class[i].id].name = students_joined_class[i].name;
            result[students_joined_class[i].id].email = students_joined_class[i].email;
            result[students_joined_class[i].id].is_present = 0;
            result[students_joined_class[i].id].mode = null;
        }

        for(let i = 0; i < students_attendance.length; i++) {
            result[students_attendance[i].user_id].is_present = students_attendance[i].is_present ? students_attendance[i].is_present : 0;
        }

        for(let i = 0; i < students_preferences.length; i++) {
            result[students_preferences[i].user_id].mode = students_preferences[i].mode ? students_preferences[i].mode : null;
        }

        return result;
    }

    get_student_list_using_class_id(class_id) {
        let query = "SELECT users.id, users.name, users.email FROM users INNER JOIN classes_join ON users.id = classes_join.user_id WHERE classes_join.class_id = ?";
        let values = [class_id];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                if(err) {
                    console.log(err);
                    return resolve(null);
                } else {
                    return resolve(rows);
                }
            });
        })
    }
    
}

module.exports = User_Helper;
