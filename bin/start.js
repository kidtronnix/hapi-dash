var exec = require('child_process').exec;
var config = require('../config')

// This is where we launch all of our different servers.
// They are on different processes so scaling parts of our web app is more manageable
// and crashing errors only bring down their local server, not the whole app!

// Basic procedure is 
// 1. stop existing processes started by this script
// 2. start processes
// 3. 



// Start up function
var start = function() {
	var startApi = exec('pm2 start '+__dirname+'/../servers/gui/server.js --watch --name "'+config.app.name+' GUI" -e tmp/logs/gui-err.log -o tmp/logs/gui.log -f -x',
		function(err, stdout, stderr) {
			if (err) return console.log(err)
		}
	);
	var startGui = exec('pm2 start '+__dirname+'/../servers/api/server.js --watch --name "'+config.app.name+' API" -e tmp/logs/api-err.log -o tmp/logs/api.log -f -x',
		function(err, stdout, stderr) {
			if (err) return console.log(err)
		}
	);
	var startedApi = false;
	var startedGui = false;

	startApi.on('close', function (data) {
	  	startedApi = true;
	  	if(startedGui && startedApi) {
			list()
		}
	});

	startGui.on('close', function (data) {
	  	startedGui = true;
	  	if(startedGui && startedApi) {
			list()
		}
	});
	
}

// Display all our processes
var list = function() {
	var processes = exec('pm2 list', function(err, stdout, stderr) {
		if (err) return console.log(err)
	});

	processes.stdout.on('data', function (data) {
		console.log(data);
	})
}

start();
