const express = require('express');
const bodyParser = require('body-parser');

const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}));

/*app.get('/', (req, res) => {
	//User.find({name: 'Borovik'})
	User.find({})
    .then(users => {
      res.render('index', { users: users });
    })
    .catch(err => {
      res.status(200).json({ err: err });
    });
});
*/
app.get('/', (req, res) => res.render('index'));

app.get('/user_reg', (req, res) => res.render('user_reg'));
app.post('/user_reg', (req, res) => {
	console.log(req.body);
	const {number, password, name} = req.body;
	//User.remove({
	User.create({
		number: number,
		password: password,
		name: name,
		balance: 0,
		serv: '0'
	}).then(user => console.log(user));		
	
	res.redirect('/');
});

module.exports = app;