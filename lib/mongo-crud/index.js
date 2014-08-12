/**
 * Created by kidtronnix on 20/05/14.
 */
var Hapi = require('hapi');
var Joi = require('joi');
var MongoDB = require('mongodb').Db;
var Server = require('mongodb').Server;
var ObjectId = require('mongodb').ObjectID;
var Extend = require('extend');
var Bcrypt = require('bcrypt-nodejs');

String.prototype.hashCode = function(){
    var hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}



module.exports = function(config) {

    // get db from config
    var db = config.db;
    
    var CRUD = {
        conf: function(request, next) {
            // Return our config
            next (JSON.stringify(config)).type('application/json');
        },
        getAll: function(request, next) {
            var path = request.path.split('/');
            

                
                
                var find = {};
               
                // Access Control
                if(request.auth.isAuthenticated && request.auth.credentials.access !== 'admin') {
                    var uId = request.auth.artifacts.id;
                    find.uId = uId;
                }
                
                
                var collection = db
                .collection(path[2]+'s')
                .find(find)
                .sort({ "_id" : 1})
                .toArray(function(err, docs) {
                    if (err) throw err;
                    next(docs).type('application/json');
                });

        },
        get: function(request, next) {
            var path = request.path.split('/');
            
                var collection = db
                .collection(path[2]+'s')
                .findOne({"_id": ObjectId(request.params.id)}, function(err, doc) {
                    
                    if(err !== null) {
                        var error = Hapi.error.badRequest(err);
                        next(error);
                    }
                    if(doc == null) {
                        var error = Hapi.error.badRequest('No '+path[2]+ ' found');
                        next(error);
                    }

                    // Access Control
                    if(request.auth.isAuthenticated && request.auth.credentials.access !== 'admin') {
                        var uId = request.auth.artifacts.id;
                        if(doc.uId === uId) {
                            // console.log('Retreived doc...');
                            // console.log(doc);
                            next(doc).type('application/json');

                        } else {
                            var error = Hapi.error.unauthorized('You are not permitted to see this');
                            next(error);
                        }
                    } else {
                        // console.log('Retreived doc');
                        // console.log(doc);
                        next(doc).type('application/json');
                    }
                    
                });
            
        },
        update: function(request, next) {
            // Get our specific route config
            var path = request.path.split('/');
            var resource = path[2];

            // Resource ID from URL
            var resourceId = request.params.id;
            var validSchema = config.update;

            Joi.validate(request.payload, validSchema, config.validationOpts, function (err, value) {
                if(err !== null) {
                    var error = Hapi.error.badRequest(err);
                    next(error);
                }
                else {



                    var update = request.payload;

                    if(config.bcrypt && update[config.bcrypt]) {
                        // Hash password before update
                        update[config.bcrypt] = Bcrypt.hashSync(update[config.bcrypt]);
                    }

                    // Update Resource with payload
                    var collection = db.collection(resource+'s');
                    

                    // Add access control
                    if(request.auth.isAuthenticated && request.auth.credentials.access !== 'admin') {
                        collection.findOne({"_id": ObjectId(request.params.id)}, function(err, doc) {
                            if(doc === null) {
                                var error = Hapi.error.badRequest('No '+path[2]+' found.');
                                next(error);
                            }
                            var uId = request.auth.artifacts.id;
                            if(doc.uId !== uId) {
                                var error = Hapi.error.unauthorized('You are not permitted to update this');
                                next(error);

                            } else {
                                 // Debug / Logging
                                console.log('Updating _id:'+resourceId+' in '+resource+'s with:');
                                
                                collection.update({"_id": ObjectId(resourceId)}, {$set: update}, {}, function(err, doc) {
                                    if(err) throw err;
                                    next({error:null,message:'Updated successfully'});
                                });
                            }
                        })
                    }
                    else {
                         // Debug / Logging
                        console.log('Updating _id:'+resourceId+' in '+resource+'s with:');
                        
                        collection.update({"_id": ObjectId(resourceId)}, {$set: update}, {}, function(err, doc) {
                            if(err) throw err;
                            next({error:null,message:'Updated successfully'});
                        });
                    }

                }   
            }); 
        },
        create: function(request, next) {
            
            // Get our specific route config
            var path = request.path.split('/');
            var resource = path[2];

            
            // add access control
            // We need to stop create if not allowed, only if:
            // route is authenticated, we are not admin, and we protect create
            if(!request.auth.isAuthenticated || request.auth.credentials.access === 'admin' ||  request.auth.credentials.access === config.accessControl.create) {
                var validSchema = config.create;

                // console.log(JSON.stringify(request.payload, null, 4))
                // First validate schema
                // respond with errors 
                Joi.validate(request.payload, validSchema, config.validationOpts, function (err, value) {
                    if(err) {
                        console.log(err)
                        var error = Hapi.error.badRequest(err);
                        return next(error);
                        
                    }
                    else {
                        
                        // Add our defaults
                        var insert = Extend({},config.defaults, request.payload);

                        // Let's hash desired field
                        if(config.hash) {
                            // IMPROVEMENT make array of fields that can be hashed
                            insert["_"+config.hash] = insert[config.hash].hashCode();
                        }

                        // If config has date option, add a timestamp
                        if(config.date) {
                            var ts = new Date();
                            insert[config.date] = ts;
                        }

                        if(config.bcrypt) {
                            // Hash password before insert
                            insert[config.bcrypt] = Bcrypt.hashSync(insert[config.bcrypt]);
                        }
                        

                        // Add uId if set to anything in defaults
                        if(request.auth.isAuthenticated && !(config.defaults === undefined || config.defaults["uId"] === undefined)) {

                            insert.uId = request.auth.artifacts.id;
                        }

                        // Connect to mongo
                        var collection = db.collection(resource+'s');

                        // Perform Insert
                        collection.insert(insert, function(err, docs) {
                            if(err) {

                                var resp = {error: true, details: err};
                                next(JSON.stringify(resp)).type('application/json');
                                throw err;
                            };
                            next(docs[0]).type('application/json');
                                      
                        });
                            
                            
                    }
                }); 
            }
            
        },
        del: function(request, next) {
            var path = request.path.split('/');
            var _del = {"_id": ObjectId(request.params.id)};

                var collection = db.collection(path[2]+'s');


                // Add access control
                if(request.auth.isAuthenticated && request.auth.credentials.access !== 'admin') {
                    collection.findOne({"_id": ObjectId(request.params.id)}, function(err, doc) {
                        if(doc === null) {
                            var error = Hapi.error.badRequest('No '+path[2]+' found.');
                            next(error);
                        }
                        var uId = request.auth.artifacts.id;
                        if(doc.uId !== uId) {
                            var error = Hapi.error.unauthorized('You are not permitted to delete this');
                            next(error);
                        }
                        else
                        {
                             // Debug / Logging
                            collection.remove( _del, function(err) {
                                if(err) throw err;
                                
                                next({error:null,message:'Deleted successfully'});          
                            });
                        }
                    })
                } else {
                    collection.remove( _del, function(err) {
                        if(err) throw err;
                        
                        next({error:null,message:'Deleted successfully'});          
                    });
                }
        }
    };
    return CRUD;
}

    
        

    
        
    

    

    



    