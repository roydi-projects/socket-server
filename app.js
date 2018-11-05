/**
 * Module dependencies.
 */
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const chalk = require('chalk');

const { joinChannel } = require('./controllers/trivia.controller');

/**
 * Express configuration.
 */
app.set('host', '0.0.0.0');
app.set('port', process.env.PORT || 8080);

/**
 * Start Express server.
 */
http.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

io.on('connection', (socket) => {
  var clients = io.sockets.clients();

  let username = socket.id

  socket.on('chat', (msg) => {
    console.log('message: ' + msg.text);
    io.emit('chat', msg);
  });

  if (!socket.userId) {
    joinChannel(io);
    io.emit('chat', 'welcome');
  }
  else {
    socket.userId = username;
  }
});

app.get('/', function (req, res) {
  res.send('<h1>Hello world</h1>');
});

module.exports = app;
