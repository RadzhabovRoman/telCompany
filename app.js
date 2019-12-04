const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}), cookieParser());

app.get('/', (req, res) => {
	res.render('index');
});

app.get('/user_reg', (req, res) => res.render('user_reg')); //если куки подойдет, то рендерим
app.post('/user_reg', (req, res) => {
	const {number, password, name} = req.body;
	User.create({
		number: number,
		password: password,
		name: name,
		balance: 0,
		serv: '0'
	}).then(user => console.log(user));		
	res.redirect('/');
});


app.get('/user_login', (req, res) => res.render('user_login')); 
app.post('/user_login', (req, res) => {
	const {number, password, name} = req.body;
	User.find({
		number: number,
		password: password
	}).then(user => {
		if (user[0]) {
			res.cookie('role', 'user'); // отправили куку
			res.redirect('/user_cabinet');
		}
		else {
			res.redirect('/');
		}
	})
	.catch(() => console.log('auth_error'));
});

app.get('/user_cabinet', (req, res) =>  {
	if (req.cookies.role === 'user') {
		res.render('user_cabinet')
	}
});

module.exports = app;