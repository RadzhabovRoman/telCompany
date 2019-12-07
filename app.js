//загрузка модулей
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

//подключение моделей
const User = require('./models/user');
const Service = require('./models/service');

//включение модулей
const app = express();
const jsonParser = express.json();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}), cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//стартовая страница
app.get('/', (req, res) => {
	res.clearCookie('role');
	res.clearCookie('number');
	res.render('index');
});

//регистрация пользователя
app.get('/user_reg', (req, res) => res.render('user_reg')); 
app.post('/user_reg', jsonParser,  (req, res) => {
    const {number, password, name} = req.body;
	User.findOne({
		number: number
	}).then(user => {
		if (!user) {
			User.create({
				number: number,
				password: password,
				name: name,
				balance: 0,
				mail: '-',
				role: 'user'
			});
			Service.create({
				number: number,
				available: ['denis', 'patau'],
				confirmed: [],
				bought: []
			});
			res.json('Регистрация прошла успешно');
		}
		else {
			//уведомление о том, что номер занят
			res.json('Номер уже используется');
		}
	})
	.catch(() => console.log('reg_error'));
});

//авторизация пользователя
app.get('/user_login', (req, res) => res.render('user_login')); 
app.post('/user_login', jsonParser,  (req, res) => {
    const {number, password, name} = req.body;
	User.findOne({
		number: number,
		password: password
	}).then(user => {
		if (user) {
			user.password = 'good luck';
			res.json(user);
		}
		else {
			//уведомление о том, что пароль не верен
			res.json('Неверный логин или пароль');
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
app.post('/user_mail', jsonParser, (req, res) =>  {
	const {mail} = req.body;
	console.log(mail);
	User.findOne({mail: mail}).then(user => {
		if (!user) {
			User.updateOne({number: req.cookies.number}, {mail:mail}).then(() => res.json('Почта изменена'));
		}
		else {
			//уведомление о том, что почта используется
			res.json('Такая почта уже используется');
		}
	});
});


module.exports = app;