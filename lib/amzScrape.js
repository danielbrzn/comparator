var amazon = require('amazon-product-api');
var cred = require('../credentials.js');

// set up amazon client
var client = amazon.createClient({
	awsId: cred.awsId,
	awsSecret: cred.awsSecret,
	awsTag : "aws Tag"
});

const PriceFinder = require('price-finder');
const priceFinder = new PriceFinder();

exports.getInfo = function (prodName) {
	return new Promise(
		function(resolve, reject) {
			client.itemSearch({
			keywords: prodName,
			responseGroup: 'ItemAttributes,Offers,Images,Reviews'
		}).then(function(results){
			console.log(results);
			console.log(results[0].MediumImage[0].URL[0]);
			if (results[0].DetailPageURL[0] !== 'undefined') {
				priceFinder.findItemDetails(results[0].DetailPageURL[0], function(err, itemDetails) {
				console.log("AMZ URL: " + results[0].DetailPageURL[0]); // bug with products that only have "offers" on AMZ
				console.log("AMZ Scraped Item Deets: " + itemDetails);
				console.log("Error from price-finder: " + err);
				resolve({
				source: "Amazon",
				name: itemDetails.name, 
				price: itemDetails.price, 
				link: results[0].DetailPageURL[0],
				prodImg: results[0].MediumImage[0].URL[0]});
		});
	}
	else {
		reject("");
	}
		}).catch(function(err){
			console.log(err[0].Code);
			resolve("");
			});
		
	
	});
}
		

	

