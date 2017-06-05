var amazon = require('amazon-product-api');

// set up amazon client
var client = amazon.createClient({
	awsId: "",
	awsSecret: "",
	awsTag : "aws Tag"
});

exports.getPrice = function (prodName, callback) {
	client.itemSearch({
		keywords: prodName,
  availability: 'Available',
  responseGroup: 'ItemAttributes, Offers'
	}).then(function(results) {
		console.log(results);
		// need to work on this, doesn't return correct price for certain products.
		console.log(results[0].OfferSummary[0].LowestNewPrice[0].FormattedPrice[0]);
		callback(results);
	}).catch(function(err){
		console.log(err);
	});
}


