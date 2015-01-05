var prompt = require('prompt');
var fs = require('fs');
// Remove annoying "prompt:"
prompt.message = "";
prompt.delimiter = "";

var apiGenKey = function(length) {
    // Just produces random string using these chars
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}


    

var messages = {
  app: "Configuring Basic App Info...\n".green,
  db: "Configuring MongoDB Connection...\n".green,
  api: "Configuring API Server...\n".green,
  gui: "Configuring GUI Server...\n".green,
  email: "Configuring Email app uses...\n".green,
}

// Define what we what entered
var schema = {
  properties: {
    appName: {
      description: messages.app+'App Name:'.blue,
      default: 'Hapi Dash'
    },
    appUrl: {
      description: 'App Url:'.blue,
      default: 'http://localhost:3030',
      before: function removeLastSlash (url) {
          if (url.substring(url.length-1) == "/")
          {
              url = url.substring(0, url.length-1);
          }

          return url;
      }
    },
    apiHost: {
      description: messages.api+'API host:'.blue,
      default: '127.0.0.1'
    },
    apiPort: {
      description: 'API port:'.blue,
      default: '3000'
    },
    apiCoreId: {
      description: 'API Core ID:'.blue,
      default: 'core'
    },
    apiCorePass: {
      description: 'API Core Password:'.blue,
      default: 'random string',
      before: function(value) {
        if(value === "random string") {
          value = apiGenKey(64)
        }
        return value;
      }
    },
    guiHost: {
      description:  messages.gui+'GUI host:'.blue,
      default: '0.0.0.0'
    },
    guiPort: {
      description: 'GUI port:'.blue,
      default: '3030'
    },
    dbHost: {
      description: messages.db+'Mongo host:'.blue,
      default: '127.0.0.1'
    },
    dbPort: {
      description: 'Mongo port:'.blue,
      default: '27017'
    },
    dbName: {
      description: "Mongo db name:".blue,
      default: 'hapi-dash'
    },
    dbUn: {
      description: "Mongo db username (optional):".blue,
      default: ''
    },
    dbPw: {
      description: "Mongo db password (optional):".blue,
      default: ''
    },
    mailService: {
      description: messages.email+'Email service:'.blue,
      default: 'Gmail'
    },
    mailEmail: {
      description: 'Email address:'.blue,
      required: true
    },
    mailPass: {
      description: 'Email password:'.blue,
      required: true,
      message: "Password is required",
      hidden: true
    },
  }
};
//
// Start the prompt
//
prompt.start();


prompt.get(schema, function (err, result) {
  //
  // Log the results.
  //
  if(result) {
    var config = {
      app: {
        name: result.appName,
        url: result.appUrl
      },
      db: {
        host: result.dbHost,
        port: result.dbPort,
        name: result.dbName,
        un: result.dbUn,
        pw: result.dbPw
      },
      api: {
        host: result.apiHost,
        port: result.apiPort
      },
      coreCreds: {
          id: result.apiCoreId,
          key: result.apiCorePass,
          algorithm: 'sha256'
      },
      gui: {
        host: result.guiHost,
        port: result.guiPort
      },
      email: {
          service: result.mailService,
          auth: {
              user: result.mailEmail,
              pass: result.mailPass
          }
      }
    }

    // Text to save to config.js
    var text = "module.exports = "+JSON.stringify(config, null, 4)
    fs.exists(__dirname+'/../config.js', function (exists) {

      if(exists) {
        fs.renameSync(__dirname+'/../config.js', __dirname+'/../config.old.js')
        console.log('Backed up old config to config.old.js');
      } 

      fs.writeFile(__dirname+'/../config.js', text, function (err) {
        if (err) return console.log(err);
        console.log('Saved configuration: ', config);
      });
      
    });
  } else {
    console.log("\nAborted configuration!")
  }
  
});
