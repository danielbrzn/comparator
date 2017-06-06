var google = require('google');

google.resultsPerPage = 1;
var searchText = prodName + 'lazada sg';
//prodName will be whatever the user enters

google(searchText, function (err, res){
    if (err) console.error(err);


    var link = res.links[0];
    //^ export this link out

});