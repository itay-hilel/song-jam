import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createPresetFromEnvironment } from '../preset/presetFactory';
import { createSessionRoutes } from '../ports/http/sessionRoutes';
import { 
  requestLogger, 
  errorHandler, 
  notFound 
} from '../ports/http/middleware';
import { 
  registerCollaborationHandlers, 
  createEventBroadcaster 
} from '../ports/websocket/collaborationHandlers';
import { DefaultCollaborationService } from '../application/collaboration/collaborationService';

// Load application dependencies from environment
const application = createPresetFromEnvironment();
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware setup
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    websocket: {
      connected: io.engine.clientsCount,
      transport: 'socket.io'
    }
  });
});

// WebSocket status endpoint
app.get('/websocket/status', (req, res) => {
  res.json({
    connected_clients: io.engine.clientsCount,
    active_sessions: io.sockets.adapter.rooms.size,
    server_time: new Date().toISOString()
  });
});

// API routes
app.use('/api/sessions', createSessionRoutes(application));

// 404 handler
app.use(notFound);

// Error handler (should be last)
app.use(errorHandler);

// Initialize collaboration service with WebSocket event broadcaster
const eventBroadcaster = createEventBroadcaster(io);
const collaborationService = new DefaultCollaborationService(
  application.sessionService,
  eventBroadcaster
);

// Register WebSocket handlers
registerCollaborationHandlers({
  io,
  collaborationService,
  sessionService: application.sessionService
});

// WebSocket connection logging
io.on('connection', (socket) => {
  console.log(`🔌 WebSocket client connected: ${socket.id} (Total: ${io.engine.clientsCount})`);
  
  socket.on('disconnect', (reason) => {
    console.log(`🔌 WebSocket client disconnected: ${socket.id} - ${reason} (Total: ${io.engine.clientsCount})`);
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection and services
    console.log('🔧 Testing application services...');
    
    const context = { timestamp: new Date() };
    
    // Test session service
    const testSession = await application.sessionService.create(context, {
      name: 'Server Test Session',
      theme: 'test',
      style: 'testing'
    });
    console.log(`✅ Session service working! Created session: ${testSession.id}`);
    
    // Test collaboration service
    console.log('🔧 Testing collaboration service...');
    const testParticipant = await collaborationService.joinSession(
      context,
      testSession.id,
      'Test Participant'
    );
    console.log(`✅ Collaboration service working! Participant: ${testParticipant.name}`);
    
    // Clean up test session if we have delete functionality
    try {
      // Note: Delete method might not be implemented yet
      // await application.sessionRepository?.deleteSession(testSession.id);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    httpServer.listen(PORT, () => {
      console.log(`🎵 Song Jam server started successfully!`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
      console.log(`📋 HTTP API endpoints available:`);
      console.log(`   POST   /api/sessions                 - Create session`);
      console.log(`   GET    /api/sessions/:id             - Get session details`);
      console.log(`   POST   /api/sessions/:id/join        - Join session`);
      console.log(`   POST   /api/sessions/:id/lines       - Add song line`);
      console.log(`   PUT    /api/sessions/:id/lines/reorder - Reorder lines`);
      console.log(`   POST   /api/sessions/:id/complete    - Complete and export`);
      console.log(`   GET    /health                       - Health check`);
      console.log(`   GET    /websocket/status             - WebSocket status`);
      console.log(`🔌 WebSocket events available:`);
      console.log(`   join-session        - Join a session room`);
      console.log(`   leave-session       - Leave a session room`);
      console.log(`   add-song-line       - Add song line via prompt`);
      console.log(`   reorder-lines       - Change line order`);
      console.log(`   complete-session    - Complete session`);
      console.log(`📖 Week 2 + WebSocket Integration Complete!`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  
  // Close WebSocket connections
  io.close(() => {
    console.log('🔌 WebSocket server closed');
  });
  
  // Close HTTP server
  httpServer.close(() => {
    console.log('🌐 HTTP server closed');
  });
  
  if (application.cleanup) {
    await application.cleanup();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  
  // Close WebSocket connections
  io.close(() => {
    console.log('🔌 WebSocket server closed');
  });
  
  // Close HTTP server
  httpServer.close(() => {
    console.log('🌐 HTTP server closed');
  });
  
  if (application.cleanup) {
    await application.cleanup();
  }
  process.exit(0);
});

// Start the server
startServer();