var express = require('express');
var session = require('express-session');
var router = express.Router();
var User_Helper = require('../helpers/User_Helper');
var Class_Helper = require('../helpers/Class_Helper');

const template = 'template/template';

router.use(session({
    secret: process.env.secret ? process.env.secret : "123654",
    resave: false,
    saveUninitialized: true
}));


router.get('/', function(req, res) {
    data = {};
    res.render('meeting/index.ejs', data);
});

router.get('/room', async function(req, res) {
    data = {};
    res.locals.session = req.session;
    if(req.session.user) {
        data.class_unique_key = req.query.unique_key;
        data.user_id = req.session.user;
        let user_helper = new User_Helper();
        let class_helper = new Class_Helper();
        let user_info = await user_helper.get_user_details_from_user_id(req.session.user);
        let role = await class_helper.get_role(req.query.unique_key, req.session.user);
        if(role == 'student' || role == 'faculty') {
            data.username = user_info.name;
            res.render(`meeting/room.ejs`, data);
        } else {
            res.redirect('/auth');
        }
    } else {
        res.redirect('/auth');
    }
});
module.exports = router;
