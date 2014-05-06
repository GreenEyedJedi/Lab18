var express = require('express'),   // web framework
    ejs     = require('ejs'),       // templates
    mysql   = require('mysql'),     // database
    connect = require('connect');   // GET and POST request parser

var app = express();                // initialize express
//app.use(connect.bodyParser());      // initialize request parser
app.use(connect.urlencoded());
app.use(connect.json());
app.use(express.static('public'));  // configure static directory

app.set('view engine', 'ejs');       // set .ejs as the default template extension.
app.set('views', __dirname + '/views'); //set where view templates are located

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection({
    host:       'cwolf.cs.sonoma.edu',
    user:       'abrownlie',
    password:   '3820042'
});

// create the test if it does not exist.
var createDatabaseQry = 'CREATE DATABASE IF NOT EXISTS test';
connection.query(createDatabaseQry, function (err) {
    if(err) throw err;

    //use the database for any queries run
    var useDatabaseQry = 'USE test';

    //create the User table if it does not exist
    connection.query(useDatabaseQry, function(err) {
        if(err) throw err;

        var createTableQry = 'CREATE TABLE IF NOT EXISTS User('
            + 'UserID INT AUTO_INCREMENT PRIMARY KEY'
            + ',Email VARCHAR(256)'
            + ',Password VARCHAR(50)'
            + ')';
        connection.query(createTableQry, function (err) {
            if (err) throw err;
        });
    });
});

// Return the text Hello, World!.
app.get('/hello', function(req, res){
    res.send('Hello, World!');
});

// subtitle values access via the header template
app.set('subtitle', 'MusicNewz');

app.get('/lab18', function(req, res) {
      res.render('lab18');
    }
);

app.get('/lab18-content', function(req, res) {
        res.render('lab18-content');
    }
);

/* index file that links to various examples */
app.get('/', function(req, res){
    // use render instead of send, to replace the placeholders in index.ejs with the Key Value Pairs (KVP).
    res.render('index');
});

/* Example 1 - HTML Form w/o Ajax or Database Interaction */
app.get('/simpleForm', function(req, res){
    res.render('about.ejs', req.body );
});

/* Example 1 - Display form data submitted above */
app.post('/displayFormData', function(req, res) {
    res.render('displayFormData.ejs', req.body );
});


/* Example 2 - Submit data to the database */
app.get('/user/create', function(req, res){
    res.render('simpleform.ejs', {action: '/user/create'});
});

// Create a user
// NOTE: Using app.post()
app.post('/user/create', function (req, res) {
    connection.query('INSERT INTO User SET ?', req.body,
        function (err, result) {
            if (err) throw err;

            if(result.UserID != 'undefined') {
                var placeHolderValues = {
                    email: req.body.email,
                    password: req.body.password
                };
                res.render('displayUserInfo.ejs', placeHolderValues);
            }
            else {
                res.send('User was not inserted.');
            }
        }
    );
});

/* View all users in a <table> */
app.get('/user/all', function (req, res) {
    connection.query('select UserID, Email from User',
        function (err, result) {
            res.render('displayUserTable.ejs', {rs: result});
        }
    );
});

app.get('/users', function (req, res) {
    var result = [
        {UserID: 1, Email: 'mhaderman'},
        {UserID: 2, Email: 'test'}
    ];
    res.render('displayUserTable.ejs', {rs: result});
});

/* View a single user's information */
app.get('/user', function (req, res) {
    /* NOTE: We are creating a query string here by appending a the userid to a string.
     *       We are also useing req.query instead of req.body, because the userid
     *       was sent as a GET request not a POST
    */
    var query = 'select UserID, Email from User WHERE UserID = ' + req.query.userid;
    connection.query(query,
        function (err, result) {
            if(result.length > 0) {
                //NOTE: We are using the same template here as for the view of all users
                res.render('displayUserTable.ejs', {rs: result});
            }
            else
                res.send('No users exist.');
        }
    );
});
app.listen(8001);
console.log("Express server listening on port %s", 8001);