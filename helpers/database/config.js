var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "myclass.cpu4v9ve25zl.us-east-2.rds.amazonaws.com",
    user: "root",
    password: "12345678",
    database: "myclass",
    port: '3306',
});

connection.connect(function(err) {
    if(err) {
        throw err;
    }
});

module.exports = connection;