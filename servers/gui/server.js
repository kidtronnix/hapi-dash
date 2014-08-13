/**
* Dependencies.
*/
var Hapi = require('hapi'),
    settings = require('./config/settings'),
    config = require('../../config');

// Create a server with a host, port, and options
var server = Hapi.createServer(config.gui.host, config.gui.port, settings.hapi.options);

// Bootstrap Hapi Server Plugins, passes the server object to the plugins
require('./config/plugins')(server, config);

// Require the routes and pass the server object.
var routes = require('./config/routes')(server);
// Add the server routes
server.route(routes);


server.start(function() {
    //Log to the console the host and port info
    console.log('GUI started at: ' + server.info.uri);    
});
