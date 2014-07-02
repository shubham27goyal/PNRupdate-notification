 var request = require('request');

// var pnr = '2259652329';

module.exports = function (pnr, Email){

	function init() {
		this.pnr = pnr;
		this.email = Email;
		this.done = false;

		request('http://pnrwala.com/pnr2.php?pnr=' + pnr, function (error, response, body) {
			if(!error && response.statusCode == 200){
				var result = JSON.parse(body);
					
			} else {

			}
		});
	}

var x = setInterval(function(){
	request('http://pnrwala.com/pnr2.php?pnr=' + pnr, function (error, response, body) {
		if(!error && response.statusCode == 200){
			console.log(JSON.parse(body));
		} else {

		}
	});
}, 900000);


}