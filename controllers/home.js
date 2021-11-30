var express = require('express');
var session = require('express-session');
var router = express.Router();
var Class_Helper = require("../helpers/Class_Helper");
const Common_Helpers = require('../helpers/Common_Helpers');
const Lecture_Helper = require('../helpers/Lecture_Helper');
const Chat_Helper = require('../helpers/Chat_Helper');
const User_Helper = require('../helpers/User_Helper');

const template = 'template/template';

router.use(session({
    secret: process.env.secret ? process.env.secret : "123654",
    resave: false,
    saveUninitialized: true
}));

router.get('', async function (req, res) {
    var data = {};
    res.locals.session = req.session;
    if (req.session.user) {
        let class_helper = new Class_Helper();
        await class_helper.get_dashboard_data(data, req.session.user);
        data.view = 'common_dashboard';
        res.render(template, data);
    } else {
        data.view = 'home';
        res.render(template, data);
    }
});

router.post('/create_class', async function (req, res) {
    if (req.session.user) {
        let data = req.body;

        let class_helper = new Class_Helper();

        let result = await class_helper.create_new_class(data, req.session.user);

        if (result.status == "error") {
            result.message = "Class not created! Please try again";
        } else {
            result.message = "Class Created Successfully.";
            let class_info = await class_helper.get_class_info_by_id(result.class_id);
            result.success_page = "/class/" + class_info.unique_key;
        }
        return res.json(result);
    }
    res.redirect('/');
});

router.post('/join_class', async function (req, res) {
    if (req.session.user) {
        let unique_key = req.body.join_code;
        let user_id = req.session.user;

        let class_helper = new Class_Helper();

        let result = await class_helper.join_new_class(unique_key, user_id);

        if (result.status == "success") {
            result.success_page = '/class/' + unique_key;
        }

        return res.json(result);
    }
    res.redirect('/')
});

router.post('/submit_lecture_details', async function(req, res) {
    var data = {};
    res.locals.session = req.session;
    if(req.session.user) {
        let class_helper = new Class_Helper();
        let status = await class_helper.schedule_new_lecture(req.body, req.session.user);
        data.status = status;
        if(status == "error") {
            data.message = "Please try again.";
        } else if(status == "exist") {
            data.status = "error";
            data.message = "An Class is already scheduled in between this time period."
        }else {
            data.message = "Lecture scheduled successfully.";
            data.success_page = "/class/" + req.body.class_unique_key;
        }
        return res.json(data);
    } else {
        res.redirect('/');
    }
});

router.post('/update_lecture_details', async function(req, res) {
    var data = {};
    res.locals.session = req.session;
    if(req.session.user) {
        let class_helper = new Class_Helper();
        let status = await class_helper.update_lecture_details(req.body, req.session.user);
        data.status = status;
        if(status == "error") {
            data.message = "Please try again.";
        } else {
            data.message = "Lecture updated successfully";
            data.success_page = '/lecture/' + req.body.class_unique_key + '/' + req.body.lecture_id;
        }
        return res.json(data);
    } else {
        return res.redirect('/');
    }
});

router.post('/update_preference', async function(req, res) {
    var data = {};
    res.locals.session = req.session;
    if(req.session.user) {
        let lecture_helper = new Lecture_Helper();
        let status = await lecture_helper.update_preference(req.session.user, req.body);
        if(status == false) {
            data.status = "error";
            data.message = "Please try again!";
        } else {
            data.status = "success";
            data.message = "Lecture Updated Successfully";
            data.success_page = '/lecture/' + req.body.class_unique_key + '/' + req.body.lecture_id;
        }
        return res.json(data);
    } else {
        return res.redirect('/');
    }
});

router.get('/lecture/:unique_key/:lecture_id', async function(req, res) {
    var unique_key = req.params.unique_key;
    var lecture_id = req.params.lecture_id;
    var data = {};
    res.locals.session = req.session;
    if(req.session.user) {
        let class_helper = new Class_Helper();
        let lecture_helper = new Lecture_Helper();
        let chat_helper = new Chat_Helper();
        let user_helper = new User_Helper();
        let user_details = await user_helper.get_user_details_from_user_id(req.session.user);
        let class_info = await class_helper.get_class_details_from_unique_key(unique_key);
        data.user_details = user_details;
        data.view = 'classroom/lecture';
        data.role = await class_helper.get_role(unique_key, req.session.user);
        data.lecture_details = await lecture_helper.get_lecture_details(lecture_id);
        data.students_list = await class_helper.get_students_list(unique_key);
        data.class_unique_key = unique_key;
        data.lecture_id = lecture_id;
        data.lecture_preference = await lecture_helper.get_student_lecture_preference(req.session.user, lecture_id);
        data.chat_messages = await chat_helper.get_all_lecture_messages(lecture_id);
        data.attendance_details = await user_helper.get_users_list_for_lecture_dashboard(lecture_id, class_info.id);
        res.render(template, data);
    } else {
        res.redirect('/');
    }
});

router.get('/class/:unique_key', async function (req, res) {
    var unique_key = req.params.unique_key;
    res.locals.session = req.session;
    var data = {};
    if (req.session.user) {
        let class_helper = new Class_Helper();
        data.role = await class_helper.get_role(unique_key, req.session.user);
        data.view = "classroom/index";
        data.class_unique_key = unique_key;
        await class_helper.get_class_homepage_data(data, unique_key, req.session.user);
        data.event_card_colors = Common_Helpers.event_card_colors;
        data.students_list = await class_helper.get_students_list(unique_key);
        res.render(template, data);
    } else {
        res.redirect('/auth');
    }
});


router.get('/remove_user/:unique_key/:id', async function(req, res) {
    if(req.session.user) {
        let user_id = req.params.id;
        let unique_key = req.params.unique_key;

        let class_helper = new Class_Helper();

        let status = await class_helper.remove_class_joined_user(unique_key, user_id);

        return res.redirect('/class/' + unique_key);

    }
    return res.redirect('/auth');
});

router.get('/mark_attendance/:unique_key/:lecture_id/:student_id/:is_present', async function(req, res) {
    var data = {};
    if(req.session.user) {
        let class_helper = new Class_Helper();
        let lecture_helper = new Lecture_Helper();
        let role = await class_helper.get_role(req.params.unique_key, req.session.user);
        if(role != "faculty") {
            return res.redirect('/');
        }
        let status = await lecture_helper.mark_student_attendance(req.params.lecture_id, req.params.student_id, req.params.is_present);
        if(status == false) {
            data.success = "error";
            data.message = "Attendance not marked. Please try again!";
        } else {
            data.success = "success";
        }

        return res.json(data);
    } else {
        res.redirect('/');
    }
});
module.exports = router;
