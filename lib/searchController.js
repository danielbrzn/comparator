var amazon = require('amazon-product-api');

// set up amazon client
var client = amazon.createClient({
	awsId: "AKIAIXBQJHWBKZJMRKEA",
	awsSecret: "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",
	awsTag : "aws Tag"
});

const PriceFinder = require('price-finder');
const priceFinder = new PriceFinder();

exports.getInfo = function (prodName) {
	return new Promise(
		function(resolve, reject) {
			client.itemSearch({
			keywords: prodName,
			responseGroup: 'ItemAttributes,Offers,Images'
		}).then(function(results){
			//console.log(results[0].DetailPageURL[0]);
			// amazon product page has been fetched
			if (results[0].DetailPageURL[0] !== 'undefined') {
				priceFinder.findItemDetails(results[0].DetailPageURL[0], function(err, itemDetails) {
				//console.log(itemDetails.price);    // 0.99 
				//console.log(itemDetails.name);     // Plants vs. Zombies™ 
				//console.log(itemDetails.category); // Mobile Apps 
				resolve([itemDetails.name, itemDetails.price]);
		});
	}
	else {
		reject("Amazon URL could not be found");
	}
		}).catch(function(err){
			console.log(err[0]);
			});
		
	
	});
}
		

	

