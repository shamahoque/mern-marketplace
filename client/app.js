const express = require('express');
const chalk = require('chalk');
const debug = require('debug')('app');
const morgan = require('morgan');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(morgan('tiny'));

app.use(express.static(path.join(__dirname, '/public')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.set('views', './src/views');
app.set('view engine', 'ejs');

const nav = [
  { link: '/services', title: 'Services' },
  { link: '/resources', title: 'Resources' },
  { link: '/products', title: 'Products' },
  { link: '/signup', title: 'Sign Up' }
];

const serviceRouter = require('./src/routes/serviceRoutes')(nav);

app.use('/services', serviceRouter);
app.get('/', (req, res) => {
  res.render(
    'index',
    {
      nav: [{ link: '/services', title: 'Services' },
        { link: '/resources', title: 'Resources' },
        { link: '/products', title: 'Products' },
        { link: '/signup', title: 'Sign Up' }]
    }
  );
});

app.listen(port, () => {
  debug(`Listening to port ${chalk.green(port)}`);
});
