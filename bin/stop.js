var exec = require('child_process').exec;
var config = require('../config')

var stopApi =  exec('pm2 stop "'+config.app.name+' API"', function(err, stdout, stderr) {
	if (err) return console.error(err)
});
var stopGui = exec('pm2 stop "'+config.app.name+' GUI"', function(err, stdout, stderr) {
	if (err) return console.error(err)
});
var stoppedApi = false;
var stoppedGui = false;

// Event handelrs for stop executions
stopApi.on('close', function (data) {
	stoppedApi = true;

	if(stoppedApi && stoppedGui) {
		list()
	}
});

stopGui.on('close', function (data) {
  	stoppedGui = true;
  	if(stoppedApi && stoppedGui) {
		list()
	}
});

// Display all our processes
var list = function() {
	var processes = exec('pm2 list', function(err, stdout, stderr) {
		if (err) return console.log(err)
	});

	processes.stdout.on('data', function (data) {
		console.log(data);
	})
}