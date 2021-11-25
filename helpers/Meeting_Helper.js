var Common_Helper = require("../helpers/Common_Helpers");

class Meeting_Helper {
    constructor() {

    }

    schedule_new_meeting() {
        let meeting_id = Common_Helper.generate_meeting_id();
        return meeting_id;
    }
}