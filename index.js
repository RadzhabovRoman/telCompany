const app = require('./app');
const database = require('./database');

database()
  .then(info => {
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
    app.listen(3000, () =>
      console.log(`Example app listening on port 3000!`)
    );
  })
  .catch(() => {
    console.error('Unable to connect to database');
    process.exit(1);
  });