var fixer = require("node-fixer-io");

module.exports = function(price) {
    fixer.get(function (err, res, body) {
        var converted = fixer.convert("USD", "SGD", price);
    });
};

//call it by var convertedprice = require(./lib/currencyconverter.js)(pricehere)