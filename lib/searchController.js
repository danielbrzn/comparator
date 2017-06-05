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
  responseGroup: 'ItemAttributes'
	}).then(function(results) {
		//console.log(results);
		//console.log(results[0].ItemAttributes[0].ListPrice[0].FormattedPrice[0]);
		callback(results);
	}).catch(function(err){
		console.log(err);
	});
}


