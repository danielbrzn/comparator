var express = require('express');
var bodyParser = require('body-parser');
var amzScrape = require('./lib/amzScrape.js');
var lazScrape = require('./lib/lazScrape.js');
var sephScrape = require('./lib/sephScrape.js')
var currConv = require('./lib/currencyconverter.js');
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

app.get('/about', function(req, res){
    res.render('about');
});

app.get('/search', function(req, res){
	// dummy for csrf
	res.render('search', { csrf: 'CSRF GOES HERE' });
});

app.post('/process', function(req, res){
	//console.log('Form (from querystring): ' + req.query.form);
	//console.log('Product Name (from visible form field): ' + req.body.name);
	app.locals.prodName = req.body.name;
	res.redirect(303, '/results');
});

app.get('/elements', function(req, res) {
	res.render('elements');
});

app.get('/generic', function(req, res) {
	res.render('generic');
});

app.get('/temp', function(req, res) {
	res.render('temp');
});

app.get('/results', function(req, res){
	var arr = [[],[]]
	var bestPrice, bestName;

	
	Promise.all([amzScrape.getInfo(req.app.locals.prodName), lazScrape.getInfo(req.app.locals.prodName), sephScrape.getInfo(req.app.locals.prodName)])
	.then(results => {
		//console.log(results)
		arr[0] = results[0];
		arr[1] = results[1];
		arr[2] = results[2];
		currConv.convert(arr[0][1])
		.then(
		function (results) {
			arr[0][1] = results;
			bestPrice = arr[0][1];
			bestName = arr[0][0];
			bestLink = arr[0][2];
			//console.log(bestName);
			//console.log(bestPrice);
			
			
			for (i = 1; i < arr.length; i++) {
				if (parseInt(bestPrice) > parseInt(arr[i][1]) && !arr[i][0].includes("Not Found")) {
					bestPrice = arr[i][1];
					bestName = arr[i][0];
					bestLink = arr[i][2];
				}
				
				if (i+1 == arr.length) {
					console.log("bestPrice " + bestPrice);
					res.render( 'results', {
						BestLink: bestLink,
						BestName: bestName, BestPrice: "$" + parseFloat(bestPrice).toFixed(2),
						AmazLink: arr[0][2],
						AmazName: arr[0][0], AmazPrice: "$" + parseFloat(arr[0][1]).toFixed(2),
						LazLink: arr[1][2],
						LazName: arr[1][0], LazPrice: "$" + parseFloat(arr[1][1]).toFixed(2),
						SephLink: arr[2][2],
						SephName: arr[2][0], SephPrice: "$" + parseFloat(arr[2][1]).toFixed(2)
					});
					
				}
			}
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

