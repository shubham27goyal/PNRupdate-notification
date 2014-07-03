var mongoose = require('mongoose').connect('mongodb://localhost:27017/pnr');
var emailRegExp = /.+\@.+\..+/;

var PassengerSchema = new mongoose.Schema({
	booking_status : String,
	current_status : String
});

var PnrSchema = new mongoose.Schema({
	name : {
		first : String,
		last : String
	},
	meta : {
		created_at : {
			type : Date,
			'default' : Date.now
		},
		updated_at : {
			type : Date,
			'default' : Date.now
		}
	},
	email : {
		type : String,
		required : true,
		match : emailRegExp
	},
	is_active : Boolean,
	pnr : {
		type : Number,
		unique : true,
		required : true,
		max : 9999999999
	},
	train_no : String,
	train_name : String,
	board_date : String,
	from : String,
	to : String,
	reserve_upto : String,
	board_point : String,
	class : String,
	is_chart_prepared : Boolean,
	passengers : [PassengerSchema]
});

module.exports = mongoose.model('PNR', PnrSchema);