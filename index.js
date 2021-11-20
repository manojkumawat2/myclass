require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();
var connection = require('./helpers/database/config');

app.set('view engine', 'ejs');
app.set('views', './views');

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({extended: true}));
// for parsing multiparts/form-data
app.use(upload.array());
app.use('/static', express.static('public'));

app.locals.baseURL = "http://localhost:3800/";
const template = 'template/template';


var home = require('./controllers/home');
app.use('/', home);

var auth = require('./controllers/auth');
app.use('/auth', auth);


app.listen(3800);