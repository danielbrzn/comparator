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
			link = link + "&searchredirect=";
			
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
				url: link, //+ "&sort=ratingdesc&viewType=gridView&psf=brand&sc=MS0F&fs=1",
				headers: {
					'Accept': 'application/json',
					'Accept-Charset': 'utf-8',
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'
				}
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
				
				
				
				if ($('h1.notFound__info__heading').first().text().includes("unable to find"))
					return resolve([""]);
				
				var name = $('a.c-product-card__name').first().text().trim();
				var price = $('span.c-product-card__price-final').first().text().trim().split(" ")[1].replace(",", "");
				
				var prodLink = "https://www.lazada.sg" + $('a.c-product-card__name').first().attr('href');
				
				if (!(name.toLowerCase()).includes(search.split(" ")[0].toLowerCase()))
					return resolve("");
				
				return resolve({
				source: "Lazada",
				name: name,
				price:	price,
				link: prodLink});
				//console.log($('#special_price_box').text());
			});
		}
	);
}