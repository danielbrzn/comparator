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
			if (results[0].DetailPageURL[0] !== 'undefined') {
				priceFinder.findItemDetails(results[0].DetailPageURL[0], function(err, itemDetails) {
				resolve([itemDetails.name, itemDetails.price, results[0].DetailPageURL[0]]);
		});
	}
	else {
		reject(["Product Not Found!", "0", "https://www.amazon.com"]);
	}
		}).catch(function(err){
			console.log(err[0]);
			});
		
	
	});
}
		

	

