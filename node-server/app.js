var url = require('url');
var uuidgen = require('uuid/v4');

var config = JSON.parse(require('fs').readFileSync('../config.json',{encoding:'utf8'}));

var mysql = require('mysql');
var connection = mysql.createConnection(config);

connection.connect();

function loginFunc(req,res){
	// DO NOT DO THIS IN PRODUCTION!!!!!
	var urlp = url.parse(req.url,true);
	var username=urlp.query.username||"";
	var passHash=("0000000000000000000000000000000000000000"+(urlp.query.passHash||"")).slice(-40);
	
	connection.query('select UserId from QHacks.Users where Username = ? and PassHash = ?',[username,passHash],function (error,results,fields) {
		console.log(results);
		if(error){
			res.statusCode=500;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			console.log(error);
			return;
		}
		if(results.length>1){
			res.statusCode=500;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			console.log("Duplicate session: "+user);
			return;
		}
		if(results.length<1){
			res.statusCode=404;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			console.log("Invalid credentials: "+username);
			return;
		}
		var userId=results[0].UserId;
		
		var token=uuidgen();
		connection.query("update QHacks.Users set Token=? where UserId=?",[token,userId],function(error,results,fields){
			if(error){
				res.statusCode=500;
				res.end("{error:'Something went very wrong! It's our fault, not yours.'}");
				console.log(error);
				return;
			}
			res.statusCode=200;
			res.end(JSON.stringify({userId:userId,token:token}));
		});
	});
}

function myroomsFunc(req,res){
	// DO NOT DO THIS IN PRODUCTION!!!!!
	var urlp = url.parse(req.url,true);
	var userId=urlp.query.userId;
	var token=urlp.query.token;
	
	connection.query('select Rooms.RoomId,Rooms.Name,Rooms.Description,Sessions.InTimestamp,Sessions.OutTimestamp from QHacks.Sessions inner join QHacks.Rooms on Sessions.RoomId=Rooms.RoomId where Sessions.UserId=?;',[userId],function (error,results,fields) {
		console.log(results);
		if(error){
			res.statusCode=500;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			console.log(error);
			return;
		}
		var processed=results.map((x)=>{return {roomId:x.RoomId,name:x.Name,description:x.Description}});
		
		res.statusCode=200;
		res.end(JSON.stringify({rooms:processed}));
	});
}

function joinroombyidFunc(req,res){
	// DO NOT DO THIS IN PRODUCTION!!!!!
	var urlp = url.parse(req.url,true);
	var userId=urlp.query.userId;
	var token=urlp.query.token;
	
	connection.query('select Rooms.RoomId,Rooms.Name,Rooms.Description,Sessions.InTimestamp,Sessions.OutTimestamp from QHacks.Sessions inner join QHacks.Rooms on Sessions.RoomId=Rooms.RoomId where Sessions.UserId=?;',[userId],function (error,results,fields) {
		console.log(results);
		if(error){
			res.statusCode=500;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			console.log(error);
			return;
		}
		var processed=results.map((x)=>{return {roomId:x.RoomId,name:x.Name,description:x.Description}});
		
		res.statusCode=200;
		res.end(JSON.stringify({rooms:processed}));
	});
};

function roomelementsFunc(req,res){
	// DO NOT DO THIS IN PRODUCTION!!!!!
	var urlp = url.parse(req.url,true);
	var userId=urlp.query.userId;
	var token=urlp.query.token;
	var roomId=urlp.query.roomId;
	
	connection.query('select Rooms.RoomId,Rooms.Name,Rooms.Description,Sessions.InTimestamp,Sessions.OutTimestamp from QHacks.Sessions inner join QHacks.Rooms on Sessions.RoomId=Rooms.RoomId where Sessions.UserId=?;',[userId],function (error,results,fields) {
		console.log(results);
		if(error){
			res.statusCode=500;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			console.log(error);
			return;
		}
		var processed=results.map((x)=>{return {roomId:x.RoomId,name:x.Name,description:x.Description}});
		
		res.statusCode=200;
		res.end(JSON.stringify({rooms:processed}));
	});
};

function updateelementstateFunc(req,res){
	
};

function nearbyroomsFunc(req,res){
	
};

var fLUT = [
	{'url':'/login','func':loginFunc},
	{'url':'/myrooms','func':myroomsFunc},
	{'url':'/joinroombyid','func':joinroombyidFunc},
	{'url':'/roomelements','func':roomelementsFunc},
	{'url':'/updateelementstate','func':updateelementstateFunc},
	//{'url':'/nearbyrooms','func':nearbyroomsFunc},
];

function handle(req,res){
	var search = url.parse(req.url).pathname;
	var matches = fLUT.filter((x)=>(x.url===search));
	if(matches.length!=1){
		res.statusCode=400;
		res.end("Invalid verb.");
		return;
	}
	matches[0].func(req,res);
}

module.exports = {
	handle: handle
};


//FOR LATER

//function nearbyRooms(){

//};


