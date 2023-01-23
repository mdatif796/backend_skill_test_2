const bodyParser = require('body-parser');
const express = require('express');
// creating app of express
const app = express();
const path = require('path');
const port = 8000;
const expressLayouts = require('express-ejs-layouts');

// setting up the connection with the database
const db = require('./config/databaseConnection');

// passport authentication
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportJwtStrategy = require('./config/passport-jwt-strategy');
const passportGoogle = require('./config/passport-google-oauth-strategy');

// for permanently store session cookies to db
const MongoStore = require('connect-mongo');
// scss
const nodeSassMiddleware = require('node-sass-middleware');
// for flash messages
const flash = require('connect-flash');
// custome middleware for flash messages
const customMiddleware = require('./config/flash_middleware');

// middleware for using scss
app.use(nodeSassMiddleware({
    src: './assets/scss',
    dest: './assets/css',
    debug: true,
    outputStyle: 'extended',
    prefix: '/css'
}));

// for parsing the data which comes from browser
app.use(bodyParser.urlencoded({extended: true}));

// using static files
app.use(express.static('./assets'));


// telling app to use expressLayouts
app.use(expressLayouts);

// extract styles from sub pages and include it in layout
app.set('layout extractStyles', true);

// setting up the views for ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // OR app.set('views', './views');

app.use(session({
    name: 'iConnect',
    secret: process.env.SESSIONSECRETKEY,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store: MongoStore.create({
        mongoUrl: `mongodb+srv://${process.env.MONGO_USER}:${process.env.DATABASE_PASS}@cluster0.lymyd.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`,
        autoRemove: 'disabled'
    },
    function(err){
        console.log(err || "MongoStore connnection setup ok");
    }
    )
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customMiddleware.setFlash);

// any request from browser for '/' sent to routes folder
app.use('/', require('./routes'));

app.listen(process.env.PORT || port, function(err){
    if(err){
        console.log("Error in listening on port ", port);
        return;
    }
    console.log("Express server is running on the port ", port);
    return;
});