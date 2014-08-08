module.exports = function(server) {
    // Options to pass into the 'Good' plugin
    var goodOptions = {
        subscribers: {
            console: ['ops', 'request', 'log', 'error'],
            'tmp/logs/': ['ops', 'request', 'log', 'error']
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
            plugin: require('../auth')
        },
        {
            name: 'socketIO',
            plugin: require('../socketIO')
        }

    ], function(err) {
        if (err) throw err;
    });
};