//загрузка модулей
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

//подключение моделей
const User = require('./models/user');
const Service = require('./models/service');

//включение модулей
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}), cookieParser());

//стартовая страница
app.get('/', (req, res) => {
	res.clearCookie('role');
	res.clearCookie('number');
	res.render('index');
});

//регистрация пользователя
app.get('/user_reg', (req, res) => res.render('user_reg')); 
app.post('/user_reg', (req, res) => {
	const {number, password, name} = req.body;
	User.findOne({
		number: number,
		password: password
	}).then(user => {
		if (!user) {
			User.create({
				number: number,
				password: password,
				name: name,
				balance: 0,
				mail: '-'
			});
			Service.create({
				number: number,
				available: ['denis', 'patau'],
				confirmed: [],
				bought: []
			});
			res.redirect('/');
		}
		else {
			//уведомление о том, что номер занят
			res.redirect('/user_login');
		}
	})
	.catch(() => console.log('reg_error'));
});

//авторизация пользователя
app.get('/user_login', (req, res) => res.render('user_login')); 
app.post('/user_login', (req, res) => {
	const {number, password, name} = req.body;
	User.findOne({
		number: number,
		password: password
	}).then(user => {
		if (user) {
			res.cookie('role', 'user'); 
			res.cookie('number', number);
			res.redirect('/user_cabinet');
		}
		else {
			//уведомление о том, что пароль не верен
			res.redirect('/user_login');
		}
	})
	.catch(() => console.log('auth_error'));
});

//личный кабинет
app.get('/user_cabinet', (req, res) =>  {
	if (req.cookies.role === 'user') {
		res.render('user_cabinet');
	}
	else {
		res.redirect('/user_login');
	}
});

//почта для уведомлений
app.get('/user_mail', (req, res) =>  {
	if (req.cookies.role === 'user') {
		User.findOne({number: req.cookies.number}).then(user => {
			res.render('user_mail', {user:user});
		});
	}
	else {
		res.redirect('/user_login');
	}
});
app.post('/user_mail', (req, res) =>  {
	const {mail} = req.body;
	User.findOne({mail: mail}).then(user => {
		if (!user) {
			console.log('check');
			User.updateOne({number: req.cookies.number}, {mail:mail}).then(() => res.redirect('/user_mail'));
		}
		else {
			//уведомление о том, что почта используется
			res.redirect('/user_mail');
		}
	});
});


module.exports = app;