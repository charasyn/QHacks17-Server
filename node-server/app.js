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
};

function myroomsFunc(req,res){
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
		var processed=results.map(function (x){return {roomId:x.RoomId,name:x.Name,description:x.Description}});
		
		res.statusCode=200;
		res.end(JSON.stringify({rooms:processed}));
	});
};

function joinroombyidFunc(req,res){
	// this isn't implemented
	/*
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
		var processed=results.map(function (x){return {roomId:x.RoomId,name:x.Name,description:x.Description}});
		
		res.statusCode=200;
		res.end(JSON.stringify({rooms:processed}));
	});
	*/
	res.statusCode=500;
	res.end();
};

function roomelementsFunc(req,res){
	var urlp = url.parse(req.url,true);
	var userId=urlp.query.userId;
	var token=urlp.query.token;
	var roomId=urlp.query.roomId;
	connection.query('select Elements.ElementId, Elements.Name, Elements.Description, Elements.Type from Elements where Elements.RoomId = ?;',[roomId],function (error,results,fields){
		console.log(results);
		if(error){
			res.statusCode=500;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			console.log(error);
			return;
		}
		
		var elements = results.map(function(x){return {elementId:x.ElementId,name:x.Name,description:x.Description,type:x.Type,value:null}});
		
		connection.query('select Elements.ElementId, Actions.Value from Elements inner join Actions on Elements.ElementId = Actions.ElementId where Elements.RoomId = ? and Actions.UserId = ? order by Actions.Timestamp desc,Actions.ActionId desc limit 1;',[roomId,userId],function (error,results,fields) {
			console.log(results);
			if(error){
				res.statusCode=500;
				res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
				console.log(error);
				return;
			}
			
			// TODO: do this better
			for(var i=0;i<results.length;i++){
				for(var j=0;j<elements.length;j++){
					if(elements[j].elementId===results[i].elementId) { elements[j].value=results[i].value; }
				}
			}
			
			res.statusCode=200;
			res.end(JSON.stringify({elements:elements}));
		});
	});
};

function updateelementstateFunc(req,res){
	var urlp = url.parse(req.url,true);
	var userId=urlp.query.userId;
	var token=urlp.query.token;
	var elementId=urlp.query.elementId;
	var value=urlp.query.value;
	connection.query('select Elements.RoomId from Elements where Elements.ElementId = ?;',[elementId],function (error,results,fields){
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
			return;
		}
		if(results.length<1){
			res.statusCode=404;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			return;
		}
		
		var roomId=results[0].RoomId;
		
		connection.query('insert into Actions (RoomId,UserId,ElementId,Value) values (?,?,?,?);',[roomId,userId,elementId,value],function (error,results,fields) {
			console.log(results);
			if(error){
				res.statusCode=500;
				res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
				console.log(error);
				return;
			}
			
			res.statusCode=200;
			res.end(JSON.stringify({}));
		});
	});
};

function updateelementstatebyroomFunc(req,res){
	var urlp = url.parse(req.url,true);
	var userId=urlp.query.userId;
	var token=urlp.query.token;
	var roomId=urlp.query.roomId;
	var value=urlp.query.value;
	var type=urlp.query.type;
	connection.query('select Elements.ElementId from Elements where Elements.RoomId = ? and Elements.Type = ?;',[roomId,type],function (error,results,fields){
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
			return;
		}
		if(results.length<1){
			res.statusCode=404;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			return;
		}
		
		var elementId=results[0].ElementId;
		
		connection.query('insert into Actions (RoomId,UserId,ElementId,Value) values (?,?,?,?);',[roomId,userId,elementId,value],function (error,results,fields) {
			console.log(results);
			if(error){
				res.statusCode=500;
				res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
				console.log(error);
				return;
			}
			
			res.statusCode=200;
			res.end(JSON.stringify({}));
		});
	});
};

function adminMyroomsFunc(req,res){
	var urlp = url.parse(req.url,true);
	var userId=urlp.query.userId;
	var token=urlp.query.token;
	
	connection.query('select Rooms.RoomId, Rooms.Name, Rooms.Description, Sessions.InTimestamp, Sessions.OutTimestamp from QHacks.Sessions inner join QHacks.Rooms on Sessions.RoomId=Rooms.RoomId inner join QHacks.Admins on Sessions.RoomId=Admins.RoomId where Sessions.UserId=? and Admins.UserId=?;',[userId,userId],function (error,results,fields) {
		console.log(results);
		if(error){
			res.statusCode=500;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			console.log(error);
			return;
		}
		var processed=results.map(function (x){return {roomId:x.RoomId,name:x.Name,description:x.Description}});
		
		res.statusCode=200;
		res.end(JSON.stringify({rooms:processed}));
	});
};

