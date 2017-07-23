var cheerio = require('cheerio');
var request = require('request');
var test = require('readline');
const PriceFinder = require('price-finder');
const priceFinder = new PriceFinder();
var fs      = require('fs');

exports.getInfo = function(search) {
	return new Promise(
		function(resolve, reject) {
			var link = "http://store.steampowered.com/search/?term=";
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
			reject(err);
			console.log(err);
		}
        // Tell Cherrio to load the HTML
        $ = cheerio.load(body);
				
		var prodLink = $('a.search_result_row.ds_collapse_flag').first().attr('href');
		
        priceFinder.findItemDetails(prodLink, function(err, itemDetails) {
						console.log("Steam URL: " + prodLink); // bug with products that only have "offers" on AMZ
						console.log("Steam Scraped Item Deets: " + itemDetails);
						console.log("STeam Error from price-finder: " + err);
						console.log(typeof itemDetails);
						if (typeof itemDetails == "undefined")
							resolve("");
					
						else {
								resolve({
									source: "Steam",
									name: itemDetails.name, 
									price: itemDetails.price, 
									link: prodLink,
									rating: rating});
						}
					});
		});
	});
}