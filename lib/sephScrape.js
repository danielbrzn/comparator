
//Takes the first item found from the search and gets name and price
var cheerio = require('cheerio');
var request = require('request');
var test = require('readline');

var fs      = require('fs');

exports.getInfo = function(search) {
	return new Promise(
		function(resolve, reject) {
			var link = "https://www.sephora.sg/search/full_search?&q=";
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
		
        //console.log($('span.product_name').first().text().trim());
        //console.log($('span.price').first().text().trim());
		
		var name = $('span.brand').first().text().trim() + " " + $('span.product_name').first().text().trim();
		// return only the numbers
		var price = $('span.price').first().text().trim().split("$")[1];
		
		var prodLink = "https://www.sephora.sg"
		
		
		$('a.product_description').each(function (){
			prodLink += $(this).attr('href');
			//console.log(prodLink);
		});
		
        //console.log("seph " + search.split(" ")[0]);
		//console.log(name);
		if (!(name.toLowerCase()).includes(search.split(" ")[0].toLowerCase()))
					return resolve(["Product Not Found!", "0", "https://www.sephora.sg"]);
				
		resolve([name, price, prodLink]);
    });
		}
	);
}