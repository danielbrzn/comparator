var express = require('express');
var bodyParser = require('body-parser');
var amzScrape = require('./lib/amzScrape.js');
var lazScrape = require('./lib/lazScrape.js');
var sephScrape = require('./lib/sephScrape.js')
var currConv = require('./lib/currencyconverter.js');
var app = express();
var tablesort = require('tablesort');
var credentials = require('./credentials.js');
var session = require('express-session');
var favicon = require('serve-favicon');
var altAMZScrape = require('./lib/altamzScrape.js');

// set up handlebars view engine
var handlebars = require('express3-handlebars')
.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('trust proxy', 1);

app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(express.static(__dirname + '/public'));
app.use(session(
	{ secret: credentials.cookieSecret,
	  resave: false,
	  saveUninitialized: false
	}));

app.set('port', process.env.PORT || 3000);
var sess;

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
	sess = req.session;
	res.render('search', { csrf: 'CSRF GOES HERE' });
});

app.post('/process', function(req, res){
	sess = req.session;
	//console.log('Form (from querystring): ' + req.query.form);
	//console.log('Product Name (from visible form field): ' + req.body.name);
	sess.prodName = req.body.prodName;
	sess.prodPrice = req.body.prodPrice;
	sess.userCurr = req.body.currency;
	console.log(req.body.currency);
	//console.log(sess.prodName);
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
	sess = req.session;
	var arr = [[],[]]
	var bestPrice, bestName;
	Promise.all([altAMZScrape.getInfo(sess.prodName),  lazScrape.getInfo(sess.prodName), sephScrape.getInfo(sess.prodName)])
	.then(results => {
		arr[0] = results[0];
		arr[1] = results[1];
		arr[2] = results[2];
		currConv.convert("USD", sess.userCurr, arr[0].price)
		.then(
		function (converted) {
			arr[0].price = parseFloat(converted).toFixed(2);
			// we return "objects" now so we can access the attributes instead of having to use array
			bestSite = arr[0].source;
			bestPrice = arr[0].price;
			bestName = arr[0].name;
			bestLink = arr[0].link;
			amzImg = arr[0].prodImg;
			rating = arr[0].rating;
			
			console.log(arr[2].name);
			console.log(bestName);
			console.log(bestPrice);
			
			for (i=0; i < arr.length; i++) {
				// remove useless results
				if (!arr[i])
					arr.splice(i,i);
			}
			
			for (i = 1; i < arr.length; i++) {
				// update if price is lower than current best
				if (parseInt(bestPrice) > parseInt(arr[i].price)) {
					bestSite = arr[i].source;
					bestPrice = arr[i].price;
					bestName = arr[i].name;
					bestLink = arr[i].link;
					
				}
				
				// render when at end of array
				if (i+1 == arr.length) {
					sess.arr = arr;
					sess.bestSite = bestSite;
					sess.bestLink = bestLink;
					sess.bestName = bestName;
					sess.bestPrice = bestPrice;
					sess.amzImg = amzImg;
					sess.rating = rating;
					sess.savings = parseFloat(sess.bestPrice) < parseFloat(sess.prodPrice);
					sess.priceDiff = Math.abs(parseFloat(sess.prodPrice - sess.bestPrice).toFixed(2));
					switch (sess.userCurr) {
						case "SGD" : sess.currSymbol = "$";
						break;
						case "JPY" : sess.currSymbol = "¥‎"
						
					}
					console.log(sess.currSymbol);
					
					res.render( 'results', { sites: sess.arr,
						savings: sess.savings,
						Rating: sess.rating,
						AmzImg: sess.amzImg,
						CurrSymbol: sess.currSymbol,
						PriceDiff: sess.priceDiff,
						BestSite: sess.bestSite,
						BestLink: sess.bestLink,
						BestName: sess.bestName, BestPrice: parseFloat(sess.bestPrice).toFixed(2),
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

