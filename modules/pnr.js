 var request = require('request');
 var PNR = require('../models/pnr.js');
 var async = require('async');
 var mail = require('./mail.js');

// var pnr = '2259652329';

module.exports = function (pnr){

	this.pnr = parseInt(pnr);

	this.getCurrentStatus = function(callback){
		request('http://pnrwala.com/pnr2.php?pnr=' + this.pnr, function(error, response, body){
			if(!error && response.statusCode == 200){
				callback(null, JSON.parse(body));
			} else {
				callback(error);
			}
		});
	};

	this.initialize = function(input, callback){
		this.getCurrentStatus(function(error, status){

			var fOne = function(next){
				global['instance'] = new PNR({
					'name' : {
						'first' : input.first_name,
						'last' : input.last_name,
					},
					'email' : input.email,
					'is_active' : true,
					'pnr' : this.pnr,
					'train_no' : status['Train Number'],
					'train_name' : status['Train Name'],
					'board_date' : status['Boarding Date '],
					'from' : status['From'],
					'to' : status['To'],
					'reserve_upto' : status['Reserved Upto'],
					'board_point' : status['Boarding Point'],
					'class' : status['Class'],
					'is_chart_prepared': (status['Charting Status'] == ' CHART NOT PREPARED ') ? false : true,
				});
				next();
			};

			var fTwo = function(next){
				var i = 0;
				var passenger = [];
				while(true){
					if(!status[i]){
						instance.passangers = passanger;
						next();
						break;
					} else {
						passenger.push(status[i]);
						i = i + 1;
						continue;
					}
				}
				next();
			};

			async.series([fOne, fTwo], function(err, results){
				if(!err){
					instance.save(function(e){
						delete global['instance'];
						this.start;
						callback(null, status);
					});
				} else {
					callback(err);
				}
			});
		});
	}

	this.start = function(){
		global[this.pnr.toSring()] = setInterval(function(){
			this.getCurrentStatus(function(error, status){
				PNR.findOne({'pnr' : pnr}, function(err, doc){
					if( status[doc.passangers.length - 1] != doc[doc.passangers.length - 1]){
						mail(doc.email, "PNR status update" , "Test Message", function(err){
						});
						doc.passangers.forEach(function(elem, index){
							doc.passangers[index] = status[index];
						});
						doc.save();
						clearInterval(this.pnr.toSring());
						delete global[this.pnr.toSring()];
					}
				});
			});
		}, 15 * 60 * 1000);
	};
}