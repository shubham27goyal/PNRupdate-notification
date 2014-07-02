 var request = require('request');

// var pnr = '2259652329';

module.exports = function (pnr){

	this.pnr = pnr;

	this.getCurrentStatus = function(callback){
		request('http://pnrwala.com/pnr2.php?pnr=' + this.pnr, function(error, response, body){
			if(!error && response.statusCode == 200){
				callback(null, body);
			} else {
				callback(error);
			}
		});
	};

}