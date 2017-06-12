var amazon = require('amazon-product-api');

// set up amazon client
var client = amazon.createClient({
	awsId: "AKIAIXBQJHWBKZJMRKEA",
	awsSecret: "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",
	awsTag : "aws Tag"
});

const PriceFinder = require('price-finder');
var uri;
const priceFinder = new PriceFinder();

exports.getURL = function (prodName, callback) {
	client.itemSearch({
	keywords: prodName,
	responseGroup: 'ItemAttributes,Offers,Images'
	}, function(err, results, response) {
	if (err) {
    console.log(err);
  } else {
    console.log(results[0].DetailPageURL[0]);  // products (Array of Object) 
	callback(results[0].DetailPageURL[0]);
    //console.log(response); // response (Array where the first element is an Object that contains Request, Item, etc.) 
  }
	});	
}

exports.getInfo = function(uri, callback) {
	priceFinder.findItemDetails(uri, function(err, itemDetails) {
		console.log(itemDetails.price);    // 0.99 
		console.log(itemDetails.name);     // Plants vs. Zombies™ 
		console.log(itemDetails.category); // Mobile Apps 
		callback(itemDetails)
	});
}