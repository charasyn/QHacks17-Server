var http = require('http');
var app = require('./app.js');
var port = 42000;

var requestHandler = function(request, response){  
	console.log(request.url);
	app.handle(request,response);
};

var server = http.createServer(requestHandler);

server.listen(port, function(err){  
	if (err) {
		return console.log('something bad happened', err);
	}
	console.log('server is listening on '+port);
});
