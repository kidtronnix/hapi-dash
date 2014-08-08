/**
 * Created by kidtronnix on 20/05/14.
 */

 // Packages for validation
var Hapi = require('hapi');
var Joi = require('joi');


var apiGenKey = function(length) {
    // Just produces random string using these chars
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

// Internal config stuff
var internals = {
    // All config for mongo-crud
    CRUD: {
        bcrypt: 'password',
        create: Joi.object().keys({
            email: Joi.string().required(),
            password: Joi.string().required(),
            fname: Joi.string().required(),
            lname: Joi.string().required(),
            access: Joi.string(),
            apiToken: Joi.string().required(),
        }),
        update: Joi.object().keys({
            password: Joi.string(),
            fname: Joi.string(),
            lname: Joi.string(),
            activated: Joi.boolean(),
            access: Joi.string(),
            guiToken: [Joi.string(), Joi.boolean()],
            forgotToken: [Joi.string(), Joi.boolean()]
        }),
        defaults: {
            access: 'normal',
            guiToken: false,
            forgotToken: false,
            activated: false
        },
        validationOpts: {
            abortEarly: false
        }
    }
};

// Require MongoCrud functions
var MongoCrud = require(__dirname+'/../../../../lib/mongo-crud')(internals.CRUD);
exports.register = function(plugin, options, next) {

    var apiGenKey = function(request, next) {
        var generate = function(length) {
            // Just produces random string using these chars
            var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var result = '';
            for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
            return result;
        }

        var apiKey = generate(64);

        // Add to payload and return
        request.payload.apiToken = apiKey;
        next(apiKey);
    }
    
    var create = function (plugin, next) {
        return {
            auth: 'core',
            pre: [
                { method: apiGenKey, assign: 'apiGenKey' }
            ],
            handler: MongoCrud.create,
        }
    };

    var all = function (plugin, next) {
        return {
            auth: 'core',
            handler: MongoCrud.getAll
        }
    };
    
    var get = function (plugin, next) {
        
        return {
            auth: 'core',
            handler: MongoCrud.get,
            validate: {
                params: {
                    id: Joi.string().min(12)
                }
            }
        }
    };

    var update = function (plugin, next) {
        
        return {
            auth: 'core',
            handler: MongoCrud.update,
            validate: {
                params: {
                    id: Joi.string().min(12)
                }
            }
        }
    };

    var del = function (plugin, next) {
        
        return {
            auth: 'core',
            handler: MongoCrud.del,
            validate: {
                params: {
                    id: Joi.string().min(12)
                }
            }
        }
    };


    
    // Create
    plugin.route({
        path: "/api/user",
        method: "POST",
        config: create()
    });
    
    // Read
    plugin.route({
        path: "/api/user/{id}",
        method: "GET",
        config: get()
    });

    plugin.route({
        path: "/api/user",
        method: "GET",
        config: all()
    });

    // Update
    plugin.route({
        path: "/api/user/{id}",
        method: "PUT",
        config: update()
    });

    // Delete
    plugin.route({
        path: "/api/user/{id}",
        method: "DELETE",
        config: del()
    });

    next();

    
}