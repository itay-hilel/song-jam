const { io } = require('socket.io-client');

console.log('🧪 Simple WebSocket Connection Test');

const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  timeout: 5000
});

socket.on('connect', () => {
  console.log('✅ Connected successfully:', socket.id);
  
  // Test join session with the session we created
  socket.emit('join-session', {
    sessionId: '85DVWO',
    participantName: 'Test User',
    userId: 'test-123'
  });
});

socket.on('connection-confirmed', (data) => {
  console.log('🔌 Connection confirmed:', data);
});

socket.on('session-updated', (data) => {
  console.log('📝 Session updated - participants:', data.session?.participants?.length);
});

socket.on('participant-joined', (data) => {
  console.log('👤 Participant joined:', data.participant?.name);
});

socket.on('error', (error) => {
  console.error('❌ Error:', error);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

// Auto-disconnect after 10 seconds
setTimeout(() => {
  console.log('⏰ Test completed, disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 10000);
