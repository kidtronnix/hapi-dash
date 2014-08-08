var spawn = require('child_process').spawn;

// This is where we launch all of our different servers.
// They are on different processes so scaling parts of our web app is more manageable
// and crashing errors only bring down their local server, not the whole app!
var gui = spawn('supervisor', ['-e', 'html,js',__dirname+"/servers/gui/server.js"]);
var socketIO = spawn('supervisor', ['-e', 'html,js',__dirname+"/servers/socketIO/server.js"]);
var api = spawn('supervisor', ['-e', 'html,js',__dirname+"/servers/api/server.js"]);

console.log('Spawned GUI process. PID: ' + gui.pid);
console.log('Spawned SocketIO process. PID: ' + socketIO.pid);
console.log('Spawned API process. PID: ' + api.pid);

api.on('message', function(m) {
	console.log('API: '+m);
})
gui.on('message', function(m) {
	console.log('GUI: '+m);
})
socketIO.on('message', function(m) {
	console.log('SocketIO: '+m);
})

