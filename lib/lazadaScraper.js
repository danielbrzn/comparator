var cheerio = require('cheerio');
var request = require('request');


exports.getData = function (uri, callback) {

request({
    method: 'GET',
	url: uri 									//placeholder for actual url
}, function(err, response, body) {
    if (err) return console.error(err);

    // Tell Cherrio to load the HTML
    $ = cheerio.load(body);
    var lazName = $('#prod_title').text().trim();

    var lazPrice = $('#special_price_box').text();
	console.log(lazName);
	console.log(lazPrice);
	var arr = [lazName, lazPrice];
	callback(arr);
});

}


