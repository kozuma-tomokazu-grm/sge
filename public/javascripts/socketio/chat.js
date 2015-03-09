$(function() {
  var chat = io('/chat');
  chat.connect();
  // var socket = io.connect();
  chat.emit('hey', function(result) {
    console.log(result);
  });
});
