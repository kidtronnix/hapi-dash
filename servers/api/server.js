var Hapi = require('hapi');
var MongoDB = require('mongodb').Db;
var Server = require('mongodb').Server;
var ObjectId = require('mongodb').ObjectID;
var apiIP = "127.0.0.1:3000";

var config = require('../../config');


// API SERVER
var apiServer = new Hapi.Server(config.api.host, config.api.port)
var connected = false;
var db = new MongoDB(config.db.name, new Server(config.db.host, config.db.port, {auto_reconnect: true}), {w: 1});
db.open(function(e, d) {
    if (e) {
        console.log(e);
    } else if (config.db.un != "" && config.db.pw != "") {
        db.authenticate(config.db.un, config.db.pw, function(err, result){
            if (err) {
                console.log(err);
            } else {
                connected = true;
            }
        });
    } else {
        connected = true;
    }
    if (connected) {
        console.log('connected to database :: '+config.db.name);
    }
})

// CORE AUTHENTICATION LOOKUP
var getCoreCredentials = function (id, callback) {
    // Core creds
    var credentials = {};
    credentials[config.coreCreds.id] = {
        key: config.coreCreds.key,
        access: 'admin',
        algorithm: 'sha256'
    }

    // Just return with core creds if supplied
    if(credentials[id] !== undefined) {
    	console.log('Core auth lookup: '+id+ ' >> valid');
    	return callback(null, credentials[id]);
    } else {
    	console.log('Core auth lookup: '+id+ ' >> invalid');
    	return callback(null, null);
    }
};


// WEB AUTHENTICATION LOOKUP
var getCredentials = function (id, callback) {
	
    // Core creds
    var credentials = config.coreCreds;

    // Just return with core creds if supplied
    if(credentials[id] !== undefined) {
    	console.log('Web auth lookup: '+id+ ' >> valid as core');
    	return callback(null, credentials[id]);
    } else {

            var collection = db
            .collection('users')
            .findOne({"_id": ObjectId(id)}, function(err, user) {
                if(err) throw err;

                var credentials = null;
                if(user) {
                	console.log('Web auth lookup: '+id+ ' >> valid as '+user.access);
                    credentials = {
		                key: user.apiToken,
		                access: user.access,
		                algorithm: 'sha256'
		            }
                } else {
                	console.log('Web auth lookup: '+id+ ' >> invalid');
                }    

                return callback(null, credentials)   
            });
    }
};

var goodOptions = {
    subscribers: {
        console: ['ops', 'request', 'log', 'error']
        // 'tmp/logs/': ['ops', 'request', 'log', 'error']
    }
};

apiServer.pack.register([
    {
    	name: 'hawk-auth',
        plugin: require('hapi-auth-hawk')
    },
    {
    	name: 'good',
        plugin: require('good'),
        options: goodOptions
    }
], function(err) {
	if (err) throw err;
    apiServer.auth.strategy('core', 'hawk', { getCredentialsFunc: getCoreCredentials });
    apiServer.auth.strategy('web', 'hawk', { getCredentialsFunc: getCredentials });
});

// Endpoints
apiServer.pack.register([   
    {
    	name: 'user',
        plugin: require('./User'),
        options: {
            db: db // passes the db connection to the plugin
        }
    }
], function(err) {
	if (err) throw err;
});

if (!module.parent) {
    apiServer.start(function() {
        var message = 'API started at: ' + apiServer.info.uri;
        console.log(message);
    });
}

module.exports = apiServer;


