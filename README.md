Hapi Dash
==========

Boilerplate Hapi Web and API Server Example, with frontend dashboard. Based on the fantastic [Hapi Ninja](https://github.com/poeticninja/hapi-ninja) project.

## The Goal:
Create a base boilerplate dashboard app, with seperate GUI and API server processes. Quick development of RESTful Resource api endpoints, out the box auth for both API and GUI, and realtime frontend communication.

## The Stack:
**Node.js** - Because it's fast, easy to get started, and Javscript is awesome.
[http://nodejs.org/](http://nodejs.org/)

**Hapi** - A very well designed server framework that is easy to understand, easy to create your own plugins, scales very well, cache options built in, and more.
[http://hapijs.com/](http://hapijs.com/)

**pm2** - A brilliant node process manager. Makes starting, stopping and restarting process if file changes occur, very simple. Can be used to restart your app on machine reboot/crash as well, similar to running processes as a linux service.
[https://github.com/Unitech/pm2](https://github.com/Unitech/pm2)

**Mongo** - A great NoSQL database that handles JSON natively, perfect fit for Node.js projects.
[http://www.mongodb.org/](http://www.mongodb.org/)

**Swig** - It looks like HTML, it's very fast, great for template inheritance, and allows you to use HTML syntax with the server and with front-end client Javascript includes.
[http://paularmstrong.github.io/swig/](http://paularmstrong.github.io/swig/docs/#browser)

**Socket.IO** - Enables real-time bidirectional event-based communication. It works on every platform, browser or device, focusing equally on reliability and speed. [http://socket.io/](http://socket.io/)

**Gulp** - A task runner for your assets, and can do a lot more. The performance is amazing and it is easy to get started.
[http://gulpjs.com/](http://gulpjs.com/)

**CSS Framework** - None. Choose your own CSS preprocessor and CSS framework.


### Requirements:

Install Mongo by following the [official install instructions](http://docs.mongodb.org/manual/installation/). Only required if you need a db (e.g. RESTful resource endpoints).

Install Node.js by using the big install button on the [http://nodejs.org/](http://nodejs.org/) homepage.

After Node.js is installed, clone this repo, change `cd` to this directory, and run `npm install`

```bash
$ git clone https://github.com/smaxwellstewart/hapi-dash.git
$ cd hapi-dash
$ npm install
```
#### Configure

Before the application can be run you must generate a configuration file:

```bash
$ node bin/configure.js
```

Warning! There is a known error for node v0.11.x when running the configure.js script. You can configure the app by hand by saving the following to config.js in the root folder:

```js
// config.js
module.exports = {
    "app": {
        "name": "Hapi Dash",
        "url": "http://localhost:3030"
    },
    "db": {
        "host": "127.0.0.1",
        "port": "27017",
        "name": "hapi-dash"
    },
    "api": {
        "host": "127.0.0.1",
        "port": "3000"
    },
    "coreCreds": {
        "id": "core",
        "key": "9TKUwfKHIkNbF9XbGdDudA3fiXzxJg4tHATYJrr16vMENNyX9UUvbNkeeRRxQHC9",
        "algorithm": "sha256"
    },
    "gui": {
        "host": "0.0.0.0",
        "port": "3030"
    },
    "email": {
        "service": "Gmail",
        "auth": {
            "user": "hapi.dashboard@gmail.com",
            "pass": "mysecretpass"
        }
    }
}
```

#### Starting

To simply start both servers:

```bash
$ node servers/api/server.js
$ node servers/gui/server.js
```

There are a few approaches to robustly starting the app. The recommended way to sart the servers is using `pm2`. It is a node process mananger that will take care of running your process like services. It is very powerful and straight foward to use.

To install run:
```bash
$ npm install -g pm2
```

Once this is installed we can start both the API and GUI using the start script `start.js`:
```bash
$ node bin/start.js
```

This will produce the following output:

![startup output](https://raw.githubusercontent.com/smaxwellstewart/hapi-dash/master/public/img/process_start.png)

To stop the pm2 processes you can run:
```bash
$ node bin/stop.js
```

Alternatively you can use `supervisor` to watch for file changes and restart the server, [https://github.com/isaacs/node-supervisor](https://github.com/isaacs/node-supervisor). It is not as powerful and not recommened. 

To install run:
```bash
$ npm install -g supervisor
```

To start the servers:
```bash
$ supervisor -e html,js  servers/api/server.js
$ supervisor -e html,js  servers/gui/server.js
```
Now all of your server html and js files are being watched and on change the node server gets restarted automatically.

####Production
Before going into production you will want to concatenate and minify your assets. This will increase performance for your user. We will use Gulp for this.

To install run:
```
npm install -g gulp
```

Now you can run `gulp` from the command line and it will run the tasks in the `gulpfile.js`. The current tasks will minify and optimize your CSS, JS, and Images. If you want more tasks you can go to the Gulp Plugin page. [http://gratimax.github.io/search-gulp-plugins/](http://gratimax.github.io/search-gulp-plugins/)

The other thing is to configure pm2 to start the desired number of process for load balancing, based on expected usage/traffic of API and GUI individually, plus no. cores on machine. For usage of pm2 see,.

## Dashboard
The dashboard uses the free [Dashgum](http://www.blacktie.co/2014/07/dashgum-free-dashboard/) responsive theme, design by [Carlos Alvarez](http://alvarez.is/). Framework used: Bootstrap 3.2

DashGum is a simple & elegant admin panel. It comes with 15 pages to start your panel as soon as possible.

With DashGum you have charts, tables, a lot of panels, calendars, notifications, to do lists and more. Grab our free theme and enjoy it.

If you need more, see the [Premium Version](http://gridgum.com/themes/dashgum-bootstrap-dashboard/) with tons of features more. With 33 HTMLs and more than 40 plugins, the premium version comes with 4 different chart plugins, Email pages, Chat pages, maps, advanced forms and tables, file uploaders, inline editor, pricing tables, complete profile page and more.

## Auth

There is seperate authentication for the different servers in the app. Once a user registers they will be created with a random API token. This is used to access the API.

###API

The API uses [Hawk](https://github.com/hapijs/hapi-auth-hawk) authentication. There are two auth strategies pre-configured, 'core' and 'web'. Core is for core functionality, ie internal API endpoints. Core credentials are hardcoded and should be changed before deployment. Web is for web facing endpoints, ie for registered users. Core credentials will work for web routes.

```javascript
// EXAMPLE
// Only allow core to use route (ie internal)
var routeConfig = {
    auth: 'core',
    ...
}

// Only allow registered users to use route
var routeConfig = {
    auth: 'web',
    ...
}
```

###GUI

The GUI uses [Cookie](https://github.com/hapijs/hapi-auth-cookie) authentication.

```javascript
// EXAMPLE: add session auth to hapi route
// Only allow registered users to use route
var routeConfig = {
    auth: 'session',
    ...
}
```

## Plugins
The Hapi plugins that are being used.

### Toothache
A Hapi plugin that removes the toothache from creating CRUD endpoints for MongoDB. [https://github.com/smaxwellstewart/toothache](https://github.com/smaxwellstewart/toothache)

#### Hapi-Named-Routes
Added names to the routes. This allows you to have access to the path in the templates just by using the `path.nameofroute` variable. [https://github.com/poeticninja/hapi-named-routes](https://github.com/poeticninja/hapi-named-routes)

#### Hapi-Assets
Assets are in the `./assets.js` file, and your view layer has access based on the node environment. If you are in `development` (default) you might want to have individual files (js,css). If you are in `production` you would want the assets combined for user performance. [https://github.com/poeticninja/hapi-assets](https://github.com/poeticninja/hapi-assets)

#### Hapi-Cache Buster
Client/browser reloads new assets based on package.json version of your application. [https://github.com/poeticninja/hapi-cache-buster](https://github.com/poeticninja/hapi-cache-buster)

#### Folder Structure
There are two main folders in the stack. The "**public**" folder for front-end (client side) code, and "**servers**" folder for server side code.

By having the front-end folder and server side folder be specific, it provides for better consistency when changing projects. This way when you change from a full front-end app (Phonegap), to a front-end and server side app you get to keep the same folder structure. Allowing for better consistency with your stack, projects, and tools.

The server folder is split into two folders. `api` and 'gui'. The api folder contains API plugins (Endpoints), each contained in an individual foldder. The gui folder contains a more MVC approach, with auth and socket.io plugins.


## Contributers

[Simon Maxwell-Stewart](https://github.com/smaxwellstewart), [Saul Maddox](https://github.com/poeticninja),
You?


## Credits
Credit goes to all of the open source code that people have made available.

#### License

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
