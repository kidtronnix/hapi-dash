var Hapi = require('hapi');
var MongoDB = require('mongodb').Db;
var Server = require('mongodb').Server;
var ObjectId = require('mongodb').ObjectID;
var apiIP = "127.0.0.1:3000";

// 3. API SERVER
var apiServer = new Hapi.Server('127.0.0.1', 3000)

var db = new MongoDB('hapi-ninja', new Server('127.0.0.1', '27017', {auto_reconnect: true}), {w: 1});
db.open(function(e, d) {
    if (e) {
        console.log(e);
    } else{
        console.log('connected to database :: hapi-ninja');
    }
})

// CORE AUTHENTICATION LOOKUP
var getCoreCredentials = function (id, callback) {
    // Core creds
    var credentials = {
        core: {
            key: 'ya3ESSappr5etWCkvpbgST09NHozozs4',
            access: 'admin',
            algorithm: 'sha256'
        }
    }
    // Just return with core creds if supplied
    if(credentials[id] !== undefined) {
    	console.log('Core auth lookup: '+id+ ' >> authenticated');
    	return callback(null, credentials[id]);
    } else {
    	console.log('Core auth lookup: '+id+ ' >> invalid');
    	return callback(null, null);
    }
};


// WEB AUTHENTICATION LOOKUP
var getCredentials = function (id, callback) {
	
    // Core creds
    var credentials = {
        core: {
            key: 'ya3ESSappr5etWCkvpbgST09NHozozs4',
            access: 'admin',
            algorithm: 'sha256'
        }
    }
    // Just return with core creds if supplied
    if(credentials[id] !== undefined) {
    	console.log('Web auth lookup: '+id+ ' >> authenticated as admin');
    	return callback(null, credentials[id]);
    } else {

            var collection = db
            .collection('users')
            .findOne({"_id": ObjectId(id)}, function(err, user) {
                if(err) throw err;

                var credentials = null;
                if(user) {
                	console.log('Web auth lookup: '+id+ ' >> authenticated as '+user.access);
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
        console: ['ops', 'request', 'log', 'error'],
        'tmp/logs/': ['ops', 'request', 'log', 'error']
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
    	name: 'core-user',
        plugin: require('./core/User'),
        options: {}
    }
], function(err) {
	if (err) throw err;
});

apiServer.start();
var message = 'Api started at: ' + apiServer.info.uri;
console.log(message);
