var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "12345678",
    database: "myclass"
});

connection.connect(function(err) {
    if(err) {
        throw err;
    }
});

module.exports = connection;