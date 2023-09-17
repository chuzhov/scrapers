const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = require('./app');
const handleSocketConnections = require('./sockets');
const { testDBConnection } = require('./db/sequelize');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow connections from any origin
    methods: ['GET', 'POST'],
  },
});

const { PORT = 4000 } = process.env;

testDBConnection()
  .then(() => {
    handleSocketConnections(io);
    return server.listen(PORT);
  })
  .then(() => {
    console.log(`Server is running on port ${PORT}`);
    //TODO: add check if are 'scrapping' records and delete them
  })
  .catch(() => {
    console.error('Could not connect to DB');
  });
