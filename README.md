# MyClass
## Features:
- Create and Join Online Classes
- Faculty can Manage the Students who joined the class eg. delete a student
- Schedule the lectures
- Take online class (Created an **Online Meeting Platform** with functionalities like: **Whiteboard, Screenshare, Camera and Mic share**)
- Mark students attendance
- Live Discussion for every lecture

## Technologies:
**JavaScript, Node.js, Express.js, jQuery, MySQL, EJS, HTML, CSS, Socket.IO, WebRTC**

## Follow the steps below to run this application in you Local System:
### Step: 1
Clone the Github Repository into your system. <br/> <br/>
`git clone https://github.com/manojkumawat2/myclass.git`

### Step: 2
Install the npm packages. <br /> <br />
`npm install`

### Step: 3
Import the sql file into your mysql database.
1. Open your terminal and type `mysql -u "your_username" -p` and press enter. After that type your mysql database password.
2. Create a new database `CREATE DATABASE myclass;`
3. Use myclass database using `use myclass;`
4. Now import the `database/myclass.sql` using `source database/myclass.sql;`
5. Now open the `helpers/database/config.js` file and replace the hostname, username, password with your local database credentials.

### Step: 4
Start the server.
`node server.js`

### Step: 5
Now open `localhost:8080` in you browser.
