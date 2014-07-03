 var request = require('request');
 var PNR = require('../models/pnr.js');
 var async = require('async');
 var mail = require('./mail.js');

// var pnr = '2259652329';

module.exports = function (pnr){

	var self = this;
	self.pnr = parseInt(pnr);

	self.getCurrentStatus = function(callback){
		request('http://pnrwala.com/pnr2.php?pnr=' + self.pnr, function(error, response, body){
			if(!error && response.statusCode == 200){
				callback(null, JSON.parse(body.replace(/(<([^>]+)>)/ig,"")));
			} else {
				callback(error);
			}
		});
	};

	self.initialize = function(input, callback){
		self.getCurrentStatus(function(error, status){

			var fOne = function(next){
				global['instance'] = new PNR({
					'name' : {
						'first' : input.first_name,
						'last' : input.last_name,
					},
					'email' : input.email,
					'is_active' : true,
					'pnr' : self['pnr'],
					'train_no' : status['Train Number'],
					'train_name' : status['Train Name'],
					'board_date' : status['Boarding Date '],
					'from' : status['From'],
					'to' : status['To'],
					'reserve_upto' : status['Reserved Upto'],
					'board_point' : status['Boarding Point'],
					'class' : status['Class'],
					'is_chart_prepared': (status['Charting Status'] == ' CHART NOT PREPARED <br/>') ? false : true,
				});
				next();
			};

			var fTwo = function(next){
				var i = 0;
				var passenger = [];
				while(true){
					if(!status[i]){
						instance.passengers = passenger;
						next();
						break;
					} else {
						passenger.push({
							booking_status : status[i]['Booking Status '],
							current_status : status[i]['* Current Status ']
						});
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
						self.start();
						callback(e, status);
					});
				} else {
					callback(err);
				}
			});
		});
	}

	self.start = function(){	
		var main = function(){
			self.getCurrentStatus(function(error, status){
				PNR.findOne({'pnr' : self.pnr}, function(err, doc){
					var counter = doc.passengers.length - 1;
					if(status[counter]['* Current Status '] == doc.passengers[counter].current_status && doc.is_active){

						var sendMail = function(){
							mail(doc.email, "PNR status update" , "Test Message", function(err){});
						};

						var dataUpdate = function(){
							var i = 0;
							while(true){
								if(status[i]){
									doc.passengers[i].booking_status = status[i]['Booking Status '];
									doc.passengers[i].current_status = status[i]['* Current Status '];
										doc.meta.updated_at = new Date();
										i++;
										continue;
									} else {
										doc.save();
										break;
									}
								}
						};

						var checkAgain = function(){
							setTimeout(main, 2 * 1000);
						}

						sendMail();
						dataUpdate();
						checkAgain();

					} else if (status[counter]['* Current Status '] == '   CNF  ') {
						doc.is_active = false;
						doc.meta.updated_at = new Date();
						doc.save();
					};
				});
			});
		};
		main();
	};
}