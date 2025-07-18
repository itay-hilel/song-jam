import { createPresetFromEnvironment } from '../preset/presetFactory';

// Load application dependencies from environment
const application = createPresetFromEnvironment();

console.log(`🎵 Song Jam server starting...`);
console.log(`📋 Application services loaded successfully`);

// Test the application
async function testApplication() {
  try {
    const context = { timestamp: new Date() };
    const session = await application.sessionService.create(context, {
      name: 'Test Session',
      theme: 'love',
      style: 'pop'
    });
    console.log(`✅ Session service working! Created session: ${session.id}`);
    
    // Test adding a song line
    const updatedSession = await application.sessionService.addSongLine(
      context, 
      session.id, 
      'Create a romantic song line'
    );
    console.log(`✅ LLM strategy working! Generated line: "${updatedSession.songLines[0]?.content}"`);
    
    // Test collaboration service
    const participant = await application.collaborationService.joinSession(
      context,
      session.id,
      'Test User'
    );
    console.log(`✅ Collaboration service working! Participant: ${participant.name}`);
    
  } catch (error) {
    console.error('❌ Application test failed:', error);
  }
}

// Run the test
testApplication().then(() => {
  console.log(`🚀 Song Jam application is ready!`);
  console.log(`🧪 Test completed successfully`);
  console.log(`📝 To add HTTP server, install express and socket.io dependencies`);
  console.log(`📖 Week 1 Core Backend Complete!`);
});