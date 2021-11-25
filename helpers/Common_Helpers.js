var bcrypt = require('bcryptjs');
var uuid = require('uuid');

class Common_Helpers {
    constructor() {
    }
    
    static event_card_colors = [
        '#ed9e00', '#bf2904', '#2ab002', '#02b0a4', '#aa02b0'
    ];

    static get_hashed_password(password) {
        //generate salt to hash the password
        let salt = bcrypt.genSaltSync(10);
        //hash the password
        let hash = bcrypt.hashSync(password, salt);
        return hash;
    }

    static compare_password(password1, password2) {
        return bcrypt.compareSync(password1, password2);
    }

    static generate_unique_class_code() {
        return uuid.v1();
    }

    static generate_meeting_id() {
        return uuid.v4();
    }
}

module.exports = Common_Helpers;