var cheerio = require('cheerio');
var request = require('request');

request({
    method: 'GET',
    url: 'http://www.lazada.sg/xiaomi-powerbank-2-20000mah-white-export-18679893.html' //placeholder for actual url
}, function(err, response, body) {
    if (err) return console.error(err);

    // Tell Cherrio to load the HTML
    $ = cheerio.load(body);
    var lazName = $('#prod_title').text().trim();

    var lazPrice = $('#special_price_box').text();

    var item = [lazName,lazPrice]; //is this how u use arrays? export this out
});