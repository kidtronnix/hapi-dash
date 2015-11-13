module.exports = function(server, config) {



    // DB Connection
    var MongoDB = require('mongodb').Db;
    var Server = require('mongodb').Server;

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


    // Options to pass into the 'Good' plugin
    var goodOptions = {
        reporters: [{
            reporter: require('good-console'),
            events: {ops: '*', response: '*', log: '*', error: '*'}
        }]
    };
    // The Assets Configuaration Options
    var assetOptions = require('../../../assets');

    // Add auth and start
    server.register([
        {
            register: require('hapi-auth-cookie')
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

    server.register([
        // {
        //     register: require("good"),
        //     options: goodOptions
        // },
        {
            register: require("hapi-assets"),
            options: assetOptions
        },
        {
            register: require("hapi-named-routes")
        },
        {
            register: require("hapi-cache-buster")
        },
        {
            register: require('../auth'),
            options: {
                db: db,
                email: config.email,
                apiIP: config.api.host+':'+config.api.port,
                app: config.app,
                coreCreds: config.coreCreds
            }
        },
        {
            register: require('../socketIO')
        }

    ], function(err) {
        if (err) throw err;
    });
};
