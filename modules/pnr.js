 // Calling the required node modules
 var request = require('request'),
 async = require('async');

 // Defining the models
 var PNR = require('../models/pnr.js');

// Defining custom modules
 mail = require('./mail.js');

module.exports = function (pnr)
{
	var self = this;

	self.pnr = parseInt(pnr);

	// Getting the current status by sending a Get request
	self.getCurrentStatus = function(callback)
	{
		request('http://pnrwala.com/pnr2.php?pnr=' + self.pnr, function (error, response, body)
		{
			if(!error && response.statusCode == 200)
			{
				var data = JSON.parse(body.replace(/(<([^>]+)>)/ig,""));

				if(data['response code'])
				{
					callback(new Error(data['response code']));
				} 
				else
				{
					callback(null, data);
				}
			}
			else
			{
				callback(error);
			}
		});
	};

	// Saving the Parameters to Database
	self.initialize = function(input, callback)
	{
		self.getCurrentStatus(function(error, status)
		{
			if(!error)
			{		
				var basicDetail = function(next)
				{
					global['instance'] = new PNR({
						'name' : 
						{
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
						'is_chart_prepared': (status['Charting Status'] == ' CHART NOT PREPARED ') ? false : true,
					});
					next();
				};

				var passengerDetail = function(next)
				{
					var i = 0,
					passenger = [];

					while(true)
					{
						if(!status[i])
						{
							instance.passengers = passenger;
							next();
							break;
						}
						else 
						{
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

				async.series([basicDetail, passengerDetail], function(err, results)
				{
					if(!err)
					{
						instance.save(function(e)
						{
							if (e) 
							{
								callback(e);
							}
							else
							{
								self.start();
								callback(null, status);
							}
							delete global['instance'];
						});
					}
					else
					{
						callback(err);
					}
				});
			}
			else
			{
				callback(error);
			}
		});
	}

	// Start Monitoring the PNR
	self.start = function()
	{	
		self.getCurrentStatus(function(error, status)
		{
			if(!error)
			{
				PNR.findOne({'pnr' : self.pnr}, function(err, doc)
				{
					if(!err)
					{
						var counter = doc.passengers.length - 1;

						if(status[counter]['* Current Status '] == doc.passengers[counter].current_status && doc.is_active)
						{
							mail(doc.email, "PNR status update" , "Test Message", function(err)
							{
								if(!err)
								{
									var i = 0;

									while(true)
									{
										if(status[i])
										{
											doc.passengers[i].booking_status = status[i]['Booking Status '];
											doc.passengers[i].current_status = status[i]['* Current Status '];
											doc.meta.updated_at = new Date();
											i++;
											continue;
										}
										else 
										{
											doc.save();
											break;
										}
									}
								}
							});
							setTimeout(self.start, 2 * 1000);
						}
						else if (status[counter]['* Current Status '] == '   CNF  ') 
						{
							doc.is_active = false;
							doc.meta.updated_at = new Date();
							doc.save();
						};
					}
				});
			}
		});
	};
}