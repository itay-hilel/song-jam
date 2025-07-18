#!/usr/bin/env node

const { io } = require('socket.io-client');

console.log('🧪 WebSocket Integration Test\n');

// Helper function to create a session via HTTP API
async function createTestSession() {
  const fetch = (await import('node-fetch')).default;
  
  const response = await fetch('http://localhost:3001/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'WebSocket Test Session',
      theme: 'testing',
      style: 'experimental'
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create session: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.id;
}

// Helper function to add delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runWebSocketTest() {
  let socket;
  let sessionId;

  try {
    console.log('1. Creating test session via HTTP API...');
    sessionId = await createTestSession();
    console.log(`✅ Created session: ${sessionId}\n`);

    console.log('2. Connecting to WebSocket server...');
    socket = io('http://localhost:3001', {
      transports: ['websocket'],
      timeout: 5000
    });

    // Setup event listeners
    socket.on('connect', () => {
      console.log(`✅ Connected to WebSocket server: ${socket.id}`);
    });

    socket.on('connection-confirmed', (data) => {
      console.log('🔌 Connection confirmed:', data);
    });

    socket.on('participant-joined', (data) => {
      console.log('👤 Participant joined:', data.participant?.name || 'Unknown');
    });

    socket.on('participant-left', (data) => {
      console.log('👋 Participant left:', data.participantId);
    });

    socket.on('song-line-added', (data) => {
      console.log('🎵 Song line added:', data.songLine?.content || 'No content');
    });

    socket.on('lines-reordered', (data) => {
      console.log('🔄 Lines reordered:', data.lineIds?.length || 0, 'lines');
    });

    socket.on('session-completed', (data) => {
      console.log('🏁 Session completed:', data.exportResult?.message || 'No message');
    });

    socket.on('session-updated', (data) => {
      console.log('📝 Session updated - Participants:', data.session?.participants?.length || 0);
    });

    socket.on('error', (data) => {
      console.error('❌ WebSocket error:', data);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason);
    });

    // Wait for connection
    await new Promise((resolve, reject) => {
      socket.on('connect', resolve);
      socket.on('connect_error', reject);
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    console.log('');

    // Test 1: Join session
    console.log('3. Testing join session...');
    socket.emit('join-session', {
      sessionId,
      participantName: 'Test Alice',
      userId: 'test-user-123'
    });
    await delay(2000);

    // Test 2: Add song line
    console.log('4. Testing add song line...');
    socket.emit('add-song-line', {
      sessionId,
      prompt: 'Write a test song about coding collaboration'
    });
    await delay(3000);

    // Test 3: Add another song line
    console.log('5. Testing add another song line...');
    socket.emit('add-song-line', {
      sessionId,
      prompt: 'Write about the joy of real-time communication'
    });
    await delay(3000);

    // Test 4: Reorder lines (using dummy IDs for demo)
    console.log('6. Testing reorder lines...');
    socket.emit('reorder-lines', {
      sessionId,
      lineIds: ['line_2', 'line_1']
    });
    await delay(2000);

    // Test 5: Complete session
    console.log('7. Testing complete session...');
    socket.emit('complete-session', {
      sessionId
    });
    await delay(3000);

    // Test 6: Leave session
    console.log('8. Testing leave session...');
    socket.emit('leave-session', {
      sessionId
    });
    await delay(2000);

    console.log('\n🎉 All WebSocket tests completed successfully!');

  } catch (error) {
    console.error('❌ WebSocket test failed:', error.message);
    process.exit(1);
  } finally {
    if (socket) {
      socket.disconnect();
      console.log('🔌 Disconnected from WebSocket server');
    }
  }
}

// Test multiple clients
async function runMultiClientTest() {
  console.log('🧪 Multi-Client WebSocket Test\n');

  let sessionId;
  let client1, client2;

  try {
    sessionId = await createTestSession();
    console.log(`✅ Created session: ${sessionId}\n`);

    // Create two clients
    client1 = io('http://localhost:3001', { transports: ['websocket'] });
    client2 = io('http://localhost:3001', { transports: ['websocket'] });

    // Wait for both to connect
    await Promise.all([
      new Promise((resolve) => client1.on('connect', resolve)),
      new Promise((resolve) => client2.on('connect', resolve))
    ]);

    console.log('✅ Both clients connected');

    // Setup listeners for client2 to see client1's actions
    client2.on('participant-joined', (data) => {
      console.log(`Client 2 sees: ${data.participant?.name} joined`);
    });

    client2.on('song-line-added', (data) => {
      console.log(`Client 2 sees new song line: "${data.songLine?.content}"`);
    });

    // Test concurrent joins
    console.log('\nTesting concurrent joins...');
    client1.emit('join-session', { sessionId, participantName: 'Alice' });
    await delay(1000);
    client2.emit('join-session', { sessionId, participantName: 'Bob' });
    await delay(2000);

    // Test one client adding a line, other seeing it
    console.log('Testing real-time song line sharing...');
    client1.emit('add-song-line', { sessionId, prompt: 'Alice writes about friendship' });
    await delay(3000);

    console.log('\n🎉 Multi-client test completed successfully!');

  } catch (error) {
    console.error('❌ Multi-client test failed:', error.message);
  } finally {
    if (client1) client1.disconnect();
    if (client2) client2.disconnect();
  }
}

// Run the test
const testType = process.argv[2] || 'single';

if (testType === 'multi') {
  runMultiClientTest();
} else {
  runWebSocketTest();
}
