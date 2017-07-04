var cheerio = require('cheerio');
var request = require('request');
var fs      = require('fs');
var amazon = require('amazon-product-api');
var cred = require('../credentials.js');
const PriceFinder = require('price-finder');
const priceFinder = new PriceFinder();

var client = amazon.createClient({
	awsId: cred.awsId,
	awsSecret: cred.awsSecret,
	awsTag : "aws Tag"
});

exports.getInfo = function(search) {
	return new Promise(
		function(resolve, reject) {
            var link = "https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords=";
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
				url: link,
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
				//console.log(link);
				$ = cheerio.load(body);
				//console.log(body);
				
				var prodLink;
				
				// each loop to determine if sponsored results are present on the page
				// could be improved to be more robust, very hacky right now
				$( "a.a-link-normal.s-access-detail-page.s-color-twister-title-link.a-text-normal" ).each(function( index ) {
					console.log( index + ": " + $(this).text() );
					// specific page element that has text containing the word 'ads' 
					// able to quickly identify if result is an ad or not
					// prodLink is generated for the top result that is not an ad, and each loop is terminated
					if(!($(this).parent().parent().prev()).text().includes("ads")) {
						prodLink = $(this).first().attr('href');	
						return false;
					}
				});
				//console.log("suspected link " + $('a.a-link-normal.s-access-detail-page.s-color-twister-title-link.a-text-normal').first().text());
				
				
				// if prodLink is non-existent, product is considered not found on AMZ
				if (!prodLink.match(/B[\dA-Z]{9}|\d{9}(X|\d)$/)[0].trim())
					resolve("");
				
				// extract ASIN using regexp
				var asin = prodLink.match(/B[\dA-Z]{9}|\d{9}(X|\d)$/)[0].trim();
				//console.log(asin);
				
				var rating = "unavailable"
				
				request({
					method: 'GET',
					url: "https://www.amazon.com/gp/customer-reviews/widgets/average-customer-review/popover/ref=dpx_acr_pop_?contextId=dpx&asin=" + asin,
					headers: {
							'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36'
					}
				}, function(err2, response2, body2) {
					if (err2)
						console.log(err2);
					ht = cheerio.load(body2);
					rating = ht('span.a-size-base.a-color-secondary').text().trim();
					//console.log(rating);
				}
				)
				
				
				client.itemLookup({
					itemId: asin,
					responseGroup: 'ItemAttributes,Offers,Images'
				}).then(function(results) {
					//console.log(results);
					
					priceFinder.findItemDetails(prodLink, function(err, itemDetails) {
						console.log("AMZ URL: " + prodLink); // bug with products that only have "offers" on AMZ
						console.log("AMZ Scraped Item Deets: " + itemDetails);
						console.log("Error from price-finder: " + err);
						console.log(typeof itemDetails);
						if (typeof itemDetails == "undefined")
							resolve("");
					
						else {
							var prodImg;
						
							if (typeof results[0].MediumImage == "undefined")
								prodImg = "";
							else prodImg = results[0].MediumImage[0].URL[0];
								resolve({
									source: "Amazon",
									name: itemDetails.name, 
									price: itemDetails.price, 
									link: prodLink,
									rating: rating,
									prodImg: prodImg});
						}
					});
				}).catch(function(err) {
					console.log(err);
					priceFinder.findItemDetails(prodLink, function(err, itemDetails) {
					console.log("AMZ URL: " + prodLink); // bug with products that only have "offers" on AMZ
					console.log("AMZ Scraped Item Deets: " + itemDetails);
					console.log("Error from price-finder: " + err);
					resolve({
						source: "Amazon",
						name: itemDetails.name, 
						price: itemDetails.price, 
						link: prodLink,
						rating: rating,
						prodImg: ""});
					});
				});
			});
		}
	);
}