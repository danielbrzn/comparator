
//Takes the first item found from the search and gets name and price
//Need to return but I scrub
var cheerio = require('cheerio');
var request = require('request');
var fs      = require('fs');

exports.getInfo = function(search) {
	return new Promise(
		function(resolve, reject) {
            var link = "http://www.lazada.sg/catalog/?q=";
			var words = search.split(" ");
			for (var i = 0; i < words.length; i++) {
				if (i === 0) {
					link += words[i];
				}
				else {
					link += "+" + words[i];
				}
			}
			
			request({
				method: 'GET',
				url: link
			}, function(err, response, body) {
				if (err) {
					return reject(err);
					console.log(err);
				}
				// Tell Cheerio to load the HTML
				$ = cheerio.load(body);
				// console.log(body);
				// console.log($('a.c-product-card__name').first().text().trim());
				// console.log($('span.c-product-card__price-final').first().text().trim());
					
				
				var name = $('a.c-product-card__name').first().text().trim();
				var price = $('span.c-product-card__price-final').first().text().trim().split(" ")[1].replace(",", "");
				
				if (!name.includes(search.split(" ")[0]))
					return resolve(["Product Not Found!", "-"]);
				
				return resolve([name, price]);
				//console.log($('#special_price_box').text());
			});
		}
	);
}