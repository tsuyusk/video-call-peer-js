const express = require('express');
const path = require('path');
const http = require('http');
const ejs = require('ejs');
const socketIo = require('socket.io');

const PORT = 3000;

const app = express();
const server = http.Server(app);
const io = socketIo(server);

app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.get('/', (request, response) => {
  response.render('index');
});

io.on('connection', socket => {
  socket.on('join room', id => {
    io.emit('user connected', id);

    socket.on('user disabled videos', () => {
      io.emit('user disconnected', id);
    });

    socket.on('disconnect', () => {
      io.emit('user disconnected', id);
    });
  });

});

server.listen(PORT, () => {
  console.log(`Server listening on *:${PORT}`);
})
