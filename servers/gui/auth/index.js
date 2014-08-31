/**
 * Created by kidtronnix on 20/05/14.
 */

var Joi = require('joi');
var Bcrypt = require('bcryptjs');
var Jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var Nipple = require('nipple');
var Hawk = require('hawk');


var jwtSecret = 'MY super secure server side secret';
var forgotSecret = 'MY super secure different server side secret';



exports.register = function(plugin, options, next) {

    // Setup things from config
    var transporter = nodemailer.createTransport(options.email);

    var API = {
        call: function(opts) {
            var url = 'http://'+options.apiIP+opts.url;
            var requestOptions = {                   
                headers: { 'content-type':'application/json'}
            };

            // Add payload
            if(opts.payload) {
                requestOptions.payload = JSON.stringify(opts.payload);
            }
            // Add auth
            var header = Hawk.client.header(url, opts.method, { credentials: opts.credentials });
            requestOptions.headers.Authorization = header.field;
            
            // Make call
            if(opts.method === 'POST')
            {
                Nipple.post(url, requestOptions, opts.callback)
            }
            else if(opts.method === 'PUT')
            {
                Nipple.put(url, requestOptions, opts.callback)
            }
            else
            {
                Nipple.get(url, requestOptions, opts.callback)
            }
        }
    };

    // Get DB connection from plugin options
    var db = options.db;

    var from = options.app.name + " <"+options.email.auth.user+">";

    var forgot = function (plugin, next) {

        return {
            handler: function(request, next) {


                var uDeets = request.payload;
                // Validate payload
                // Validate payload
                var validSchema = Joi.object().keys({
                    email: Joi.string().required()
                })

                // We got everything we need to create a new user
                Joi.validate(uDeets, validSchema, function (err, value) {
                    if(err !== null) {
                        next({error: true, details: 'Incorrect email'}).type('application/json');
                    }
                    else {
                        var collection = db.collection('users');
                        collection.findOne({"email": uDeets.email}, function(err, user) {
                            if(err) throw err;
                       
                            // Check we have a user
                            if(user) {

                                delete user.password;
                                // Generate a forgot access token and email it to them
                                var token = Jwt.sign(user, forgotSecret, { expiresInMinutes: 60 });

                                var opts = {
                                    payload: JSON.stringify({forgotToken: token}),
                                    headers:   { 'content-type':'application/json'}
                                };


                                API.call({
                                    method: 'PUT',
                                    url: '/api/user/'+user._id,
                                    payload: {
                                        forgotToken: token
                                    },
                                    credentials: options.coreCreds,
                                    callback: function (err, res, payload) {
                                        
                                        // Update user to be 
                                        var link = options.app.url+"/reset/"+token;

                                        // setup e-mail data with unicode symbols
                                        var mailOptions = {
                                            from: from, // sender address
                                            to: user.email, // list of receivers
                                            subject: "Reset Password", // Subject line
                                            text: "Hi "+user.fname+",\nHere is your password reset link:\n\n"+link+"\n\nThis token will expire in 1 hour.\n\nThe Team", // plaintext body
                                            html: "<p>Hi "+user.fname+",</br>Click the link below to reset your password:</p><a href='"+link+"'><h3>Reset Password</h3></a><p>This token will expire in 1 hour.</p><p>The Team</p>" // html body
                                        }

                                        // send mail with defined transport object
                                        transporter.sendMail(mailOptions, function(error, response){
                                            if(error) {
                                                console.log(error);
                                            } else {
                                                console.log("Password reset message sent: " + response.message);
                                            }

                                            // if you don't want to use this transport object anymore, uncomment following line
                                            //smtpTransport.close(); // shut down the connection pool, no more messages
                                        });

                                        next({error: false, token: token});

                                    }
                                });

                                     
                            } else {
                                // Throw error if we didn't find an email
                                next({error: true, details: 'Incorrect email'}).type('application/json');
                            }                   
                        });
                    }
                })        
               
            }
        }
    };

    var register = function (plugin, next) {

        return {
            handler: function(request, next) {

                var newUser = request.payload;

                var validSchema = Joi.object().keys({
                    fname: Joi.string().required(),
                    lname: Joi.string().required(),
                    email: Joi.string().email().required(),
                    password: Joi.string().alphanum().required().min(5).max(15),
                    password2: Joi.any().valid(newUser.password)
                })

                // We got everything we need to create a new user
                Joi.validate(newUser, validSchema, {abortEarly: false}, function (err, value) {
                    if(err !== null) {
                        console.log(err)

                        var message = '';
                        for(i=0; i < err.details.length; i++)
                        {
                            var _message = err.details[i].message;
                            if(err.details[i].path == 'password2') {
                                message += 'Passwords must match. '
                            } else {
                                message += _message.substr(0, 1).toUpperCase() + _message.substr(1) +'. ';
                            }  
                        }
                                           
                        return next({error: true, details: message}).type('application/json');
                    } else {
                        delete newUser.password2;

                        API.call({
                            method: 'POST',
                            url: '/api/user',
                            payload: newUser,
                            credentials: options.coreCreds,
                            callback: function(err, res, payload) {
                                if (err) throw err;

                                var response = JSON.parse(payload);

                                if(response.error) {
                                    return next({error: true, details: 'Error registering.'}).type('application/json');
                                } else {
                                    var token = Jwt.sign({id:response._id}, forgotSecret);
                                    var link = options.app.url+"/activate/"+token;
                                    // setup e-mail data with unicode symbols
                                    var mailOptions = {
                                        from: from, // sender address
                                        to: response.email, // list of receivers
                                        subject: "Activate your Account", // Subject line
                                        text: "Hi "+response.fname+",\nThank you for registering. Use the following link to activate your account:\n\n"+link+"\n\nThanks for your cooperation.\n\nThe Team", // plaintext body
                                        html: "<p>Hi "+response.fname+",</p><p>Thank you for registering. Please click the following link to activate your account:</p><a href='"+link+"'><h3>Activate account</h3></a><p>Thanks for your cooperation.</p><p>The Team</p>" // html body
                                    }

                                    // send mail with defined transport object
                                    // send mail with defined transport object
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if(error){
                                            console.log(error);
                                        }else{
                                            console.log('Message sent: ' + info.response);
                                        }
                                    });
                                    return next({error: false, details: 'Success! An activation email has been sent to you.'}).type('application/json');
                                }
                            }
                        });                      
                    }
                })
            }
        }
    };

    var resetPass = function (plugin, next) {

        return {
            handler: function(request, next) {
                var changePass = request.payload;

                var validSchema = Joi.object().keys({
                    email: Joi.string().email().required(),
                    password: Joi.string().alphanum().required().min(5).max(15),
                    password2: Joi.any().valid(changePass.password),
                    token: Joi.string().required()
                })

                Joi.validate(changePass, validSchema,{abortEarly: false}, function (err, value) {
                    if(err !== null) {
                        var message = '';
                        for(i=0; i < err.details.length; i++)
                        {
                            var _message = err.details[i].message;
                            if(err.details[i].path == 'password2') {
                                message += 'Passwords must match. '
                            } else {
                                message += _message.substr(0, 1).toUpperCase() + _message.substr(1) +'. ';
                            }  
                        }
                                           
                        return next({error: true, details: message}).type('application/json');
                    } else {

                        var collection = db.collection('users');
                        collection.findOne({"email": changePass.email}, function(err, user) {
                            if(err) throw err;
                            // We are only going to change if we 
                            // 1. have a user
                            // 2. we have the same token in DB
                            // 3. Token is valid and not expired
                            if(user && (user.forgotToken === changePass.token)) {
                                Jwt.verify(user.forgotToken, forgotSecret, function(err, decoded) {
                                    if (err) {
                                        throw err;
                                        next({error: true, details: 'Incorrect Token'});
                                    } else {
                                        var payload = {password: changePass.password, forgotToken: false}
                                        console.log(payload)
                                        API.call({
                                            method: 'PUT',
                                            url: '/api/user/'+user._id,
                                            payload: payload,
                                            credentials: options.coreCreds,
                                            callback: function(err, res, payload) {
                                                if (err) throw err; 
                                                next({error: false, details: 'Changed Password'});
                                            }
                                        });
                                    }

                                });
                            } else {
                                next({error: true, details: 'Incorrect Token'});
                            }
                        })             
                    }
                })       
            }
        }
    };

    var login = function (request, reply) {



        if (request.auth.isAuthenticated) {
            return reply.redirect('/');
        }

        var message = '', error = true;
        var account = null;

        if (!request.payload.email || !request.payload.password) {
            message = 'Missing username or password';
            return reply({error: true, details: message})
        }
        else {
            var collection = db.collection('users');
            collection.findOne({"email": request.payload.email}, function(err, user) {
                if(err) throw err;
                
                // Check we have a user and correct password
                if(!user || !Bcrypt.compareSync(request.payload.password, user.password) ) {
                    message = 'Invalid email or password';
                } else if(!user.activated) {
                    message = 'Activate your account. Check your email.';
                } else {
                    request.auth.session.set({
                        id: user._id,
                        password: request.payload.password
                    });
                    error = false;
                    message = 'Successfully authenticated!';    
                }

                return reply({error: error, details: message})
            })
        }       
    };

    var logout = function (request, reply) {

        request.auth.session.clear();
        return reply.redirect('/login');
    }

    var activate = function (request, reply) {

        Jwt.verify(request.params.token, forgotSecret, function(err, decoded) {
            if (err) {
                throw err;
                return next({error: true, details: 'Incorrect Token!'});
            } else {

                API.call({
                    method: 'PUT',
                    url: '/api/user/'+decoded.id,
                    payload: {activated: true},
                    credentials: options.coreCreds,
                    callback: function(err, res, payload) {
                        if (err) throw err; 
                        
                        return reply.redirect('/login/activated');
                    }
                });
            }
        });
    }

    // Handles login attempt
    plugin.route({
        method: 'POST',
        path: '/login',
        config: {
            handler: login,
            auth: {
                mode: 'try',
                strategy: 'session'
            },
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            }
        }
    })

    // Logs out user
    plugin.route({
        method: 'GET',
        path: '/logout',
        config: {
            handler: logout,
            auth: 'session'
        }
    })


    // Handles new user activation
    plugin.route({
        method: 'GET',
        path: '/activate/{token}',
        config: {
            handler: activate
        }
    })

    // Handles forgot password
    plugin.route({
        path: "/forgot",
        method: "POST",
        config: forgot()
    });

    // Handles reset attempt
    plugin.route({
        path: "/reset",
        method: "POST",
        config: resetPass()
    });

    // Handles registration attempt
    plugin.route({
        path: "/register",
        method: "POST",
        config: register()
    });

    // FRONTEND FORM ROUTES
    plugin.route({
        method: 'GET',
        path: '/register',
        config: {
            handler: function (request, reply) {
                return reply.view('register', {
                    title: 'Hapi Dash - Register'
                });
            }
        }
    })

    plugin.route({
        path: "/reset/{token}",
        method: "GET",
        config: {
            handler: function(request, reply) {
                return reply.view('reset', {
                    title: 'Hapi Dash - Reset Password',
                    token: request.params.token
                });
            }
        }
    });

    plugin.route({
        path: "/login/{activated?}",
        method: "GET",
        config: {
            handler: function(request, reply){
                if (request.auth.isAuthenticated) {
                    return reply.redirect('/');
                }
                var scripts = '';

                if (request.params.activated) {
                    scripts += '<script>$( document ).ready(function() { $.notify("Activated account!", "success");})</script>'
                }

                reply.view('login', {
                    title: 'Hapi Dash - Login',
                    scripts: scripts
                });
            },
            app: {
                name: 'login'
            },
            auth: {
                mode: 'try',
                strategy: 'session'
            },
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: false
                }
            }
        }
    });



    next();
}