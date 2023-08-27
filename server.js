const http = require('http');
const socketIo = require('socket.io');

const app = require('./app');
const handleSocketConnections = require('./sockets');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow connections from any origin
    methods: ['GET', 'POST'],
  },
});

// Handle socket connections
handleSocketConnections(io);

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
