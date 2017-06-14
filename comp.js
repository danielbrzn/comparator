var express = require('express');
var bodyParser = require('body-parser');
var searchController = require('./lib/searchController.js');
var lazScrape = require('./lib/lazScrape.js');
var app = express();
var tablesort = require('tablesort');

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
	var arr = [[],[]]
		/*
		searchController.getInfo(req.app.locals.prodName).then(function (amzDone) {
			console.log(amzDone);
		})
		.catch(function (error) {
			console.log(error.message);
		})
		.then(lazScrape.getInfo(req.app.locals.prodName).then(function (lazDone) {
			console.log(lazDone);
		})).catch(function (error) {
			console.log(error.message);
		});
		*/
		
		Promise.all([searchController.getInfo(req.app.locals.prodName), lazScrape.getInfo(req.app.locals.prodName)])
		.then(results => {
			console.log(results)
			arr[0] = results[0];
			arr[1] = results[1];
			res.render( 'results', { AmazName: arr[0][0], AmazPrice: arr[0][1],
										LazName: arr[1][0], LazPrice: arr[1][1]
			});
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


	