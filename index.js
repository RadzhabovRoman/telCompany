const express = require('express');
const app = express();
const bodyParser = require('body-parser')

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}));

const value = 'hi';

app.get('/', (req, res) => res.render('index', { data: value }));

app.get('/create', (req, res) => res.render('create'));
app.post('/create', (req, res) => {
	console.log(req.body);
});

app.listen(3000, () => console.log('App listening on port 3000'));