Hapi Dash
==========

Boilerplate Hapi Web and API Server Example, with frontend dashboard. Based on the fantastic [Hapi Ninja](https://github.com/poeticninja/hapi-ninja) project.

## The Goal:
Create a base boilerplate dashboard app showing how easy it is to get started with Hapi as a web server. Quick development of RESTful Resource api endpoints, out the box auth for both API and GUI, and realtime messaging.

## The Stack:
**Node.js** - Because it's fast, easy to get started, and Javscript is awesome.
[http://nodejs.org/](http://nodejs.org/)

**Hapi** - A very well designed server framework that is easy to understand, easy to create your own plugins, scales very well, cache options built in, and more.
[http://hapijs.com/](http://hapijs.com/)

**Swig** - It looks like HTML, it's very fast, great for template inheritance, and allows you to use HTML syntax with the server and with front-end client Javascript includes.
[http://paularmstrong.github.io/swig/](http://paularmstrong.github.io/swig/docs/#browser)

**CSS Framework** - None. Choose your own CSS preprocessor and CSS framework.

**Gulp** - A task runner for your assets, and can do a lot more. The performance is amazing and it is easy to get started. [http://gulpjs.com/](http://gulpjs.com/)

**Mongo** - A great NoSQL database that handles JSON natively, perfect fit for Node.js projects. [http://www.mongodb.org/](http://www.mongodb.org/)

**Socket.IO** - Enables real-time bidirectional event-based communication. It works on every platform, browser or device, focusing equally on reliability and speed. [http://socket.io/](http://socket.io/)

### Requirements:

Install Mongo by following the [official install instructions](http://docs.mongodb.org/manual/installation/). Only needed if you need resource endpoints.

Install Node.js by using the big install button on the [http://nodejs.org/](http://nodejs.org/) homepage.

After Node.js is installed, clone this repo, change `cd` to this directory, and run `npm install`

```bash
$ git clone https://github.com/smaxwellstewart/hapi-dash.git
$ cd hapi-dash
$ npm install
```

Start the servers by running the command:
```
$ node start
```

To see any changes you can manually just shutdown and restart the node server. This can be a pain so I use Supervisor to watch for file changes and restart the server [https://github.com/isaacs/node-supervisor](https://github.com/isaacs/node-supervisor).

To install run:
```
$ npm install -g supervisor
```

To use it run:
```
$ supervisor -e html,js  start.js
```
Now all of your server html and js files are being watched and on change the node server gets restarted automatically.

####Production
Before going into production you will want to concatenate and minify your assets. This will increase performance for your user. We will use Gulp for this.

To install run:
```
npm install -g gulp
```

Now you can run `gulp` from the command line and it will run the tasks in the `gulpfile.js`. The current tasks will minify and optimize your CSS, JS, and Images. If you want more tasks you can go to the Gulp Plugin page. [http://gratimax.github.io/search-gulp-plugins/](http://gratimax.github.io/search-gulp-plugins/)

## Dashboard
The dashboard uses the free [Dashgum](http://www.blacktie.co/2014/07/dashgum-free-dashboard/) responsive theme, design by [Carlos Alvarez](http://alvarez.is/). Framework used: Bootstrap 3.2

DashGum is a simple & elegant admin panel. It comes with 15 pages to start your panel as soon as possible.

With DashGum you have charts, tables, a lot of panels, calendars, notifications, to do lists and more. Grab our free theme and enjoy it.

If you need more, see the [Premium Version](http://gridgum.com/themes/dashgum-bootstrap-dashboard/) with tons of features more. With 33 HTMLs and more than 40 plugins, the premium version comes with 4 different chart plugins, Email pages, Chat pages, maps, advanced forms and tables, file uploaders, inline editor, pricing tables, complete profile page and more.

## RESTful Resource Endpoints

The Mongo-Crud module instantly adds the following functionality to any mongo db...

* Plug 'n' play CRUD Routes
* Access control
* Set custom fields to hash and/or timestamp at doc creation, if required

Check the [readme](https://github.com/smaxwellstewart/hapi-dash/tree/master/lib/mongo-crud) for more info on how to add and configure CRUD routes.

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

#### Hapi-Named-Routes
Added names to the routes. This allows you to have access to the path in the templates just by using the `path.nameofroute` variable. [https://github.com/poeticninja/hapi-named-routes](https://github.com/poeticninja/hapi-named-routes)

#### Hapi-Assets
Assets are in the `./assets.js` file, and your view layer has access based on the node environment. If you are in `development` (default) you might want to have individual files (js,css). If you are in `production` you would want the assets combined for user performance. [https://github.com/poeticninja/hapi-assets](https://github.com/poeticninja/hapi-assets)

#### Hapi-Cache Buster
Client/browser reloads new assets based on package.json version of your application. [https://github.com/poeticninja/hapi-cache-buster](https://github.com/poeticninja/hapi-cache-buster)

#### Folder Structure
There are two main folders in the stack. The "**public**" folder for front-end (client side) code, and "**servers**" folder for server side code.

By having the front-end folder and server side folder be specific, it provides for better consistency when changing projects. This way when you change from a full front-end app (Phonegap), to a front-end and server side app you get to keep the same folder structure. Allowing for better consistency with your stack, projects, and tools.


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
