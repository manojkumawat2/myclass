var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var bodyParser = require('body-parser');
var session = require('express-session');
var express = require('express');
var router = express.Router();
var connection = require('../helpers/database/config');
var Common_Helpers = require('../helpers/Common_Helpers');
var User_Helper = require('../helpers/User_Helper');
var User_Builder = require('../helpers/User_Builder');

var csrfProtection = csrf({cookie: true});
var parseForm = bodyParser.urlencoded({extended: false});

const template = 'template/template';

router.use(cookieParser());
router.use(session({
    secret: process.env.secret ? process.env.secret : "123654",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000,
    }
}));

router.get('/', csrfProtection, function(req, res) {
    res.locals.session = req.session;
    if(req.session.user) {
        return res.redirect('/');
    }
    res.render(template, {
        view: 'login',
        csrfToken: req.csrfToken()
    });
})

router.post('/login', parseForm, csrfProtection, function(req, res) {
    res.locals.session = req.session;
    let user_info = req.body;
    let user_helper = new User_Helper();

    user_helper.user_login_helper(user_info).then(function(reslt) {
        if(reslt.status == "success") {
            req.session.user = reslt.user_data.id;
            reslt.success_page = '/';
            res.cookie('user_id', req.session.user);
        }
        res.send(reslt);
    });
});

router.post('/register', parseForm, csrfProtection, function (req, res) {
    res.locals.session = req.session;
    let user_info = req.body;
    let user_builder = new User_Builder();
    let message;
    user_builder.create_new_user(user_info, req).then(function(reslt) {
        message = reslt;
        let result = {};
        if (message === "success") {
            result.status = "success";
            result.message = "User created successfully";
            result.success_page = '/';
        } else {
            result.status = "error";
            result.message = message;
        }
        res.send(result);
    });
});

router.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
