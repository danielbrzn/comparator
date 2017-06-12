var express = require('express');
var bodyParser = require('body-parser');
var searchController = require('./lib/searchController.js');
var lazScrape = require('./lib/newLazScrape.js');
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
		
		searchController.getInfo(req.app.locals.prodName).then(function (fulfilled) {
			console.log(fulfilled);
		})
		.catch(function (error) {
			console.log(error.message);
		});
		
		
	
		
		/*
		var priceArr = [];

		var amz = false;
		var fetchAMZ = new Promise(function(resolve, reject) {
			searchController.getURL(req.app.locals.prodName, function(prodLink) {
				searchController.getInfo(prodLink, function(results) {
					priceArr.push(results);
					amz = true;
				});
			});
	
			if (amz)
				resolve(priceArr);
			else
				reject('Failure!');
		});

		fetchAMZ.then(function(fulfilled) {
			console.log(priceArr[0].name);
			console.log(priceArr[0].price);
		}).catch(function(error) {
			console.error("failed to fetch from Amazon");
		});
		
		
		*/
		/*searchController.getURL(req.app.locals.prodName)
		.then(searchController.getInfo(prodLink, function(results) {
			priceArr.push(results);
			res.render('results', {AmazName: priceArr[0].name, AmazPrice: priceArr[0].price,
							LazName: priceArr[0], LazPrice: priceArr[1]});
		})
		).catch(function(err) {
			console.log(err);
		});
		*/
	
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


	