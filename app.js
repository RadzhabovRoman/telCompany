const express = require('express');
const bodyParser = require('body-parser');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/', (req, res) => res.render('index'));

app.get('/create', (req, res) => res.render('create'));
app.post('/create', (req, res) => {
	const {name} = req.body;

	User.create({
		name: name
	}).then(user => console.log(user));		
	
	res.redirect('/');
});

module.exports = app;