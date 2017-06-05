var express = require('express');
var fortune = require('./lib/fortune.js');
var bodyParser = require('body-parser');
var searchController = require('./lib/searchController.js');

var app = express();

// set up handlebars view engine
var handlebars = require('express3-handlebars')
		.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res){
	res.render('home');
});

app.get('/about', function(req,res){
	res.render('about', { fortune: searchController.getPrice('gtx 1080') });
});

app.use(function(req, res, next){
		res.locals.showTests = app.get('env') !== 'production' &&
				req.query.test === '1';
		next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.get('/search', function(req, res){
	// dummy for csrf
	res.render('search', { csrf: 'CSRF GOES HERE' });
});

app.post('/process', function(req, res){
	console.log('Form (from querystring): ' + req.query.form);
	console.log('Product Name (from visible form field): ' + req.body.name);
	app.locals.prodName = req.body.name;
	res.redirect(303, '/results');
});

app.get('/results', function(req, res){
	searchController.getPrice(req.app.locals.prodName, function(results) {
		res.render('results', { name: results[0].ItemAttributes[0].Title[0] , 
			price: results[0].OfferSummary[0].LowestNewPrice[0].FormattedPrice[0]});
	});
});

// 404 catch-all handler (middleware)
app.use(function(req, res){
		res.status(404);
		res.render('404');
});

// custom 500 page
app.use(function(err, req, res, next){
		console.error(err.stack);
		res.status(500);
		res.render('500');
});

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' +
		app.get('port') + '; press Ctrl-C to terminate.' );

});

function getWeatherData(){
	return {
		locations: [
			{
				name: 'Portland',
				forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
				weather: 'Overcast',
				temp: '54.1 F (12.3 C)',
			},
			{
				name: 'Bend',
				forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
				weather: 'Partly Cloudy',
				temp: '55.0 F (12.8 C)',
			},
			{
				name: 'Manzanita',
				forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
				weather: 'Light Rain',
				temp: '55.0 F (12.8 C)',
			},
		],
	};
}

app.use(function(req, res, next){
		if(!res.locals.partials) res.locals.partials = {};
		res.locals.partials.weather = getWeatherData();
		next();
});