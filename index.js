

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

var config = require('./config');
var port = process.env.PORT || config.port;

var mongojs = require('mongojs');
/* get access to ‘users’ collection in ‘mydb’ database*/
var db = mongojs('admin:admin@ds259855.mlab.com:59855/hw-api', ['users']);



/* Body Parser Middleware */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true} ));

/* Path for static content: Angular, Vue.js, html, js, css */
// Create ‘index.html’ file inside the ‘public’ directory
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', function(req, res) {
// 	res.send('Hello World..');
// });

// app.get('/users', function(req, res) {
// 	res.json(people);
// });
var people = [
	{ name: 'John Doe', age: 35 },
	{ name: 'Jane Deen', age: 19 },
	{ name: 'Billy bob', age: 49 }
];

/* setup view engine */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* handle GET request */
app.get('/', function(req, res) {
	res.render('index', { // passing params
		title: 'Customer List',
		users: people
	});
});

/* handle POST request */
app.post('/users/add', function(req, res) {
	var newUser = {
		name: req.body.name,
		age: parseInt(req.body.age),
		email: req.body.email
	}
	people.push(newUser); // add new user to array
	res.render('index', { // redirect to ‘/’
		title: 'Customer List',
		users: people
	});
});

app.get('/user', (request, response) => {
	db.users.find( function (err, docs) {
		if(err) {
			console.error(err);
			response.json({ status: false });
		}
		response.json(docs);
	});
});

app.get('/', (request,response) => {
	db.users.find( function (err, docs) {
		if(err) {
			console.error(err);
		}
		/* passing data object to render in index */
		response.render('index', {
			title: 'Customer DB list:',
			users: docs
		});
	});
});

app.get('/user/:id', (req, res) => {
	var id = parseInt(req.params.id);
	db.users.findOne({id: id}, function(err, doc) {
		if (doc) {
			/* if found, return the document */
			res.json(doc);
		} else {
			/* if not, return custom error object */
			res.json({ status: false });
		}
	});
});

app.post('/user/add', (request, response) => {
	if(validateNewUser(request.body)) {
		var newUser = {
			name: request.body.name,
			age: parseInt(request.body.age),
			email: request.body.email
		}
		db.users.insert(newUser, function(err, result) {
			if(err){
				console.log(err);
			}
			response.redirect('/');
			console.log('New user has beed added.')
		});
	}
});

app.listen(port, function() {
	console.log('Server Started on Port 8000...');
});