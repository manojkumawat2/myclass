const { query } = require("express");
const Common_Helpers = require("./Common_Helpers");
const connection = require("./database/config");

class Class_Helper {
    constructor() {

    }

    async get_students_list(unique_key) {
        let class_info = await this.get_class_details_from_unique_key(unique_key);
        let query = "SELECT * FROM classes_join INNER JOIN users ON users.id = classes_join.user_id WHERE classes_join.class_id = ?";
        let values = [class_info.id];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                if(err) {
                    resolve(null);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async remove_class_joined_user(unique_key, user_id) {
        let class_info = await this.get_class_details_from_unique_key(unique_key);

        let query = "DELETE FROM classes_join WHERE classes_join.user_id = ? AND classes_join.class_id = ?";
        let values = [user_id, class_info.id];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                return resolve(true);
            })
        })
    }

    async get_class_homepage_data(data, unique_key, user_id) {
        let class_info = await this.get_class_details_from_unique_key(unique_key);
        let lectures = await this.get_all_schedules_by_class_id(class_info.id);

        data.lectures = this.get_the_correct_format_of_lectures(lectures, data);
        data.class_info = class_info;
    }

    get_the_correct_format_of_lectures(lectures, data) {
        let lecture_format = {};
        let total_upcoming_lectures = 0;
        let history_lectures = 0;

        for(let i=0; i<lectures.length; i++) {
            let date = Date.parse(lectures[i].date);
            let now_date = Date.now();
            if(date >= now_date) {
                total_upcoming_lectures++;
            } else {
                history_lectures++;
            }
            if(lecture_format[lectures[i].date]) {
                lecture_format[lectures[i].date].push(
                    lectures[i]
                );
            } else {
                lecture_format[lectures[i].date] = [lectures[i]];
            }
            
        }
        data.total_upcoming_lectures = total_upcoming_lectures;
        data.total_history_lectures = history_lectures;
        return lecture_format;
    }

    get_all_schedules_by_class_id(class_id) {
        let query = "SELECT * FROM lectures WHERE class_id = ?";
        let values = [class_id];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                if(err) {
                    return resolve(null);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    update_lecture_details(lecture_data, user_id) {
        let query = "UPDATE lectures SET title = ?, date = ?, start_time = ?, end_time = ?, lecture_mode = ?, description = ?, offline_seats = ? WHERE id = ?";
        let values = [lecture_data.title, lecture_data.lecture_date, lecture_data.start_time, lecture_data.end_time, lecture_data.lecture_mode, lecture_data.lecture_description, lecture_data.available_seats, lecture_data.lecture_id];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                if(err) {
                    console.log(err);
                    resolve("error");
                } else {
                    resolve("success");
                }
            });
        });
    }

    async schedule_new_lecture(lecture_data, user_id) {
        let class_details = await this.get_class_details_from_unique_key(lecture_data.class_unique_key);
        let is_lecture_schedule_is_valid = await this.is_lecture_schedule_is_valid(lecture_data.lecture_date, lecture_data.start_time, lecture_data.end_time, class_details.id);
        
        if(!is_lecture_schedule_is_valid) {
            return "exist";
        }

        let meeting_id = Common_Helpers.generate_meeting_id();

        let query = "INSERT INTO lectures (title, date, start_time, end_time, lecture_mode, description, offline_seats, class_id, user_id, meeting_id) values (?)";
        let values = [[lecture_data.title, lecture_data.lecture_date, lecture_data.start_time, lecture_data.end_time, lecture_data.lecture_mode, lecture_data.lecture_description, lecture_data.available_seats, class_details.id ,user_id, meeting_id]];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                if(err) {
                    console.log(err);
                    resolve("error");
                } else {
                    resolve("success");
                }
            });
        });
    }

    is_lecture_schedule_is_valid(lecture_date, lecture_start_time, lecture_end_time, class_id) {
        let query = "SELECT id FROM lectures WHERE date = CONVERT(?, DATE) AND class_id = ? AND " + 
                    "((CONVERT(?, TIME) BETWEEN start_time AND end_time) OR (CONVERT(?, TIME) BETWEEN start_time AND end_time))";

        let values = [lecture_date, class_id, lecture_start_time, lecture_end_time];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                if(err) {
                    console.log(err);
                    return resolve(false);
                } else {
                    if(rows.length > 0) {
                        return resolve(false);
                    }
                    return resolve(true);
                }
            });
        });
    }

    get_class_details_from_unique_key(unique_key) {
        return new Promise(function(resolve, reject) {
            let query = "SELECT * FROM classes WHERE unique_key = ?";
            let values = [unique_key];
            connection.query(query, values, function(err, rows) {
                if(err) {
                    return resolve(null);
                } else {
                    return resolve(rows[0]);
                }
            });
        });
    }

    async get_role(unique_key, user_id) {
        let class_info = await this.get_class_details_from_unique_key(unique_key);
        
        let is_faculty = await this.is_user_owner_of_the_class(user_id, class_info.id);

        if(is_faculty) {
            return "faculty";
        }

        let is_student = await this.is_student_joined_class(user_id, class_info.id);

        if(is_student) {
            return "student";
        }

        return null;
    }

    is_student_joined_class(user_id, class_id) {
        let query = "SELECT id FROM classes_join WHERE user_id = ? AND class_id = ?";
        let values = [user_id, class_id];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                if(err) {
                    return resolve(false);
                } else {
                    if(rows.length > 0) {
                        return resolve(true);
                    }
                    return resolve(false);
                }
            })
        })
    }

    is_user_owner_of_the_class(user_id, class_id) {
        let query = "SELECT id FROM classes WHERE id = ? AND owner = ?";
        let values = [class_id, user_id];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                if(err) {
                    return resolve(false);
                } else {
                    if(rows.length > 0) {
                        return resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            });
        });
    }

    async get_dashboard_data(data, user_id) {
        data.joined_classes = await this.get_joined_classes(user_id);
        data.owned_classes = await this.get_owned_classes(user_id);
    }

    get_joined_classes(user_id) {
        return new Promise(function(resolve) {
            let query = "SELECT * FROM classes INNER JOIN classes_join ON classes_join.class_id = classes.id WHERE classes_join.user_id = ?";
            let values = [user_id];
            connection.query(query, values, function(err, rows) {
                if(err) {
                    return resolve("error");
                } else {
                    return resolve(rows);
                }
            });
        });
    }

    get_owned_classes(user_id) {
        return new Promise(function(resolve) {
            let query = "SELECT * FROM classes WHERE classes.owner = ?";
            let values = [user_id];
            connection.query(query, values, function(err, rows) {
                if(err) {
                    return resolve(null);
                } else {
                    return resolve(rows);
                }
            });
        });
    }

    get_class_info_by_id(class_id) {
        let query = "SELECT * FROM classes WHERE id = ?";
        let values = [class_id];
        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                if(err) {
                    resolve(null);
                } else {
                    resolve(rows[0]);
                }
            });
        });
    }

    create_new_class(data, user_id) {
        let subject = data.subject;
        let description = data.description;
        let unique_id = Common_Helpers.generate_unique_class_code();

        let query = "INSERT INTO classes (subject, owner, description, unique_key) VALUES (?)";
        let values = [[subject, user_id, description, unique_id]];

        return new Promise(function(resolve) {
            connection.query(query, values, function(err, result) {
                let res = {};
                if(err) {
                    res.status = "error";
                } else {
                    res.status = "success";
                    res.class_id = result.insertId;
                }
                resolve(res);
            });
        });
    }

    async join_new_class(unique_key, user_id) {
        let is_class_exist = await this.is_class_exist(unique_key);

        if(is_class_exist.status == "error") {
            return is_class_exist;
        }

        let is_user_already_joined = await this.is_user_already_joined(is_class_exist.class_id, user_id);

        if(is_user_already_joined.status == "success") {
            return is_user_already_joined;
        }

        let class_info = await this.get_class_details_from_unique_key(unique_key);

        let is_user_owner_of_the_class = await this.is_user_owner_of_the_class(user_id, class_info.id);

        if(is_user_owner_of_the_class) {
            return {"status" : "error", "message" : "You can't join as a student to this class." };
        }

        let inserted_data = await this.insert_new_join_class_entry(user_id, is_class_exist.class_id);

        return inserted_data;
    }

    insert_new_join_class_entry(user_id, class_id) {
        let query = "INSERT INTO classes_join (class_id, user_id) VALUES (?)";
        let values = [[class_id, user_id]];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                let result = {};
                if(err) {
                    result.status = "error";
                    result.message = "Something went wrong. Please try again!";
                    return resolve(result);
                } 

                result.status = "success";
                result.message = "Data inserted successfully";
                return resolve(result);
            });
        });
    }

    is_class_exist(unique_key) {
        let query = "SELECT id FROM classes WHERE unique_key = ?";
        let values = [unique_key];
        return new Promise(function(resolve) {
            connection.query(query, values, function(err, rows) {
                let result = {};
                if(err) {
                    result.status = "error";
                    result.message = "Something went wrong. Please try again!";
                } else {
                    if(rows.length > 0) {
                        result.status = "success";
                        result.class_id = rows[0].id;
                    } else {
                        result.status = "error";
                        result.message = "Class is not exist";

                    }
                }
                resolve(result);
            });
        });
    }

    is_user_already_joined(class_id, user_id) {
        let query = "SELECT id FROM classes_join WHERE class_id = ? and user_id = ?";
        let values = [class_id, user_id];

        return new Promise(function(resolve, reject) {
            connection.query(query, values, function(err, rows) {
                let result = {};
                if(err) {
                    result.status = "error";
                    result.message = "Something went wrong. Please try again!";
                } else {
                    if(rows.length > 0) {
                        result.status = "success";
                        result.class_id = "You have already joined this class.";
                    } else {
                        result.status = "error";
                    }
                }
                resolve(result);
            });
        });
    }
}

module.exports = Class_Helper;