function adminRoomelementsFunc(req,res){
	var urlp = url.parse(req.url,true);
	var userId=urlp.query.userId;
	var token=urlp.query.token;
	var roomId=urlp.query.roomId;
	
	function CalcTime(ts){
		var tsd = Date.parse(ts), cur = Date.now();
		return (cur-tsd)/1000+(new Date().getTimezoneOffset()*60);
	};
	
	connection.query('select Users.UserId, Elements.Type, Actions.Value, Users.Name, Actions.Timestamp from Elements inner join Actions on Elements.ElementId = Actions.ElementId inner join Users on Actions.UserId = Users.UserId where Elements.RoomId = ? order by Actions.Timestamp desc,Actions.ActionId desc;',[roomId,userId],function (error,results,fields) {
		console.log(results);
		if(error){
			res.statusCode=500;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			console.log(error);
			return;
		}
		
		var out = [];
		
		for(var i=0;i<results.length;i++){
			var r=results[i];
			if(!(out[r.UserId]))
				out[r.UserId]={name:r.Name,type:r.Type,message:r.Value,location:"Table "+r.UserId,timeSince:CalcTime(r.Timestamp)};
		}
		console.log(out);
		
		var out2 = [];
		
		var j=0;
		for(var i=0;i<results.length;i++){
			var r=results[i];
			if(out[r.UserId]!=null){
				out2[j++]=out[r.UserId];
				out[r.UserId]=null;
			}
		}
		console.log(out2);
		
		//out=out.sort(function(a,b){return -(a.timeSince-b.timeSince);});
		
		res.statusCode=200;
		res.end(JSON.stringify({elements:out2}));
	});
};

function adminUpdateelementstateFunc(req,res){
	var urlp = url.parse(req.url,true);
	var userId=urlp.query.userId;
	var token=urlp.query.token;
	var elementId=urlp.query.elementId;
	var value=urlp.query.value;
	connection.query('select Elements.RoomId from Elements where Elements.ElementId = ?;',[elementId],function (error,results,fields){
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
			return;
		}
		if(results.length<1){
			res.statusCode=404;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			return;
		}
		
		var roomId=results[0].RoomId;
		
		connection.query('insert into Actions (RoomId,UserId,ElementId,Value) values (?,?,?,?);',[roomId,userId,elementId,value],function (error,results,fields) {
			console.log(results);
			if(error){
				res.statusCode=500;
				res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
				console.log(error);
				return;
			}
			
			res.statusCode=200;
			res.end(JSON.stringify({}));
		});
	});
};

function adminUpdateelementstatebyroomFunc(req,res){
	var urlp = url.parse(req.url,true);
	var userId=urlp.query.userId;
	var token=urlp.query.token;
	var roomId=urlp.query.roomId;
	var value=urlp.query.value;
	var type=urlp.query.type;
	var targetUserId=urlp.query.targetUserId;
	connection.query('select Elements.ElementId from Elements where Elements.RoomId = ? and Elements.Type = ?;',[roomId,type],function (error,results,fields){
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
			return;
		}
		if(results.length<1){
			res.statusCode=404;
			res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
			return;
		}
		
		var elementId=results[0].ElementId;
		
		connection.query('insert into Actions (RoomId,UserId,ElementId,Value) values (?,?,?,?);',[roomId,targetUserId,elementId,value],function (error,results,fields) {
			console.log(results);
			if(error){
				res.statusCode=500;
				res.end(JSON.stringify({error:"We messed up, bigtime. Sorry."}));
				console.log(error);
				return;
			}
			
			res.statusCode=200;
			res.end(JSON.stringify({}));
		});
	});
};

function nearbyroomsFunc(req,res){
	
};

var fLUT = [
	{'url':'/login','func':loginFunc},
	{'url':'/myrooms','func':myroomsFunc},
	{'url':'/joinroombyid','func':joinroombyidFunc},
	{'url':'/roomelements','func':roomelementsFunc},
	{'url':'/updateelementstate','func':updateelementstateFunc},
	{'url':'/updateelementstatebyroom','func':updateelementstatebyroomFunc},
	//{'url':'/nearbyrooms','func':nearbyroomsFunc},
	{'url':'/admin/myrooms','func':adminMyroomsFunc},
	{'url':'/admin/roomelements','func':adminRoomelementsFunc},
	{'url':'/admin/updateelementstate','func':adminUpdateelementstateFunc},
	{'url':'/admin/updateelementstatebyroom','func':adminUpdateelementstatebyroomFunc},
];

function handle(req,res){
	var search = url.parse(req.url).pathname;
	var matches = fLUT.filter(function (x){return x.url===search;});
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


