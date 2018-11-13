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
});

let numUsers = 0;
io.on('connection', (socket) => {
  let addedUser = false;

  socket.on('add user', (username) => {
    if (addedUser) return;

    ++numUsers;
    addedUser = true;
    socket.username = username;
    joinChannel(io);
    io.emit('chat', `welcome ${username}. ${numUsers}/4`);
    socket.emit('system', { numUsers });
  });

  socket.on('start game', () => {
    io.emit('chat', 'starting...');
  })

  socket.on('chat', (msg) => {
    console.log('message: ' + msg.text);
    socket.emit('chat', msg);
  });

  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;
      io.emit('chat', `${socket.username} left. ${numUsers}/4`);
      socket.emit('system', { numUsers });
    }
  });
});

app.get('/', function (req, res) {
  res.send('<h1>Hello world</h1>');
});

module.exports = app;
