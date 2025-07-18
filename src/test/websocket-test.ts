import { io, Socket } from 'socket.io-client';

interface TestScenario {
  name: string;
  execute: (socket: Socket, sessionId?: string) => Promise<void>;
}

class WebSocketTester {
  private socket: Socket;
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      timeout: 5000
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);

      this.socket.on('connect', () => {
        clearTimeout(timeout);
        console.log(`✅ Connected to WebSocket server: ${this.socket.id}`);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  setupEventListeners(): void {
    // Connection events
    this.socket.on('connection-confirmed', (data) => {
      console.log(`🔌 Connection confirmed:`, data);
    });

    // Collaboration events
    this.socket.on('participant-joined', (data) => {
      console.log(`👤 Participant joined:`, data);
    });

    this.socket.on('participant-left', (data) => {
      console.log(`👋 Participant left:`, data);
    });

    this.socket.on('song-line-added', (data) => {
      console.log(`🎵 Song line added:`, data);
    });

    this.socket.on('lines-reordered', (data) => {
      console.log(`🔄 Lines reordered:`, data);
    });

    this.socket.on('session-completed', (data) => {
      console.log(`🏁 Session completed:`, data);
    });

    this.socket.on('session-updated', (data) => {
      console.log(`📝 Session updated:`, data);
    });

    this.socket.on('collaboration-event', (event) => {
      console.log(`🤝 Collaboration event:`, event);
    });

    // Error events
    this.socket.on('error', (data) => {
      console.error(`❌ WebSocket error:`, data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`🔌 Disconnected: ${reason}`);
    });
  }

  async testJoinSession(sessionId: string, participantName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Join session timeout'));
      }, 5000);

      this.socket.once('session-updated', (data) => {
        clearTimeout(timeout);
        console.log(`✅ Successfully joined session ${sessionId} as ${participantName}`);
        resolve();
      });

      this.socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to join session: ${error.message}`));
      });

      this.socket.emit('join-session', {
        sessionId,
        participantName,
        userId: `test-user-${Date.now()}`
      });
    });
  }

  async testAddSongLine(sessionId: string, prompt: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Add song line timeout'));
      }, 10000); // Longer timeout for LLM

      this.socket.once('song-line-added', (data) => {
        clearTimeout(timeout);
        console.log(`✅ Successfully added song line to session ${sessionId}`);
        resolve();
      });

      this.socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to add song line: ${error.message}`));
      });

      this.socket.emit('add-song-line', {
        sessionId,
        prompt
      });
    });
  }

  async testReorderLines(sessionId: string, lineIds: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Reorder lines timeout'));
      }, 5000);

      this.socket.once('lines-reordered', (data) => {
        clearTimeout(timeout);
        console.log(`✅ Successfully reordered lines in session ${sessionId}`);
        resolve();
      });

      this.socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to reorder lines: ${error.message}`));
      });

      this.socket.emit('reorder-lines', {
        sessionId,
        lineIds
      });
    });
  }

  async testCompleteSession(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Complete session timeout'));
      }, 10000); // Longer timeout for export

      this.socket.once('session-completed', (data) => {
        clearTimeout(timeout);
        console.log(`✅ Successfully completed session ${sessionId}`);
        resolve();
      });

      this.socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to complete session: ${error.message}`));
      });

      this.socket.emit('complete-session', {
        sessionId
      });
    });
  }

  async testLeaveSession(sessionId: string): Promise<void> {
    return new Promise((resolve) => {
      this.socket.emit('leave-session', {
        sessionId
      });
      console.log(`✅ Left session ${sessionId}`);
      setTimeout(resolve, 1000); // Give time for cleanup
    });
  }

  disconnect(): void {
    this.socket.disconnect();
    console.log(`🔌 Disconnected from WebSocket server`);
  }
}

// Helper function to create session via HTTP API
async function createTestSession(): Promise<string> {
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

// Main test function
async function runWebSocketTests(): Promise<void> {
  console.log('🧪 Starting WebSocket Integration Tests...\n');

  try {
    // Create a test session first
    console.log('1. Creating test session via HTTP API...');
    const sessionId = await createTestSession();
    console.log(`✅ Created session: ${sessionId}\n`);

    // Initialize WebSocket tester
    console.log('2. Connecting to WebSocket server...');
    const tester = new WebSocketTester();
    tester.setupEventListeners();
    await tester.connect();
    console.log('');

    // Test scenarios
    console.log('3. Testing join session...');
    await tester.testJoinSession(sessionId, 'Test Alice');
    console.log('');

    console.log('4. Testing add song line...');
    await tester.testAddSongLine(sessionId, 'Write a test song about coding collaboration');
    console.log('');

    console.log('5. Testing add another song line...');
    await tester.testAddSongLine(sessionId, 'Write about the joy of real-time communication');
    console.log('');

    console.log('6. Testing reorder lines...');
    // Note: In a real scenario, you'd extract actual line IDs from the session
    await tester.testReorderLines(sessionId, ['line_2', 'line_1']);
    console.log('');

    console.log('7. Testing complete session...');
    await tester.testCompleteSession(sessionId);
    console.log('');

    console.log('8. Testing leave session...');
    await tester.testLeaveSession(sessionId);
    console.log('');

    // Cleanup
    tester.disconnect();

    console.log('🎉 All WebSocket tests completed successfully!');

  } catch (error) {
    console.error('❌ WebSocket test failed:', error);
    process.exit(1);
  }
}

// Test with multiple clients
async function runMultiClientTest(): Promise<void> {
  console.log('🧪 Starting Multi-Client WebSocket Test...\n');

  try {
    // Create a test session
    const sessionId = await createTestSession();
    console.log(`✅ Created session: ${sessionId}\n`);

    // Create multiple clients
    const client1 = new WebSocketTester();
    const client2 = new WebSocketTester();

    client1.setupEventListeners();
    client2.setupEventListeners();

    console.log('Connecting clients...');
    await Promise.all([
      client1.connect(),
      client2.connect()
    ]);

    console.log('Testing concurrent joins...');
    await Promise.all([
      client1.testJoinSession(sessionId, 'Alice'),
      client2.testJoinSession(sessionId, 'Bob')
    ]);

    console.log('Testing concurrent song line additions...');
    await Promise.all([
      client1.testAddSongLine(sessionId, 'Alice writes about friendship'),
      client2.testAddSongLine(sessionId, 'Bob writes about adventure')
    ]);

    // Cleanup
    await Promise.all([
      client1.testLeaveSession(sessionId),
      client2.testLeaveSession(sessionId)
    ]);

    client1.disconnect();
    client2.disconnect();

    console.log('🎉 Multi-client test completed successfully!');

  } catch (error) {
    console.error('❌ Multi-client test failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testType = process.argv[2] || 'single';
  
  if (testType === 'multi') {
    runMultiClientTest();
  } else {
    runWebSocketTests();
  }
}
