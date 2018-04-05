// app.js

const path = require('path');

//express
const express = require('express');

const helmet = require('helmet');



//create instance
const app = express();

const mysql = require('./lib/database');

let mysql_con = mysql.connect();
mysql_con.then((data) => {
    console.log("Database connected", data);
}).catch((error) => {
    console.log("Database error", error);
});

const moment = require('moment');
app.locals.moment = moment;

//middleware to process POST data
const bodyParser = require('body-parser');

//set the template engine into ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').renderFile);

app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

app.use(helmet());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// serve the files out of ./public as our main files
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', require('./routes/index'));


module.exports = app;   