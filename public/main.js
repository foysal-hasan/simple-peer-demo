// public/main.js
const socket = io(); // Connect to the signaling server
const localAudio = document.getElementById('localAudio');
const remoteAudio = document.getElementById('remoteAudio');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesDiv = document.getElementById('messages');

let peer;

// Get user media (audio only)
navigator.mediaDevices.getUserMedia({ audio: true })
  .then((stream) => {
    localAudio.srcObject = stream;

    // Initialize Simple-Peer
    peer = new SimplePeer({
      initiator: window.location.hash === '#init', // One peer is the initiator
      trickle: false, // Disable trickle ICE for simplicity
      stream: stream, // Send the local audio stream
    });

    // Handle signaling data
    peer.on('signal', (data) => {
      socket.emit('signal', JSON.stringify(data)); // Send signaling data to the other peer
    });

    // Receive signaling data from the other peer
    socket.on('signal', (data) => {
      peer.signal(JSON.parse(data)); // Pass signaling data to Simple-Peer
    });

    // Handle remote stream
    peer.on('stream', (remoteStream) => {
      remoteAudio.srcObject = remoteStream; // Play the remote audio stream
    });

    // Handle data messages
    peer.on('data', (data) => {
      const message = document.createElement('div');
      message.textContent = `Remote: ${data}`;
      messagesDiv.appendChild(message);
    });
  })
  .catch((err) => {
    console.error('Error accessing media devices:', err);
  });

// Send messages
sendButton.addEventListener('click', () => {
  const message = messageInput.value;
  if (message) {
    peer.send(message); // Send the message to the other peer
    const messageElement = document.createElement('div');
    messageElement.textContent = `You: ${message}`;
    messagesDiv.appendChild(messageElement);
    messageInput.value = ''; // Clear the input field
  }
});