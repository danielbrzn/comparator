var fixer = require("node-fixer-io");

exports.convert = function(price) {
    return new Promise(
		function (resolve, reject) {
			fixer.get(function (err, res, body) {
				var converted = fixer.convert("USD", "SGD", price);
				if (err)
					reject(err);
				resolve(converted);
			});
		}	
	);
}
//call it by var convertedprice = require(./lib/currencyconverter.js)(pricehere)