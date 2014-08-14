module.exports = function(server, config) {

    

    // DB Connection
    var MongoDB = require('mongodb').Db;
    var Server = require('mongodb').Server;
    var db = new MongoDB(config.db.name, new Server(config.db.host, config.db.port, {auto_reconnect: true}), {w: 1});
    db.open(function(e, d) {
        if (e) {
            console.log(e);
        } else{
            console.log('connected to database :: '+config.db.name);
        }
    })

    // Options to pass into the 'Good' plugin
    var goodOptions = {
        subscribers: {
            console: ['ops', 'request', 'log', 'error'],
            // 'tmp/logs/': ['ops', 'request', 'log', 'error']
        }
    };
    // The Assets Configuaration Options
    var assetOptions = require('../../../assets');

    // Add auth and start
    server.pack.register([
        {
            name: 'hapi-auth-cookie',
            plugin: require('hapi-auth-cookie')
        }

    ], function(err) {
        if (err) throw err;
        // // Define auth strategy
        server.auth.strategy('session', 'cookie', {
            password: 'secret',
            cookie: 'sid-example',
            redirectTo: '/login',
            isSecure: false
        });

     });

    server.pack.register([
        {
            plugin: require("good"),
            options: goodOptions
        },
        {
            plugin: require("hapi-assets"),
            options: assetOptions
        },
        {
            plugin: require("hapi-named-routes")
        },
        {
            plugin: require("hapi-cache-buster")
        },
        {
            name: 'auth-endpoints',
            plugin: require('../auth'),
            options: {
                db: db,
                email: config.email,
                apiIP: config.api.host+':'+config.api.port,
                app: config.app,
                coreCreds: config.coreCreds
            }
        },
        {
            name: 'socketIO',
            plugin: require('../socketIO')
        }

    ], function(err) {
        if (err) throw err;
    });
};