const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = require('./app');
const handleSocketConnections = require('./sockets');
const { postgresTestConnection } = require('./db/sequelize');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow connections from any origin
    methods: ['GET', 'POST'],
  },
});

const { PORT = 4000 } = process.env;

// Handle socket connections
handleSocketConnections(io);

postgresTestConnection();

server.listen(PORT, () => {
  console.log('Server is running on port 4000');
});
