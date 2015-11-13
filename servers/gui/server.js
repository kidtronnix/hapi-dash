/**
* Dependencies.
*/
var Hapi = require('hapi'),
    settings = require('./config/settings'),
    config = require('../../config');

// Create a server with a host, port, and options
var server = new Hapi.Server({
  debug: {
    request: ['error'],
    log: ['error'],
  }
});

server.connection({ host: config.gui.host, port: config.gui.port });

// Bootstrap Hapi Server Plugins, passes the server object to the plugins
require('./config/plugins')(server, config);

// Require the routes and pass the server object.
var routes = require('./config/routes')(server);


server.register([require('vision'), require('inert')], function(err) {
	if (err) throw err;

  server.views(settings.vision);

  // Add the server routes
  server.route(routes);

  if (!module.parent) {
      server.start(function() {
          var message = 'GUI started at: ' + server.info.uri;
          console.log(message);
      });
  }
});




module.exports = server;
