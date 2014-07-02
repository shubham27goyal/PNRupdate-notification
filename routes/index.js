var express = require('express');
var async = require('async');
var router = express.Router();
var Pnr = require('../modules/pnr.js');

router.get('/', function(req, res) {
	if(req.query.pnr){
	  	var pnr = new Pnr(req.query.pnr);
	  	pnr.getCurrentStatus(function(error, status){
	  		res.send(status);
	  	});
	} else {
		res.send(403);
	}
});

// router.post('/register', function(req,res){
// 	if(req.body.first_name && req.body.last_name && req.body.email && req.body.pnr){
// 		var pnr = new Pnr(req.query.pnr);
// 	};
// });

module.exports = router;
