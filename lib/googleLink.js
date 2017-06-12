var google = require('google');

// currently only does Lazada SG
google.resultsPerPage = 1;
//prodName will be whatever the user enters

exports.getLink = function (searchText, website, callback) {
	var search = searchText + website;
	google(search, function (err, res){
    if (err) console.error(err);


    var link = res.links[0].link;
	callback(link);
    //^ export this link out
	});
}