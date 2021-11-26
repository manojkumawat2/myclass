require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();
const http = require('http')
const moment = require('moment');
const socketio = require('socket.io');
var connection = require('./helpers/database/config');
const server = http.createServer(app);
const Class_Helper = require('./helpers/Class_Helper');
const class_helper = new Class_Helper();
const Chat_Helper = require('./helpers/Chat_Helper');
const chat_helper = new Chat_Helper();

app.set('view engine', 'ejs');
app.set('views', './views');

// for parsing application/json
app.use(bodyParser.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({extended: true}));
// for parsing multiparts/form-data
app.use(upload.array());
app.use('/static', express.static('public'));

app.locals.baseURL = "http://localhost:8081/";
const template = 'template/template';


var home = require('./controllers/home');
app.use('/', home);

var auth = require('./controllers/auth');
app.use('/auth', auth);

var meeting = require('./controllers/meeting');
app.use('/meeting', meeting);


/**
 * Socket Io Content
 */

var session = require('express-session');
var cookie = require('cookie');
app.use(session({
    secret: "123654",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000,
    }
}));

 const io = socketio(server);
 let rooms = {};
 let socketroom = {};
 let socketname = {};
 let micSocket = {};
 let videoSocket = {};
 let roomBoard = {};
 let userRole = {};

io.on('connect', socket => {

    socket.on("join room", (roomid, username) => {

        socket.join(roomid);
        socketroom[socket.id] = roomid;
        socketname[socket.id] = username;
        micSocket[socket.id] = 'on';
        videoSocket[socket.id] = 'on';

        if (rooms[roomid] && rooms[roomid].length > 0) {
            rooms[roomid].push(socket.id);
            socket.to(roomid).emit('message', `${username} joined the room.`, 'Bot', moment().format(
                "h:mm a"
            ));
            io.to(socket.id).emit('join room', rooms[roomid].filter(pid => pid != socket.id), socketname, micSocket, videoSocket);
        }
        else {
            rooms[roomid] = [socket.id];
            io.to(socket.id).emit('join room', null, null, null, null);
        }

        io.to(roomid).emit('user count', rooms[roomid].length);

    });

    socket.on('action', msg => {
        if (msg == 'mute')
            micSocket[socket.id] = 'off';
        else if (msg == 'unmute')
            micSocket[socket.id] = 'on';
        else if (msg == 'videoon')
            videoSocket[socket.id] = 'on';
        else if (msg == 'videooff')
            videoSocket[socket.id] = 'off';

        socket.to(socketroom[socket.id]).emit('action', msg, socket.id);
    })

    socket.on('video-offer', (offer, sid) => {
        socket.to(sid).emit('video-offer', offer, socket.id, socketname[socket.id], micSocket[socket.id], videoSocket[socket.id]);
    })

    socket.on('video-answer', (answer, sid) => {
        socket.to(sid).emit('video-answer', answer, socket.id);
    })

    socket.on('new icecandidate', (candidate, sid) => {
        socket.to(sid).emit('new icecandidate', candidate, socket.id);
    })

    socket.on('message', (msg, username, roomid) => {
        io.to(roomid).emit('message', msg, username, moment().format(
            "h:mm a"
        ));
    })

    socket.on('getCanvas', () => {
        if (roomBoard[socketroom[socket.id]])
            socket.emit('getCanvas', roomBoard[socketroom[socket.id]]);
    });

    socket.on('draw', (newx, newy, prevx, prevy, color, size) => {
        socket.to(socketroom[socket.id]).emit('draw', newx, newy, prevx, prevy, color, size);
    })

    socket.on('clearBoard', () => {
        socket.to(socketroom[socket.id]).emit('clearBoard');
    });

    socket.on('store canvas', url => {
        roomBoard[socketroom[socket.id]] = url;
    })

    socket.on('chat_message', async function(msg, user_id, unique_key, lecture_id, user_name) {
        let status = await chat_helper.set_new_chat_message(lecture_id, user_id, msg);

        io.to(lecture_id).emit('chat_message', msg, user_name, moment().format("h:mm a"));
    });

    socket.on('disconnect', () => {
        if (!socketroom[socket.id]) return;
        socket.to(socketroom[socket.id]).emit('message', `${socketname[socket.id]} left the chat.`, `Bot`, moment().format(
            "h:mm a"
        ));
        socket.to(socketroom[socket.id]).emit('remove peer', socket.id);
        var index = rooms[socketroom[socket.id]].indexOf(socket.id);
        rooms[socketroom[socket.id]].splice(index, 1);
        io.to(socketroom[socket.id]).emit('user count', rooms[socketroom[socket.id]].length);
        delete socketroom[socket.id];
        console.log('--------------------');
        console.log(rooms[socketroom[socket.id]]);

        //toDo: push socket.id out of rooms
    });
})

server.listen(8080, () => console.log(`Server is up and running on port 8080`));
