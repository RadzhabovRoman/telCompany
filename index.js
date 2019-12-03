const app = require('./app');
const database = require('./database');

database()
  .then(info => {
    console.log('Connected to locallhost:3000/mydb');
    app.listen(3000, () =>
      console.log(`App listening on port 3000`)
    );
  })
  .catch(() => {
    console.error('Unable to connect to database');
    process.exit(1);
  });