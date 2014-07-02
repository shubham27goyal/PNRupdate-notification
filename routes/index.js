var express = require('express');
var router = express.Router();
var Pnr = require('../modules/pnr.js');

router.get('/', function(req, res) {
	if(req.query.pnr){
	  	var pnr = new Pnr(req.query.pnr);
	  	pnr.getCurrentStatus(function(error, status){
	  		if(!error){
		  		res.json(status);
		  	} else {
		  		res.send(500);
		  	}
	  	});
	} else {
		res.send(403);
	}
});

router.post('/register', function(req,res){
	if(req.body.first_name && req.body.last_name && req.body.email && req.body.pnr){
		var pnr = new Pnr(req.body.pnr);
		pnr.initialize(req.body, function(err, status){
			if(!error){
		  		res.json(status);
		  	} else {
		  		res.send(500);
		  	}
		});
	};
});

module.exports = router;
