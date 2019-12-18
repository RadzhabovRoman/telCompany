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
const Admin = require('./models/admin');

//цены
const price = {};
price['статический ip'] = 500;
price['красивый номер'] = 1000;
price['переадреация'] = 750;
price['тариф выгодный'] = 400;
price['тариф  максимум'] = 600;
price['ip  TV'] = 600;
price['аренда приставки'] = 20;
price['аренда роутера'] = 40;

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
				balance: 3000,
				mail: '-',
				role: 'user',
				mail: 'super.stronger20121@yandex.ru'
			});
			Service.create({
				number: number,
				available: ['тариф выгодный', 'тариф  максимум', 'ip  TV', 'аренда приставки', 'аренда роутера'],
				confirmed: ['статический ip', 'переадреация' ], //для тестирования оплаты
				bought: []
			});
			Admin.create({
				number: '11',
				password: '11',
				name: 'valera',
				role: 'admin'
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
    const {number, password} = req.body;
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
		res.render('user_cabinet', {name: req.cookies.name});
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
				{number: req.cookies.number}, { timestamp: Date.now(), $addToSet: { services: potential }}
				).then(() => {
				Service.updateOne({number: req.cookies.number}, {$pullAll: { available: potential }}).then(() => res.json('Услуги добавлены'));
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

//авторизация менеджера
app.get('/manager', (req, res) => res.redirect('manager_login'));
app.get('/manager_login', (req, res) => res.render('manager_login'));  
app.post('/manager_login', jsonParser,  (req, res) => {
    const {number, password} = req.body;
	Manager.findOne({
		number: number,
		password: password
	}).then(manager => {
		if (manager) {
			manager.password = 'good luck';
			res.json(manager);
		}
		else {
			//уведомление о том, что пароль не верен
			res.json('Неверный логин или пароль');
		}
	})
	.catch(() => console.log('auth_error'));
});

//личный кабинет менеджера
app.get('/manager_cabinet', (req, res) =>  {
	if (req.cookies.role === 'manager') {
		res.render('manager_cabinet');
	}
	else {
		res.redirect('/manager_login');
	}
});

//проверка клиента
app.get('/manager_check', (req, res) =>  {
	if (req.cookies.role === 'manager') {
		res.render('manager_check', {user: null});
	}
	else {
		res.redirect('/manager_login');
	}
});
app.post('/manager_check', (req, res) => {
    const {number} = req.body;
	User.findOne({
		number: number
	}).then(user => {
		if (user) {
			user.password = 'good luck';
			//res.redirect('/manager_check');
			res.render('manager_check', {user: user});
		} else {
			res.render('manager_check', {user: null});
		}
	})
	.catch(() => console.log('find_error'));
});

//изменение ФИО клиента
app.get('/manager_change', (req, res) =>  {
	if (req.cookies.role === 'manager') {
		res.render('manager_change');
	}
	else {
		res.redirect('/manager_login');
	}
});
app.post('/manager_change', jsonParser,  (req, res) => {
    const {number, name} = req.body;
	User.findOne({
		number: number
	}).then(user => {
		if (user) {
			User.updateOne(
				{number: number},
				{name: name}).then(() => res.json('ФИО изменено'));
		} else {
			res.json('Нет такого пользователя');
		}
	})
});

module.exports = app;

//изменение баланса клиента
app.get('/manager_bonus', (req, res) =>  {
	if (req.cookies.role === 'manager') {
		res.render('manager_bonus');
	}
	else {
		res.redirect('/manager_login');
	}
});
app.post('/manager_bonus', jsonParser,  (req, res) => {
    const {number, bonus} = req.body;
	User.findOne({
		number: number
	}).then(user => {
		if (user) {
			User.updateOne(
				{number: number},
				{balance: user.balance -+- bonus}).then(() => res.json('Баллы зачислены'));
		} else {
			res.json('Нет такого пользователя');
		}
	})
});

//список потенциальных клиентов
app.get('/manager_list', (req, res) =>  {
	if (req.cookies.role === 'manager') {
		res.render('manager_list', {list: null});
	}
	else {
		res.redirect('/manager_login');
	}
});
app.post('/manager_list', jsonParser,  (req, res) => {
	Manager.findOne({
		number: req.cookies.number
	}).then(manager => {
		if (!manager || manager.rating < 4) {
			res.render('manager_list', {list: 'Недостаточно рейтинга'});
		} else {
			User.find().sort({balance: -1}).limit(5).then(users => {
				for (i in users) {
					users[i].password = 'good luck';
				}
				res.render('manager_list', {list: users});
			});
		}
	})
});

//одобрение заявки
app.get('/manager_order', (req, res) =>  {
	if (req.cookies.role === 'manager') {
		Potential.find().sort({timestamp: 1}).limit(1).then(order => {
			if (!order) {
				res.render('manager_order', {order: null});
			} else {
				res.render('manager_order', {order: order[0]});
			}
		});
	} else {
		res.redirect('/manager_login');
	}
});
app.post('/manager_order', jsonParser,  (req, res) => {
	const {number, services, flag} = req.body;
	if (!flag) {
		Potential.deleteOne( { number: number } ).then(() => {
		Service.updateOne(
					{number: number},
					{ $addToSet: { confirmed: services }}).then(() => {
						User.findOne({number:number}).then(user => {
							if (user.mail !== '-') {
	  						var nodemailer = require('nodemailer');
							transporter.sendMail({
								from: 'SERVER <fanya.korovin@mail.ru>',
	  							to: user.mail,
	 							subject: 'Подтверждение заявки',
	  							text: 'Вам подтвердил заявку ' + req.cookies.name + ' ('+ req.cookies.number + ')'
							});
						}
						}).then(() => {
							Manager.updateOne(
								{number: req.cookies.number},
								{ $inc: { sum: 1} }).then(() => {
									res.json('Заявка подтверждена');
								});
						});
					})
	});
	} else {
		Potential.deleteOne( { number: number } ).then(() => {
		Service.updateOne(
					{number: number},
					{ $addToSet: { available: services }}).then(() => {
						User.findOne({number:number}).then(user => {
							if (user.mail !== '-') {
	  						var nodemailer = require('nodemailer');
							transporter.sendMail({
								from: 'SERVER <fanya.korovin@mail.ru>',
	  							to: user.mail,
	 							subject: 'Отмена заявки',
	  							text: 'Вашу заявку отменил' + req.cookies.name + ' ('+ req.cookies.number + ')'
							});
						}
						}).then(() => {
							res.json('Заявка отмненена');
						});
					})
	});
	}
});

//авторизация администратора
app.get('/admin', (req, res) => res.redirect('admin_login'));
app.get('/admin_login', (req, res) => res.render('admin_login'));  
app.post('/admin_login', jsonParser,  (req, res) => {
    const {number, password} = req.body;
	Admin.findOne({
		number: number,
		password: password
	}).then(admin => {
		if (admin) {
			admin.password = 'good luck';
			res.json(admin);
		}
		else {
			//уведомление о том, что пароль не верен
			res.json('Неверный логин или пароль');
		}
	})
	.catch(() => console.log('auth_error'));
});

//личный кабинет администратора
app.get('/admin_cabinet', (req, res) =>  {
	if (req.cookies.role === 'admin') {
		res.render('admin_cabinet');
	}
	else {
		res.redirect('/admin_login');
	}
});

//удаление клиента
app.get('/admin_userdelete', (req, res) =>  {
	if (req.cookies.role === 'admin') {
		res.render('admin_userdelete');
	}
	else {
		res.redirect('/admin_login');
	}
});
app.post('/admin_userdelete', jsonParser,  (req, res) => {
    const {number} = req.body;
	User.deleteOne({
		number: number
	}).then(result  => {
		if (result.deletedCount > 0) {
			res.json('Пользователь удален');
		}
		else {
			//уведомление о том, что пароль не верен
			res.json('Нет такого пользователя');
		}
	})
	.catch(() => console.log('auth_error'));
});

//добавление менеджера
app.get('/admin_managercreate', (req, res) =>  {
	if (req.cookies.role === 'admin') {
		res.render('admin_managercreate');
	}
	else {
		res.redirect('/admin_login');
	}
});
app.post('/admin_managercreate', jsonParser,  (req, res) => {
    const {number, password, name} = req.body;
	Manager.findOne({
		number: number
	}).then(user => {
		if (!user) {
			Manager.create({
				number: number,
				password: password,
				name: name,
				rating: 0,
				sum: 0,
				reviews: 0,
				role: 'manager'
			});
			res.json('Сотрудник добавлен');
		}
		else {
			//уведомление о том, что номер занят
			res.json('Номер уже используется');
		}
	})
	.catch(() => console.log('reg_error'));
});

//последние отзывы
app.get('/admin_reviews', (req, res) =>  {
	if (req.cookies.role === 'admin') {
		Review.find().sort({timestamp: -1}).limit(5).then(reviews => {
			if (!reviews) {
				res.render('admin_reviews', {reviews: null});
			} else {
				res.render('admin_reviews', {reviews: reviews});
			}
		});
	}
	else {
		res.redirect('/admin_login');
	}
});

//лучшие сотрудники
app.get('/admin_best', (req, res) =>  {
	if (req.cookies.role === 'admin') {
		Manager.find().sort({sum: -1}).limit(5).then(managers => {
			if (!managers) {
				res.render('admin_best', {managers: null});
			} else {
				res.render('admin_best', {managers: managers});
			}
		});
	}
	else {
		res.redirect('/admin_login');
	}
});

//лучшие сотрудники
app.get('/admin_report', (req, res) =>  {
	if (req.cookies.role === 'admin') {
		res.render('admin_report', {manager: null, reviews: null});
	}
	else {
		res.redirect('/admin_login');
	}
});
app.post('/admin_report', (req, res) => {
    const {number} = req.body;
	Manager.findOne({
		number: number
	}).then(manager => {
		if (manager) {
			manager.password = 'good luck';
			Review.find({
				managerNumber: manager.number
			}).then(reviews =>{
				if (reviews) {
					res.render('admin_report', {manager: manager, reviews: reviews});
				} else {
					res.render('admin_report', {manager: manager, reviews: null});
				}
			})
		} else {
			res.render('admin_report', {manager: null, reviews: null});
		}
	})
	.catch(() => console.log('find_error'));
});