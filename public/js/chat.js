$( document ).ready(function() {
	var TYPING_TIMER_LENGTH = 400;

	var socket = io.connect('http://localhost:3020');
	// Initialize varibles
	var $window = $(window);
	var $usernameInput = $('input#username'); // Input for username
	var $messages = $('.messages'); // Messages area
	var $inputMessage = $('input#message'); // Input message input box
	var $users = $('.chat-available-user');
	var $sendMessage = $('#sendMessage');
	var $join = $('#join');
	var $participants = $('.noUsers');

	// Prompt for setting a username
	var username;
	var connected = false;
	var typing = false;
	var lastTypingTime;
	var $currentInput = $usernameInput.focus();

	function addParticipantsMessage(data) {
		var message = '';
	    if (data.numUsers === 1) {
	      message += "there's 1 participant";
	    } else {
	      message += "there're " + data.numUsers + " participants";
	    }
	    log(message);
	}

	function addChatMessage(data) {

		var ts = new Date();

		var time = ts.toTimeString().substring(0,5); 
		var $first = $('<div>').addClass('first-part').addClass('odd').text(data.username)
		var $second = $('<div>').addClass('second-part').text(data.message)
		var $third = $('<div>').addClass('third-part').text(time)

		var $el = $('<div>').addClass('group-rom');
		$el.append($first);
		$el.append($second);
		$el.append($third);

		addMessageElement($el)
	}

	function addChatTyping(data) {
		var $user = $('*[data-user="'+data.username+'"]');
		$user.find('small').text(' typing');
	}

	function removeChatTyping(data) {
		var $user = $('*[data-user="'+data.username+'"]');
		$user.find('small').text('');
	}

	function sendMessage() {
		var message = $inputMessage.val();
		// Prevent markup from being injected into the message
		message = cleanInput(message);
		// if there is a non-empty message and a socket connection
		if (message && connected) {
			$inputMessage.val('');
			addChatMessage({
				username: username,
				message: message
			});
			// tell server to execute 'new message' and send along one parameter
			socket.emit('new message', message);
		}
	}

	function setUsername() {
		username = cleanInput($usernameInput.val().trim());

	    // If the username is valid
	    if (username) {
	      // Tell the server your username
	      socket.emit('add user', username);
	    }
	}

	function updateTyping() {

		if (connected) {
			if (!typing) {
				typing = true;
				socket.emit('typing');
			}
			lastTypingTime = (new Date()).getTime();
			setTimeout(function () {
				var typingTimer = (new Date()).getTime();
				var timeDiff = typingTimer - lastTypingTime;
				if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
					socket.emit('stop typing');
					typing = false;
				}
			}, TYPING_TIMER_LENGTH);
		}
	}

	function addMessageElement(el) {
		var $el = $(el);
		$messages.append($el);
	}

	function log (message) {
		var ts = new Date();

		var time = ts.toTimeString().substring(0,5); 
		var $first = $('<div>').addClass('first-part')
		var $second = $('<div>').addClass('second-part').text(message)
		var $third = $('<div>').addClass('third-part').text(time)

		var $el = $('<div>').addClass('group-rom');
		$el.append($first);
		$el.append($second);
		$el.append($third);

		addMessageElement($el);
	}

	function cleanInput (input) {
	    return $('<div/>').text(input).text();
	}

	// Keyboard events
	$window.keydown(function (event) {
		// When the client hits ENTER on their keyboard
		if (event.which === 13) {
		  if (username) {
		    sendMessage();
		    socket.emit('stop typing');
		    typing = false;
		  } else {
		    setUsername();
		  }
		}
	});

	$inputMessage.on('input', function() {
		updateTyping();
	});

	$sendMessage.on('click', function() {
		sendMessage();
		socket.emit('stop typing');
	});

	$join.on('click', function() {
		setUsername();
	});

	  // Click events



	  // Socket events

	  // Whenever the server emits 'login', log the login message
	  socket.on('login', function (data) {
	    connected = true;
	    $inputMessage.removeAttr('disabled')
	    $inputMessage.attr('placeholder', 'Type message...')
	    $join.attr('disabled', 'disabled')
	    // Display the welcome message
	    var message = "Welcome to the Chat Room ";
	    log(message);
	    // addParticipantsMessage(data);
	  });

	  // Whenever the server emits 'new message', update the chat body
	  socket.on('new message', function (data) {
	    addChatMessage(data);
	  });

	  // Whenever the server emits 'user joined', log it in the chat body
	  socket.on('user joined', function (data) {
	    log(data.username + ' joined');
	  });

	  socket.on('users', function (data) {
	  	$users.html('');
	  	var userCounter = 0;
	  	$.each(data, function(index,value) {
	  		$li = $('<li>').html('<span data-user="'+value+'"><strong>'+value+'</strong><small></small></span>')
	  		$users.append($li)
	  		userCounter++;
	  	})
	  	$participants.text(userCounter)
	    
	  });

	  // Whenever the server emits 'user left', log it in the chat body
	  socket.on('user left', function (data) {
	  	log(data.username + ' left');
	    removeChatTyping(data);
	  });

	  // Whenever the server emits 'typing', show the typing message
	  socket.on('typing', function (data) {
	    addChatTyping(data);
	  });

	  // Whenever the server emits 'stop typing', kill the typing message
	  socket.on('stop typing', function (data) {
	    removeChatTyping(data);
	  });
})