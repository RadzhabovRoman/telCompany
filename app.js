//загрузка модулей
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const transporter = require('./nodemailer');

//подключение моделей
const User = require('./models/user');
const Service = require('./models/service');
const Manager = require('./models/manager');
const Review = require('./models/review');
const Potential = require('./models/potential');

//цены
const price = {};
price['static ip'] = 100;
price['good number 500'] = 500;
price['tarif1'] = 200;
price['tarif2'] = 300;

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
				available: ['good number', 'static ip'],
				confirmed: ['tarif1', 'tarif2'], //для тестирования оплаты
				bought: []
			});
			/* для тестирования отзывов
			Manager.create({
				number: '322',
				password: 'dcp',
				name: 'dodik',
				rating: 0,
				sum: 0,
				reviews: 0,
				role: 'manager'
			});
			*/
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

//обратная связь
app.get('/user_review', (req, res) =>  {
	if (req.cookies.role === 'user') {
		res.render('user_review');
	}
	else {
		res.redirect('/user_login');
	}
});
app.post('/user_review', jsonParser, (req, res) =>  {
	const {managerNumber, reviewText, rating} = req.body;
	Review.create({
				managerNumber: managerNumber,
				reviewText: reviewText,
				userNumber: req.cookies.number
			});
	Manager.findOne({number: managerNumber}).then(manager => {
		if (manager) {
			calibratedRating = (manager.reviews * manager.rating -+- rating) / (manager.reviews + 1);
			console.log(calibratedRating);
			let calibratedReviews = manager.reviews + 1;
			Manager.updateOne({number: managerNumber}, {rating:calibratedRating, reviews:calibratedReviews}).then(() => res.redirect('/user_cabinet'));
		}
		else {
			res.redirect('/user_cabinet');
		}
	});
});

//создание заявки
app.get('/user_potential', (req, res) =>  {
	if (req.cookies.role === 'user') {
		Service.findOne({number: req.cookies.number}).then(service => {
			Potential.findOne({number: req.cookies.number}).then(order => {
				res.render('user_potential', {service:service, order:order});
			});
		});
	}
	else {
		res.redirect('/user_login');
	}
});
app.post('/user_potential', jsonParser, (req, res) =>  {
	const {potential} = req.body;
	Potential.findOne({number: req.cookies.number}).then(order => {
		if (!order) {
			Potential.create({
				number: req.cookies.number,
				services: potential
			}).then(() => {
				Service.updateOne({number: req.cookies.number}, { $pullAll: { available: potential }}).then(() => res.json('Услуги добавлены'));
			});
		} else {
			Potential.updateOne(
				{number: req.cookies.number}, { $addToSet: { services: potential }}
				).then(() => {
				Service.updateOne({number: req.cookies.number}, { $pullAll: { available: potential }, }).then(() => res.json('Услуги добавлены'));
			});
		}
	});
});

//оплата
app.get('/user_pay', (req, res) =>  {
	if (req.cookies.role === 'user') {
		Service.findOne({number: req.cookies.number}).then(service => {
			User.findOne({number: req.cookies.number}).then(user => {
				res.render('user_pay', {service:service, price:price, balance:user.balance});
			});
		});
	}
	else {
		res.redirect('/user_login');
	}
});
app.post('/user_pay', jsonParser, (req, res) =>  {
	const {bought} = req.body;
	let sum = 0;
	for (let current in bought) {
		sum +=price[bought[current]];
	}
	User.findOne({number: req.cookies.number}).then(user =>{
		if (user.balance - sum < 0){
			console.log(sum);
			res.json('Недостаточно средств');
		} else {
			let oldBalance = user.balance;
			let newBalance = user.balance - sum;
			User.updateOne(
				{number: req.cookies.number},
				{balance: user.balance - sum}).then(() => {
				Service.updateOne(
					{number: req.cookies.number},{ $pullAll: { confirmed: bought }, $addToSet: { bought: bought }}).then(() => {
						if (user.mail !== '-') {
	  						var nodemailer = require('nodemailer');
							transporter.sendMail({
								from: 'SERVER <fanya.korovin@mail.ru>',
	  							to: user.mail,
	 							subject: 'Изменился баланс',
	  							text: 'Было: ' + oldBalance + ', Стало:' + newBalance
							});
						}
						res.json('Оплачено');
					});
			});
		}
	});
});

module.exports = app;