
var socketIO = require('socket.io'),
	io
	;

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

exports.register = function(plugin, options, next) {
    // this is the hapi specific binding
    io = socketIO.listen(plugin.servers[0].listener,{ log: false });

    io.on('connection', function (socket) {
	  var addedUser = false;
	  socket.emit('users', usernames);
	  // when the client emits 'new message', this listens and executes
	  socket.on('new message', function (data) {
	    // we tell the client to execute 'new message'
	    socket.broadcast.emit('new message', {
	      username: socket.username,
	      message: data
	    });
	  });

	  // when the client emits 'add user', this listens and executes
	  socket.on('add user', function (username) {
	    // we store the username in the socket session for this client
	    socket.username = username;
	    // add the client's username to the global list
	    usernames[username] = username;
	    ++numUsers;
	    addedUser = true;
	    socket.emit('login', {
	      numUsers: numUsers
	    });
	    // echo globally (all clients) that a person has connected
	    socket.broadcast.emit('user joined', {
	      username: socket.username,
	      numUsers: numUsers
	    });
	    socket.broadcast.emit('users', usernames);
	    socket.emit('users', usernames);

	  });
	  
	  // when the client emits 'typing', we broadcast it to others
	  socket.on('typing', function () {
	    socket.broadcast.emit('typing', {
	      username: socket.username
	    });
	  });

	  // when the client emits 'stop typing', we broadcast it to others
	  socket.on('stop typing', function () {
	    socket.broadcast.emit('stop typing', {
	      username: socket.username
	    });
	  });

	  // when the user disconnects.. perform this
	  socket.on('disconnect', function () {
	    // remove the username from global usernames list
	    if (addedUser) {
	      delete usernames[socket.username];
	      --numUsers;

	      // echo globally that this client has left
	      socket.broadcast.emit('user left', {
	        username: socket.username,
	        numUsers: numUsers
	      });

	      socket.broadcast.emit('users', usernames);
	    }
	  });
	});
}