var express = require('express');
var bodyParser = require('body-parser');
var amzScrape = require('./lib/amzScrape.js');
var lazScrape = require('./lib/lazScrape.js');
var sephScrape = require('./lib/sephScrape.js');
var currConv = require('./lib/currencyconverter.js');
var fixer = require("node-fixer-io");
var app = express();
var tablesort = require('tablesort');
var credentials = require('./credentials.js');
var session = require('express-session');
var favicon = require('serve-favicon');
var altAMZScrape = require('./lib/altamzScrape.js');
var fixer = require("node-fixer-io");
var nodemailer = require('nodemailer');

var VALID_EMAIL_REGEX = "/\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i";
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

var mailTransport = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: credentials.email.user,
    pass: credentials.email.pass
  }
});


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

app.post('/saveresult', function(req, res){
	sess = req.session;
	sess.email = req.body.email;
	console.log(req.body.email);
	//console.log(sess.prodName);
	
	// input validation
	//if (!sess.email.match(VALID_EMAIL_REGEX))
	//	return res.next(new Error('Invalid email address.'));
	
	res.render('email/succ-results',
	 { layout: null, sites: sess.arr,
						savings: sess.savings,
						Rating: sess.rating,
						AmzImg: sess.amzImg,
						CurrSymbol: sess.currSymbol,
						UserCurr: sess.userCurr,
						PriceDiff: sess.priceDiff,
						BestSite: sess.bestSite,
						BestLink: sess.bestLink,
						BestName: sess.bestName, BestPrice: parseFloat(sess.bestPrice).toFixed(2),
					}, function (err, html) {
						if( err ) console.log('error in email template');
						mailTransport.sendMail({
							from: '"Price Comparator" <donotreply@pricecomp.com>',
							to: sess.email,
							subject: 'Your Comparison Results are Here!',
							html: html,
							generateTextFromHtml: true
					}, function(err) {
						if (err) console.error("Unable to send email: " + err.stack);
					});
				}
	);
	
	res.render('success');
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

app.get('/success', function(req, res) {
	res.render('success');
});

app.get('/results', function(req, res){
	console.log(fixer.allowedRates());
	sess = req.session;
	var arr = [[],[]]
	var bestPrice, bestName;
	Promise.all([altAMZScrape.getInfo(sess.prodName),  lazScrape.getInfo(sess.prodName), sephScrape.getInfo(sess.prodName)])
	.then(results => {
		arr[0] = results[0];
		arr[1] = results[1];
		arr[2] = results[2];
		// add conversion for other websites too, not just AMZ
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
			
			//console.log(arr[2].name);
			//console.log(bestName);
			//console.log(bestPrice);
			
			// remove useless results
			for (i=0; i < arr.length; i++) {
				if (!arr[i])
					arr.splice(i,1);
			}
			
			for (i=1; i<arr.length; i++) {
				if (!sess.userCurr.includes("SGD"))
					arr[i].price = parseFloat(fixer.convert("SGD", sess.userCurr, arr[i].price)).toFixed(2);
			}
			
			// best price updating
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
						case "USD" :
						case "AUD" :
						case "NZD" :
						case "HKD" :
 						case "SGD" : sess.currSymbol = "$";
						break;
						
						case "EUR" : sess.currSymbol = "€";
						break;
						
						case "GBP" : sess.currSymbol = "£";
						break;
						
						case "KRW" : sess.currSymbol = "₩";
						break;
						
						case "PHP" : sess.currSymbol = "₱";
						break;
						
						case "MYR" : sess.currSymbol = "RM";
						break;
						
						case "CNY" :
						case "JPY" : sess.currSymbol = "¥"
						break;
						
						default: sess.currSymbol = "$";
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

