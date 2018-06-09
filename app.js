var express = require('express'),
    config = require('./config.json').configuration,
    development = config.development,
    production = config.production,
    redis = require('redis'),
    client = redis.createClient(
        config.redis.port,
        config.redis.host
    ),
    async = require('async'),
    _ = require('underscore'),
    path = require('path'),
    api = require('./api'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    methodOverride = require('method-override');

var app = express();

client.debug_mode = true;

app.set('strict routing', true);
app.set("sauco address", "http://" + config.sauco.host + ":" + config.sauco.port);

if (config.sauco.port == 4000) {
    app.set("sauco network", 'mainnet');
} else {
    app.set("sauco network", 'testnet');
}

app.locals.host = config.sauco.host;
app.locals.port = config.sauco.port;
app.locals.nethash = config.sauco.nethash;
app.locals.broadhash = config.sauco.broadhash;
app.locals.liskVersion = config.sauco.version;
app.locals.liskMinVersion = config.sauco.minVersion;
app.locals.passphrase = config.sauco.passphrase;
app.locals.address = config.sauco.address;
app.locals.amountToSend = config.amount;
app.locals.cacheTTL = config.cacheTTL;

app.use(function(req, res, next) {
    req.sauco = app.get("sauco address");
    return next();
});

app.use(function(req, res, next) {
    req.fixedPoint = config.fixedPoint;
    next();
});

app.use(function(req, res, next) {
    req.redis = client;
    return next();
});


app.use(express.logger());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.compress());
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());

if (app.get('env') === 'development') {
    app.set("host", development.host);
    app.set("port", development.port);
    app.locals.captcha = development.captcha;
}

if (app.get('env') === 'production') {
    app.set("host", production.host);
    app.set("port", production.port);
    app.locals.captcha = production.captcha;
}

api(app);
app.listen(app.get('port'), app.get('host'), function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Server started at " + app.get('host') + ":" + app.get('port'));
    }
});