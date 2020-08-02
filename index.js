const express = require('express');
const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const bodyParser = require('body-parser');
const { connected } = require('process');
var port = process.env.PORT || 3000;

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var users = [];
var messages = [];

app.post('/chat', function(req, res){
  res.sendFile(__dirname + '/chat.html');
});

io.on('connection', function(socket){
  console.log(io.engine.clientsCount+" sockets ativos!");//quantidade de clientes online
  console.log(socket.id);
  
  socket.on('signIn', function(conn){
    
    if (users.length == 0){
      users.push(conn.user);
    }else{
      var user = users.find(u => conn.user && u.id === conn.user.id);
      if (!user) {
        users.push(conn.user);
      }
    }
    
    io.emit('usersOn', users);
    socket.emit('loadChat', [messages, socket.id]);
    console.log(conn.user.nickname+' entrou no chat!');
  });

  socket.on('chat', function(msg){//evento de envio de msg;
    if (messages.length >= 20){
      messages = [];
    }

    messages.push(msg);

    io.emit('chat', msg);
  });

  socket.on('logout', function(user){
    var index = users.findIndex(u => u.id === user.id);
    if (index > -1) {
      users.splice(index, 1);//remove da lista
      console.log(user.nickname+' saiu!');
      io.emit('usersOn', users);
    }
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
