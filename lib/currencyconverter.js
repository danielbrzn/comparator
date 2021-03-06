var fixer = require("node-fixer-io");

exports.convert = function(curr1, curr2, price) {
    return new Promise(
		function (resolve, reject) {
			fixer.get(function (err, res, body) {
				var converted = fixer.convert(curr1, curr2, price);
				if (err)
					reject(err);
				resolve(converted);
			});
		}	
	);
}
//call it by var convertedprice = require(./lib/currencyconverter.js)(pricehere)