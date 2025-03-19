// server.js
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');


const app = express();
const key = fs.readFileSync('certs/cert.key');
const cert = fs.readFileSync('certs/cert.crt');

//we changed our express setup so we can use https
//pass the key and cert to createServer on https
const expressServer = https.createServer({key, cert}, app);
//create our socket.io server... it will listen to our express port
const io = socketIo(expressServer,{
    cors: {
        origin: [
            "https://localhost",
            // 'https://LOCAL-DEV-IP-HERE' //if using a phone or another computer
        ],
        methods: ["GET", "POST"]
    }
});


// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io signaling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Relay signaling data between peers
  socket.on('signal', (data) => {
    socket.broadcast.emit('signal', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
expressServer.listen(PORT, () => {
  console.log(`HTTPS server is running on https://localhost:${PORT}`);
});