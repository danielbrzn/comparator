//this crap only reads from console atm.

//Takes the first item found from the search and gets name and price
//Need to return but I scrub
var cheerio = require('cheerio');
var request = require('request');
var test = require('readline');
var prompts = test.createInterface(process.stdin, process.stdout);

var link = "http://www.lazada.sg/catalog/?q=";

prompts.question("Enter search query here: ", function(search) {

    var words = search.split(" ");
    for (var i = 0; i < words.length; i++) {
        if (i === 0) {
            link += words[i];
        }
        else {
            link += "+" + words[i];
        }
    }
    request({
        method: 'GET',
        url: link
    }, function(err, response, body) {
        if (err) return console.error(err);

        // Tell Cherrio to load the HTML
        $ = cheerio.load(body);

        console.log($('a.c-product-card__name').first().text().trim());
        console.log($('span.c-product-card__price-final').first().text().trim());
        //console.log($('#special_price_box').text());
    });
    prompts.close();
});