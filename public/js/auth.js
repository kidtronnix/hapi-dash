$( document ).ready(function() {



// LOGIN
$('form#login').submit(function (e) {
  e.preventDefault();

  var payload = {
    email: $('#email').val(),
    password: $('#password').val()
  }

  $.post('/login', payload).done(function (result) {
    console.log(result)
    if(result.error) {
      $.notify(result.details, 'error');
    } else {
      window.location.href = '/';
    }
  });
});
console.log('here')
// REGISTER
$('form#register').submit(function (e) {
  e.preventDefault();
  console.log('attempting register')
  var payload = {
    fname: $('#fname').val(),
    lname: $('#lname').val(),
    email: $('#email').val(),
    password: $('#password').val(),
    password2: $('#password2').val()
  }

  $.post('/register', payload).done(function (result) {
    if(result.error) {
      console.error('could NOT register', result);
      $.notify(result.details, 'error');
    } else {
      console.log('registered', result);
      $.notify(result.details, 'success');
      setTimeout(function(){
        window.location.href = '/';
      }, 3000)

    }
  });
});

$('button#forgot-btn').click(function (e) {
  e.preventDefault();

  var payload = {
    email: $('#forgot-email').val()
  }
  console.log(payload);

  $.post('/forgot', payload).done(function (result) {
    console.log(result);
    if(!result.error) {
      $.notify('You have been sent a password reset email.', 'success');
    } else {
      $.notify(result.details, 'error');
    }
  });
});

$('form#reset').submit(function (e) {
  e.preventDefault();

  var payload = {
    email: $('#email').val(),
    password: $('#password').val(),
    password2: $('#password2').val(),
    token: $('#forgotToken').val()
  }
  console.log('Attempting password reset...', payload)
  $.post('/reset', payload).done(function (result) {
    console.log(result);
    if(!result.error) {
      $.notify('Password reset successfully. Redirecting to login...', 'success');
      setTimeout(function(){
        window.location.href = '/login';
      }, 3000)
    } else {
      $.notify(result.details, 'error');
    }
  });
});

})
